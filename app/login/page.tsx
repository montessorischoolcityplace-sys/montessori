"use client";

import PublicHeader from "@/components/layout/header";
import React, { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth, configureAuthPersistence } from "@/lib/firebase-client";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import Link from "next/link";
import { useState } from "react";

const SLIDES = [
  "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=1600&q=80&fit=crop",
  "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1600&q=80&fit=crop",
  "https://images.unsplash.com/photo-1544776193-352d25ca82cd?w=1600&q=80&fit=crop",
  "https://images.unsplash.com/photo-1529390079861-591de354faf5?w=1600&q=80&fit=crop",
];

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const router = useRouter();
  const sp = useSearchParams();
  const redirectTo = sp.get("redirectTo") ?? "/dashboard";

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
        router.replace(redirectTo);
        router.refresh();
      }
    } catch {
      // No session, stay on login.
    }
  }

  checkSession();

  return () => {
    active = false;
  };
}, [router, redirectTo]);

  async function sessionLogin() {
    const idToken = await auth.currentUser?.getIdToken(true);
    if (!idToken) throw new Error("No idToken");
    const res = await fetch("/api/sessionLogin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken, remember }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      throw new Error(j.error ?? "Could not create session");
    }
  }

  async function onEmailPass(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await configureAuthPersistence(remember);
      await signInWithEmailAndPassword(auth, email, password);
      await sessionLogin();
      router.push(redirectTo);
      router.refresh();
    } catch (e: any) {
      setErr(e.message ?? "Sign-in error");
    } finally {
      setLoading(false);
    }
  }

  async function onGoogle() {
    setErr(null);
    setLoading(true);
    try {
      await configureAuthPersistence(remember);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      await sessionLogin();
      router.push(redirectTo);
      router.refresh();
    } catch (e: any) {
      setErr(e.message ?? "Google sign-in error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap');

        .lg-root, .lg-root * { box-sizing: border-box; margin: 0; padding: 0; }

        .lg-root {
          font-family: 'Plus Jakarta Sans', sans-serif;
          min-height: calc(100vh - 4rem);
          position: relative;
          overflow: hidden;
          background: #030f1c;
        }

        /* ─────────────────────────────────────
           SLIDESHOW  –  scale-down entrance
        ───────────────────────────────────── */
        .slides-wrap {
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
          transform: scale(1.14);
          animation: zoomDown 24s infinite;
          will-change: opacity, transform;
        }

        .slide:nth-child(1) { animation-delay: 0s; }
        .slide:nth-child(2) { animation-delay: 6s; }
        .slide:nth-child(3) { animation-delay: 12s; }
        .slide:nth-child(4) { animation-delay: 18s; }

        @keyframes zoomDown {
          /* appear big → shrink to normal → linger → fade out */
          0%   { opacity: 0;    transform: scale(1.14); }
          5%   { opacity: 1;    transform: scale(1.08); }
          22%  { opacity: 1;    transform: scale(1.00); }
          27%  { opacity: 0;    transform: scale(0.97); }
          100% { opacity: 0;    transform: scale(0.97); }
        }

        /* ── Overlays ── */
        /* Deep blue-teal atmosphere */
        .ov-color {
          position: absolute; inset: 0; z-index: 1;
          background:
            radial-gradient(ellipse 90% 70% at 10% 30%,  rgba(6,60,110,0.60) 0%, transparent 65%),
            radial-gradient(ellipse 60% 80% at 80% 100%, rgba(4,90,80,0.50)  0%, transparent 60%),
            radial-gradient(ellipse 50% 50% at 50%  0%,  rgba(30,160,90,0.18) 0%, transparent 55%),
            linear-gradient(170deg, rgba(4,20,50,0.70) 0%, rgba(2,40,55,0.55) 100%);
        }

        /* Frosted curtain on right so card is readable */
        .ov-right {
          position: absolute; inset: 0; z-index: 2;
          background: linear-gradient(
            to right,
            transparent     0%,
            transparent     40%,
            rgba(3,15,40,0.70) 58%,
            rgba(3,15,40,0.92) 100%
          );
        }

        /* Subtle top-left glow for yellow accent */
        .ov-glow {
          position: absolute; z-index: 1;
          width: 500px; height: 500px; border-radius: 50%;
          background: radial-gradient(circle, rgba(230,195,30,0.18) 0%, transparent 70%);
          top: -120px; left: -80px;
          pointer-events: none;
        }

        /* ── Layout ── */
        .lg-inner {
          position: relative; z-index: 10;
          max-width: 1200px; margin: 0 auto;
          padding: 52px 32px 72px;
          display: grid;
          grid-template-columns: 1fr 420px;
          gap: 60px;
          align-items: center;
          min-height: calc(100vh - 4rem);
        }
        @media (max-width: 860px) {
          .lg-inner { grid-template-columns: 1fr; padding: 32px 20px 56px; gap: 36px; }
          .lg-left  { display: none; }
        }

        /* ── Left column ── */
        .lg-left { color: #fff; }

        .lg-eyebrow {
          display: inline-flex; align-items: center; gap: 10px;
          font-size: 11px; font-weight: 600; letter-spacing: 0.18em;
          text-transform: uppercase; color: #7DE8C0; margin-bottom: 22px;
        }
        .lg-eyebrow::before {
          content: ''; display: block; width: 28px; height: 1.5px; background: #7DE8C0;
        }

        .lg-headline {
          font-family: 'Playfair Display', serif;
          font-size: 58px; font-weight: 700; line-height: 1.08;
          color: #EEF8FF; margin-bottom: 20px;
          text-shadow: 0 2px 28px rgba(0,0,0,0.55);
        }
        .lg-headline em { font-style: italic; color: #E6C31E; }

        .lg-body {
          font-size: 16px; font-weight: 300;
          color: rgba(200,240,230,0.80); line-height: 1.78;
          max-width: 400px; margin-bottom: 36px;
        }

        /* Quote block */
        .lg-quote {
          border-left: 3px solid #E6C31E;
          padding: 14px 0 14px 20px; margin-bottom: 34px;
        }
        .lg-quote-text {
          font-family: 'Playfair Display', serif; font-style: italic;
          font-size: 16px; color: rgba(220,245,235,0.88); line-height: 1.6;
          margin-bottom: 8px;
        }
        .lg-quote-author {
          font-size: 11px; font-weight: 600; letter-spacing: 0.10em;
          text-transform: uppercase; color: rgba(125,232,192,0.70);
        }

        /* Stats */
        .lg-stats { display: flex; gap: 28px; }
        .lg-stat { }
        .lg-stat-num {
          font-family: 'Playfair Display', serif; font-size: 30px; font-weight: 700;
          color: #EEF8FF; line-height: 1;
        }
        .lg-stat-num span { color: #E6C31E; }
        .lg-stat-label { font-size: 12px; color: rgba(200,240,230,0.60); margin-top: 3px; font-weight: 400; }
        .lg-stat-div { width: 1px; background: rgba(125,232,192,0.18); align-self: stretch; }

        /* ── Card ── */
        .lg-card {
          background: rgba(250, 255, 252, 0.97);
          border: 1px solid rgba(100,200,160,0.30);
          border-radius: 24px;
          padding: 36px 32px;
          box-shadow:
            0 8px 40px rgba(0,0,0,0.40),
            0 2px 4px rgba(0,0,0,0.20),
            inset 0 1px 0 rgba(255,255,255,0.95);
          position: relative; overflow: hidden;
        }
        /* Accent bar: blue → green → yellow */
        .lg-card::before {
          content: ''; position: absolute;
          top: 0; left: 0; right: 0; height: 4px;
          background: linear-gradient(90deg, #0D6EFD 0%, #0FAE7A 45%, #E6C31E 100%);
        }
        /* Subtle teal shimmer top-right */
        .lg-card::after {
          content: ''; position: absolute; inset: 0;
          background: radial-gradient(ellipse 55% 35% at 100% 0%, rgba(30,180,130,0.08) 0%, transparent 70%);
          pointer-events: none;
        }

        .lg-card-head { text-align: center; margin-bottom: 24px; position: relative; z-index: 1; }
        .lg-card-icon {
          display: inline-flex; align-items: center; justify-content: center;
          width: 54px; height: 54px; border-radius: 16px;
          background: linear-gradient(135deg, #D8F5EC, #C0EAF8);
          border: 1px solid rgba(13,110,253,0.25);
          margin-bottom: 13px;
          box-shadow: 0 2px 10px rgba(13,110,200,0.14);
        }
        .lg-card-title {
          font-family: 'Playfair Display', serif; font-size: 27px; font-weight: 600;
          color: #05181A; margin-bottom: 4px;
        }
        .lg-card-sub { font-size: 14px; color: #607080; font-weight: 400; }

        /* Form */
        .lg-form { display: flex; flex-direction: column; gap: 15px; position: relative; z-index: 1; }

        .lg-label {
          display: block; font-size: 11.5px; font-weight: 600;
          letter-spacing: 0.07em; text-transform: uppercase;
          color: #1A3A30; margin-bottom: 5px;
        }
        .lg-input {
          width: 100%; border: 1.5px solid #C8DDD6; border-radius: 11px;
          background: #F4FBF8; padding: 10px 14px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 15px; color: #051810; outline: none;
          transition: border-color 0.18s, box-shadow 0.18s, background 0.18s;
        }
        .lg-input::placeholder { color: #96B8A8; font-weight: 300; }
        .lg-input:focus {
          border-color: #0D9E72; box-shadow: 0 0 0 3px rgba(13,158,114,0.14);
          background: #fff;
        }

        .lg-pass-wrap { position: relative; }
        .lg-pass-btn {
          position: absolute; right: 11px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          font-size: 11.5px; font-family: 'Plus Jakarta Sans', sans-serif;
          font-weight: 600; color: #0D6EFD; padding: 2px 7px;
          border-radius: 6px; transition: background 0.15s;
        }
        .lg-pass-btn:hover { background: #EAF3FF; }
        .lg-pass-input { padding-right: 74px !important; }

        .lg-bottom-row {
          display: flex; align-items: center; justify-content: space-between;
        }
        .lg-remember { display: flex; align-items: center; gap: 8px; cursor: pointer; }
        .lg-check {
          width: 17px; height: 17px; border-radius: 5px;
          accent-color: #0D9E72; cursor: pointer; flex-shrink: 0;
        }
        .lg-remember-lbl { font-size: 13px; color: #3A5A50; font-weight: 400; }
        .lg-forgot { font-size: 13px; color: #0D6EFD; text-decoration: none; font-weight: 600; }
        .lg-forgot:hover { text-decoration: underline; }

        .lg-error {
          background: #F0FBF7; border: 1px solid #A0D8C0;
          border-radius: 10px; padding: 10px 13px;
          font-size: 13px; color: #0A4A30;
          display: flex; align-items: flex-start; gap: 7px;
        }

        /* Buttons */
        .lg-submit {
          width: 100%; border: none; border-radius: 13px;
          background: linear-gradient(135deg, #0D6EFD 0%, #0A55CC 100%);
          color: #fff;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 15px; font-weight: 600; letter-spacing: 0.02em;
          padding: 13px 20px; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          box-shadow: 0 4px 16px rgba(13,110,253,0.38);
          transition: opacity 0.18s, transform 0.15s, box-shadow 0.18s;
        }
        .lg-submit:hover:not(:disabled) {
          opacity: 0.93; transform: translateY(-1px);
          box-shadow: 0 6px 22px rgba(13,110,253,0.45);
        }
        .lg-submit:active:not(:disabled) { transform: translateY(0); }
        .lg-submit:disabled { opacity: 0.50; cursor: not-allowed; }

        .lg-divider { display: flex; align-items: center; gap: 12px; }
        .lg-div-line { flex: 1; height: 1px; background: #D0E8DC; }
        .lg-div-text {
          font-size: 11px; color: #90B0A0;
          text-transform: uppercase; letter-spacing: 0.08em;
        }

        .lg-google {
          width: 100%; border: 1.5px solid #C8DDD6; border-radius: 13px;
          background: #fff; font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 15px; font-weight: 500; color: #1A1A1A;
          padding: 11px 20px; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          transition: border-color 0.18s, box-shadow 0.18s, transform 0.15s;
        }
        .lg-google:hover:not(:disabled) {
          border-color: #9AC8B8; box-shadow: 0 2px 10px rgba(13,110,253,0.10);
          transform: translateY(-1px);
        }
        .lg-google:disabled { opacity: 0.50; cursor: not-allowed; }

        /* Spinners */
        .spin-w {
          width: 15px; height: 15px;
          border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff;
          border-radius: 50%; animation: rot 0.7s linear infinite;
        }
        .spin-d {
          width: 15px; height: 15px;
          border: 2px solid rgba(0,0,0,0.12); border-top-color: #1A1A1A;
          border-radius: 50%; animation: rot 0.7s linear infinite;
        }
        @keyframes rot { to { transform: rotate(360deg); } }

        .lg-signup-link { margin-top: 20px; text-align: center; font-size: 13px; color: #608070; }
        .lg-signup-link a { color: #0D6EFD; font-weight: 600; text-decoration: none; }
        .lg-signup-link a:hover { text-decoration: underline; }

        .lg-page-footer {
          position: relative; z-index: 10;
          border-top: 1px solid rgba(255,255,255,0.07);
          padding: 20px 32px; text-align: center;
          font-size: 12px; color: rgba(150,220,190,0.40);
          background: rgba(3,15,40,0.65);
        }
      `}</style>

      <PublicHeader isLogin={true} />

      <div className="lg-root">

        <div className="slides-wrap">
          {SLIDES.map((url, i) => (
            <div key={i} className="slide" style={{ backgroundImage: `url('${url}')` }} />
          ))}
        </div>

        <div className="ov-glow" />
        <div className="ov-color" />
        <div className="ov-right" />

        <div className="lg-inner">

          <div className="lg-left">
            <div className="lg-eyebrow">Welcome Back</div>

            <h1 className="lg-headline">
              Your <em>learning</em><br />
              space is<br />
              waiting for you.
            </h1>

            <p className="lg-body">
              Sign in to access your students' progress, classroom materials,
              and the latest updates from the Dallas Montessori community.
            </p>

            <div className="lg-quote">
              <p className="lg-quote-text">
                "The greatest sign of success for a teacher is to be able to say:
                the children are now working as if I did not exist."
              </p>
              <div className="lg-quote-author">— Maria Montessori</div>
            </div>

          </div>

          <div className="lg-card">
            <div className="lg-card-head">
              <div className="lg-card-icon">
                <svg viewBox="0 0 24 24" width="26" height="26" fill="none">
                  <path d="M12 3C9.24 3 7 5.24 7 8s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5Z" fill="#0D6EFD" opacity="0.9"/>
                  <path d="M12 15c-5 0-8 2.5-8 5v1h16v-1c0-2.5-3-5-8-5Z" fill="#0FAE7A" opacity="0.85"/>
                </svg>
              </div>
              <h2 className="lg-card-title">Sign In</h2>
              <p className="lg-card-sub">Access your Montessori account</p>
            </div>

            <button type="button" onClick={onGoogle} disabled={loading} className="lg-google">
              {loading ? <span className="spin-d" /> : (
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              )}
              {loading ? "Opening Google…" : "Continue with Google"}
            </button>

            <div className="lg-divider" style={{ margin: "17px 0" }}>
              <div className="lg-div-line" />
              <span className="lg-div-text">or with email</span>
              <div className="lg-div-line" />
            </div>

            <form onSubmit={onEmailPass} className="lg-form">
              {/* Correo */}
              <div>
                <label className="lg-label">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  className="lg-input"
                />
              </div>

              {/* Contraseña */}
              <div>
                <label className="lg-label">Password</label>
                <div className="lg-pass-wrap">
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    autoComplete="current-password"
                    required
                    minLength={8}
                    className="lg-input lg-pass-input"
                  />
                  <button type="button" onClick={() => setShowPass((s) => !s)} className="lg-pass-btn">
                    {showPass ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className="lg-bottom-row">
                <label className="lg-remember">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="lg-check"
                  />
                  <span className="lg-remember-lbl">Remember me</span>
                </label>
                <Link href="/forgot-password" className="lg-forgot">Forgot password?</Link>
              </div>

              {/* Error */}
              {err && (
                <div className="lg-error">
                  <span>⚠</span><span>{err}</span>
                </div>
              )}

              {/* Submit */}
              <button type="submit" disabled={loading} className="lg-submit">
                {loading ? (
                  <><span className="spin-w" /> Signing in…</>
                ) : (
                  <>Sign In to My Account →</>
                )}
              </button>
            </form>

            <p className="lg-signup-link">
              Don't have an account?{" "}
              <Link href="/signup">Create one free</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;