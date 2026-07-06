// ─────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────

export type Gender = "male" | "female" | "prefer_not_to_say";

export type PrimaryLanguage = "english" | "spanish" | "other";

export type MontessoriProgram =
  | "infant"
  | "toddler"
  | "primary"
  | "kindergarten";

export type ScheduleType = "full_time" | "part_time";

export type AttendanceDay =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday";

export type EnrollmentStatus =
  | "draft"
  | "submitted"
  | "needs_correction"
  | "approved"
  | "rejected"
  | "active"
  | "inactive";

export type RelationshipToStudent =
  | "mother"
  | "father"
  | "grandmother"
  | "grandfather"
  | "aunt"
  | "uncle"
  | "legal_guardian"
  | "other";

export type EmergencyRelationship =
  | "mother"
  | "father"
  | "grandmother"
  | "grandfather"
  | "aunt"
  | "uncle"
  | "nanny"
  | "family_friend"
  | "other";

export type HowDidYouHear =
  | "google"
  | "facebook"
  | "instagram"
  | "friend_referral"
  | "existing_family"
  | "community_event"
  | "other";

// ─────────────────────────────────────────────
// VACUNAS
// ─────────────────────────────────────────────

export type VaccineCode =
  | "dtap"
  | "polio"
  | "mmr"
  | "varicella"
  | "hepatitis_a"
  | "hepatitis_b"
  | "hib"
  | "pcv"
  | "meningococcal"
  | "tdap"
  | "other";

export const VACCINE_LABELS: Record<VaccineCode, string> = {
  dtap: "DTaP (Diphtheria, Tetanus, Pertussis)",
  polio: "Polio (IPV)",
  mmr: "MMR (Measles, Mumps, Rubella)",
  varicella: "Varicella (Chickenpox)",
  hepatitis_a: "Hepatitis A",
  hepatitis_b: "Hepatitis B",
  hib: "Hib (Haemophilus influenzae type b)",
  pcv: "Pneumococcal (PCV)",
  meningococcal: "Meningococcal",
  tdap: "Tdap Booster",
  other: "Other",
};

export interface VaccineEntry {
  code: VaccineCode;
  label?: string;
  dateAdministered?: string;
}

export type VaccinationStatus =
  | "up_to_date"
  | "incomplete"
  | "medical_exemption"
  | "religious_exemption";

// ─────────────────────────────────────────────
// DOCUMENTOS DEL ALUMNO
// ─────────────────────────────────────────────

export type StudentDocumentType =
  | "birth_certificate"
  | "vaccination_record"
  | "medical_form"
  | "previous_school_record"
  | "other";

export type StudentDocumentStatus =
  | "pending_review"
  | "approved"
  | "rejected";

export interface StudentDocument {
  id: string;
  type: StudentDocumentType;

  fileName: string;
  fileUrl: string;
  fileType: string;

  publicId: string;
  resourceType: "image" | "raw";

  uploadedAt: string;
  uploadedBy?: string;

  status: StudentDocumentStatus;
  reviewNotes?: string;
}

// ─────────────────────────────────────────────
// SUB-TIPOS
// ─────────────────────────────────────────────

export interface ParentLink {
  parentId: string;
  relationshipToStudent: RelationshipToStudent;
  isPrimaryGuardian: boolean;
  canPickUp: boolean;
  receivesNotifications: boolean;
}

export interface EmergencyContact {
  fullName: string;
  relationship: EmergencyRelationship;
  primaryPhone: string;
  alternatePhone?: string;
  authorizedToPickUp: boolean;
}

export interface MedicalInfo {
  allergies: string;
  medicalConditions: string;
  currentMedications: string;
  dietaryRestrictions: string;
  specialNeeds: string;
  physicianName?: string;
  physicianPhone?: string;
}

export interface VaccinationInfo {
  status: VaccinationStatus;
  vaccines: VaccineEntry[];
}

// ─────────────────────────────────────────────
// DOCUMENTO PRINCIPAL — students/{id}
// ─────────────────────────────────────────────

export interface Student {
  id: string;

  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender;
  primaryLanguage: PrimaryLanguage;
  photoUrl?: string;

  program: MontessoriProgram;
  desiredStartDate: string;
  scheduleType: ScheduleType;
  attendanceDays: AttendanceDay[];

  medicalInfo: MedicalInfo;
  vaccination: VaccinationInfo;

  emergencyContacts: EmergencyContact[];
  documents: StudentDocument[];

  previousSchool?: string;
  howDidYouHear: HowDidYouHear;
  parentComments?: string;

  photoPermission: boolean;
  emergencyMedicalAuthorization: boolean;

  parentIds: string[];
  parentLinks: ParentLink[];

  teacherId?: string;

  enrollmentStatus: EnrollmentStatus;

  // Fechas del flujo
  submittedAt?: string;
  approvedAt?: string;
  activeAt?: string;

  correctionNotes?: string;
  correctionRequestedAt?: string;
  correctedAt?: string;
  resubmittedAt?: string;

  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;

  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────────────────────
// INPUT — creación
// ─────────────────────────────────────────────

export interface CreateStudentInput {
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender;
  primaryLanguage: PrimaryLanguage;
  photoUrl?: string;

  program: MontessoriProgram;
  desiredStartDate: string;
  scheduleType: ScheduleType;
  attendanceDays: AttendanceDay[];

  medicalInfo: MedicalInfo;
  vaccination: VaccinationInfo;

  emergencyContacts: EmergencyContact[];
  documents?: StudentDocument[];

  previousSchool?: string;
  howDidYouHear: HowDidYouHear;
  parentComments?: string;

  photoPermission: boolean;
  emergencyMedicalAuthorization: boolean;

  parentId: string;
  relationshipToStudent: RelationshipToStudent;
}

// ─────────────────────────────────────────────
// INPUT — actualización
// ─────────────────────────────────────────────

export interface UpdateStudentInput {
  enrollmentStatus?: EnrollmentStatus;

  reviewNotes?: string;
  correctionNotes?: string;

  reviewedBy?: string;
  teacherId?: string;

  firstName?: string;
  middleName?: string;
  lastName?: string;

  dateOfBirth?: string;
  gender?: Gender;
  primaryLanguage?: PrimaryLanguage;
  photoUrl?: string;

  program?: MontessoriProgram;
  desiredStartDate?: string;
  scheduleType?: ScheduleType;
  attendanceDays?: AttendanceDay[];

  medicalInfo?: Partial<MedicalInfo>;
  vaccination?: Partial<VaccinationInfo>;

  emergencyContacts?: EmergencyContact[];
  documents?: StudentDocument[];

  parentLinks?: ParentLink[];
  parentIds?: string[];

  previousSchool?: string;
  howDidYouHear?: HowDidYouHear;
  parentComments?: string;

  photoPermission?: boolean;
  emergencyMedicalAuthorization?: boolean;
}