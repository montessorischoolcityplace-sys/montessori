import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase-admin";
import cloudinary from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
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

    const body = await req.json();

    const publicId = body.publicId as string | undefined;
    const resourceType = body.resourceType as "image" | "raw" | undefined;

    if (!publicId || !resourceType) {
      return NextResponse.json(
        { ok: false, message: "publicId and resourceType are required." },
        { status: 400 }
      );
    }

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });

    return NextResponse.json({
      ok: true,
      result,
    });
  } catch (error) {
    console.error("Delete upload error:", error);

    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Could not delete the file.",
      },
      { status: 500 }
    );
  }
}