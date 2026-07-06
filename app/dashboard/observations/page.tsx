import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import PublicHeader from "@/components/layout/header";
import { adminAuth } from "@/lib/firebase-admin";
import { getUserByUid } from "@/lib/users/user.repository";
import { getStudentsByParent } from "@/lib/students/student.repository";
import { getObservationsByStudent } from "@/lib/observations/observation.repository";
import { OBSERVATION_AREA_LABELS } from "@/lib/observations/observation.type";
import BackButton from "@/components/navegation/back-button";

function formatDate(value?: string) {
  if (!value) return "No date";
  return new Date(value).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default async function ParentObservationsPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("__session")?.value;

  if (!session) redirect("/login?redirectTo=/dashboard/observations");

  let uid = "";

  try {
    const decoded = await adminAuth.verifySessionCookie(session, true);
    uid = decoded.uid;
  } catch {
    redirect("/login?redirectTo=/dashboard/observations");
  }

  const user = await getUserByUid(uid);

  if (!user) redirect("/dashboard");

  if (user.role !== "parent") {
    redirect("/dashboard");
  }

  const students = await getStudentsByParent(uid);

  const observationsByStudent = await Promise.all(
    students.map(async (student) => {
      const observations = await getObservationsByStudent(student.id, {
        onlyVisibleToParent: true,
      });

      return {
        student,
        observations,
      };
    })
  );

  const totalObservations = observationsByStudent.reduce(
    (sum, item) => sum + item.observations.length,
    0
  );

  return (
    <>
      <PublicHeader />

      <style>{`
        .obs-root {
          min-height: calc(100vh - 4rem);
          padding: 42px 22px 90px;
          background:
            radial-gradient(circle at top left, rgba(29,95,166,.12), transparent 30%),
            radial-gradient(circle at top right, rgba(170,46,11,.10), transparent 28%),
            linear-gradient(135deg, #fffaf0, #f7efe2);
          font-family: Outfit, sans-serif;
        }

        .obs-container {
          max-width: 1120px;
          margin: 0 auto;
        }

        .obs-hero {
          background: rgba(255,255,255,.86);
          border: 1px solid rgba(210,180,140,.55);
          border-radius: 28px;
          padding: 32px;
          margin-bottom: 24px;
          box-shadow: 0 10px 30px rgba(80,45,10,.08);
        }

        .obs-eyebrow {
          color: #c0410c;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: .16em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .obs-title {
          font-family: "Cormorant Garamond", serif;
          font-size: 46px;
          color: #1a0f00;
          margin: 0 0 10px;
        }

        .obs-subtitle {
          color: #725944;
          line-height: 1.6;
          max-width: 740px;
          margin: 0;
        }

        .obs-summary {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .obs-summary-card {
          background: rgba(255,255,255,.92);
          border: 1px solid rgba(210,180,140,.55);
          border-radius: 22px;
          padding: 22px;
        }

        .obs-number {
          font-family: "Cormorant Garamond", serif;
          font-size: 38px;
          color: #1a0f00;
          font-weight: 700;
        }

        .obs-label {
          color: #725944;
          margin-top: 4px;
        }

        .student-section {
          margin-bottom: 30px;
        }

        .student-title {
          font-family: "Cormorant Garamond", serif;
          font-size: 32px;
          color: #1a0f00;
          margin: 0 0 14px;
        }

        .obs-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
        }

        .obs-card {
          background: rgba(255,255,255,.94);
          border: 1px solid rgba(210,180,140,.55);
          border-radius: 22px;
          padding: 22px;
          text-decoration: none;
          display: block;
          box-shadow: 0 8px 24px rgba(80,45,10,.06);
          transition: transform .15s, box-shadow .18s, border-color .18s;
        }

        .obs-card:hover {
          transform: translateY(-2px);
          border-color: #1d5fa6;
          box-shadow: 0 12px 28px rgba(29,95,166,.14);
        }

        .obs-card-top {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 12px;
        }

        .obs-card-title {
          font-family: "Cormorant Garamond", serif;
          font-size: 27px;
          font-weight: 700;
          color: #1a0f00;
          margin: 0 0 5px;
        }

        .obs-date {
          color: #725944;
          font-size: 14px;
        }

        .obs-area {
          display: inline-flex;
          padding: 6px 11px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 800;
          color: #1d5fa6;
          background: #e8f1ff;
          margin-bottom: 12px;
        }

        .obs-text {
          color: #725944;
          line-height: 1.6;
          font-size: 14px;
        }

        .obs-media {
          margin-top: 14px;
          color: #aa2e0b;
          font-size: 13px;
          font-weight: 800;
        }

        .empty {
          background: rgba(255,255,255,.9);
          border: 1px dashed rgba(210,180,140,.75);
          border-radius: 22px;
          padding: 28px;
          color: #725944;
          text-align: center;
        }

        @media(max-width: 760px) {
          .obs-grid,
          .obs-summary {
            grid-template-columns: 1fr;
          }

          .obs-title {
            font-size: 38px;
          }
        }
      `}</style>

      <main className="obs-root">
        <div className="obs-container">
          <BackButton label="Back"/>
          <section className="obs-hero">
            <div className="obs-eyebrow">Family observations</div>
            <h1 className="obs-title">Progress notes</h1>
            <p className="obs-subtitle">
              Review personalized notes, classroom activities, recommendations,
              and evidence shared by your child&apos;s teacher.
            </p>
          </section>

          <section className="obs-summary">
            <div className="obs-summary-card">
              <div className="obs-number">{students.length}</div>
              <div className="obs-label">Students</div>
            </div>

            <div className="obs-summary-card">
              <div className="obs-number">{totalObservations}</div>
              <div className="obs-label">Shared observations</div>
            </div>
          </section>

          {observationsByStudent.length === 0 ? (
            <div className="empty">No students are linked to your account yet.</div>
          ) : (
            observationsByStudent.map(({ student, observations }) => (
              <section key={student.id} className="student-section">
                <h2 className="student-title">
                  {student.firstName} {student.lastName}
                </h2>

                {observations.length === 0 ? (
                  <div className="empty">
                    No observations have been shared yet.
                  </div>
                ) : (
                  <div className="obs-grid">
                    {observations.map((observation) => (
                      <Link
                        href={`/dashboard/observations/${observation.id}`}
                        key={observation.id}
                        className="obs-card"
                      >
                        <div className="obs-card-top">
                          <div>
                            <h3 className="obs-card-title">
                              {observation.title}
                            </h3>
                            <div className="obs-date">
                              {formatDate(observation.observationDate)}
                            </div>
                          </div>
                        </div>

                        <div className="obs-area">
                          {OBSERVATION_AREA_LABELS[observation.area]}
                        </div>

                        <p className="obs-text">
                          {observation.sessionSummary.slice(0, 150)}
                          {observation.sessionSummary.length > 150 ? "..." : ""}
                        </p>

                        {observation.media.length > 0 && (
                          <div className="obs-media">
                            {observation.media.length} evidence file(s)
                          </div>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </section>
            ))
          )}
        </div>
      </main>
    </>
  );
}