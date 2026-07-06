"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "@/lib/firebase-client";

/* ── Genera un color consistente a partir del nombre/email ── */
const AVATAR_COLORS = [
  "bg-blue-600",
  "bg-emerald-600",
  "bg-orange-500",
  "bg-violet-600",
  "bg-rose-500",
  "bg-teal-600",
];

function getAvatarColor(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

function getInitial(user: User) {
  const source = user.displayName || user.email || "?";
  return source.charAt(0).toUpperCase();
}

function PublicHeader({ isLogin = false }: { isLogin?: boolean }) {
  const router = useRouter();
  const [user, setUser]       = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOut(auth);
      // Borra la cookie de sesión httpOnly
      await fetch("/api/sessionLogout", { method: "POST" }).catch(() => {});
      router.push("/");
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <header className="sticky top-0 z-50 flex flex-row items-center py-3 px-6 rounded-bl-4xl bg-gradient-to-r rounded-br-4xl from-yellow-400 to-white border-b-4 border-white hover:border-blue-600 transition duration-200">
      <Link href="/">
        <img
          src="/logotipo.png"
          alt="Logotipo"
          className="max-w-34 duration-300 [filter:drop-shadow(0_2px_2px_rgba(255,255,255,0.5))] hover:[filter:drop-shadow(0_4px_8px_rgba(255,255,255,1.0))] transition hover:scale-125"
        />
      </Link>

      <ul className="flex flex-row gap-3 font-bold text-md ml-auto items-center text-black">

        {/* ── Auth area ── */}
        <li className="ml-2">
          {loading ? (
            /* Placeholder mientras carga el estado de auth */
            <div className="h-9 w-9 rounded-full bg-black/10 animate-pulse" />
          ) : user ? (
            /* Usuario logueado: avatar + cerrar sesión */
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard"
                title={user.displayName || user.email || "Account"}
                className={`flex h-9 w-9 items-center justify-center rounded-full font-bold text-white text-sm ${getAvatarColor(
                  user.displayName || user.email || "U"
                )} transition hover:scale-110 hover:shadow-lg`}
              >
                {getInitial(user)}
              </Link>

              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="rounded-full border-2 border-blue-600 bg-white px-3 py-1.5 text-xs font-bold text-blue-600 transition hover:bg-blue-600 hover:text-white disabled:opacity-50"
              >
                {signingOut ? "..." : "SIGN OUT"}
              </button>
            </div>
          ) : (
            /* Sin sesión: Sign In / Sign Up */
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-full border-2 border-blue-600 bg-white px-4 py-1.5 text-xs font-bold text-blue-600 transition hover:bg-blue-600 hover:text-white"
              >
                SIGN IN
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-blue-600 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-blue-700 hover:scale-105"
              >
                SIGN UP
              </Link>
            </div>
          )}
        </li>
      </ul>
    </header>
  );
}

export default PublicHeader;