"use server";

import { auth } from "@clerk/nextjs/server";
import { desc, eq } from "drizzle-orm";
import { del } from "@vercel/blob";
import { db } from "@/db/client";
import { content, contentMedia } from "@/db/schema";
import { buildContentPayload } from "@/lib/content";
import { revalidatePath } from "next/cache";

async function requireUser() {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");
  return userId;
}

export async function listContent() {
  await requireUser();
  return db.select().from(content).orderBy(desc(content.createdAt));
}

export async function createContent(formValues: Record<string, unknown>) {
  const userId = await requireUser();
  const payload = buildContentPayload(formValues);

  const [row] = await db
    .insert(content)
    .values({
      title: payload.title,
      description: payload.description,
      productName: payload.productName,
      platform: payload.platform,
      type: payload.type,
      status: payload.status,
      statusLabel: payload.statusLabel,
      statusKey: payload.statusKey,
      distributionType: payload.distributionType,
      pillar: payload.pillar,
      publishDate: payload.publishDate,
      publishTime: payload.publishTime,
      campaign: payload.campaign,
      audience: payload.audience,
      hook: payload.hook,
      copy: payload.copy,
      cta: payload.cta,
      hashtags: payload.hashtags,
      designer: payload.designer,
      reviewer: payload.reviewer,
      responsible: payload.responsible,
      notes: payload.notes,
      coverImageUrl: payload.coverImageUrl,
      createdBy: userId,
    })
    .returning();

  revalidatePath("/content");
  return row;
}

export async function updateContent(id: string, formValues: Record<string, unknown>) {
  await requireUser();

  const [existing] = await db.select().from(content).where(eq(content.id, id));
  if (!existing) throw new Error("No se encontró el contenido.");

  // Hay callers que mandan una actualización parcial (arrastrar en el kanban
  // solo manda el estado). Sin este merge, buildContentPayload rellena el
  // resto con vacíos y el update borra el registro entero.
  const has = (key: string) => Object.prototype.hasOwnProperty.call(formValues, key);
  const pick = (key: string, fallback: unknown) => (has(key) ? formValues[key] : fallback);

  const merged = {
    name: pick("name", pick("title", existing.title)),
    objective: pick("objective", pick("description", existing.description)),
    productName: pick("productName", existing.productName),
    customProductName: pick("customProductName", ""),
    platform: pick("platform", existing.platform),
    format: pick("format", pick("type", existing.type)),
    statusKey: pick("statusKey", pick("status", existing.statusKey)),
    distributionType: pick("distributionType", existing.distributionType),
    pillar: pick("pillar", existing.pillar),
    date: pick("date", pick("publishDate", existing.publishDate)),
    time: pick("time", pick("publishTime", existing.publishTime)),
    campaign: pick("campaign", existing.campaign),
    audience: pick("audience", existing.audience),
    hook: pick("hook", existing.hook),
    copy: pick("copy", existing.copy),
    cta: pick("cta", existing.cta),
    hashtags: pick("hashtags", existing.hashtags),
    designer: pick("designer", existing.designer),
    reviewer: pick("reviewer", existing.reviewer),
    responsible: pick("responsible", existing.responsible),
    notes: pick("notes", existing.notes),
    coverImageUrl: pick("coverImageUrl", pick("cover_image_url", existing.coverImageUrl)),
  };

  const payload = buildContentPayload(merged);

  const [row] = await db
    .update(content)
    .set({
      title: payload.title,
      description: payload.description,
      productName: payload.productName,
      platform: payload.platform,
      type: payload.type,
      status: payload.status,
      statusLabel: payload.statusLabel,
      statusKey: payload.statusKey,
      distributionType: payload.distributionType,
      pillar: payload.pillar,
      publishDate: payload.publishDate,
      publishTime: payload.publishTime,
      campaign: payload.campaign,
      audience: payload.audience,
      hook: payload.hook,
      copy: payload.copy,
      cta: payload.cta,
      hashtags: payload.hashtags,
      designer: payload.designer,
      reviewer: payload.reviewer,
      responsible: payload.responsible,
      notes: payload.notes,
      coverImageUrl: payload.coverImageUrl,
      updatedAt: new Date(),
    })
    .where(eq(content.id, id))
    .returning();

  revalidatePath("/content");
  return row;
}

export async function deleteContent(id: string) {
  await requireUser();

  // La FK borra las filas de content_media en cascada, pero los archivos en
  // Blob storage no se van solos: hay que limpiarlos antes de perder las URLs.
  const media = await db
    .select({ fileUrl: contentMedia.fileUrl })
    .from(contentMedia)
    .where(eq(contentMedia.contentId, id));

  const urls = media.map((row) => row.fileUrl).filter(Boolean);

  if (urls.length) {
    // Un archivo ya borrado en Blob no debe impedir borrar el contenido.
    await del(urls).catch(() => {});
  }

  await db.delete(content).where(eq(content.id, id));
  revalidatePath("/content");
}

function toMediaViewModel(row: typeof contentMedia.$inferSelect) {
  return {
    id: row.id,
    content_id: row.contentId,
    file_name: row.fileName,
    file_url: row.fileUrl,
    storage_path: row.storagePath,
    mime_type: row.mimeType,
    media_type: row.mediaType,
    size_bytes: row.sizeBytes,
    thumbnail_url: row.thumbnailUrl,
    workspace_id: row.workspaceId,
  };
}

export async function listAllMedia() {
  await requireUser();

  const rows = await db
    .select({
      media: contentMedia,
      contentTitle: content.title,
      productName: content.productName,
    })
    .from(contentMedia)
    .leftJoin(content, eq(contentMedia.contentId, content.id))
    .orderBy(desc(contentMedia.createdAt));

  return rows.map((row) => ({
    ...toMediaViewModel(row.media),
    content_title: row.contentTitle || "",
    product_name: row.productName || "",
  }));
}

export async function listContentMedia(contentId: string) {
  await requireUser();
  const rows = await db.select().from(contentMedia).where(eq(contentMedia.contentId, contentId));
  return rows.map(toMediaViewModel);
}

export async function createContentMedia(entry: {
  contentId: string;
  fileName: string;
  fileUrl: string;
  storagePath: string;
  mimeType: string;
  mediaType: string;
  sizeBytes?: number;
  thumbnailUrl?: string | null;
  workspaceId: string;
}) {
  await requireUser();

  // El contentId viene del cliente; sin esto se podrían colgar archivos de un
  // id inexistente y quedarían huérfanos fuera de todo flujo de borrado.
  const [parent] = await db.select({ id: content.id }).from(content).where(eq(content.id, entry.contentId));
  if (!parent) throw new Error("El contenido asociado ya no existe.");

  const [row] = await db.insert(contentMedia).values(entry).returning();
  revalidatePath("/content");
  return toMediaViewModel(row);
}

export async function deleteContentMedia(id: string) {
  await requireUser();
  await db.delete(contentMedia).where(eq(contentMedia.id, id));
  revalidatePath("/content");
}

export async function setCoverImage(contentId: string, coverImageUrl: string | null) {
  await requireUser();
  await db.update(content).set({ coverImageUrl: coverImageUrl || "" }).where(eq(content.id, contentId));
  revalidatePath("/content");
}
