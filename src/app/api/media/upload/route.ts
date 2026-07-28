import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const ALLOWED_CONTENT_TYPES = ["image/jpeg", "image/png", "image/webp", "video/mp4"];

// Los archivos van del navegador directo a Blob. Pasarlos por una Server Action
// los hacía cruzar la función serverless, que corta las peticiones de unos pocos
// MB: cualquier video fallaba. Aquí solo se firma el permiso de subida.
export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        const { userId } = await auth();
        if (!userId) throw new Error("No autenticado.");

        return {
          allowedContentTypes: ALLOWED_CONTENT_TYPES,
          addRandomSuffix: false,
          maximumSizeInBytes: 500 * 1024 * 1024,
        };
      },
      onUploadCompleted: async () => {
        // El registro en content_media lo crea el cliente al resolver la subida.
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
