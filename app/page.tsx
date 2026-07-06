import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase-admin";
import HomeClient from "./home-client";

export default async function Page() {
  const cookieStore = await cookies();
  const session = cookieStore.get("__session")?.value;

  let isAuthenticated = false;

  if (session) {
    try {
      await adminAuth.verifySessionCookie(session, true);
      isAuthenticated = true;
    } catch {
      isAuthenticated = false;
    }
  }

  return <HomeClient isAuthenticated={isAuthenticated} />;
}