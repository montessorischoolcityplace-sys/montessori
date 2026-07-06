"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PublicHeader from "@/components/layout/header";
import { auth } from "@/lib/firebase-client";
import BackButton from "@/components/navegation/back-button";

type RelationshipToStudent =
  | "mother"
  | "father"
  | "grandmother"
  | "grandfather"
  | "aunt"
  | "uncle"
  | "legal_guardian"
  | "other";

type StudentDocumentType =
  | "birth_certificate"
  | "vaccination_record"
  | "medical_form"
  | "previous_school_record"
  | "other";

type StudentDocument = {
  id: string;
  type: StudentDocumentType;
  fileName: string;
  fileUrl: string;
  fileType: string;
  publicId: string;
  resourceType: "image" | "raw";
  uploadedAt: string;
  status: "pending_review" | "approved" | "rejected";
};

const WEEKDAYS = ["monday", "tuesday", "wednesday", "thursday", "friday"];

export default function NewStudentPage() {
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");

  const [gender, setGender] = useState("prefer_not_to_say");
  const [primaryLanguage, setPrimaryLanguage] = useState("english");

  const [program, setProgram] = useState("primary");
  const [desiredStartDate, setDesiredStartDate] = useState("");
  const [scheduleType, setScheduleType] = useState("full_time");
  const [attendanceDays, setAttendanceDays] = useState<string[]>(WEEKDAYS);

  const [relationshipToStudent, setRelationshipToStudent] =
    useState<RelationshipToStudent>("legal_guardian");

  const [allergies, setAllergies] = useState("");
  const [medicalConditions, setMedicalConditions] = useState("");
  const [currentMedications, setCurrentMedications] = useState("");
  const [dietaryRestrictions, setDietaryRestrictions] = useState("");
  const [specialNeeds, setSpecialNeeds] = useState("");
  const [physicianName, setPhysicianName] = useState("");
  const [physicianPhone, setPhysicianPhone] = useState("");

  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [emergencyRelationship, setEmergencyRelationship] = useState("mother");

  const [documentType, setDocumentType] =
    useState<StudentDocumentType>("birth_certificate");
  const [documents, setDocuments] = useState<StudentDocument[]>([]);

  const [photoPermission, setPhotoPermission] = useState(false);
  const [emergencyMedicalAuthorization, setEmergencyMedicalAuthorization] =
    useState(true);

  const [parentComments, setParentComments] = useState("");

  function toggleDay(day: string) {
    setAttendanceDays((prev) =>
      prev.includes(day)
        ? prev.filter((d) => d !== day)
        : [...prev, day]
    );
  }

  function documentViewerHref(doc: StudentDocument) {
    return `/dashboard/documents/view?url=${encodeURIComponent(
      doc.fileUrl
    )}&type=${encodeURIComponent(doc.fileType || "")}`;
  }

  async function handleDocumentUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "montessori/student-documents");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.ok) {
        throw new Error(data?.message ?? "Could not upload document.");
      }

      const newDocument: StudentDocument = {
        id: crypto.randomUUID(),
        type: documentType,
        fileName: file.name,
        fileUrl: data.url,
        fileType: data.fileType ?? file.type,
        publicId: data.publicId,
        resourceType:
          data.resourceType === "image" || data.resourceType === "raw"
            ? data.resourceType
            : file.type.startsWith("image/")
            ? "image"
            : "raw",
        uploadedAt: new Date().toISOString(),
        status: "pending_review",
      };

      setDocuments((prev) => [...prev, newDocument]);
      e.target.value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not upload file.");
    } finally {
      setUploading(false);
    }
  }

  function removeDocument(id: string) {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        throw new Error("No authenticated user found.");
      }

      const payload = {
        firstName,
        middleName: middleName || undefined,
        lastName,
        dateOfBirth,
        gender,
        primaryLanguage,

        program,
        desiredStartDate,
        scheduleType,
        attendanceDays,

        medicalInfo: {
          allergies,
          medicalConditions,
          currentMedications,
          dietaryRestrictions,
          specialNeeds,
          physicianName: physicianName || undefined,
          physicianPhone: physicianPhone || undefined,
        },

        vaccination: {
          status: "incomplete",
          vaccines: [],
        },

        emergencyContacts: [
          {
            fullName: emergencyName,
            relationship: emergencyRelationship,
            primaryPhone: emergencyPhone,
            authorizedToPickUp: true,
          },
        ],

        documents,

        previousSchool: undefined,
        howDidYouHear: "other",
        parentComments: parentComments || undefined,

        photoPermission,
        emergencyMedicalAuthorization,

        parentId: currentUser.uid,
        relationshipToStudent,
      };

      const res = await fetch("/api/students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error ?? "Could not create student.");
      }

      await fetch(`/api/students?id=${data.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          enrollmentStatus: "submitted",
        }),
      });

      router.push("/dashboard/students");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PublicHeader />

      <style>{`
        .ns-root {
          min-height: calc(100vh - 4rem);
          padding: 42px 20px 90px;
          background:
            radial-gradient(circle at top left, rgba(245,195,106,.22), transparent 32%),
            linear-gradient(135deg, #fffaf0, #f7efe2);
          font-family: Outfit, sans-serif;
        }

        .ns-container {
          max-width: 940px;
          margin: 0 auto;
        }

        .ns-hero {
          background: rgba(255,255,255,.78);
          border: 1px solid rgba(210,180,140,.5);
          border-radius: 28px;
          padding: 30px;
          margin-bottom: 24px;
          box-shadow: 0 10px 30px rgba(80,45,10,.08);
        }

        .ns-eyebrow {
          color: #c0410c;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: .16em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .ns-title {
          font-family: "Cormorant Garamond", serif;
          font-size: 44px;
          color: #1a0f00;
          margin: 0 0 8px;
        }

        .ns-subtitle {
          color: #725944;
          line-height: 1.6;
        }

        .ns-card {
          background: rgba(255,255,255,.92);
          border: 1px solid rgba(210,180,140,.55);
          border-radius: 24px;
          padding: 24px;
          margin-bottom: 20px;
          box-shadow: 0 8px 24px rgba(80,45,10,.06);
        }

        .ns-card-title {
          font-family: "Cormorant Garamond", serif;
          font-size: 25px;
          color: #1a0f00;
          margin-bottom: 18px;
        }

        .ns-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        @media(max-width: 720px) {
          .ns-grid-2 {
            grid-template-columns: 1fr;
          }

          .ns-title {
            font-size: 36px;
          }
        }

        .ns-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 14px;
        }

        .ns-label {
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: .06em;
          color: #5a3a20;
        }

        .ns-input,
        .ns-select,
        .ns-textarea {
          border: 1.5px solid #d7c4aa;
          border-radius: 13px;
          padding: 12px 14px;
          background: #fffdf8;
          font-size: 15px;
          outline: none;
          color: #5a3a20;
          font-family: Outfit, sans-serif;
        }

        .ns-textarea {
          min-height: 92px;
          resize: vertical;
        }

        .ns-input:focus,
        .ns-select:focus,
        .ns-textarea:focus {
          border-color: #c0410c;
          box-shadow: 0 0 0 3px rgba(192,65,12,.12);
          color: #c0410c;
        }

        .ns-days {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .ns-day {
          border: 1px solid #d7c4aa;
          border-radius: 999px;
          background: #fffdf8;
          color: #5a3a20;
          padding: 8px 12px;
          font-weight: 700;
          cursor: pointer;
          text-transform: capitalize;
        }

        .ns-day.active {
          background: #fff3d8;
          border-color: #c0410c;
          color: #c0410c;
        }

        .ns-doc-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 14px;
        }

        .ns-doc {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: center;
          border: 1px solid #d7c4aa;
          background: #fffdf8;
          border-radius: 14px;
          padding: 12px 14px;
          color: #5a3a20;
        }

        .ns-doc a {
          color: #c0410c;
          font-weight: 700;
          text-decoration: none;
        }

        .ns-doc button {
          border: none;
          background: transparent;
          color: #aa2e0b;
          cursor: pointer;
          font-weight: 700;
        }

        .ns-check {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #5a3a20;
          font-size: 14px;
          margin-bottom: 10px;
        }

        .ns-error {
          background: #fff0eb;
          color: #aa2e0b;
          border: 1px solid #f1a38d;
          border-radius: 14px;
          padding: 13px 16px;
          margin-bottom: 18px;
        }

        .ns-actions {
          display: flex;
          justify-content: flex-end;
        }

        .ns-btn {
          border: none;
          border-radius: 15px;
          padding: 13px 24px;
          background: linear-gradient(135deg, #c0410c, #9a3008);
          color: #fff8ee;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 6px 18px rgba(192,65,12,.25);
        }

        .ns-btn:disabled {
          opacity: .55;
          cursor: not-allowed;
        }
      `}</style>

      <main className="ns-root">
        <div className="ns-container">
          <BackButton
                                    label="Back to Students"
                                  />
          <section className="ns-hero">
            <div className="ns-eyebrow">Student application</div>
            <h1 className="ns-title">Register a student</h1>
            <p className="ns-subtitle">
              Complete the application and upload the requested documents. The
              school will review the information before approving enrollment.
            </p>
          </section>

          {error && <div className="ns-error">⚠ {error}</div>}

          <form onSubmit={handleSubmit}>
            <section className="ns-card">
              <h2 className="ns-card-title">Student information</h2>

              <div className="ns-grid-2">
                <div className="ns-field">
                  <label className="ns-label">First name *</label>
                  <input
                    className="ns-input"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>

                <div className="ns-field">
                  <label className="ns-label">Middle name</label>
                  <input
                    className="ns-input"
                    value={middleName}
                    onChange={(e) => setMiddleName(e.target.value)}
                  />
                </div>
              </div>

              <div className="ns-grid-2">
                <div className="ns-field">
                  <label className="ns-label">Last name *</label>
                  <input
                    className="ns-input"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>

                <div className="ns-field">
                  <label className="ns-label">Date of birth *</label>
                  <input
                    className="ns-input"
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="ns-grid-2">
                <div className="ns-field">
                  <label className="ns-label">Gender</label>
                  <select
                    className="ns-select"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                  >
                    <option value="prefer_not_to_say">Prefer not to say</option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                  </select>
                </div>

                <div className="ns-field">
                  <label className="ns-label">Primary language</label>
                  <select
                    className="ns-select"
                    value={primaryLanguage}
                    onChange={(e) => setPrimaryLanguage(e.target.value)}
                  >
                    <option value="english">English</option>
                    <option value="spanish">Spanish</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </section>

            <section className="ns-card">
              <h2 className="ns-card-title">Enrollment</h2>

              <div className="ns-grid-2">
                <div className="ns-field">
                  <label className="ns-label">Program</label>
                  <select
                    className="ns-select"
                    value={program}
                    onChange={(e) => setProgram(e.target.value)}
                  >
                    <option value="infant">Infant</option>
                    <option value="toddler">Toddler</option>
                    <option value="primary">Primary</option>
                    <option value="kindergarten">Kindergarten</option>
                  </select>
                </div>

                <div className="ns-field">
                  <label className="ns-label">Desired start date *</label>
                  <input
                    className="ns-input"
                    type="date"
                    value={desiredStartDate}
                    onChange={(e) => setDesiredStartDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="ns-grid-2">
                <div className="ns-field">
                  <label className="ns-label">Schedule</label>
                  <select
                    className="ns-select"
                    value={scheduleType}
                    onChange={(e) => setScheduleType(e.target.value)}
                  >
                    <option value="full_time">Full time</option>
                    <option value="part_time">Part time</option>
                  </select>
                </div>

                <div className="ns-field">
                  <label className="ns-label">Your relationship</label>
                  <select
                    className="ns-select"
                    value={relationshipToStudent}
                    onChange={(e) =>
                      setRelationshipToStudent(
                        e.target.value as RelationshipToStudent
                      )
                    }
                  >
                    <option value="mother">Mother</option>
                    <option value="father">Father</option>
                    <option value="grandmother">Grandmother</option>
                    <option value="grandfather">Grandfather</option>
                    <option value="aunt">Aunt</option>
                    <option value="uncle">Uncle</option>
                    <option value="legal_guardian">Legal guardian</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="ns-field">
                <label className="ns-label">Attendance days</label>
                <div className="ns-days">
                  {WEEKDAYS.map((day) => (
                    <button
                      key={day}
                      type="button"
                      className={`ns-day ${
                        attendanceDays.includes(day) ? "active" : ""
                      }`}
                      onClick={() => toggleDay(day)}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <section className="ns-card">
              <h2 className="ns-card-title">Medical information</h2>

              <div className="ns-grid-2">
                <div className="ns-field">
                  <label className="ns-label">Allergies</label>
                  <input
                    className="ns-input"
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                    placeholder="None, peanuts, pollen..."
                  />
                </div>

                <div className="ns-field">
                  <label className="ns-label">Medical conditions</label>
                  <input
                    className="ns-input"
                    value={medicalConditions}
                    onChange={(e) => setMedicalConditions(e.target.value)}
                  />
                </div>
              </div>

              <div className="ns-grid-2">
                <div className="ns-field">
                  <label className="ns-label">Current medications</label>
                  <input
                    className="ns-input"
                    value={currentMedications}
                    onChange={(e) => setCurrentMedications(e.target.value)}
                  />
                </div>

                <div className="ns-field">
                  <label className="ns-label">Dietary restrictions</label>
                  <input
                    className="ns-input"
                    value={dietaryRestrictions}
                    onChange={(e) => setDietaryRestrictions(e.target.value)}
                  />
                </div>
              </div>

              <div className="ns-field">
                <label className="ns-label">Special needs</label>
                <textarea
                  className="ns-textarea"
                  value={specialNeeds}
                  onChange={(e) => setSpecialNeeds(e.target.value)}
                />
              </div>

              <div className="ns-grid-2">
                <div className="ns-field">
                  <label className="ns-label">Physician name</label>
                  <input
                    className="ns-input"
                    value={physicianName}
                    onChange={(e) => setPhysicianName(e.target.value)}
                  />
                </div>

                <div className="ns-field">
                  <label className="ns-label">Physician phone</label>
                  <input
                    className="ns-input"
                    value={physicianPhone}
                    onChange={(e) => setPhysicianPhone(e.target.value)}
                  />
                </div>
              </div>
            </section>

            <section className="ns-card">
              <h2 className="ns-card-title">Emergency contact</h2>

              <div className="ns-grid-2">
                <div className="ns-field">
                  <label className="ns-label">Full name *</label>
                  <input
                    className="ns-input"
                    value={emergencyName}
                    onChange={(e) => setEmergencyName(e.target.value)}
                    required
                  />
                </div>

                <div className="ns-field">
                  <label className="ns-label">Phone *</label>
                  <input
                    className="ns-input"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="ns-field">
                <label className="ns-label">Relationship</label>
                <select
                  className="ns-select"
                  value={emergencyRelationship}
                  onChange={(e) => setEmergencyRelationship(e.target.value)}
                >
                  <option value="mother">Mother</option>
                  <option value="father">Father</option>
                  <option value="grandmother">Grandmother</option>
                  <option value="grandfather">Grandfather</option>
                  <option value="aunt">Aunt</option>
                  <option value="uncle">Uncle</option>
                  <option value="nanny">Nanny</option>
                  <option value="family_friend">Family friend</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </section>

            <section className="ns-card">
              <h2 className="ns-card-title">Documents</h2>

              <div className="ns-grid-2">
                <div className="ns-field">
                  <label className="ns-label">Document type</label>
                  <select
                    className="ns-select"
                    value={documentType}
                    onChange={(e) =>
                      setDocumentType(e.target.value as StudentDocumentType)
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
                </div>

                <div className="ns-field">
                  <label className="ns-label">Upload PDF or image</label>
                  <input
                    className="ns-input"
                    type="file"
                    accept="application/pdf,image/*"
                    onChange={handleDocumentUpload}
                    disabled={uploading}
                  />
                </div>
              </div>

              {documents.length > 0 && (
                <div className="ns-doc-list">
                  {documents.map((doc) => (
                    <div key={doc.id} className="ns-doc">
                      <div>
                        <strong>{doc.fileName}</strong>
                        <br />
                        <span>{doc.type.replaceAll("_", " ")}</span>
                      </div>

                      <div style={{ display: "flex", gap: 12 }}>
                        <a href={documentViewerHref(doc)} target="_blank" rel="noreferrer">
                          View
                        </a>
                        <button
                          type="button"
                          onClick={() => removeDocument(doc.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="ns-card">
              <h2 className="ns-card-title">Permissions</h2>

              <label className="ns-check">
                <input
                  type="checkbox"
                  checked={photoPermission}
                  onChange={(e) => setPhotoPermission(e.target.checked)}
                />
                I authorize the school to use my child's photo for school
                activities and internal communication.
              </label>

              <label className="ns-check">
                <input
                  type="checkbox"
                  checked={emergencyMedicalAuthorization}
                  onChange={(e) =>
                    setEmergencyMedicalAuthorization(e.target.checked)
                  }
                />
                I authorize emergency medical attention if needed.
              </label>

              <div className="ns-field">
                <label className="ns-label">Comments</label>
                <textarea
                  className="ns-textarea"
                  value={parentComments}
                  onChange={(e) => setParentComments(e.target.value)}
                />
              </div>
            </section>

            <div className="ns-actions">
              <button className="ns-btn" disabled={saving || uploading}>
                {saving ? "Submitting..." : "Submit application"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}