"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import BackButton from "@/components/navegation/back-button";

type DocumentType =
  | "birth_certificate"
  | "vaccination_record"
  | "medical_form"
  | "previous_school_record"
  | "other";

interface StudentDocument {
  id: string;
  type: DocumentType | string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  publicId: string;
  resourceType: "image" | "raw";
  uploadedAt: string;
  status: "pending_review" | "approved" | "rejected";
  reviewNotes?: string;
}

interface Student {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  parentComments?: string;
  correctionNotes?: string;
  reviewNotes?: string;
  enrollmentStatus: string;
  documents?: StudentDocument[];
}

interface Props {
  student: Student;
  parentUid: string;
}

function label(value?: string) {
  return value ? value.replaceAll("_", " ") : "Not provided";
}

export default function StudentCorrectionForm({ student }: Props) {
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingType, setUploadingType] = useState<string | null>(null);

  const [firstName, setFirstName] = useState(student.firstName);
  const [middleName, setMiddleName] = useState(student.middleName ?? "");
  const [lastName, setLastName] = useState(student.lastName);
  const [parentComments, setParentComments] = useState(
    student.parentComments ?? ""
  );

  const [documentType, setDocumentType] =
    useState<DocumentType>("birth_certificate");

  const [documents, setDocuments] = useState<StudentDocument[]>(
    student.documents ?? []
  );

  const selectedTypeAlreadyUploaded = useMemo(
    () => documents.some((doc) => doc.type === documentType),
    [documents, documentType]
  );

  function uploadDocumentWithProgress(
    file: File,
    type: DocumentType
  ): Promise<StudentDocument> {
    return new Promise((resolve, reject) => {
      const formData = new FormData();

      formData.append("file", file);
      formData.append("folder", "montessori/students");

      const xhr = new XMLHttpRequest();

      xhr.open("POST", "/api/upload");

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percent);
        }
      };

      xhr.onload = () => {
        try {
          const data = JSON.parse(xhr.responseText);

          if (xhr.status < 200 || xhr.status >= 300 || !data.ok) {
            reject(new Error(data?.message ?? "Could not upload file."));
            return;
          }

          resolve({
            id: crypto.randomUUID(),
            type,
            fileName: file.name,
            fileUrl: data.url,
            fileType: file.type,
            publicId: data.publicId,
            resourceType: data.resourceType,
            uploadedAt: new Date().toISOString(),
            status: "pending_review",
          });
        } catch {
          reject(new Error("Invalid upload response."));
        }
      };

      xhr.onerror = () => {
        reject(new Error("Upload failed."));
      };

      xhr.send(formData);
    });
  }

  async function persistDocuments(nextDocuments: StudentDocument[]) {
    const res = await fetch(`/api/students?id=${student.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        documents: nextDocuments,
      }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      throw new Error(data?.error ?? "Could not update documents.");
    }
  }

  async function deleteFromCloudinary(doc: StudentDocument) {
    if (!doc.publicId || !doc.resourceType) return;

    const res = await fetch("/api/upload/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        publicId: doc.publicId,
        resourceType: doc.resourceType,
      }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok || !data?.ok) {
      throw new Error(data?.message ?? "Could not delete file.");
    }
  }

  async function addDocument(file: File, type: DocumentType) {
    const alreadyExists = documents.some((doc) => doc.type === type);

    if (alreadyExists) {
      setError("This document type already exists. Use Replace instead.");
      return;
    }

    setUploading(true);
    setUploadingType(type);
    setUploadProgress(0);
    setError("");

    try {
      const newDocument = await uploadDocumentWithProgress(file, type);
      const nextDocuments = [...documents, newDocument];

      await persistDocuments(nextDocuments);
      setDocuments(nextDocuments);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not upload file.");
    } finally {
      setUploading(false);
      setUploadingType(null);
      setUploadProgress(0);
    }
  }

  async function replaceDocument(documentId: string, file: File) {
    const oldDocument = documents.find((doc) => doc.id === documentId);

    if (!oldDocument) return;

    setUploading(true);
    setUploadingType(oldDocument.type);
    setUploadProgress(0);
    setError("");

    try {
      const newDocument = await uploadDocumentWithProgress(
        file,
        oldDocument.type as DocumentType
      );

      await deleteFromCloudinary(oldDocument);

      const nextDocuments = documents.map((doc) =>
        doc.id === documentId ? newDocument : doc
      );

      await persistDocuments(nextDocuments);
      setDocuments(nextDocuments);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not replace file.");
    } finally {
      setUploading(false);
      setUploadingType(null);
      setUploadProgress(0);
    }
  }

  async function removeDocument(documentId: string) {
    const doc = documents.find((d) => d.id === documentId);

    if (!doc) return;

    const confirmed = window.confirm(
      "Are you sure you want to remove this document?"
    );

    if (!confirmed) return;

    setSaving(true);
    setError("");

    try {
      await deleteFromCloudinary(doc);

      const nextDocuments = documents.filter((d) => d.id !== documentId);

      await persistDocuments(nextDocuments);
      setDocuments(nextDocuments);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove file.");
    } finally {
      setSaving(false);
    }
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
          firstName,
          middleName: middleName || undefined,
          lastName,
          parentComments: parentComments || undefined,
          documents,
          enrollmentStatus: "submitted",
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error ?? "Could not submit application.");
      }

      router.push(`/dashboard/students/${student.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <style>{`
        .sc-root {
          min-height: calc(100vh - 4rem);
          padding: 42px 20px 90px;
          background:
            radial-gradient(circle at top left, rgba(245,195,106,.20), transparent 32%),
            linear-gradient(135deg, #fffaf0, #f7efe2);
          font-family: Outfit, sans-serif;
        }

        .sc-container {
          max-width: 900px;
          margin: 0 auto;
        }

        .sc-card {
          background: rgba(255,255,255,.92);
          border: 1px solid rgba(210,180,140,.55);
          border-radius: 24px;
          padding: 24px;
          margin-bottom: 20px;
          box-shadow: 0 8px 24px rgba(80,45,10,.06);
        }

        .sc-eyebrow {
          color: #c0410c;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: .16em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .sc-title {
          font-family: "Cormorant Garamond", serif;
          font-size: 42px;
          color: #1a0f00;
          margin: 0;
        }

        .sc-card-title {
          font-family: "Cormorant Garamond", serif;
          font-size: 28px;
          margin-bottom: 18px;
          color: #1a0f00;
        }

        .sc-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 14px;
        }

        .sc-label {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: .06em;
          text-transform: uppercase;
          color: #5a3a20;
        }

        .sc-input,
        .sc-select,
        .sc-textarea {
          border: 1.5px solid #d7c4aa;
          border-radius: 14px;
          padding: 12px 14px;
          background: #fffdf8;
          color: #5a3a20;
          font-size: 15px;
          outline: none;
          font-family: Outfit, sans-serif;
        }

        .sc-textarea {
          min-height: 90px;
          resize: vertical;
        }

        .sc-input:focus,
        .sc-select:focus,
        .sc-textarea:focus {
          border-color: #c0410c;
          color: #c0410c;
          box-shadow: 0 0 0 3px rgba(192,65,12,.12);
        }

        .sc-warning {
          background: #fff3e7;
          border: 1px solid #ffc48a;
          color: #8a4200;
          border-radius: 16px;
          padding: 16px;
          margin-bottom: 20px;
        }

        .sc-error {
          background: #fff0eb;
          color: #aa2e0b;
          border: 1px solid #f1a38d;
          border-radius: 14px;
          padding: 12px;
          margin-bottom: 16px;
        }

        .sc-upload {
          border: 2px dashed #d7c4aa;
          border-radius: 16px;
          padding: 18px;
          background: #fffdf8;
        }

        .sc-help {
          color: #c0410c;
          font-size: 13px;
          font-weight: 800;
          margin-top: 10px;
        }

        .sc-progress-wrap {
          margin-top: 14px;
        }

        .sc-progress-text {
          color: #725944;
          font-size: 13px;
          margin-bottom: 6px;
          font-weight: 700;
          text-transform: capitalize;
        }

        .sc-progress {
          width: 100%;
          height: 10px;
          background: #f3eadc;
          border-radius: 999px;
          overflow: hidden;
        }

        .sc-progress-bar {
          height: 100%;
          background: linear-gradient(135deg, #c0410c, #9a3008);
          transition: width .2s ease;
        }

        .sc-doc {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 14px;
          padding: 14px 0;
          border-bottom: 1px solid #eee;
          color: #5a3a20;
        }

        .sc-doc-name {
          color: #1a0f00;
          font-weight: 800;
        }

        .sc-doc-meta {
          color: #725944;
          font-size: 13px;
          text-transform: capitalize;
          margin-top: 4px;
        }

        .sc-doc-actions {
          display: flex;
          gap: 10px;
          align-items: center;
          flex-wrap: wrap;
        }

        .sc-link {
          color: #c0410c;
          font-weight: 800;
          text-decoration: none;
        }

        .sc-replace {
          background: #fff3d8;
          color: #c0410c;
          border-radius: 10px;
          padding: 8px 10px;
          font-weight: 800;
          cursor: pointer;
        }

        .sc-remove {
          border: none;
          background: #fff0eb;
          color: #aa2e0b;
          border-radius: 10px;
          padding: 8px 10px;
          font-weight: 800;
          cursor: pointer;
        }

        .sc-actions {
          display: flex;
          justify-content: flex-end;
        }

        .sc-btn {
          border: none;
          border-radius: 15px;
          padding: 14px 22px;
          background: linear-gradient(135deg, #c0410c, #9a3008);
          color: #fff8ee;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 6px 18px rgba(192,65,12,.25);
        }

        .sc-btn:disabled,
        .sc-remove:disabled {
          opacity: .55;
          cursor: not-allowed;
        }

        @media(max-width: 640px) {
          .sc-doc {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>

      <main className="sc-root">
        <div className="sc-container">
          <BackButton
                      label="Back"
                    />
          <div className="sc-card">
            <div className="sc-eyebrow">Enrollment correction</div>
            <h1 className="sc-title">Update application</h1>
          </div>

          {student.correctionNotes && (
            <div className="sc-warning">
              <strong>Administrator notes:</strong>
              <br />
              {student.correctionNotes}
            </div>
          )}

          {student.reviewNotes && (
            <div className="sc-warning">
              <strong>Previous review:</strong>
              <br />
              {student.reviewNotes}
            </div>
          )}

          {error && <div className="sc-error">⚠ {error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="sc-card">
              <h2 className="sc-card-title">Student information</h2>

              <div className="sc-field">
                <label className="sc-label">First name</label>
                <input
                  className="sc-input"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>

              <div className="sc-field">
                <label className="sc-label">Middle name</label>
                <input
                  className="sc-input"
                  value={middleName}
                  onChange={(e) => setMiddleName(e.target.value)}
                />
              </div>

              <div className="sc-field">
                <label className="sc-label">Last name</label>
                <input
                  className="sc-input"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>

              <div className="sc-field">
                <label className="sc-label">Parent comments</label>
                <textarea
                  className="sc-textarea"
                  value={parentComments}
                  onChange={(e) => setParentComments(e.target.value)}
                  placeholder="Add any explanation about the correction..."
                />
              </div>
            </div>

            <div className="sc-card">
              <h2 className="sc-card-title">Documents</h2>

              <div className="sc-field">
                <label className="sc-label">Document type</label>

                <select
                  className="sc-select"
                  value={documentType}
                  onChange={(e) =>
                    setDocumentType(e.target.value as DocumentType)
                  }
                >
                  <option value="birth_certificate">Birth certificate</option>
                  <option value="vaccination_record">Vaccination record</option>
                  <option value="medical_form">Medical form</option>
                  <option value="previous_school_record">
                    Previous school record
                  </option>
                  <option value="other">Other</option>
                </select>

                {selectedTypeAlreadyUploaded && (
                  <div className="sc-help">
                    This document type already exists. Use Replace on the
                    existing document.
                  </div>
                )}
              </div>

              <div className="sc-upload">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  disabled={uploading || saving || selectedTypeAlreadyUploaded}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];

                    if (!file) return;

                    await addDocument(file, documentType);
                    e.target.value = "";
                  }}
                />
              </div>

              {uploading && (
                <div className="sc-progress-wrap">
                  <div className="sc-progress-text">
                    Uploading {label(uploadingType ?? "")}... {uploadProgress}%
                  </div>

                  <div className="sc-progress">
                    <div
                      className="sc-progress-bar"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {documents.map((doc) => (
                <div key={doc.id} className="sc-doc">
                  <div>
                    <div className="sc-doc-name">{doc.fileName}</div>
                    <div className="sc-doc-meta">
                      {label(doc.type)} · {label(doc.status)}
                    </div>

                    {doc.status === "rejected" && (
                      <div className="sc-doc-meta" style={{ color: "#aa2e0b" }}>
                        This document needs to be replaced.
                      </div>
                    )}
                  </div>

                  <div className="sc-doc-actions">
                    <a
                      href={`/dashboard/documents/view?url=${encodeURIComponent(
                        doc.fileUrl
                      )}&type=${encodeURIComponent(doc.fileType || "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="sc-link"
                    >
                      View
                    </a>

                    <label className="sc-replace">
                      Replace
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                        hidden
                        disabled={saving || uploading}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];

                          if (!file) return;

                          await replaceDocument(doc.id, file);
                          e.target.value = "";
                        }}
                      />
                    </label>

                    <button
                      type="button"
                      className="sc-remove"
                      disabled={saving || uploading}
                      onClick={() => removeDocument(doc.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="sc-actions">
              <button className="sc-btn" disabled={saving || uploading}>
                {saving ? "Submitting..." : "Resubmit application"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}