import Link from "next/link";

import { getAuthenticatedUid } from "@/lib/auth-helper";
import { getObservationsByTeacher } from "@/lib/observations/observation.repository";
import { getStudentById } from "@/lib/students/student.repository";
import { OBSERVATION_AREA_LABELS } from "@/lib/observations/observation.type";
import PublicHeader from "@/components/layout/header";
import BackButton from "@/components/navegation/back-button";

export default async function TeacherObservationsPage() {
  const auth = await getAuthenticatedUid();

  if (!auth) {
    return null;
  }

  const observations = await getObservationsByTeacher(auth.uid);
  const observationsWithStudents = await Promise.all(
  observations.map(async (observation) => {
    const student = await getStudentById(observation.studentId);

    return {
      ...observation,
      studentName: student
        ? `${student.firstName} ${student.lastName}`
        : "Student not found",
    };
  })
);

  return (
    <>
      <style>{`
      .obs-root{
        min-height:100vh;
        padding:42px 35px 90px;
        background:
        radial-gradient(circle at top left,
        rgba(245,195,106,.22),
        transparent 30%),
        linear-gradient(
        135deg,
        #fffaf0,
        #f7efe2);
        font-family:Outfit,sans-serif;
      }

      .obs-container{
        max-width:1250px;
        margin:auto;
      }

      .hero{
        background:white;
        border-radius:30px;
        padding:40px;
        border:1px solid rgba(215,190,150,.45);
        display:flex;
        justify-content:space-between;
        align-items:center;
        gap:30px;
        margin-bottom:30px;
      }

      .hero small{
        letter-spacing:.22em;
        color:#b64613;
        font-weight:700;
      }

      .hero h1{
        margin:10px 0;
        font-family:"Cormorant Garamond",serif;
        font-size:64px;
        line-height:1;
        color:#24160f;
      }

      .hero p{
        max-width:700px;
        color:#6a5848;
        font-size:18px;
      }

      .new-btn{
        background:linear-gradient(
        135deg,
        #2563eb,
        #1d4ed8);

        color:white;
        text-decoration:none;
        padding:16px 26px;
        border-radius:18px;
        font-weight:700;
        box-shadow:
        0 12px 28px
        rgba(37,99,235,.25);
      }

      .grid{
        display:grid;
        gap:22px;
      }

      .card{
        background:white;
        border-radius:24px;
        border:1px solid rgba(215,190,150,.45);
        padding:24px;
        transition:.18s;
      }

      .card:hover{
        transform:translateY(-3px);
        box-shadow:
        0 18px 34px
        rgba(0,0,0,.08);
      }

      .top{
        display:flex;
        justify-content:space-between;
        align-items:center;
        margin-bottom:16px;
      }

      .student{
        font-size:28px;
        font-family:
        "Cormorant Garamond",
        serif;
        color:#24160f;
      }

      .date{
        color:#666;
        font-size:14px;
      }

      .badges{
        display:flex;
        gap:10px;
        flex-wrap:wrap;
        margin-bottom:18px;
      }

      .badge{
        padding:7px 12px;
        border-radius:999px;
        font-size:13px;
        font-weight:700;
      }

      .blue{
        background:#dbeafe;
        color:#1d4ed8;
      }

      .gold{
        background:#fff3dc;
        color:#b85b12;
      }

      .green{
        background:#dcfce7;
        color:#15803d;
      }

      .red{
        background:#fee2e2;
        color:#b91c1c;
      }

      .section{
        margin-top:18px;
      }

      .section strong{
        color:#b64613;
        display:block;
        margin-bottom:6px;
      }

      .section p{
        color:#5d4f42;
        line-height:1.6;
      }

      .actions{
        display:flex;
        gap:12px;
        margin-top:24px;
      }

      .edit{

        background:#2563eb;
        color:white;
        padding:12px 18px;
        border-radius:12px;
        text-decoration:none;
        font-weight:700;
      }

      .view{

        background:#c2410c;
        color:white;
        padding:12px 18px;
        border-radius:12px;
        text-decoration:none;
        font-weight:700;
      }

      .empty{
        background:white;
        border-radius:26px;
        padding:70px;
        text-align:center;
        border:2px dashed #dcc4a2;
      }

      .empty h2{
        font-family:
        "Cormorant Garamond",
        serif;
        font-size:42px;
      }

      `}</style>

      <PublicHeader />

      <main className="obs-root">

        <div className="obs-container">

          <BackButton
                      label="Back"
                    />


          <section className="hero">

            <div>

              <small>TEACHER OBSERVATIONS</small>

              <h1>
                Classroom Journal
              </h1>

              <p>
                Share meaningful classroom experiences,
                recommendations for home,
                photos and progress with every family.
              </p>

            </div>

            <Link
              href="/dashboard/teacher/observations/new"
              className="new-btn"
            >
              + New Observation
            </Link>

          </section>

          {observations.length === 0 ? (

            <section className="empty">

              <h2>
                No observations yet
              </h2>

              <p>
                Create your first observation to start
                sharing classroom progress with parents.
              </p>

            </section>

          ) : (

            <section className="grid">

              {observationsWithStudents.map((observation) => (

                <article
                  key={observation.id}
                  className="card"
                >

                  <div className="top">

                    <div>

                      <div className="student">

                        {observation.studentName ?? observation.studentId}

                      </div>

                      <div className="date">

                        {new Date(
                          observation.observationDate
                        ).toLocaleDateString()}

                      </div>

                    </div>

                    <div className="badges">

                      <span className="badge blue">
                        {observation.areaLabel ?? OBSERVATION_AREA_LABELS[observation.area]}
                      </span>

                      <span className="badge gold">
                        {observation.mood}
                      </span>

                      <span
                        className={`badge ${
                          observation.visibleToParent
                            ? "green"
                            : "red"
                        }`}
                      >
                        {observation.visibleToParent
                          ? "Visible to family"
                          : "Hidden"}
                      </span>

                    </div>

                  </div>

                  <div className="section">
                    <strong>
                      Classroom summary
                    </strong>

                    <p>
                      {observation.summary ?? observation.sessionSummary}
                    </p>
                  </div>

                  <div className="section">
                    <strong>
                      Recommendation
                    </strong>

                    <p>
                      {observation.homeRecommendation ??
                        observation.homeRecommendations?.[0]?.description ??
                        "No recommendation added."}
                    </p>
                  </div>

                  <div className="actions">

                    <Link
                      href={`/dashboard/observations/${observation.id}`}
                      className="view"
                    >
                      View
                    </Link>

                    <Link
                      href={`/dashboard/teacher/observations/${observation.id}/edit`}
                      className="edit"
                    >
                      Edit
                    </Link>

                  </div>

                </article>

              ))}

            </section>

          )}

        </div>

      </main>

    </>
  );
}