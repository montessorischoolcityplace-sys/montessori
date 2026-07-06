
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ObservationArea,
  ObservationMedia,
  ObservationMood,
} from "@/lib/observations/observation.type";
import BackButton from "@/components/navegation/back-button";

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  program: string;
}

interface Props {
  teacherUid: string;
  students: Student[];
}

const AREAS: { value: ObservationArea; label: string }[] = [
  { value: "practical_life", label: "Practical Life" },
  { value: "sensorial", label: "Sensorial" },
  { value: "language", label: "Language" },
  { value: "mathematics", label: "Mathematics" },
  { value: "cultural_studies", label: "Cultural Studies" },
  { value: "social_emotional", label: "Social-Emotional" },
  { value: "motor_skills", label: "Motor Skills" },
  { value: "independence", label: "Independence" },
  { value: "behavior", label: "Behavior" },
  { value: "general", label: "General" },
];

const MOODS: { value: ObservationMood; label: string }[] = [
  { value: "happy", label: "Happy" },
  { value: "calm", label: "Calm" },
  { value: "focused", label: "Focused" },
  { value: "sensitive", label: "Sensitive" },
  { value: "tired", label: "Tired" },
  { value: "frustrated", label: "Frustrated" },
  { value: "excited", label: "Excited" },
  { value: "not_observed", label: "Not observed" },
];

export default function NewObservationForm({ teacherUid, students }: Props) {
  const router = useRouter();

  const [studentId, setStudentId] = useState("");
  const [observationDate, setObservationDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  const [area, setArea] = useState<ObservationArea>("general");
  const [mood, setMood] = useState<ObservationMood>("not_observed");

  const [title, setTitle] = useState("");
  const [sessionSummary, setSessionSummary] = useState("");
  const [activitiesWorked, setActivitiesWorked] = useState("");
  const [strengths, setStrengths] = useState("");
  const [challenges, setChallenges] = useState("");
  const [teacherNotes, setTeacherNotes] = useState("");

  const [recommendations, setRecommendations] = useState([
    { title: "", description: "" },
  ]);

  const [media, setMedia] = useState<ObservationMedia[]>([]);
  const [visibleToParent, setVisibleToParent] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function readJsonSafe(res: Response) {
    const text = await res.text();
    if (!text) return null;

    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  }

  function viewerHref(file: ObservationMedia) {
    return `/dashboard/documents/view?url=${encodeURIComponent(
      file.fileUrl
    )}&type=${encodeURIComponent(file.fileType || "")}`;
  }

  function updateRecommendation(
    index: number,
    field: "title" | "description",
    value: string
  ) {
    setRecommendations((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  }

  function addRecommendation() {
    setRecommendations((prev) => [...prev, { title: "", description: "" }]);
  }

  function removeRecommendation(index: number) {
    setRecommendations((prev) => prev.filter((_, i) => i !== index));
  }

  async function uploadEvidence(file: File) {
    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "montessori/observations");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await readJsonSafe(res);

      if (!res.ok || !data?.url) {
        throw new Error(data?.message ?? "Could not upload evidence.");
      }

      const isImage = file.type.startsWith("image/");

      const newMedia: ObservationMedia = {
        id: crypto.randomUUID(),
        fileName: file.name,
        fileUrl: data.url,
        fileType: data.fileType ?? file.type,
        publicId: data.publicId,
        resourceType: data.resourceType,
        mediaType: isImage ? "image" : file.type === "application/pdf" ? "pdf" : "other",
        caption: "",
        uploadedAt: new Date().toISOString(),
        uploadedBy: teacherUid,
      };

      setMedia((prev) => [...prev, newMedia]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function deleteMedia(file: ObservationMedia) {
    setError("");

    try {
      const res = await fetch("/api/upload/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          publicId: file.publicId,
          resourceType: file.resourceType,
        }),
      });

      const data = await readJsonSafe(res);

      if (!res.ok) {
        throw new Error(data?.message ?? "Could not remove evidence.");
      }

      setMedia((prev) => prev.filter((item) => item.id !== file.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove evidence.");
    }
  }

  function updateMediaCaption(id: string, caption: string) {
    setMedia((prev) =>
      prev.map((item) => (item.id === id ? { ...item, caption } : item))
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setSaving(true);
    setError("");

    try {
      const cleanedRecommendations = recommendations.filter(
        (item) => item.title.trim() || item.description.trim()
      );

      const res = await fetch("/api/observations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId,
          teacherId: teacherUid,
          observationDate,
          area,
          mood,
          title,
          sessionSummary,
          activitiesWorked,
          strengths,
          challenges,
          homeRecommendations: cleanedRecommendations,
          teacherNotes,
          media,
          visibleToParent,
        }),
      });

      const data = await readJsonSafe(res);

      if (!res.ok) {
        throw new Error(data?.message ?? "Could not create observation.");
      }

      router.push("/dashboard/teacher/observations");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <style>{`
        .nof-root{
          min-height:calc(100vh - 4rem);
          padding:42px 22px 90px;
          background:
            radial-gradient(circle at top left, rgba(29,95,166,.12), transparent 30%),
            radial-gradient(circle at top right, rgba(170,46,11,.10), transparent 28%),
            linear-gradient(135deg,#fffaf0,#f7efe2);
          font-family:Outfit,sans-serif;
        }

        .nof-container{
          max-width:1060px;
          margin:0 auto;
        }

        .nof-hero,
        .nof-card{
          background:rgba(255,255,255,.92);
          border:1px solid rgba(210,180,140,.55);
          border-radius:26px;
          padding:28px;
          margin-bottom:20px;
          box-shadow:0 8px 24px rgba(80,45,10,.06);
        }

        .nof-eyebrow{
          color:#c0410c;
          font-size:12px;
          font-weight:800;
          letter-spacing:.16em;
          text-transform:uppercase;
          margin-bottom:8px;
        }

        .nof-title{
          font-family:"Cormorant Garamond",serif;
          font-size:46px;
          color:#1a0f00;
          margin:0 0 8px;
        }

        .nof-subtitle{
          color:#725944;
          line-height:1.6;
          margin:0;
          max-width:760px;
        }

        .nof-card-title{
          font-family:"Cormorant Garamond",serif;
          font-size:30px;
          color:#1a0f00;
          margin:0 0 18px;
        }

        .nof-grid{
          display:grid;
          grid-template-columns:repeat(2,minmax(0,1fr));
          gap:16px;
        }

        .nof-field{
          display:flex;
          flex-direction:column;
          gap:7px;
          margin-bottom:14px;
        }

        .nof-field.full{
          grid-column:1 / -1;
        }

        .nof-label{
          font-size:12px;
          font-weight:800;
          letter-spacing:.08em;
          text-transform:uppercase;
          color:#5a3a20;
        }

        .nof-input,
        .nof-textarea,
        .nof-select{
          width:100%;
          border:1.5px solid #d7c4aa;
          border-radius:15px;
          padding:13px 14px;
          background:#fffdf8;
          color:#5a3a20;
          font-family:Outfit,sans-serif;
          outline:none;
        }

        .nof-textarea{
          resize:vertical;
          min-height:110px;
        }

        .nof-input:focus,
        .nof-textarea:focus,
        .nof-select:focus{
          border-color:#1d5fa6;
          color:#1d5fa6;
          box-shadow:0 0 0 3px rgba(29,95,166,.12);
        }

        .nof-help{
          color:#725944;
          font-size:13px;
          line-height:1.5;
        }

        .recommendation{
          border:1px solid #d7c4aa;
          border-radius:18px;
          padding:16px;
          margin-bottom:14px;
          background:#fffdf8;
        }

        .nof-actions{
          display:flex;
          gap:12px;
          flex-wrap:wrap;
          justify-content:space-between;
          align-items:center;
          margin-top:18px;
        }

        .nof-btn,
        .nof-secondary,
        .nof-danger{
          border:none;
          border-radius:15px;
          padding:12px 18px;
          font-weight:800;
          cursor:pointer;
          text-decoration:none;
        }

        .nof-btn{
          background:linear-gradient(135deg,#c0410c,#9a3008);
          color:white;
          box-shadow:0 8px 24px rgba(192,65,12,.22);
        }

        .nof-secondary{
          background:#e8f1ff;
          color:#1d5fa6;
        }

        .nof-danger{
          background:#fff0eb;
          color:#aa2e0b;
        }

        .nof-btn:disabled,
        .nof-secondary:disabled,
        .nof-danger:disabled{
          opacity:.55;
          cursor:not-allowed;
        }

        .upload-box{
          border:2px dashed #d7c4aa;
          border-radius:18px;
          padding:20px;
          background:#fffdf8;
        }

        .media-list{
          display:grid;
          grid-template-columns:repeat(2,minmax(0,1fr));
          gap:14px;
          margin-top:18px;
        }

        .media-card{
          border:1px solid #d7c4aa;
          border-radius:18px;
          padding:15px;
          background:#fffaf0;
        }

        .media-title{
          color:#1a0f00;
          font-weight:900;
          margin-bottom:5px;
          word-break:break-word;
        }

        .media-meta{
          color:#725944;
          font-size:13px;
          margin-bottom:12px;
        }

        .media-buttons{
          display:flex;
          gap:10px;
          flex-wrap:wrap;
          margin-top:10px;
        }

        .media-link{
          border-radius:12px;
          padding:9px 12px;
          background:#e8f1ff;
          color:#1d5fa6;
          font-weight:800;
          text-decoration:none;
        }

        .visibility{
          display:flex;
          gap:12px;
          align-items:flex-start;
          padding:16px;
          border-radius:18px;
          border:1px solid #d7c4aa;
          background:#fffdf8;
        }

        .visibility input{
          margin-top:4px;
        }

        .error{
          background:#fff0eb;
          color:#aa2e0b;
          border:1px solid #f1a38d;
          border-radius:14px;
          padding:13px 16px;
          margin-bottom:18px;
          font-weight:700;
        }

        @media(max-width:760px){
          .nof-grid,
          .media-list{
            grid-template-columns:1fr;
          }

          .nof-title{
            font-size:38px;
          }
        }
      `}</style>

      <main className="nof-root">

        <div className="nof-container">
          <BackButton
            label="Back"
          />

          <section className="nof-hero">
            <div className="nof-eyebrow">Teacher observation</div>
            <h1 className="nof-title">New observation</h1>
            <p className="nof-subtitle">
              Share what was worked on today, meaningful classroom moments,
              recommendations for home, and optional evidence for the family.
            </p>
          </section>

          {error && <div className="error">⚠ {error}</div>}

          <form onSubmit={handleSubmit}>
            <section className="nof-card">
              <h2 className="nof-card-title">Student and context</h2>

              <div className="nof-grid">
                <div className="nof-field">
                  <label className="nof-label">Student</label>
                  <select
                    className="nof-select"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    required
                  >
                    <option value="">Select student</option>
                    {students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.firstName} {student.lastName} —{" "}
                        {student.program}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="nof-field">
                  <label className="nof-label">Observation date</label>
                  <input
                    className="nof-input"
                    type="date"
                    value={observationDate}
                    onChange={(e) => setObservationDate(e.target.value)}
                    required
                  />
                </div>

                <div className="nof-field">
                  <label className="nof-label">Area</label>
                  <select
                    className="nof-select"
                    value={area}
                    onChange={(e) => setArea(e.target.value as ObservationArea)}
                    required
                  >
                    {AREAS.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="nof-field">
                  <label className="nof-label">Mood / attitude</label>
                  <select
                    className="nof-select"
                    value={mood}
                    onChange={(e) => setMood(e.target.value as ObservationMood)}
                  >
                    {MOODS.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="nof-field full">
                  <label className="nof-label">Title</label>
                  <input
                    className="nof-input"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Example: Concentration during practical life work"
                    required
                  />
                </div>
              </div>
            </section>

            <section className="nof-card">
              <h2 className="nof-card-title">Classroom work</h2>

              <div className="nof-field">
                <label className="nof-label">Session summary</label>
                <textarea
                  className="nof-textarea"
                  value={sessionSummary}
                  onChange={(e) => setSessionSummary(e.target.value)}
                  placeholder="Describe what happened during the session..."
                  required
                />
              </div>

              <div className="nof-field">
                <label className="nof-label">Activities worked</label>
                <textarea
                  className="nof-textarea"
                  value={activitiesWorked}
                  onChange={(e) => setActivitiesWorked(e.target.value)}
                  placeholder="Mention the activities, materials, or topics practiced today..."
                  required
                />
              </div>

              <div className="nof-grid">
                <div className="nof-field">
                  <label className="nof-label">Strengths</label>
                  <textarea
                    className="nof-textarea"
                    value={strengths}
                    onChange={(e) => setStrengths(e.target.value)}
                    placeholder="What went well?"
                  />
                </div>

                <div className="nof-field">
                  <label className="nof-label">Challenges / situations</label>
                  <textarea
                    className="nof-textarea"
                    value={challenges}
                    onChange={(e) => setChallenges(e.target.value)}
                    placeholder="Any situation, behavior, or area that needs support?"
                  />
                </div>
              </div>
            </section>

            <section className="nof-card">
              <h2 className="nof-card-title">Recommendations for home</h2>

              <p className="nof-help">
                Add simple recommendations for the family to support the child at
                home.
              </p>

              {recommendations.map((item, index) => (
                <div key={index} className="recommendation">
                  <div className="nof-field">
                    <label className="nof-label">Recommendation title</label>
                    <input
                      className="nof-input"
                      value={item.title}
                      onChange={(e) =>
                        updateRecommendation(index, "title", e.target.value)
                      }
                      placeholder="Example: Practice independence at home"
                    />
                  </div>

                  <div className="nof-field">
                    <label className="nof-label">Description</label>
                    <textarea
                      className="nof-textarea"
                      value={item.description}
                      onChange={(e) =>
                        updateRecommendation(
                          index,
                          "description",
                          e.target.value
                        )
                      }
                      placeholder="Explain how the parent can help..."
                    />
                  </div>

                  {recommendations.length > 1 && (
                    <button
                      type="button"
                      className="nof-danger"
                      onClick={() => removeRecommendation(index)}
                    >
                      Remove recommendation
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                className="nof-secondary"
                onClick={addRecommendation}
              >
                Add recommendation
              </button>
            </section>

            <section className="nof-card">
              <h2 className="nof-card-title">Evidence</h2>

              <p className="nof-help">
                Upload optional photos or files showing classroom work or
                evidence. Accepted formats depend on your upload endpoint.
              </p>

              <div className="upload-box">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  disabled={uploading}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    await uploadEvidence(file);
                    e.target.value = "";
                  }}
                />

                {uploading && (
                  <p className="nof-help" style={{ marginTop: 10 }}>
                    Uploading evidence...
                  </p>
                )}
              </div>

              {media.length > 0 && (
                <div className="media-list">
                  {media.map((file) => (
                    <div key={file.id} className="media-card">
                      <div className="media-title">{file.fileName}</div>
                      <div className="media-meta">{file.fileType}</div>

                      <div className="nof-field">
                        <label className="nof-label">Caption</label>
                        <input
                          className="nof-input"
                          value={file.caption ?? ""}
                          onChange={(e) =>
                            updateMediaCaption(file.id, e.target.value)
                          }
                          placeholder="Optional caption for the family"
                        />
                      </div>

                      <div className="media-buttons">
                        <a
                          className="media-link"
                          href={viewerHref(file)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          View
                        </a>

                        <button
                          type="button"
                          className="nof-danger"
                          onClick={() => deleteMedia(file)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="nof-card">
              <h2 className="nof-card-title">Visibility</h2>

              <label className="visibility">
                <input
                  type="checkbox"
                  checked={visibleToParent}
                  onChange={(e) => setVisibleToParent(e.target.checked)}
                />

                <div>
                  <strong>Share this observation with the parent</strong>
                  <p className="nof-help" style={{ marginTop: 6 }}>
                    If unchecked, the observation will be saved as a draft and
                    only the teacher/admin can see it.
                  </p>
                </div>
              </label>
            </section>

            <div className="nof-actions">
              <button
                type="button"
                className="nof-secondary"
                onClick={() => router.push("/dashboard/teacher/observations")}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="nof-btn"
                disabled={saving || uploading}
              >
                {saving ? "Saving..." : "Save observation"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}