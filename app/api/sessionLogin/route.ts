export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";

const COOKIE = process.env.SESSION_COOKIE_NAME ?? "__session";

// 5 días en segundos
const REMEMBER_MAX_AGE = Number(
  process.env.SESSION_COOKIE_MAX_AGE ?? 60 * 60 * 24 * 5
);

// 2 horas en segundos
const NORMAL_MAX_AGE = 60 * 60 * 2;

export async function POST(req: Request) {
  try {
    const { idToken, remember } = await req.json();

    if (!idToken) {
      return NextResponse.json(
        { error: "Missing idToken" },
        { status: 400 }
      );
    }

    const maxAge = remember ? REMEMBER_MAX_AGE : NORMAL_MAX_AGE;
    const expiresIn = maxAge * 1000;

    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn,
    });

    const res = NextResponse.json({ ok: true });

    res.cookies.set(COOKIE, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge,
      expires: new Date(Date.now() + expiresIn),
    });

    return res;
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Cannot create session";

    console.error("[sessionLogin error]", message);

    return NextResponse.json(
      { error: message },
      { status: 401 }
    );
  }
}