import { NextRequest, NextResponse } from "next/server";
import {
  createUser,
  getUserByUid,
  getUsers,
  getUsersByRole,
  updateUser,
  touchLastLogin,
} from "@/lib/users/user.repository";
import {
  CreateUserInput,
  UpdateUserInput,
  UserRole,
} from "@/lib/users/user.type";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const uid = searchParams.get("uid");
    const role = searchParams.get("role");

    if (uid) {
      const user = await getUserByUid(uid);

      if (!user) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(user);
    }

    if (role) {
      const users = await getUsersByRole(role as UserRole);
      return NextResponse.json(users);
    }

    const users = await getUsers();
    return NextResponse.json(users);
  } catch (error) {
    console.error("GET /api/users error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateUserInput;

    if (!body.uid || !body.email || !body.firstName || !body.lastName) {
      return NextResponse.json(
        { error: "uid, email, firstName and lastName are required" },
        { status: 400 }
      );
    }

    if (!body.role) {
      return NextResponse.json(
        { error: "role is required" },
        { status: 400 }
      );
    }

    const user = await createUser(body);

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("POST /api/users error:", error);

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

    if (action === "touchLastLogin") {
      await touchLastLogin(uid);
      return NextResponse.json({ ok: true });
    }

    const body = (await req.json()) as UpdateUserInput;

    const user = await updateUser(uid, body);

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("PUT /api/users error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}