import { pgTable, uuid, text, timestamp, bigint, integer } from "drizzle-orm/pg-core";

export const content = pgTable("content", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull().default(""),
  description: text("description").notNull().default(""),
  productName: text("product_name").notNull().default("Otro"),
  platform: text("platform").notNull().default(""),
  type: text("type").notNull().default(""),
  status: text("status").notNull().default("Pendiente"),
  statusLabel: text("status_label").notNull().default("Pendiente"),
  statusKey: text("status_key").notNull().default("draft"),
  distributionType: text("distribution_type").notNull().default("Orgánico"),
  pillar: text("pillar").notNull().default("—"),
  publishDate: text("publish_date").notNull().default(""),
  publishTime: text("publish_time").notNull().default(""),
  campaign: text("campaign").notNull().default(""),
  audience: text("audience").notNull().default(""),
  hook: text("hook").notNull().default(""),
  copy: text("copy").notNull().default(""),
  cta: text("cta").notNull().default(""),
  hashtags: text("hashtags").notNull().default(""),
  designer: text("designer").notNull().default(""),
  reviewer: text("reviewer").notNull().default(""),
  responsible: text("responsible").notNull().default(""),
  notes: text("notes").notNull().default(""),
  coverImageUrl: text("cover_image_url").notNull().default(""),
  createdBy: text("created_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// Productos y pilares vivían hardcodeados en el formulario, así que el equipo
// no podía agregar uno sin un deploy. Aquí se administran desde Configuración.
export const catalogItems = pgTable("catalog_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: text("type").notNull(), // "product" | "pillar"
  name: text("name").notNull(),
  position: integer("position").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const contentMedia = pgTable("content_media", {
  id: uuid("id").primaryKey().defaultRandom(),
  contentId: uuid("content_id")
    .notNull()
    .references(() => content.id, { onDelete: "cascade" }),
  fileName: text("file_name").notNull().default(""),
  fileUrl: text("file_url").notNull().default(""),
  storagePath: text("storage_path").notNull().default(""),
  mimeType: text("mime_type").notNull().default(""),
  mediaType: text("media_type").notNull().default("image"),
  sizeBytes: bigint("size_bytes", { mode: "number" }),
  thumbnailUrl: text("thumbnail_url"),
  workspaceId: text("workspace_id").notNull().default("default-workspace"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
