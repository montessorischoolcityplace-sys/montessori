import { NextRequest, NextResponse } from "next/server";
import {
  createAdmin,
  getAdminByUid,
  getAdmins,
  getAdminsByLevel,
  getAdminsByStatus,
  updateAdmin,
  completeAdminProfile,
  touchAdminLastAccess,
  deactivateAdmin,
  suspendAdmin,
  deleteAdmin,
} from "@/lib/admins/admin.repository";
import {
  AdminLevel,
  AdminStatus,
  CreateAdminInput,
  UpdateAdminInput,
} from "@/lib/admins/admin.type";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const uid = searchParams.get("uid");
    const level = searchParams.get("level");
    const status = searchParams.get("status");

    if (uid) {
      const admin = await getAdminByUid(uid);

      if (!admin) {
        return NextResponse.json(
          { error: "Admin not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(admin);
    }

    if (level) {
      const admins = await getAdminsByLevel(level as AdminLevel);
      return NextResponse.json(admins);
    }

    if (status) {
      const admins = await getAdminsByStatus(status as AdminStatus);
      return NextResponse.json(admins);
    }

    const admins = await getAdmins();
    return NextResponse.json(admins);
  } catch (error) {
    console.error("GET /api/admins error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateAdminInput;

    if (!body.uid || !body.userId || !body.email) {
      return NextResponse.json(
        { error: "uid, userId and email are required" },
        { status: 400 }
      );
    }

    if (!body.firstName || !body.lastName) {
      return NextResponse.json(
        { error: "firstName and lastName are required" },
        { status: 400 }
      );
    }

    if (!body.position || !body.adminLevel) {
      return NextResponse.json(
        { error: "position and adminLevel are required" },
        { status: 400 }
      );
    }

    const admin = await createAdmin(body);

    return NextResponse.json(admin, { status: 201 });
  } catch (error) {
    console.error("POST /api/admins error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const uid = searchParams.get("uid");
    const action = searchParams.get("action");

    if (!uid) {
      return NextResponse.json(
        { error: "uid is required" },
        { status: 400 }
      );
    }

    if (action === "completeProfile") {
      const body = (await req.json()) as UpdateAdminInput;
      const admin = await completeAdminProfile(uid, body);

      if (!admin) {
        return NextResponse.json(
          { error: "Admin not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(admin);
    }

    if (action === "touchLastAccess") {
      await touchAdminLastAccess(uid);
      return NextResponse.json({ ok: true });
    }

    if (action === "deactivate") {
      await deactivateAdmin(uid);
      return NextResponse.json({ ok: true });
    }

    if (action === "suspend") {
      await suspendAdmin(uid);
      return NextResponse.json({ ok: true });
    }

    const body = (await req.json()) as UpdateAdminInput;

    const admin = await updateAdmin(uid, body);

    if (!admin) {
      return NextResponse.json(
        { error: "Admin not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(admin);
  } catch (error) {
    console.error("PUT /api/admins error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const uid = searchParams.get("uid");

    if (!uid) {
      return NextResponse.json(
        { error: "uid is required" },
        { status: 400 }
      );
    }

    await deleteAdmin(uid);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/admins error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}