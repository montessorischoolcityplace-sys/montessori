// components/AuthHeader.tsx
import Link from "next/link";

interface AuthHeaderProps {
  user: {
    email?: string | null;
    uid: string;
  } | null;
}

export default function AuthHeader({ user }: AuthHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/70 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <button
          type="button"          
          className="font-bold text-lg tracking-tight text-white hover:text-emerald-400 transition"
        >
          Panel<span className="text-emerald-400">.dev</span>
        </button>   
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden text-right sm:block">
                <p className="text-xs text-slate-400">
                  Sesión activa
                </p>

                <p className="max-w-55 truncate text-sm text-white">
                  {user.email ?? user.uid}
                </p>
              </div>

              <form action="/api/sessionLogout" method="POST">
                <button className="rounded-xl  px-4 py-2 text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-900 cursor-pointer">
                  Salir
                </button>
              </form>
            </>
          ) : (
            <span className="text-sm text-red-300">
              Sin sesión
            </span>
          )}
        </div>
      </div>
    </header>
  );
}