"use server";

import { auth } from "@clerk/nextjs/server";
import { desc, eq } from "drizzle-orm";
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
  const payload = buildContentPayload(formValues);

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
