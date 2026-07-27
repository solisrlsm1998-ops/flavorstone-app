"use server";

import { auth } from "@clerk/nextjs/server";
import { put, del } from "@vercel/blob";

const ACCEPTED_UPLOAD_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "mp4"];
const ACCEPTED_UPLOAD_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "video/mp4"];

function getFileExtension(fileName = "") {
  const segments = fileName.toLowerCase().split(".");
  return segments.length > 1 ? segments.at(-1) : "";
}

export async function uploadContentMedia(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const file = formData.get("file") as File | null;
  const contentId = formData.get("contentId") as string;
  const productName = (formData.get("productName") as string) || "workspace";

  if (!file) throw new Error("No se recibió el archivo.");

  const extension = getFileExtension(file.name);
  const mimeType = (file.type || "").toLowerCase();

  if (!extension || !ACCEPTED_UPLOAD_EXTENSIONS.includes(extension) || (mimeType && !ACCEPTED_UPLOAD_MIME_TYPES.includes(mimeType))) {
    throw new Error("Solo se permiten archivos JPG, JPEG, PNG, WEBP y MP4.");
  }

  const timestamp = Date.now();
  const safeName = file.name.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9._-]/g, "");
  const storagePath = `${productName}/${contentId}/${timestamp}-${safeName}`;

  const blob = await put(storagePath, file, {
    access: "public",
    addRandomSuffix: false,
  });

  const mediaType = mimeType.startsWith("video/") || extension === "mp4" ? "video" : "image";

  return {
    fileName: file.name,
    fileUrl: blob.url,
    storagePath,
    mimeType: file.type,
    mediaType,
    sizeBytes: file.size,
  };
}

export async function deleteContentMediaBlob(fileUrl: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");
  await del(fileUrl);
}
