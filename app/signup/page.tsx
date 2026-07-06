"use client";

import { useEffect, useState } from "react";
import PublicHeader from "@/components/layout/header";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth, configureAuthPersistence } from "@/lib/firebase-client";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  type User as FirebaseUser,
} from "firebase/auth";

const SLIDES = [
  {
    url: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=1600&q=80&fit=crop",
    credit: "Unsplash",
  },
  {
    url: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1600&q=80&fit=crop",
    credit: "Unsplash",
  },
  {
    url: "https://images.unsplash.com/photo-1544776193-352d25ca82cd?w=1600&q=80&fit=crop",
    credit: "Unsplash",
  },
  {
    url: "https://images.unsplash.com/photo-1529390079861-591de354faf5?w=1600&q=80&fit=crop",
    credit: "Unsplash",
  },
];

function splitName(fullName: string) {
  const parts = fullName.trim().split(" ").filter(Boolean);

  return {
    firstName: parts[0] || "Parent",
    lastName: parts.slice(1).join(" ") || "User",
  };
}

function SignUp() {
  const router = useRouter();
  useEffect(() => {
    let active = true;

    async function checkSession() {
      try {
        const res = await fetch("/api/session", {
          method: "GET",
          cache: "no-store",
        });

        const data = await res.json();

        if (active && data.authenticated) {
          router.replace("/dashboard");
          router.refresh();
        }
      } catch {
        // No active session, stay on signup.
      }
    }

  checkSession();

  return () => {
    active = false;
  };
}, [router]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [remember, setRemember] = useState(true);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function sessionLogin() {
    const idToken = await auth.currentUser?.getIdToken(true);

    if (!idToken) {
      throw new Error("No idToken");
    }

    const res = await fetch("/api/sessionLogin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        idToken,
        remember,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? "Could not create session");
    }
  }

  async function createUserProfile(user: FirebaseUser, fullName?: string) {
    const { firstName, lastName } = splitName(
      fullName || user.displayName || name
    );

    const res = await fetch("/api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uid: user.uid,
        email: user.email ?? email,

        firstName,
        lastName,
        photoUrl: user.photoURL ?? undefined,

        role: "parent",

        contact: {
          phone: "",
          alternatePhone: "",
        },

        preferredLanguage: "english",

        parentInfo: {
          studentIds: [],
          relationshipToStudent: "legal_guardian",
        },
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(
        data.error ?? data.message ?? "Could not create user profile"
      );
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    if (password !== confirm) {
      setErr("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await configureAuthPersistence(remember);

      const cred = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      if (name.trim()) {
        await updateProfile(cred.user, {
          displayName: name.trim(),
        });

        await cred.user.reload();
      }

      await sessionLogin();
      await createUserProfile(cred.user, name);

      router.push("/dashboard");
      router.refresh();
    } catch (error: any) {
      setErr(error.message ?? "Registration error");
    } finally {
      setLoading(false);
    }
  }

  async function onGoogleSignUp() {
    setErr(null);
    setLoading(true);

    try {
      await configureAuthPersistence(remember);

      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);

      await sessionLogin();
      await createUserProfile(cred.user, cred.user.displayName ?? "");

      router.push("/dashboard");
      router.refresh();
    } catch (error: any) {
      setErr(error.message ?? "Google registration error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Outfit:wght@300;400;500;600&display=swap');

        .su-root, .su-root * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .su-root {
          font-family: 'Outfit', sans-serif;
          min-height: calc(100vh - 4rem);
          position: relative;
          overflow: hidden;
          background: #1a0f00;
        }

        .slides-track {
          position: absolute;
          inset: 0;
          z-index: 0;
        }

        .slide {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          opacity: 0;
          transform: translateX(6%);
          animation: slideIn 24s infinite;
          will-change: opacity, transform;
        }

        .slide:nth-child(1) { animation-delay: 0s; }
        .slide:nth-child(2) { animation-delay: 6s; }
        .slide:nth-child(3) { animation-delay: 12s; }
        .slide:nth-child(4) { animation-delay: 18s; }

        @keyframes slideIn {
          0%   { opacity: 0; transform: translateX(6%); }
          4%   { opacity: 1; transform: translateX(0%); }
          22%  { opacity: 1; transform: translateX(0%); }
          27%  { opacity: 0; transform: translateX(-4%); }
          100% { opacity: 0; transform: translateX(-4%); }
        }

        .overlay-warm {
          position: absolute;
          inset: 0;
          z-index: 1;
          background:
            radial-gradient(ellipse 80% 80% at 20% 50%, rgba(180,80,10,0.45) 0%, transparent 70%),
            radial-gradient(ellipse 60% 100% at 100% 100%, rgba(120,40,0,0.55) 0%, transparent 60%),
            linear-gradient(135deg, rgba(30,10,0,0.65) 0%, rgba(10,30,60,0.55) 100%);
        }

        .overlay-right {
          position: absolute;
          inset: 0;
          z-index: 2;
          background: linear-gradient(
            to right,
            transparent 0%,
            transparent 42%,
            rgba(18, 8, 0, 0.72) 62%,
            rgba(18, 8, 0, 0.90) 100%
          );
        }

        .su-inner {
          position: relative;
          z-index: 10;
          max-width: 1200px;
          margin: 0 auto;
          padding: 52px 32px 72px;
          display: grid;
          grid-template-columns: 1fr 420px;
          gap: 64px;
          align-items: center;
          min-height: calc(100vh - 4rem);
        }

        @media (max-width: 860px) {
          .su-inner {
            grid-template-columns: 1fr;
            padding: 32px 20px 56px;
            gap: 36px;
          }

          .su-left {
            display: none;
          }
        }

        .su-left {
          color: #fff;
        }

        .su-headline {
          font-family: 'Cormorant Garamond', serif;
          font-size: 62px;
          font-weight: 700;
          line-height: 1.05;
          color: #FFF8EE;
          margin-bottom: 22px;
          text-shadow: 0 2px 24px rgba(0,0,0,0.5);
        }

        .su-headline em {
          font-style: italic;
          color: #F5C36A;
        }

        .su-body {
          font-size: 17px;
          font-weight: 300;
          color: rgba(255,240,210,0.82);
          line-height: 1.75;
          max-width: 420px;
          margin-bottom: 40px;
        }

        .su-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .su-pill {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: rgba(255,255,255,0.10);
          border: 1px solid rgba(245,195,106,0.35);
          backdrop-filter: blur(8px);
          border-radius: 100px;
          padding: 7px 14px;
          font-size: 13px;
          color: rgba(255,240,210,0.90);
          font-weight: 400;
        }

        .su-pill-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .su-location {
          margin-top: 36px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: rgba(255,220,160,0.70);
          font-weight: 400;
        }

        .su-card {
          background: rgba(255, 252, 245, 0.97);
          border: 1px solid rgba(220,195,155,0.5);
          border-radius: 24px;
          padding: 38px 34px;
          box-shadow:
            0 8px 32px rgba(0,0,0,0.35),
            0 2px 4px rgba(0,0,0,0.15),
            inset 0 1px 0 rgba(255,255,255,0.9);
          position: relative;
          overflow: hidden;
        }

        .su-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #C0410C 0%, #F5A623 40%, #E8C200 70%, #1D5FA6 100%);
        }

        .su-card-head {
          text-align: center;
          margin-bottom: 24px;
          position: relative;
          z-index: 1;
        }

        .su-card-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 54px;
          height: 54px;
          border-radius: 16px;
          background: linear-gradient(135deg, #FEF3DC, #FDE3C0);
          border: 1px solid rgba(245,163,35,0.45);
          margin-bottom: 14px;
          box-shadow: 0 2px 10px rgba(192,65,12,0.15);
        }

        .su-card-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 28px;
          font-weight: 600;
          color: #1A0F00;
          margin-bottom: 4px;
        }

        .su-card-sub {
          font-size: 14px;
          color: #8A7060;
          font-weight: 400;
        }

        .su-google-btn {
          width: 100%;
          border: 1.5px solid #DDD0BE;
          border-radius: 13px;
          background: #fff;
          color: #1A0F00;
          font-family: 'Outfit', sans-serif;
          font-size: 15px;
          font-weight: 600;
          padding: 12px 20px;
          cursor: pointer;
          margin-bottom: 16px;
          transition: border-color .18s, box-shadow .18s, transform .15s;
        }

        .su-google-btn:hover:not(:disabled) {
          border-color: #C0410C;
          box-shadow: 0 3px 12px rgba(0,0,0,0.08);
          transform: translateY(-1px);
        }

        .su-google-btn:disabled {
          opacity: .55;
          cursor: not-allowed;
        }

        .su-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 0 0 16px;
          color: #A78C78;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: .08em;
          font-weight: 600;
        }

        .su-divider::before,
        .su-divider::after {
          content: "";
          flex: 1;
          height: 1px;
          background: #E1D3BF;
        }

        .su-form {
          display: flex;
          flex-direction: column;
          gap: 15px;
          position: relative;
          z-index: 1;
        }

        .su-label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #5A3A20;
          margin-bottom: 5px;
        }

        .su-input {
          width: 100%;
          border: 1.5px solid #DDD0BE;
          border-radius: 11px;
          background: #FDFAF5;
          padding: 10px 14px;
          font-family: 'Outfit', sans-serif;
          font-size: 15px;
          color: #1A0F00;
          outline: none;
          transition: border-color 0.18s, box-shadow 0.18s, background 0.18s;
        }

        .su-input::placeholder {
          color: #C0A888;
          font-weight: 300;
        }

        .su-input:focus {
          border-color: #C0410C;
          box-shadow: 0 0 0 3px rgba(192,65,12,0.12);
          background: #fff;
          color: #C0410C;
        }

        .su-field-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        @media (max-width: 480px) {
          .su-field-row {
            grid-template-columns: 1fr;
          }
        }

        .su-remember {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }

        .su-check {
          width: 17px;
          height: 17px;
          border-radius: 5px;
          accent-color: #C0410C;
          cursor: pointer;
          flex-shrink: 0;
        }

        .su-remember-label {
          font-size: 13px;
          color: #6A5040;
          font-weight: 400;
        }

        .su-error {
          background: #FFF0EB;
          border: 1px solid #F5A898;
          border-radius: 10px;
          padding: 10px 13px;
          font-size: 13px;
          color: #B03010;
          display: flex;
          align-items: flex-start;
          gap: 7px;
        }

        .su-btn {
          width: 100%;
          border: none;
          border-radius: 13px;
          background: linear-gradient(135deg, #C0410C 0%, #9A3008 100%);
          color: #FFF8EE;
          font-family: 'Outfit', sans-serif;
          font-size: 15px;
          font-weight: 600;
          letter-spacing: 0.02em;
          padding: 13px 20px;
          cursor: pointer;
          transition: opacity 0.18s, transform 0.15s, box-shadow 0.18s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 4px 16px rgba(192,65,12,0.38);
        }

        .su-btn:hover:not(:disabled) {
          opacity: 0.93;
          transform: translateY(-1px);
          box-shadow: 0 6px 22px rgba(192,65,12,0.45);
        }

        .su-btn:disabled {
          opacity: 0.50;
          cursor: not-allowed;
        }

        .su-spin {
          width: 15px;
          height: 15px;
          border: 2px solid rgba(255,248,238,0.35);
          border-top-color: #FFF8EE;
          border-radius: 50%;
          animation: su-rotate 0.7s linear infinite;
        }

        @keyframes su-rotate {
          to {
            transform: rotate(360deg);
          }
        }

        .su-footer-text {
          margin-top: 20px;
          text-align: center;
          font-size: 13px;
          color: #8A7060;
        }

        .su-footer-text a {
          color: #1D5FA6;
          font-weight: 600;
          text-decoration: none;
        }

        .su-footer-text a:hover {
          text-decoration: underline;
        }
      `}</style>

      <PublicHeader />

      <div className="su-root">
        <div className="slides-track">
          {SLIDES.map((s, i) => (
            <div
              key={i}
              className="slide"
              style={{
                backgroundImage: `url('${s.url}')`,
              }}
            />
          ))}
        </div>

        <div className="overlay-warm" />
        <div className="overlay-right" />

        <div className="su-inner">
          <div className="su-left">
            <h1 className="su-headline">
              Where <em>curiosity</em>
              <br />
              becomes a
              <br />
              superpower.
            </h1>

            <p className="su-body">
              Join our vibrant learning community in Dallas. Every child grows
              at their own pace — guided by wonder, supported by dedicated
              educators, and celebrated every step of the way.
            </p>

            <div className="su-pills">
              <span className="su-pill">
                <span
                  className="su-pill-dot"
                  style={{ background: "#F5C36A" }}
                />
                Active Learning
              </span>

              <span className="su-pill">
                <span
                  className="su-pill-dot"
                  style={{ background: "#E05A2B" }}
                />
                Personal Progress Tracking
              </span>

              <span className="su-pill">
                <span
                  className="su-pill-dot"
                  style={{ background: "#6DB8F5" }}
                />
                Family Community
              </span>

              <span className="su-pill">
                <span
                  className="su-pill-dot"
                  style={{ background: "#A8D98A" }}
                />
                Certified Educators
              </span>
            </div>

            <div className="su-location">
              Dallas, Texas · Est. 2008
            </div>
          </div>

          <div className="su-card">
            <div className="su-card-head">
              <div className="su-card-icon">
                <svg viewBox="0 0 24 24" width="26" height="26" fill="none">
                  <circle cx="12" cy="8" r="4" fill="#C0410C" />
                  <path
                    d="M4 20c0-4 3.6-7 8-7s8 3 8 7"
                    stroke="#1D5FA6"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <div className="su-card-title">Create Your Account</div>
              <div className="su-card-sub">
                Start your Montessori journey today
              </div>
            </div>

            <button
              type="button"
              onClick={onGoogleSignUp}
              disabled={loading}
              className="su-google-btn"
            >
              Continue with Google
            </button>

            <div className="su-divider">or</div>

            <form onSubmit={onSubmit} className="su-form">
              <div>
                <label className="su-label">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  required
                  className="su-input"
                />
              </div>

              <div>
                <label className="su-label">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  className="su-input"
                />
              </div>

              <div className="su-field-row">
                <div>
                  <label className="su-label">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 chars"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    className="su-input"
                  />
                </div>

                <div>
                  <label className="su-label">Confirm</label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Repeat password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    className="su-input"
                  />
                </div>
              </div>

              <label className="su-remember">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="su-check"
                />
                <span className="su-remember-label">Keep me signed in</span>
              </label>

              {err && (
                <div className="su-error">
                  <span>⚠</span>
                  <span>{err}</span>
                </div>
              )}

              <button type="submit" disabled={loading} className="su-btn">
                {loading ? (
                  <>
                    <span className="su-spin" />
                    Creating account…
                  </>
                ) : (
                  <>Get Started →</>
                )}
              </button>
            </form>

            <p className="su-footer-text">
              Already have an account? <Link href="/login">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default SignUp;