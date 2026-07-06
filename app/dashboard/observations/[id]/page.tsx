import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import PublicHeader from "@/components/layout/header";
import { adminAuth } from "@/lib/firebase-admin";
import { getUserByUid } from "@/lib/users/user.repository";
import { getStudentById } from "@/lib/students/student.repository";
import { getObservationById } from "@/lib/observations/observation.repository";
import { OBSERVATION_AREA_LABELS } from "@/lib/observations/observation.type";
import BackButton from "@/components/navegation/back-button";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

function formatDate(value?: string) {
  if (!value) return "No date";

  return new Date(value).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function viewerHref(fileUrl: string, fileType: string) {
  return `/dashboard/documents/view?url=${encodeURIComponent(
    fileUrl
  )}&type=${encodeURIComponent(fileType || "")}`;
}

export default async function ObservationDetailPage({ params }: PageProps) {
  const { id } = await params;

  const cookieStore = await cookies();
  const session = cookieStore.get("__session")?.value;

  if (!session) {
    redirect(`/login?redirectTo=/dashboard/observations/${id}`);
  }

  let uid = "";

  try {
    const decoded = await adminAuth.verifySessionCookie(session, true);
    uid = decoded.uid;
  } catch {
    redirect(`/login?redirectTo=/dashboard/observations/${id}`);
  }

  const user = await getUserByUid(uid);

  if (!user) redirect("/dashboard");

  const observation = await getObservationById(id);

  if (!observation) notFound();

  const student = await getStudentById(observation.studentId);

  if (!student) notFound();

  const isAdmin = user.role === "admin";
  const isTeacher = user.role === "teacher" && observation.teacherId === uid;
  const isParent = user.role === "parent" && student.parentIds.includes(uid);

  if (!isAdmin && !isTeacher && !isParent) {
    redirect("/dashboard");
  }

  if (isParent && !observation.visibleToParent) {
    redirect("/dashboard/observations");
  }

  return (
    <>
      <PublicHeader />

      <style>{`
        .od-root {
          min-height: calc(100vh - 4rem);
          padding: 42px 22px 90px;
          background:
            radial-gradient(circle at top left, rgba(29,95,166,.12), transparent 30%),
            radial-gradient(circle at top right, rgba(170,46,11,.10), transparent 28%),
            linear-gradient(135deg, #fffaf0, #f7efe2);
          font-family: Outfit, sans-serif;
        }

        .od-container {
          max-width: 1050px;
          margin: 0 auto;
        }

        .od-hero,
        .od-card {
          background: rgba(255,255,255,.92);
          border: 1px solid rgba(210,180,140,.55);
          border-radius: 26px;
          padding: 28px;
          margin-bottom: 20px;
          box-shadow: 0 8px 24px rgba(80,45,10,.06);
        }

        .od-eyebrow {
          color: #c0410c;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: .16em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .od-title {
          font-family: "Cormorant Garamond", serif;
          font-size: 46px;
          color: #1a0f00;
          margin: 0 0 10px;
        }

        .od-subtitle {
          color: #725944;
          line-height: 1.6;
          margin: 0;
        }

        .od-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 18px;
        }

        .od-badge {
          display: inline-flex;
          padding: 7px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 800;
        }

        .blue {
          background: #e8f1ff;
          color: #1d5fa6;
        }

        .red {
          background: #fff0eb;
          color: #aa2e0b;
        }

        .orange {
          background: #fff3d8;
          color: #a5420b;
        }

        .green {
          background: #e9f8ee;
          color: #287a3e;
        }

        .od-card-title {
          font-family: "Cormorant Garamond", serif;
          font-size: 30px;
          color: #1a0f00;
          margin: 0 0 14px;
        }

        .od-text {
          color: #725944;
          line-height: 1.7;
          white-space: pre-wrap;
        }

        .od-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
        }

        .recommendation {
          background: #fffdf8;
          border: 1px solid #d7c4aa;
          border-radius: 18px;
          padding: 16px;
          margin-bottom: 12px;
        }

        .recommendation-title {
          color: #1a0f00;
          font-weight: 900;
          margin-bottom: 6px;
        }

        .media-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }

        .media-card {
          background: #fffdf8;
          border: 1px solid #d7c4aa;
          border-radius: 18px;
          padding: 16px;
        }

        .media-title {
          color: #1a0f00;
          font-weight: 900;
          word-break: break-word;
          margin-bottom: 6px;
        }

        .media-caption {
          color: #725944;
          font-size: 14px;
          line-height: 1.5;
          margin-bottom: 12px;
        }

        .media-link {
          color: #1d5fa6;
          font-weight: 900;
          text-decoration: none;
        }

        @media(max-width: 760px) {
          .od-grid,
          .media-grid {
            grid-template-columns: 1fr;
          }

          .od-title {
            font-size: 38px;
          }
        }
      `}</style>

      <main className="od-root">
        <div className="od-container">
          <BackButton
                      label="Back to Observations"
                    />
          <section className="od-hero">
            <div className="od-eyebrow">Observation detail</div>

            <h1 className="od-title">{observation.title}</h1>

            <p className="od-subtitle">
              {student.firstName} {student.lastName} ·{" "}
              {formatDate(observation.observationDate)}
            </p>

            <div className="od-badges">
              <span className="od-badge blue">
                {OBSERVATION_AREA_LABELS[observation.area]}
              </span>

              <span className="od-badge orange">
                Mood: {observation.mood.replaceAll("_", " ")}
              </span>

              <span
                className={`od-badge ${
                  observation.visibleToParent ? "green" : "red"
                }`}
              >
                {observation.visibleToParent
                  ? "Visible to parent"
                  : "Draft"}
              </span>
            </div>
          </section>

          <section className="od-card">
            <h2 className="od-card-title">Session summary</h2>
            <p className="od-text">{observation.sessionSummary}</p>
          </section>

          <section className="od-card">
            <h2 className="od-card-title">Activities worked</h2>
            <p className="od-text">{observation.activitiesWorked}</p>
          </section>

          <div className="od-grid">
            <section className="od-card">
              <h2 className="od-card-title">Strengths</h2>
              <p className="od-text">
                {observation.strengths || "No strengths added."}
              </p>
            </section>

            <section className="od-card">
              <h2 className="od-card-title">Challenges / situations</h2>
              <p className="od-text">
                {observation.challenges || "No challenges added."}
              </p>
            </section>
          </div>

          <section className="od-card">
            <h2 className="od-card-title">Recommendations for home</h2>

            {observation.homeRecommendations.length === 0 ? (
              <p className="od-text">No recommendations added.</p>
            ) : (
              observation.homeRecommendations.map((item, index) => (
                <div key={index} className="recommendation">
                  <div className="recommendation-title">{item.title}</div>
                  <div className="od-text">{item.description}</div>
                </div>
              ))
            )}
          </section>

          {observation.media.length > 0 && (
            <section className="od-card">
              <h2 className="od-card-title">Evidence</h2>

              <div className="media-grid">
                {observation.media.map((file) => (
                  <div key={file.id} className="media-card">
                    <div className="media-title">{file.fileName}</div>

                    {file.caption && (
                      <div className="media-caption">{file.caption}</div>
                    )}

                    <a
                      className="media-link"
                      href={viewerHref(file.fileUrl, file.fileType)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View evidence →
                    </a>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  );
}