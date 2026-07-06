import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import PublicHeader from "@/components/layout/header";
import { adminAuth } from "@/lib/firebase-admin";
import { getUserByUid } from "@/lib/users/user.repository";
import { getObservationsByTeacher } from "@/lib/observations/observation.repository";
import { OBSERVATION_AREA_LABELS } from "@/lib/observations/observation.type";

function formatDate(value?: string) {
  if (!value) return "No date";
  return new Date(value).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default async function TeacherObservationsPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("__session")?.value;

  if (!session) {
    redirect("/login?redirectTo=/dashboard/teacher/observations");
  }

  let uid = "";

  try {
    const decoded = await adminAuth.verifySessionCookie(session, true);
    uid = decoded.uid;
  } catch {
    redirect("/login?redirectTo=/dashboard/teacher/observations");
  }

  const user = await getUserByUid(uid);

  if (!user) redirect("/dashboard");

  if (user.role !== "teacher" && user.role !== "admin") {
    redirect("/dashboard");
  }

  const observations = await getObservationsByTeacher(uid);

  const drafts = observations.filter((o) => !o.visibleToParent).length;
  const published = observations.filter((o) => o.visibleToParent).length;

  return (
    <>
      <PublicHeader />

      <style>{`
        .to-root {
          min-height: calc(100vh - 4rem);
          padding: 42px 22px 90px;
          background:
            radial-gradient(circle at top left, rgba(29,95,166,.12), transparent 30%),
            radial-gradient(circle at top right, rgba(170,46,11,.10), transparent 28%),
            linear-gradient(135deg, #fffaf0, #f7efe2);
          font-family: Outfit, sans-serif;
        }

        .to-container {
          max-width: 1120px;
          margin: 0 auto;
        }

        .to-hero {
          background: rgba(255,255,255,.86);
          border: 1px solid rgba(210,180,140,.55);
          border-radius: 28px;
          padding: 32px;
          margin-bottom: 24px;
          box-shadow: 0 10px 30px rgba(80,45,10,.08);
          display: flex;
          justify-content: space-between;
          gap: 20px;
          align-items: flex-start;
        }

        .to-eyebrow {
          color: #c0410c;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: .16em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .to-title {
          font-family: "Cormorant Garamond", serif;
          font-size: 46px;
          color: #1a0f00;
          margin: 0 0 10px;
        }

        .to-subtitle {
          color: #725944;
          line-height: 1.6;
          max-width: 700px;
          margin: 0;
        }

        .to-btn {
          background: linear-gradient(135deg, #c0410c, #9a3008);
          color: #fff8ee;
          text-decoration: none;
          padding: 14px 20px;
          border-radius: 16px;
          font-weight: 800;
          white-space: nowrap;
          box-shadow: 0 8px 24px rgba(192,65,12,.25);
        }

        .to-summary {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        .to-summary-card {
          background: rgba(255,255,255,.92);
          border: 1px solid rgba(210,180,140,.55);
          border-radius: 22px;
          padding: 22px;
        }

        .to-number {
          font-family: "Cormorant Garamond", serif;
          font-size: 38px;
          color: #1a0f00;
          font-weight: 700;
        }

        .to-label {
          color: #725944;
          margin-top: 4px;
        }

        .to-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
        }

        .to-card {
          background: rgba(255,255,255,.94);
          border: 1px solid rgba(210,180,140,.55);
          border-radius: 22px;
          padding: 22px;
          text-decoration: none;
          display: block;
          box-shadow: 0 8px 24px rgba(80,45,10,.06);
          transition: transform .15s, box-shadow .18s, border-color .18s;
        }

        .to-card:hover {
          transform: translateY(-2px);
          border-color: #1d5fa6;
          box-shadow: 0 12px 28px rgba(29,95,166,.14);
        }

        .to-card-title {
          font-family: "Cormorant Garamond", serif;
          font-size: 28px;
          font-weight: 700;
          color: #1a0f00;
          margin-bottom: 6px;
        }

        .to-meta {
          color: #725944;
          font-size: 14px;
          line-height: 1.7;
        }

        .to-area {
          display: inline-flex;
          padding: 6px 11px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 800;
          color: #1d5fa6;
          background: #e8f1ff;
          margin: 14px 0;
        }

        .to-status {
          display: inline-flex;
          padding: 6px 11px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 800;
          margin-top: 14px;
        }

        .published {
          background: #e9f8ee;
          color: #287a3e;
        }

        .draft {
          background: #fff0eb;
          color: #aa2e0b;
        }

        .empty {
          background: rgba(255,255,255,.9);
          border: 1px dashed rgba(210,180,140,.75);
          border-radius: 22px;
          padding: 30px;
          color: #725944;
          text-align: center;
        }

        @media(max-width: 760px) {
          .to-hero {
            flex-direction: column;
          }

          .to-grid,
          .to-summary {
            grid-template-columns: 1fr;
          }

          .to-title {
            font-size: 38px;
          }
        }
      `}</style>

      <main className="to-root">
        <div className="to-container">
          <section className="to-hero">
            <div>
              <div className="to-eyebrow">Teacher observations</div>
              <h1 className="to-title">Classroom notes</h1>
              <p className="to-subtitle">
                Create personalized observations, share classroom work,
                recommendations, and evidence with each family.
              </p>
            </div>

            <Link href="/dashboard/teacher/observations/new" className="to-btn">
              New observation →
            </Link>
          </section>

          <section className="to-summary">
            <div className="to-summary-card">
              <div className="to-number">{observations.length}</div>
              <div className="to-label">Total observations</div>
            </div>

            <div className="to-summary-card">
              <div className="to-number">{published}</div>
              <div className="to-label">Visible to parents</div>
            </div>

            <div className="to-summary-card">
              <div className="to-number">{drafts}</div>
              <div className="to-label">Drafts</div>
            </div>
          </section>

          {observations.length === 0 ? (
            <div className="empty">You have not created observations yet.</div>
          ) : (
            <section className="to-grid">
              {observations.map((observation) => (
                <Link
                  key={observation.id}
                  href={`/dashboard/teacher/observations/${observation.id}/edit`}
                  className="to-card"
                >
                  <div className="to-card-title">{observation.title}</div>

                  <div className="to-meta">
                    Date: {formatDate(observation.observationDate)}
                    <br />
                    Student ID: {observation.studentId}
                  </div>

                  <div className="to-area">
                    {OBSERVATION_AREA_LABELS[observation.area]}
                  </div>

                  <div className="to-meta">
                    {observation.sessionSummary.slice(0, 150)}
                    {observation.sessionSummary.length > 150 ? "..." : ""}
                  </div>

                  <span
                    className={`to-status ${
                      observation.visibleToParent ? "published" : "draft"
                    }`}
                  >
                    {observation.visibleToParent
                      ? "Visible to parent"
                      : "Draft"}
                  </span>
                </Link>
              ))}
            </section>
          )}
        </div>
      </main>
    </>
  );
}