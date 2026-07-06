import { cookies } from "next/headers";
import { adminAuth, adminDb } from "./firebase-admin";

export interface AuthResult {
  uid: string;
  role: string;
}

export async function getAuthenticatedUid(): Promise<AuthResult | null> {
  try {
    const cookieStore = await cookies();

    const session = cookieStore.get("__session")?.value;

    if (!session) {
      return null;
    }

    // Verificar la sesión
    const decoded = await adminAuth.verifySessionCookie(session, true);

    // Obtener el usuario desde Firestore
    const userDoc = await adminDb
      .collection("users")
      .doc(decoded.uid)
      .get();

    if (!userDoc.exists) {
      return null;
    }

    const user = userDoc.data();

    return {
      uid: decoded.uid,
      role: String(user?.role ?? ""),
    };
  } catch (error) {
    console.error("Authentication error:", error);
    return null;
  }
}