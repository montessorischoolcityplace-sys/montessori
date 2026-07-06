import { NextRequest, NextResponse } from "next/server";

const COOKIE = process.env.SESSION_COOKIE_NAME ?? "__session";

export function middleware(req: NextRequest){
    const { pathname } = req.nextUrl;
    if(!pathname.startsWith("/dashboard")) return NextResponse.next();

    const has = req.cookies.get(COOKIE)?.value;
    if(has) return NextResponse.next();

    const url = new URL("/login", req.url);
    url.searchParams.set("rediredctTo", pathname);
    return NextResponse.redirect(url);
}

export const config = {
    matcher: ["/dashboard/:path*"],
}