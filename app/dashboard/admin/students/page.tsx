import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { adminAuth } from "@/lib/firebase-admin";
import { getUserByUid } from "@/lib/users/user.repository";
import {
  getStudents,
  getStudentsByParent,
} from "@/lib/students/student.repository";
import BackButton from "@/components/navegation/back-button";

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

  return (
    <>
      <style>{`
        .st-root {
          min-height: calc(100vh - 4rem);
          padding: 42px 22px 90px;
          background: linear-gradient(135deg, #fffaf0, #f7efe2);
          font-family: Outfit, sans-serif;
        }

        .st-container {
          max-width: 1100px;
          margin: 0 auto;
        }

        .st-header {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          align-items: flex-start;
          margin-bottom: 26px;
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
          font-size: 42px;
          color: #1a0f00;
          margin: 0;
        }

        .st-subtitle {
          color: #725944;
          margin-top: 8px;
          line-height: 1.6;
        }

        .st-btn {
          background: linear-gradient(135deg, #c0410c, #9a3008);
          color: #fff8ee;
          text-decoration: none;
          padding: 12px 18px;
          border-radius: 14px;
          font-weight: 700;
          white-space: nowrap;
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
          .st-header {
            flex-direction: column;
          }

          .st-grid {
            grid-template-columns: 1fr;
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
        }

        .st-card:hover {
          transform: translateY(-2px);
          border-color: #c0410c;
          box-shadow: 0 12px 28px rgba(80,45,10,.12);
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
          background: #fff3d8;
          color: #a5420b;
          text-transform: capitalize;
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
          <header className="st-header">
            <BackButton
                      label="Back"
                    />
            <div>
              <div className="st-eyebrow">
                {user.role === "admin" ? "Admin students" : "My students"}
              </div>

              <h1 className="st-title">
                {user.role === "admin" ? "All students" : "My children"}
              </h1>

              <p className="st-subtitle">
                {user.role === "admin"
                  ? "Review all registered students and enrollment requests."
                  : "View your children and register a new student."}
              </p>
            </div>

            {user.role === "parent" && (
              <Link href="/dashboard/students/new" className="st-btn">
                Register student →
              </Link>
            )}
          </header>

          {students.length === 0 ? (
            <div className="st-empty">
              {user.role === "parent"
                ? "You have not registered any students yet."
                : "There are no students registered yet."}
            </div>
          ) : (
            <div className="st-grid">
              {students.map((student) => (
                <Link
                  key={student.id}
                  href={`/dashboard/students/${student.id}`}
                  className="st-card"
                >
                  <div className="st-name">
                    {student.firstName} {student.lastName}
                  </div>

                  <div className="st-info">
                    Program: {student.program}
                    <br />
                    Schedule: {student.scheduleType.replace("_", " ")}
                    <br />
                    Start date: {student.desiredStartDate}
                  </div>

                  <span className="st-status">
                    {student.enrollmentStatus.replace("_", " ")}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}