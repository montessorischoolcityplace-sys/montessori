import { NextRequest, NextResponse } from "next/server";
import {
  createParent,
  getParentByUid,
  getParents,
  getParentsByStatus,
  updateParent,
  completeParentProfile,
  deactivateParent,
  deleteParent,
} from "@/lib/parents/parent.repository";
import {
  CreateParentInput,
  UpdateParentInput,
  ParentStatus,
} from "@/lib/parents/parent.type";

// ─────────────────────────────────────────────
// GET
// /api/parents
// /api/parents?uid=UID
// /api/parents?status=active
// ─────────────────────────────────────────────

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const uid = searchParams.get("uid");
    const status = searchParams.get("status");

    if (uid) {
      const parent = await getParentByUid(uid);

      if (!parent) {
        return NextResponse.json(
          { error: "Parent not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(parent);
    }

    if (status) {
      const parents = await getParentsByStatus(status as ParentStatus);
      return NextResponse.json(parents);
    }

    const parents = await getParents();
    return NextResponse.json(parents);
  } catch (error) {
    console.error("GET /api/parents error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────
// POST
// Crea un padre/tutor
// ─────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateParentInput;

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

    if (!body.contact?.phone) {
      return NextResponse.json(
        { error: "contact.phone is required" },
        { status: 400 }
      );
    }

    if (
      !body.address?.street ||
      !body.address?.city ||
      !body.address?.state ||
      !body.address?.zipCode ||
      !body.address?.country
    ) {
      return NextResponse.json(
        {
          error:
            "address.street, address.city, address.state, address.zipCode and address.country are required",
        },
        { status: 400 }
      );
    }

    const parent = await createParent(body);

    return NextResponse.json(parent, { status: 201 });
  } catch (error) {
    console.error("POST /api/parents error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────
// PUT
// /api/parents?uid=UID
// /api/parents?uid=UID&action=completeProfile
// /api/parents?uid=UID&action=deactivate
// ─────────────────────────────────────────────

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
      const body = (await req.json()) as UpdateParentInput;

      const parent = await completeParentProfile(uid, body);

      if (!parent) {
        return NextResponse.json(
          { error: "Parent not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(parent);
    }

    if (action === "deactivate") {
      await deactivateParent(uid);
      return NextResponse.json({ ok: true });
    }

    const body = (await req.json()) as UpdateParentInput;

    const parent = await updateParent(uid, body);

    if (!parent) {
      return NextResponse.json(
        { error: "Parent not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(parent);
  } catch (error) {
    console.error("PUT /api/parents error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────
// DELETE
// /api/parents?uid=UID
// ─────────────────────────────────────────────

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

    await deleteParent(uid);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/parents error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}