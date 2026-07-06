"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Observation,
  ObservationArea,
  ObservationMedia,
  ObservationMood,
} from "@/lib/observations/observation.type";
import BackButton from "@/components/navegation/back-button";

interface Props {
  observation: Observation;
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

export default function EditObservationForm({ observation }: Props) {
  const router = useRouter();

  const [observationDate, setObservationDate] = useState(
    observation.observationDate
  );

  const [area, setArea] = useState<ObservationArea>(observation.area);
  const [mood, setMood] = useState<ObservationMood>(observation.mood);

  const [title, setTitle] = useState(observation.title);
  const [sessionSummary, setSessionSummary] = useState(
    observation.sessionSummary
  );
  const [activitiesWorked, setActivitiesWorked] = useState(
    observation.activitiesWorked
  );
  const [strengths, setStrengths] = useState(observation.strengths ?? "");
  const [challenges, setChallenges] = useState(observation.challenges ?? "");
  const [teacherNotes, setTeacherNotes] = useState(
    observation.teacherNotes ?? ""
  );

  const [recommendations, setRecommendations] = useState(
    observation.homeRecommendations.length > 0
      ? observation.homeRecommendations
      : [{ title: "", description: "" }]
  );

  const [media, setMedia] = useState<ObservationMedia[]>(
    observation.media ?? []
  );

  const [visibleToParent, setVisibleToParent] = useState(
    observation.visibleToParent
  );

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
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

  function updateMediaCaption(id: string, caption: string) {
    setMedia((prev) =>
      prev.map((item) => (item.id === id ? { ...item, caption } : item))
    );
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
        mediaType: isImage
          ? "image"
          : file.type === "application/pdf"
          ? "pdf"
          : "other",
        caption: "",
        uploadedAt: new Date().toISOString(),
        uploadedBy: observation.teacherId,
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

  async function saveObservation(e: React.FormEvent) {
    e.preventDefault();

    setSaving(true);
    setError("");

    try {
      const cleanedRecommendations = recommendations.filter(
        (item) => item.title.trim() || item.description.trim()
      );

      const res = await fetch(`/api/observations/${observation.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          observationDate,
          area,
          mood,
          title,
          sessionSummary,
          activitiesWorked,
          strengths,
          challenges,
          teacherNotes,
          homeRecommendations: cleanedRecommendations,
          media,
          visibleToParent,
        }),
      });

      const data = await readJsonSafe(res);

      if (!res.ok) {
        throw new Error(data?.message ?? "Could not update observation.");
      }

      router.push("/dashboard/teacher/observations");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteObservation() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this observation? This action cannot be undone."
    );

    if (!confirmed) return;

    setDeleting(true);
    setError("");

    try {
      for (const file of media) {
        await fetch("/api/upload/delete", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            publicId: file.publicId,
            resourceType: file.resourceType,
          }),
        });
      }

      const res = await fetch(`/api/observations/${observation.id}`, {
        method: "DELETE",
      });

      const data = await readJsonSafe(res);

      if (!res.ok) {
        throw new Error(data?.message ?? "Could not delete observation.");
      }

      router.push("/dashboard/teacher/observations");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete observation.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <style>{`
        .eof-root{
          min-height:calc(100vh - 4rem);
          padding:42px 22px 90px;
          background:
            radial-gradient(circle at top left, rgba(29,95,166,.12), transparent 30%),
            radial-gradient(circle at top right, rgba(170,46,11,.10), transparent 28%),
            linear-gradient(135deg,#fffaf0,#f7efe2);
          font-family:Outfit,sans-serif;
        }

        .eof-container{
          max-width:1060px;
          margin:0 auto;
        }

        .eof-hero,
        .eof-card{
          background:rgba(255,255,255,.92);
          border:1px solid rgba(210,180,140,.55);
          border-radius:26px;
          padding:28px;
          margin-bottom:20px;
          box-shadow:0 8px 24px rgba(80,45,10,.06);
        }

        .eof-eyebrow{
          color:#c0410c;
          font-size:12px;
          font-weight:800;
          letter-spacing:.16em;
          text-transform:uppercase;
          margin-bottom:8px;
        }

        .eof-title{
          font-family:"Cormorant Garamond",serif;
          font-size:46px;
          color:#1a0f00;
          margin:0 0 8px;
        }

        .eof-subtitle{
          color:#725944;
          line-height:1.6;
          margin:0;
          max-width:760px;
        }

        .eof-card-title{
          font-family:"Cormorant Garamond",serif;
          font-size:30px;
          color:#1a0f00;
          margin:0 0 18px;
        }

        .eof-grid{
          display:grid;
          grid-template-columns:repeat(2,minmax(0,1fr));
          gap:16px;
        }

        .eof-field{
          display:flex;
          flex-direction:column;
          gap:7px;
          margin-bottom:14px;
        }

        .eof-field.full{
          grid-column:1 / -1;
        }

        .eof-label{
          font-size:12px;
          font-weight:800;
          letter-spacing:.08em;
          text-transform:uppercase;
          color:#5a3a20;
        }

        .eof-input,
        .eof-textarea,
        .eof-select{
          width:100%;
          border:1.5px solid #d7c4aa;
          border-radius:15px;
          padding:13px 14px;
          background:#fffdf8;
          color:#5a3a20;
          font-family:Outfit,sans-serif;
          outline:none;
        }

        .eof-textarea{
          resize:vertical;
          min-height:110px;
        }

        .eof-input:focus,
        .eof-textarea:focus,
        .eof-select:focus{
          border-color:#1d5fa6;
          color:#1d5fa6;
          box-shadow:0 0 0 3px rgba(29,95,166,.12);
        }

        .eof-help{
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

        .eof-actions{
          display:flex;
          gap:12px;
          flex-wrap:wrap;
          justify-content:space-between;
          align-items:center;
          margin-top:18px;
        }

        .eof-action-left,
        .eof-action-right{
          display:flex;
          gap:12px;
          flex-wrap:wrap;
        }

        .eof-btn,
        .eof-secondary,
        .eof-danger{
          border:none;
          border-radius:15px;
          padding:12px 18px;
          font-weight:800;
          cursor:pointer;
          text-decoration:none;
        }

        .eof-btn{
          background:linear-gradient(135deg,#c0410c,#9a3008);
          color:white;
          box-shadow:0 8px 24px rgba(192,65,12,.22);
        }

        .eof-secondary{
          background:#e8f1ff;
          color:#1d5fa6;
        }

        .eof-danger{
          background:#fff0eb;
          color:#aa2e0b;
        }

        .eof-btn:disabled,
        .eof-secondary:disabled,
        .eof-danger:disabled{
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
          .eof-grid,
          .media-list{
            grid-template-columns:1fr;
          }

          .eof-title{
            font-size:38px;
          }

          .eof-actions{
            align-items:stretch;
          }

          .eof-action-left,
          .eof-action-right{
            width:100%;
          }
        }
      `}</style>

      <main className="eof-root">
        <div className="eof-container">

          <section className="eof-hero">
            <div className="eof-eyebrow">Edit observation</div>
            <h1 className="eof-title">{observation.title || "Observation"}</h1>
            <p className="eof-subtitle">
              Update classroom notes, recommendations, visibility, or evidence
              shared with the family.
            </p>
          </section>

          {error && <div className="error">⚠ {error}</div>}

          <form onSubmit={saveObservation}>
            <section className="eof-card">
              <h2 className="eof-card-title">Student and context</h2>

              <div className="eof-grid">
                <div className="eof-field">
                  <label className="eof-label">Observation date</label>
                  <input
                    className="eof-input"
                    type="date"
                    value={observationDate}
                    onChange={(e) => setObservationDate(e.target.value)}
                    required
                  />
                </div>

                <div className="eof-field">
                  <label className="eof-label">Area</label>
                  <select
                    className="eof-select"
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

                <div className="eof-field">
                  <label className="eof-label">Mood / attitude</label>
                  <select
                    className="eof-select"
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

                <div className="eof-field full">
                  <label className="eof-label">Title</label>
                  <input
                    className="eof-input"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
              </div>
            </section>

            <section className="eof-card">
              <h2 className="eof-card-title">Classroom work</h2>

              <div className="eof-field">
                <label className="eof-label">Session summary</label>
                <textarea
                  className="eof-textarea"
                  value={sessionSummary}
                  onChange={(e) => setSessionSummary(e.target.value)}
                  required
                />
              </div>

              <div className="eof-field">
                <label className="eof-label">Activities worked</label>
                <textarea
                  className="eof-textarea"
                  value={activitiesWorked}
                  onChange={(e) => setActivitiesWorked(e.target.value)}
                  required
                />
              </div>

              <div className="eof-grid">
                <div className="eof-field">
                  <label className="eof-label">Strengths</label>
                  <textarea
                    className="eof-textarea"
                    value={strengths}
                    onChange={(e) => setStrengths(e.target.value)}
                  />
                </div>

                <div className="eof-field">
                  <label className="eof-label">Challenges / situations</label>
                  <textarea
                    className="eof-textarea"
                    value={challenges}
                    onChange={(e) => setChallenges(e.target.value)}
                  />
                </div>
              </div>

              <div className="eof-field">
                <label className="eof-label">Private teacher notes</label>
                <textarea
                  className="eof-textarea"
                  value={teacherNotes}
                  onChange={(e) => setTeacherNotes(e.target.value)}
                  placeholder="Internal notes. Use carefully if visible to parents."
                />
              </div>
            </section>

            <section className="eof-card">
              <h2 className="eof-card-title">Recommendations for home</h2>

              {recommendations.map((item, index) => (
                <div key={index} className="recommendation">
                  <div className="eof-field">
                    <label className="eof-label">Recommendation title</label>
                    <input
                      className="eof-input"
                      value={item.title}
                      onChange={(e) =>
                        updateRecommendation(index, "title", e.target.value)
                      }
                    />
                  </div>

                  <div className="eof-field">
                    <label className="eof-label">Description</label>
                    <textarea
                      className="eof-textarea"
                      value={item.description}
                      onChange={(e) =>
                        updateRecommendation(
                          index,
                          "description",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  {recommendations.length > 1 && (
                    <button
                      type="button"
                      className="eof-danger"
                      onClick={() => removeRecommendation(index)}
                    >
                      Remove recommendation
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                className="eof-secondary"
                onClick={addRecommendation}
              >
                Add recommendation
              </button>
            </section>

            <section className="eof-card">
              <h2 className="eof-card-title">Evidence</h2>

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
                  <p className="eof-help" style={{ marginTop: 10 }}>
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

                      <div className="eof-field">
                        <label className="eof-label">Caption</label>
                        <input
                          className="eof-input"
                          value={file.caption ?? ""}
                          onChange={(e) =>
                            updateMediaCaption(file.id, e.target.value)
                          }
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
                          className="eof-danger"
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

            <section className="eof-card">
              <h2 className="eof-card-title">Visibility</h2>

              <label className="visibility">
                <input
                  type="checkbox"
                  checked={visibleToParent}
                  onChange={(e) => setVisibleToParent(e.target.checked)}
                />

                <div>
                  <strong>Share this observation with the parent</strong>
                  <p className="eof-help" style={{ marginTop: 6 }}>
                    If unchecked, it stays as a draft for teacher/admin only.
                  </p>
                </div>
              </label>
            </section>

            <div className="eof-actions">
              <div className="eof-action-left">
                <button
                  type="button"
                  className="eof-danger"
                  onClick={deleteObservation}
                  disabled={saving || deleting || uploading}
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>

              <div className="eof-action-right">
                <button
                  type="button"
                  className="eof-secondary"
                  onClick={() => router.push("/dashboard/teacher/observations")}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="eof-btn"
                  disabled={saving || deleting || uploading}
                >
                  {saving ? "Saving..." : "Save changes"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}