import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import PublicHeader from "@/components/layout/header";
import { adminAuth } from "@/lib/firebase-admin";
import { getUserByUid } from "@/lib/users/user.repository";
import {
  getStudents,
  getStudentsByParent,
} from "@/lib/students/student.repository";
import BackButton from "@/components/navegation/back-button";

function statusLabel(status: string) {
  return status.replaceAll("_", " ");
}

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  draft: {
    bg: "#f3eadc",
    color: "#7c5c34",
  },
  submitted: {
    bg: "#e8f1ff",
    color: "#1d5fa6",
  },
  needs_correction: {
    bg: "#fff3d8",
    color: "#c0410c",
  },
  approved: {
    bg: "#e9f8ee",
    color: "#287a3e",
  },
  rejected: {
    bg: "#fff0eb",
    color: "#aa2e0b",
  },
  active: {
    bg: "#e9f8ee",
    color: "#287a3e",
  },
  inactive: {
    bg: "#eeeeee",
    color: "#666666",
  },
};

function statusStyle(status: string) {
  return STATUS_STYLES[status] ?? STATUS_STYLES.draft;
}

export default async function StudentsPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("__session")?.value;

  if (!session) redirect("/login?redirectTo=/dashboard/students");

  let uid = "";

  try {
    const decoded = await adminAuth.verifySessionCookie(session, true);
    uid = decoded.uid;
  } catch {
    redirect("/login?redirectTo=/dashboard/students");
  }

  const user = await getUserByUid(uid);

  if (!user) redirect("/dashboard");

  const students =
    user.role === "admin"
      ? await getStudents()
      : user.role === "parent"
      ? await getStudentsByParent(uid)
      : [];

  const correctionCount = students.filter(
    (student) => student.enrollmentStatus === "needs_correction"
  ).length;

  return (
    <>
      <PublicHeader />

      <style>{`
        .st-root {
          min-height: calc(100vh - 4rem);
          padding: 42px 22px 90px;
          background:
            radial-gradient(circle at top left, rgba(245,195,106,.22), transparent 32%),
            linear-gradient(135deg, #fffaf0, #f7efe2);
          font-family: Outfit, sans-serif;
        }

        .st-container {
          max-width: 1120px;
          margin: 0 auto;
        }

        .st-header {
          background: rgba(255,255,255,.78);
          border: 1px solid rgba(210,180,140,.5);
          border-radius: 28px;
          padding: 30px;
          display: flex;
          justify-content: space-between;
          gap: 20px;
          align-items: flex-start;
          margin-bottom: 26px;
          box-shadow: 0 10px 30px rgba(80,45,10,.08);
        }

        .st-eyebrow {
          color: #c0410c;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: .16em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .st-title {
          font-family: "Cormorant Garamond", serif;
          font-size: 44px;
          color: #1a0f00;
          margin: 0;
        }

        .st-subtitle {
          color: #725944;
          margin-top: 8px;
          line-height: 1.6;
          max-width: 620px;
        }

        .st-btn {
          background: linear-gradient(135deg, #c0410c, #9a3008);
          color: #fff8ee;
          text-decoration: none;
          padding: 12px 18px;
          border-radius: 14px;
          font-weight: 700;
          white-space: nowrap;
          box-shadow: 0 6px 18px rgba(192,65,12,.25);
        }

        .st-alert {
          background: #fff3d8;
          border: 1px solid #f3c47a;
          color: #7a3d00;
          border-radius: 20px;
          padding: 18px 20px;
          margin-bottom: 22px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
        }

        .st-alert-title {
          font-weight: 800;
          margin-bottom: 4px;
          color: #1a0f00;
        }

        .st-alert-text {
          font-size: 14px;
          line-height: 1.5;
        }

        .st-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
        }

        @media(max-width: 900px) {
          .st-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media(max-width: 620px) {
          .st-header,
          .st-alert {
            flex-direction: column;
            align-items: flex-start;
            padding: 24px;
          }

          .st-grid {
            grid-template-columns: 1fr;
          }

          .st-title {
            font-size: 36px;
          }
        }

        .st-card {
          background: rgba(255,255,255,.92);
          border: 1px solid rgba(210,180,140,.55);
          border-radius: 22px;
          padding: 22px;
          text-decoration: none;
          box-shadow: 0 8px 24px rgba(80,45,10,.06);
          transition: transform .15s, border-color .18s, box-shadow .18s;
          display: block;
        }

        .st-card:hover {
          transform: translateY(-2px);
          border-color: #c0410c;
          box-shadow: 0 12px 28px rgba(80,45,10,.12);
        }

        .st-card.needs-correction {
          border-color: #c0410c;
        }

        .st-top {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: flex-start;
          margin-bottom: 12px;
        }

        .st-avatar {
          width: 46px;
          height: 46px;
          border-radius: 15px;
          background: #fff3d8;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          flex-shrink: 0;
        }

        .st-name {
          font-family: "Cormorant Garamond", serif;
          font-size: 26px;
          font-weight: 700;
          color: #1a0f00;
          margin-bottom: 6px;
        }

        .st-info {
          font-size: 14px;
          color: #725944;
          line-height: 1.6;
        }

        .st-status {
          display: inline-flex;
          margin-top: 14px;
          padding: 5px 10px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
          text-transform: capitalize;
        }

        .st-docs {
          margin-top: 10px;
          font-size: 13px;
          color: #725944;
        }

        .st-card-action {
          display: inline-flex;
          margin-top: 14px;
          font-size: 13px;
          font-weight: 800;
          color: #c0410c;
        }

        .st-empty {
          background: rgba(255,255,255,.92);
          border: 1px dashed rgba(210,180,140,.75);
          border-radius: 22px;
          padding: 34px;
          color: #725944;
          text-align: center;
        }
      `}</style>

      <main className="st-root">
        <div className="st-container">
          <BackButton
                      label="Back"
                    />
          <header className="st-header">
            <div>
              <div className="st-eyebrow">
                {user.role === "admin" ? "Admin students" : "My students"}
              </div>

              <h1 className="st-title">
                {user.role === "admin" ? "All students" : "My children"}
              </h1>

              <p className="st-subtitle">
                {user.role === "admin"
                  ? "Review registered students, enrollment requests, documents, and status."
                  : "View your children, follow their enrollment status, and register a new student."}
              </p>
            </div>

            {user.role === "parent" && (
              <Link href="/dashboard/students/new" className="st-btn">
                Register student →
              </Link>
            )}
          </header>

          {user.role === "parent" && correctionCount > 0 && (
            <div className="st-alert">
              <div>
                <div className="st-alert-title">
                  {correctionCount === 1
                    ? "One application needs correction"
                    : `${correctionCount} applications need correction`}
                </div>
                <div className="st-alert-text">
                  The school reviewed your application and requested changes.
                  Open the student profile to correct and resubmit it.
                </div>
              </div>
            </div>
          )}

          {students.length === 0 ? (
            <div className="st-empty">
              {user.role === "parent"
                ? "You have not registered any students yet."
                : "There are no students registered yet."}
            </div>
          ) : (
            <div className="st-grid">
              {students.map((student) => {
                const styles = statusStyle(student.enrollmentStatus);
                const needsCorrection =
                  student.enrollmentStatus === "needs_correction";

                return (
                  <Link
                    key={student.id}
                    href={`/dashboard/students/${student.id}`}
                    className={`st-card ${
                      needsCorrection ? "needs-correction" : ""
                    }`}
                  >
                    <div className="st-top">
                      <div>
                        <div className="st-name">
                          {student.firstName} {student.lastName}
                        </div>

                        <div className="st-info">
                          Program: {student.program}
                          <br />
                          Schedule:{" "}
                          {student.scheduleType.replaceAll("_", " ")}
                          <br />
                          Start date: {student.desiredStartDate || "Not set"}
                        </div>
                      </div>

                      <div className="st-avatar">🧒</div>
                    </div>

                    <span
                      className="st-status"
                      style={{
                        backgroundColor: styles.bg,
                        color: styles.color,
                      }}
                    >
                      {statusLabel(student.enrollmentStatus)}
                    </span>

                    <div className="st-docs">
                      Documents: {student.documents?.length ?? 0}
                    </div>

                    {user.role === "parent" && needsCorrection && (
                      <div className="st-card-action">
                        Correction requested →
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </>
  );
}