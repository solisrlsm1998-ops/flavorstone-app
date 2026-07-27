"use server";

import { auth } from "@clerk/nextjs/server";
import { and, asc, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db/client";
import { catalogItems, content } from "@/db/schema";

export type CatalogType = "product" | "pillar";

async function requireUser() {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");
  return userId;
}

export async function listCatalog(type: CatalogType) {
  await requireUser();

  const rows = await db
    .select()
    .from(catalogItems)
    .where(eq(catalogItems.type, type))
    .orderBy(asc(catalogItems.position), asc(catalogItems.name));

  return rows.map((row) => ({ id: row.id, name: row.name }));
}

export async function listCatalogs() {
  await requireUser();

  const rows = await db
    .select()
    .from(catalogItems)
    .orderBy(asc(catalogItems.position), asc(catalogItems.name));

  return {
    products: rows.filter((row) => row.type === "product").map((row) => ({ id: row.id, name: row.name })),
    pillars: rows.filter((row) => row.type === "pillar").map((row) => ({ id: row.id, name: row.name })),
  };
}

export async function createCatalogItem(type: CatalogType, rawName: string) {
  await requireUser();

  const name = rawName.trim();
  if (!name) throw new Error("El nombre no puede estar vacío.");

  const duplicate = await db
    .select({ id: catalogItems.id })
    .from(catalogItems)
    .where(and(eq(catalogItems.type, type), sql`lower(${catalogItems.name}) = lower(${name})`));

  if (duplicate.length) throw new Error(`"${name}" ya existe en la lista.`);

  const [{ next }] = await db
    .select({ next: sql<number>`coalesce(max(${catalogItems.position}), -1) + 1` })
    .from(catalogItems)
    .where(eq(catalogItems.type, type));

  const [row] = await db.insert(catalogItems).values({ type, name, position: next }).returning();

  revalidatePath("/settings");
  return { id: row.id, name: row.name };
}

export async function deleteCatalogItem(id: string) {
  await requireUser();

  const [item] = await db.select().from(catalogItems).where(eq(catalogItems.id, id));
  if (!item) return { deleted: false, inUse: 0 };

  // Borrar un producto no debe dejar contenidos apuntando a algo inexistente.
  if (item.type === "product") {
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(content)
      .where(eq(content.productName, item.name));

    if (count > 0) return { deleted: false, inUse: count };
  }

  await db.delete(catalogItems).where(eq(catalogItems.id, id));
  revalidatePath("/settings");
  return { deleted: true, inUse: 0 };
}
