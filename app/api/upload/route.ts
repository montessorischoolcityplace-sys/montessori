import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase-admin";
import cloudinary from "@/lib/cloudinary";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("__session")?.value;

    if (!session) {
      return NextResponse.json(
        { ok: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    await adminAuth.verifySessionCookie(session, true);

    const formData = await request.formData();

    const file = formData.get("file") as File | null;
    const folder = String(
      formData.get("folder") ?? "montessori/documents"
    );

    if (!file) {
      return NextResponse.json(
        { ok: false, message: "No file provided." },
        { status: 400 }
      );
    }

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          ok: false,
          message: "Only PDF, JPG, PNG and WEBP files are allowed.",
        },
        { status: 400 }
      );
    }

    const maxSizeInBytes = 10 * 1024 * 1024;

    if (file.size > maxSizeInBytes) {
      return NextResponse.json(
        {
          ok: false,
          message: "File is too large. Maximum size is 10MB.",
        },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const base64 = buffer.toString("base64");
    const dataUri = `data:${file.type};base64,${base64}`;

    const isImage = file.type.startsWith("image/");
    const resourceType = isImage ? "image" : "raw";

    const result = await cloudinary.uploader.upload(dataUri, {
      folder,
      resource_type: resourceType,
      use_filename: true,
      unique_filename: true,
    });

    return NextResponse.json(
      {
        ok: true,
        url: result.secure_url,
        publicId: result.public_id,
        resourceType: result.resource_type,
        fileType: file.type,
        fileName: file.name,
        bytes: result.bytes,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Upload error:", error);

    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Could not upload the file.",
      },
      { status: 500 }
    );
  }
}