import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import PublicHeader from "@/components/layout/header";
import { adminAuth } from "@/lib/firebase-admin";
import { getUserByUid } from "@/lib/users/user.repository";
import { getStudentById } from "@/lib/students/student.repository";
import BackButton from "@/components/navegation/back-button";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

function label(value?: string) {
  return value ? value.replaceAll("_", " ") : "Not provided";
}

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  draft: { bg: "#f3eadc", color: "#7c5c34" },
  submitted: { bg: "#e8f1ff", color: "#1d5fa6" },
  needs_correction: { bg: "#fff3d8", color: "#c0410c" },
  approved: { bg: "#e9f8ee", color: "#287a3e" },
  rejected: { bg: "#fff0eb", color: "#aa2e0b" },
  active: { bg: "#e9f8ee", color: "#287a3e" },
  inactive: { bg: "#eeeeee", color: "#666666" },
};

function statusStyle(status: string) {
  return STATUS_STYLES[status] ?? STATUS_STYLES.draft;
}

export default async function StudentDetailPage({ params }: PageProps) {
  const { id } = await params;

  const cookieStore = await cookies();
  const session = cookieStore.get("__session")?.value;

  if (!session) {
    redirect(`/login?redirectTo=/dashboard/students/${id}`);
  }

  let uid = "";

  try {
    const decoded = await adminAuth.verifySessionCookie(session, true);
    uid = decoded.uid;
  } catch {
    redirect(`/login?redirectTo=/dashboard/students/${id}`);
  }

  const user = await getUserByUid(uid);

  if (!user) redirect("/dashboard");

  const student = await getStudentById(id);

  if (!student) notFound();

  const isAdmin = user.role === "admin";
  const isParentOwner =
    user.role === "parent" && student.parentIds.includes(uid);

    const parentCanCorrect =
      isParentOwner &&
      (student.enrollmentStatus === "draft" ||
        student.enrollmentStatus === "needs_correction");

    const styles = statusStyle(student.enrollmentStatus);

  if (!isAdmin && !isParentOwner) {
    redirect("/dashboard/students");
  }

  return (
    <>
      <PublicHeader />

      <style>{`
        .sd-root {
          min-height: calc(100vh - 4rem);
          padding: 42px 20px 90px;
          background:
            radial-gradient(circle at top left, rgba(245,195,106,.22), transparent 32%),
            linear-gradient(135deg, #fffaf0, #f7efe2);
          font-family: Outfit, sans-serif;
        }

        .sd-container {
          max-width: 1050px;
          margin: 0 auto;
        }

        .sd-hero {
          background: rgba(255,255,255,.82);
          border: 1px solid rgba(210,180,140,.55);
          border-radius: 28px;
          padding: 30px;
          margin-bottom: 22px;
          box-shadow: 0 10px 30px rgba(80,45,10,.08);
          display: flex;
          justify-content: space-between;
          gap: 18px;
          align-items: flex-start;
        }

        .sd-eyebrow {
          color: #c0410c;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: .16em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .sd-title {
          font-family: "Cormorant Garamond", serif;
          font-size: 44px;
          color: #1a0f00;
          margin: 0 0 8px;
        }

        .sd-subtitle {
          color: #725944;
          line-height: 1.6;
        }

        .sd-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .sd-btn,
        .sd-btn-outline {
          text-decoration: none;
          border-radius: 14px;
          padding: 11px 16px;
          font-weight: 700;
          white-space: nowrap;
        }

        .sd-btn {
          background: linear-gradient(135deg, #c0410c, #9a3008);
          color: #fff8ee;
          box-shadow: 0 6px 18px rgba(192,65,12,.25);
        }

        .sd-btn-outline {
          background: #fffdf8;
          color: #c0410c;
          border: 1.5px solid #d7c4aa;
        }

        .sd-grid {
          display: grid;
          grid-template-columns: 1.1fr .9fr;
          gap: 20px;
        }

        .sd-card {
          background: rgba(255,255,255,.92);
          border: 1px solid rgba(210,180,140,.55);
          border-radius: 24px;
          padding: 24px;
          margin-bottom: 20px;
          box-shadow: 0 8px 24px rgba(80,45,10,.06);
        }

        .sd-card-title {
          font-family: "Cormorant Garamond", serif;
          font-size: 25px;
          color: #1a0f00;
          margin-bottom: 16px;
        }

        .sd-info {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        .sd-item {
          background: #fffdf8;
          border: 1px solid #e2d1b8;
          border-radius: 14px;
          padding: 12px 14px;
        }

        .sd-label {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: .08em;
          text-transform: uppercase;
          color: #8a6849;
          margin-bottom: 4px;
        }

        .sd-value {
          color: #1a0f00;
          font-size: 15px;
          text-transform: capitalize;
        }

        .sd-status {
          display: inline-flex;
          padding: 6px 12px;
          border-radius: 999px;
          background: #fff3d8;
          color: #a5420b;
          font-size: 13px;
          font-weight: 800;
          text-transform: capitalize;
        }

        .sd-doc {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          background: #fffdf8;
          border: 1px solid #e2d1b8;
          border-radius: 14px;
          padding: 12px 14px;
          margin-bottom: 10px;
        }

        .sd-doc-name {
          color: #1a0f00;
          font-weight: 700;
        }

        .sd-doc-meta {
          color: #725944;
          font-size: 13px;
          text-transform: capitalize;
        }

        .sd-doc a {
          color: #c0410c;
          text-decoration: none;
          font-weight: 800;
        }

        .sd-empty {
          color: #725944;
          background: #fffdf8;
          border: 1px dashed #d7c4aa;
          border-radius: 14px;
          padding: 16px;
        }


        .sd-warning {
          background: #fff3d8;
          border: 1px solid #f3c47a;
          color: #7a3d00;
          border-radius: 20px;
          padding: 18px 20px;
          margin-bottom: 22px;
        }

        .sd-warning-title {
          font-weight: 800;
          color: #1a0f00;
          margin-bottom: 6px;
        }

        @media(max-width: 850px) {
          .sd-hero {
            flex-direction: column;
          }

          .sd-grid,
          .sd-info {
            grid-template-columns: 1fr;
          }

          .sd-title {
            font-size: 36px;
          }
        }
      `}</style>

      <main className="sd-root">
        <div className="sd-container">
          <BackButton
                                    label="Back"
                                  />
          <section className="sd-hero">
            <div>
              <div className="sd-eyebrow">Student profile</div>

              <h1 className="sd-title">
                {student.firstName} {student.lastName}
              </h1>

              <p className="sd-subtitle">
                Enrollment status:{" "}
                <span
                  className="sd-status"
                  style={{
                    backgroundColor: styles.bg,
                    color: styles.color,
                  }}
                >
                  {label(student.enrollmentStatus)}
                </span>
              </p>
            </div>

            <div className="sd-actions">

              {isAdmin && (
                <Link
                  href={`/dashboard/students/${student.id}/edit`}
                  className="sd-btn"
                >
                  Review application
                </Link>
              )}

              {parentCanCorrect && (
                <Link
                  href={`/dashboard/students/${student.id}/edit`}
                  className="sd-btn"
                >
                  Correct application
                </Link>
              )}
            </div>
          </section>

          {student.enrollmentStatus === "needs_correction" && (
            <section className="sd-warning">
              <div className="sd-warning-title">Corrections requested</div>
              <div>
                {student.correctionNotes ||
                  "The school requested changes to this application."}
              </div>
            </section>
          )}

          <div className="sd-grid">
            <div>
              <section className="sd-card">
                <h2 className="sd-card-title">Personal information</h2>

                <div className="sd-info">
                  <div className="sd-item">
                    <div className="sd-label">Full name</div>
                    <div className="sd-value">
                      {student.firstName} {student.middleName ?? ""}{" "}
                      {student.lastName}
                    </div>
                  </div>

                  <div className="sd-item">
                    <div className="sd-label">Date of birth</div>
                    <div className="sd-value">{student.dateOfBirth}</div>
                  </div>

                  <div className="sd-item">
                    <div className="sd-label">Gender</div>
                    <div className="sd-value">{label(student.gender)}</div>
                  </div>

                  <div className="sd-item">
                    <div className="sd-label">Primary language</div>
                    <div className="sd-value">
                      {label(student.primaryLanguage)}
                    </div>
                  </div>
                </div>
              </section>

              <section className="sd-card">
                <h2 className="sd-card-title">Enrollment</h2>

                <div className="sd-info">
                  <div className="sd-item">
                    <div className="sd-label">Program</div>
                    <div className="sd-value">{label(student.program)}</div>
                  </div>

                  <div className="sd-item">
                    <div className="sd-label">Schedule</div>
                    <div className="sd-value">
                      {label(student.scheduleType)}
                    </div>
                  </div>

                  <div className="sd-item">
                    <div className="sd-label">Start date</div>
                    <div className="sd-value">
                      {student.desiredStartDate || "Not provided"}
                    </div>
                  </div>

                  <div className="sd-item">
                    <div className="sd-label">Attendance days</div>
                    <div className="sd-value">
                      {student.attendanceDays.join(", ") || "Not provided"}
                    </div>
                  </div>
                </div>
              </section>

              <section className="sd-card">
                <h2 className="sd-card-title">Medical information</h2>

                <div className="sd-info">
                  <div className="sd-item">
                    <div className="sd-label">Allergies</div>
                    <div className="sd-value">
                      {student.medicalInfo.allergies || "None"}
                    </div>
                  </div>

                  <div className="sd-item">
                    <div className="sd-label">Conditions</div>
                    <div className="sd-value">
                      {student.medicalInfo.medicalConditions || "None"}
                    </div>
                  </div>

                  <div className="sd-item">
                    <div className="sd-label">Medications</div>
                    <div className="sd-value">
                      {student.medicalInfo.currentMedications || "None"}
                    </div>
                  </div>

                  <div className="sd-item">
                    <div className="sd-label">Dietary restrictions</div>
                    <div className="sd-value">
                      {student.medicalInfo.dietaryRestrictions || "None"}
                    </div>
                  </div>

                  <div className="sd-item">
                    <div className="sd-label">Physician</div>
                    <div className="sd-value">
                      {student.medicalInfo.physicianName || "Not provided"}
                    </div>
                  </div>

                  <div className="sd-item">
                    <div className="sd-label">Physician phone</div>
                    <div className="sd-value">
                      {student.medicalInfo.physicianPhone || "Not provided"}
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <aside>
              <section className="sd-card">
                <h2 className="sd-card-title">Documents</h2>

                {student.documents.length === 0 ? (
                  <div className="sd-empty">No documents uploaded.</div>
                ) : (
                  student.documents.map((doc) => (
                    <div key={doc.id} className="sd-doc">
                      <div>
                        <div className="sd-doc-name">{doc.fileName}</div>
                        <div className="sd-doc-meta">
                          {label(doc.type)} · {label(doc.status)}
                        </div>
                      </div>

                      <a
                        href={`/dashboard/documents/view?url=${encodeURIComponent(
                          doc.fileUrl
                        )}&type=${encodeURIComponent(doc.fileType || "")}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View
                      </a>
                    </div>
                  ))
                )}
              </section>

              <section className="sd-card">
                <h2 className="sd-card-title">Emergency contacts</h2>

                {student.emergencyContacts.length === 0 ? (
                  <div className="sd-empty">No emergency contacts.</div>
                ) : (
                  student.emergencyContacts.map((contact, index) => (
                    <div key={index} className="sd-doc">
                      <div>
                        <div className="sd-doc-name">{contact.fullName}</div>
                        <div className="sd-doc-meta">
                          {label(contact.relationship)} · {contact.primaryPhone}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </section>

              <section className="sd-card">
                <h2 className="sd-card-title">Review notes</h2>

                <div className="sd-empty">
                  {student.reviewNotes || "No review notes yet."}
                </div>
              </section>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}