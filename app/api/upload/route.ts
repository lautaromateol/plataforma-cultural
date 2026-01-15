import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { verify } from "hono/jwt";

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const decoded = await verify(token, process.env.JWT_SECRET!, "HS256");
    if (!decoded) {
      return NextResponse.json(
        { error: "Token inválido" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No se proporcionó ningún archivo" },
        { status: 400 }
      );
    }

    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "El archivo es demasiado grande. Máximo 50MB" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const blobPath = `escuela/uploads/${timestamp}-${randomString}-${file.name}`;

    const blob = await put(blobPath, new Blob([bytes], { type: file.type }), {
      access: "public",
    });

    return NextResponse.json(
      {
        success: true,
        fileUrl: blob.url,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al subir archivo:", error);
    const errorMessage = error instanceof Error ? error.message : "Error desconocido al subir el archivo";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

