import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import PublicHeader from "@/components/layout/header";
import { adminAuth } from "@/lib/firebase-admin";
import { getUserByUid } from "@/lib/users/user.repository";
import { getParentByUid } from "@/lib/parents/parent.repository";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("__session")?.value;

  if (!session) redirect("/login?redirectTo=/dashboard");

  let uid: string;

  try {
    const decoded = await adminAuth.verifySessionCookie(session, true);
    uid = decoded.uid;
  } catch {
    redirect("/login?redirectTo=/dashboard");
  }

  const user = await getUserByUid(uid);

  if (!user) {
    redirect("/signup");
  }

  const firstName = user.firstName || "there";

  let parentProfileCompleted = true;

  if (user.role === "parent") {
    const parent = await getParentByUid(uid);
    parentProfileCompleted = !!parent && parent.profileCompleted === true;
  }

  return (
    <>
      <PublicHeader />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Outfit:wght@300;400;500;600;700&display=swap');

        .db-page {
          min-height: calc(100vh - 4rem);
          background:
            radial-gradient(circle at top left, rgba(245,195,106,.18), transparent 34%),
            linear-gradient(135deg, #fffaf0 0%, #f7efe2 45%, #fffdf8 100%);
          font-family: 'Outfit', sans-serif;
          padding: 48px 24px 90px;
        }

        .db-root {
          max-width: 1100px;
          margin: 0 auto;
        }

        .db-hero {
          background: rgba(255,255,255,.78);
          border: 1px solid rgba(210,180,140,.45);
          border-radius: 28px;
          padding: 34px;
          margin-bottom: 28px;
          box-shadow: 0 10px 30px rgba(80,45,10,.08);
        }

        .db-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: .12em;
          text-transform: uppercase;
          padding: 7px 13px;
          border-radius: 999px;
          background: #fff3d8;
          color: #a5420b;
          margin-bottom: 14px;
        }

        .db-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 46px;
          line-height: 1.05;
          color: #1a0f00;
          margin: 0 0 8px;
        }

        .db-subtitle {
          max-width: 680px;
          font-size: 16px;
          line-height: 1.7;
          color: #725944;
        }

        .db-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
        }

        @media(max-width: 760px) {
          .db-grid {
            grid-template-columns: 1fr;
          }

          .db-title {
            font-size: 36px;
          }
        }

        .db-card {
          display: flex;
          gap: 16px;
          align-items: flex-start;
          text-decoration: none;
          background: rgba(255,255,255,.9);
          border: 1px solid rgba(210,180,140,.5);
          border-radius: 22px;
          padding: 22px;
          transition: transform .15s, box-shadow .18s, border-color .18s;
        }

        .db-card:hover {
          transform: translateY(-2px);
          border-color: #c0410c;
          box-shadow: 0 12px 28px rgba(80,45,10,.12);
        }

        .db-icon {
          width: 48px;
          height: 48px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          flex-shrink: 0;
        }

        .blue { background:#e8f3ff; }
        .green { background:#e9f8ee; }
        .amber { background:#fff4d8; }
        .coral { background:#ffece5; }

        .db-card-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px;
          font-weight: 700;
          color: #1a0f00;
          margin-bottom: 5px;
        }

        .db-card-desc {
          font-size: 14px;
          line-height: 1.55;
          color: #725944;
        }

        .db-warning {
          background: #fff7e8;
          border: 1px solid #f3c47a;
          border-radius: 24px;
          padding: 26px;
          margin-bottom: 22px;
        }

        .db-warning-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 28px;
          color: #1a0f00;
          margin-bottom: 8px;
        }

        .db-warning-text {
          color: #725944;
          line-height: 1.6;
          margin-bottom: 18px;
        }

        .db-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #c0410c, #9a3008);
          color: #fff8ee;
          text-decoration: none;
          border-radius: 14px;
          padding: 12px 18px;
          font-weight: 700;
          box-shadow: 0 6px 18px rgba(192,65,12,.28);
        }

        .db-section-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 24px;
          color: #1a0f00;
          margin: 34px 0 16px;
        }
      `}</style>

      <main className="db-page">
        <div className="db-root">
          <section className="db-hero">
            <span className="db-badge">
              {user.role === "admin"
                ? "Administrator"
                : user.role === "teacher"
                ? "Teacher"
                : "Parent"}
            </span>

            <h1 className="db-title">Welcome back, {firstName}</h1>

            <p className="db-subtitle">
              {user.role === "admin"
                ? "Manage enrollments, payments, users, teachers, and school information."
                : user.role === "teacher"
                ? "View your classroom and create student observations."
                : parentProfileCompleted
                ? "Manage your children, tuition payments, profile, and school updates."
                : "Before registering students or viewing payments, please complete your parent profile."}
            </p>
          </section>

          {user.role === "parent" && !parentProfileCompleted && (
            <>
              <section className="db-warning">
                <h2 className="db-warning-title">Complete your parent profile</h2>
                <p className="db-warning-text">
                  We need your personal information, contact details, address,
                  emergency contacts, and pickup preferences before you can
                  register your children or access tuition payments.
                </p>
                <Link href="/dashboard/profile" className="db-btn">
                  Complete profile →
                </Link>
              </section>
            </>
          )}

          {user.role === "parent" && parentProfileCompleted && (
            <div className="db-grid">
              <Link href="/dashboard/students" className="db-card">
                <div className="db-icon blue">🧒</div>
                <div>
                  <div className="db-card-title">My students</div>
                  <div className="db-card-desc">
                    Register your children and view their enrollment status.
                  </div>
                </div>
              </Link>

              <Link href="/dashboard/payments" className="db-card">
                <div className="db-icon green">💳</div>
                <div>
                  <div className="db-card-title">Tuition payments</div>
                  <div className="db-card-desc">
                    Review pending payments and upload receipts.
                  </div>
                </div>
              </Link>

              <Link href="/dashboard/observations" className="db-card">
                <div className="db-icon amber">📋</div>
                <div>
                  <div className="db-card-title">Observations</div>
                  <div className="db-card-desc">
                    Read progress notes shared by your child’s teacher.
                  </div>
                </div>
              </Link>

              <Link href="/dashboard/profile" className="db-card">
                <div className="db-icon coral">👤</div>
                <div>
                  <div className="db-card-title">My profile</div>
                  <div className="db-card-desc">
                    Update contact information, address, and preferences.
                  </div>
                </div>
              </Link>
            </div>
          )}

          {user.role === "teacher" && (
            <div className="db-grid">
              <Link
                href="/dashboard/teacher/observations"
                className="db-card"
              >
                <div className="db-icon blue">
                  📖
                </div>

                <div>
                  <div className="db-card-title">
                    Classroom Journal
                  </div>

                  <div className="db-card-desc">
                    Review, create and manage daily observations, photos,
                    recommendations and classroom notes shared with families.
                  </div>
                </div>
              </Link>

              <Link href="/dashboard/teacher/observations/new" className="db-card">
                <div className="db-icon amber">📝</div>
                <div>
                  <div className="db-card-title">New observation</div>
                  <div className="db-card-desc">
                    Create a progress observation for a student.
                  </div>
                </div>
              </Link>
            </div>
          )}

          {user.role === "admin" && (
            <>
              <div className="db-grid">

                <Link href="/dashboard/admin/payments" className="db-card">
                  <div className="db-icon green">🧾</div>
                  <div>
                    <div className="db-card-title">Payments</div>
                    <div className="db-card-desc">
                      Review tuition receipts and payment status.
                    </div>
                  </div>
                </Link>
              </div>

              <h2 className="db-section-title">School management</h2>

              <div className="db-grid">
                <Link href="/dashboard/admin/payments/plans" className="db-card">
                  <div className="db-icon amber">📐</div>
                  <div>
                    <div className="db-card-title">Tuition plans</div>
                    <div className="db-card-desc">
                      Create and edit tuition plans for students.
                    </div>
                  </div>
                </Link>

                <Link href="/dashboard/students" className="db-card">
                  <div className="db-icon blue">🧒</div>
                  <div>
                    <div className="db-card-title">Student directory</div>
                    <div className="db-card-desc">
                      Browse all registered students.
                    </div>
                  </div>
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}