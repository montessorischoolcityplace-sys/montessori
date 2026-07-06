"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import BackButton from "@/components/navegation/back-button";

type EnrollmentStatus =
  | "draft"
  | "submitted"
  | "needs_correction"
  | "approved"
  | "rejected"
  | "active"
  | "inactive";

type StudentDocument = {
  id: string;
  type: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  publicId?: string;
  resourceType?: "image" | "raw";
  uploadedAt: string;
  status: "pending_review" | "approved" | "rejected";
  reviewNotes?: string;
};

type Student = {
  id: string;
  firstName: string;
  lastName: string;
  enrollmentStatus: EnrollmentStatus;
  reviewNotes?: string;
  correctionNotes?: string;
  documents: StudentDocument[];
};

interface Props {
  student: Student;
  adminUid: string;
}

function label(value?: string) {
  return value ? value.replaceAll("_", " ") : "Not provided";
}


export default function StudentReviewForm({ student, adminUid }: Props) {
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [enrollmentStatus, setEnrollmentStatus] =
    useState<EnrollmentStatus>(student.enrollmentStatus);
    
  const [correctionNotes, setCorrectionNotes] = useState(
    student.correctionNotes ?? ""
    );

  const [reviewNotes, setReviewNotes] = useState(student.reviewNotes ?? "");
  const [documents, setDocuments] = useState<StudentDocument[]>(
    student.documents ?? []
  );

  function updateDocumentStatus(
    documentId: string,
    status: "pending_review" | "approved" | "rejected"
  ) {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === documentId
          ? {
              ...doc,
              status,
            }
          : doc
      )
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/students?id=${student.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          enrollmentStatus,
          reviewNotes,
          correctionNotes,
          reviewedBy: adminUid,
          documents,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error ?? "Could not update student.");
      }

      router.push(`/dashboard/students/${student.id}`);
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
        .sr-root {
          min-height: calc(100vh - 4rem);
          padding: 42px 20px 90px;
          background:
            radial-gradient(circle at top left, rgba(245,195,106,.22), transparent 32%),
            linear-gradient(135deg, #fffaf0, #f7efe2);
          font-family: Outfit, sans-serif;
        }

        .sr-container {
          max-width: 900px;
          margin: 0 auto;
        }

        .sr-hero,
        .sr-card {
          background: rgba(255,255,255,.92);
          border: 1px solid rgba(210,180,140,.55);
          border-radius: 24px;
          padding: 24px;
          margin-bottom: 20px;
          box-shadow: 0 8px 24px rgba(80,45,10,.06);
        }

        .sr-eyebrow {
          color: #c0410c;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: .16em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .sr-title {
          font-family: "Cormorant Garamond", serif;
          font-size: 42px;
          color: #1a0f00;
          margin: 0;
        }

        .sr-card-title {
          font-family: "Cormorant Garamond", serif;
          font-size: 25px;
          color: #1a0f00;
          margin-bottom: 18px;
        }

        .sr-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 14px;
        }

        .sr-label {
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: .06em;
          color: #5a3a20;
        }

        .sr-select,
        .sr-textarea {
          border: 1.5px solid #d7c4aa;
          border-radius: 13px;
          padding: 12px 14px;
          background: #fffdf8;
          font-size: 15px;
          outline: none;
          color: #5a3a20;
          font-family: Outfit, sans-serif;
        }

        .sr-textarea {
          min-height: 110px;
          resize: vertical;
        }

        .sr-select:focus,
        .sr-textarea:focus {
          border-color: #c0410c;
          box-shadow: 0 0 0 3px rgba(192,65,12,.12);
          color: #c0410c;
        }

        .sr-doc {
          border: 1px solid #d7c4aa;
          background: #fffdf8;
          border-radius: 16px;
          padding: 14px;
          margin-bottom: 12px;
        }

        .sr-doc-top {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 12px;
        }

        .sr-doc-name {
          color: #1a0f00;
          font-weight: 800;
        }

        .sr-doc-meta {
          color: #725944;
          font-size: 13px;
          text-transform: capitalize;
        }

        .sr-link {
          color: #c0410c;
          font-weight: 800;
          text-decoration: none;
        }

        .sr-error {
          background: #fff0eb;
          color: #aa2e0b;
          border: 1px solid #f1a38d;
          border-radius: 14px;
          padding: 13px 16px;
          margin-bottom: 18px;
        }

        .sr-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }

        .sr-btn {
          border: none;
          border-radius: 15px;
          padding: 13px 24px;
          background: linear-gradient(135deg, #c0410c, #9a3008);
          color: #fff8ee;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 6px 18px rgba(192,65,12,.25);
        }

        .sr-btn:disabled {
          opacity: .55;
          cursor: not-allowed;
        }
      `}</style>

      <main className="sr-root">
        <div className="sr-container">
          <BackButton
                                label="Back"
                              />
          <section className="sr-hero">
            <div className="sr-eyebrow">Admin review</div>
            <h1 className="sr-title">
              {student.firstName} {student.lastName}
            </h1>
          </section>

          {error && <div className="sr-error">⚠ {error}</div>}

          <form onSubmit={handleSubmit}>
            <section className="sr-card">
              <h2 className="sr-card-title">Application status</h2>

              <div className="sr-field">
                <label className="sr-label">Enrollment status</label>
                <select
                  className="sr-select"
                  value={enrollmentStatus}
                  onChange={(e) =>
                    setEnrollmentStatus(e.target.value as EnrollmentStatus)
                  }
                >
                  <option value="draft">Draft</option>
                  <option value="submitted">Submitted</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="needs_correction">Needs correction</option>
                </select>
              </div>

              <div className="sr-field">
                <label className="sr-label">Review notes</label>
                <textarea
                  className="sr-textarea"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Write notes for internal review or parent follow-up..."
                />
              </div>

              <div className="sr-field">
                <label className="sr-label">Correction notes for parent</label>
                <textarea
                    className="sr-textarea"
                    value={correctionNotes}
                    onChange={(e) => setCorrectionNotes(e.target.value)}
                    placeholder="Explain what the parent needs to correct or upload again..."
                />
              </div>
            </section>

            <section className="sr-card">
              <h2 className="sr-card-title">Documents review</h2>

              {documents.length === 0 ? (
                <p style={{ color: "#725944" }}>No documents uploaded.</p>
              ) : (
                documents.map((doc) => (
                  <div key={doc.id} className="sr-doc">
                    <div className="sr-doc-top">
                      <div>
                        <div className="sr-doc-name">{doc.fileName}</div>
                        <div className="sr-doc-meta">
                          {label(doc.type)} · {label(doc.status)}
                        </div>
                      </div>

                      <Link
                        href={`/dashboard/documents/view?url=${encodeURIComponent(
                          doc.fileUrl
                        )}&type=${encodeURIComponent(doc.fileType || "")}`}
                        target="_blank"
                        className="sr-link"
                      >
                        View
                      </Link>
                    </div>

                    <div className="sr-field">
                      <label className="sr-label">Document status</label>
                      <select
                        className="sr-select"
                        value={doc.status}
                        onChange={(e) =>
                          updateDocumentStatus(
                            doc.id,
                            e.target.value as
                              | "pending_review"
                              | "approved"
                              | "rejected"
                          )
                        }
                      >
                        <option value="pending_review">Pending review</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </div>
                ))
              )}
            </section>

            <div className="sr-actions">
              <button className="sr-btn" disabled={saving}>
                {saving ? "Saving..." : "Save review"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}