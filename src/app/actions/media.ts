"use server";

import { auth } from "@clerk/nextjs/server";
import { del } from "@vercel/blob";

// La subida ya no pasa por aquí: el navegador va directo a Blob vía
// /api/media/upload para no chocar con el límite de la función serverless.
export async function deleteContentMediaBlob(fileUrl: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("No autenticado.");
  await del(fileUrl);
}
