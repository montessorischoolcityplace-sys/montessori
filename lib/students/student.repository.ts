import { Timestamp } from "firebase-admin/firestore";
import {
  CreateStudentInput,
  Student,
  UpdateStudentInput,
  EnrollmentStatus,
  ParentLink,
} from "./student.type";
import { adminDb } from "../firebase-admin";

const COLLECTION_NAME = "students";

// ─────────────────────────────────────────────
// CREATE
// ─────────────────────────────────────────────

export async function createStudent(
  input: CreateStudentInput
): Promise<Student> {
  const now = Timestamp.now();

  const parentLink: ParentLink = {
    parentId: input.parentId,
    relationshipToStudent: input.relationshipToStudent,
    isPrimaryGuardian: true,
    canPickUp: true,
    receivesNotifications: true,
  };

  const studentData = {
    firstName: input.firstName,
    middleName: input.middleName ?? null,
    lastName: input.lastName,
    dateOfBirth: input.dateOfBirth,
    gender: input.gender,
    primaryLanguage: input.primaryLanguage,
    photoUrl: input.photoUrl ?? null,

    program: input.program,
    desiredStartDate: input.desiredStartDate,
    scheduleType: input.scheduleType,
    attendanceDays: input.attendanceDays,

    medicalInfo: {
      allergies: input.medicalInfo.allergies,
      medicalConditions: input.medicalInfo.medicalConditions,
      currentMedications: input.medicalInfo.currentMedications,
      dietaryRestrictions: input.medicalInfo.dietaryRestrictions,
      specialNeeds: input.medicalInfo.specialNeeds,
      physicianName: input.medicalInfo.physicianName ?? null,
      physicianPhone: input.medicalInfo.physicianPhone ?? null,
    },

    vaccination: {
      status: input.vaccination.status,
      vaccines: input.vaccination.vaccines,
    },

    emergencyContacts: input.emergencyContacts,

    documents: input.documents ?? [],

    previousSchool: input.previousSchool ?? null,
    howDidYouHear: input.howDidYouHear,
    parentComments: input.parentComments ?? null,

    photoPermission: input.photoPermission,
    emergencyMedicalAuthorization: input.emergencyMedicalAuthorization,

    parentIds: [input.parentId],
    parentLinks: [parentLink],

    teacherId: null,

    enrollmentStatus: "draft" as EnrollmentStatus,
    correctionNotes: null,
    correctionRequestedAt: null,
    correctedAt: null,
    resubmittedAt: null,
    submittedAt: null,
    approvedAt: null,
    activeAt: null,
    reviewedAt: null,
    reviewedBy: null,
    reviewNotes: null,
    

    createdAt: now,
    updatedAt: now,
  };

  const docRef = await adminDb.collection(COLLECTION_NAME).add(studentData);

  return mapDocToStudent(docRef.id, studentData);
}

// ─────────────────────────────────────────────
// GET ALL
// ─────────────────────────────────────────────

export async function getStudents(): Promise<Student[]> {
  const snapshot = await adminDb
    .collection(COLLECTION_NAME)
    .orderBy("createdAt", "desc")
    .get();

  return snapshot.docs.map((doc) =>
    mapDocToStudent(doc.id, doc.data())
  );
}

// ─────────────────────────────────────────────
// GET ONE
// ─────────────────────────────────────────────

export async function getStudentById(
  id: string
): Promise<Student | null> {
  const doc = await adminDb.collection(COLLECTION_NAME).doc(id).get();

  if (!doc.exists) return null;

  return mapDocToStudent(doc.id, doc.data()!);
}

// ─────────────────────────────────────────────
// GET BY STATUS
// Se ordena en JS para evitar índice compuesto.
// ─────────────────────────────────────────────

export async function getStudentsByStatus(
  status: EnrollmentStatus
): Promise<Student[]> {
  const snapshot = await adminDb
    .collection(COLLECTION_NAME)
    .where("enrollmentStatus", "==", status)
    .get();

  return snapshot.docs
    .map((doc) => mapDocToStudent(doc.id, doc.data()))
    .sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
}

// ─────────────────────────────────────────────
// GET BY PARENT
// ─────────────────────────────────────────────

export async function getStudentsByParent(
  parentId: string
): Promise<Student[]> {
  const snapshot = await adminDb
    .collection(COLLECTION_NAME)
    .where("parentIds", "array-contains", parentId)
    .get();

  return snapshot.docs
    .map((doc) => mapDocToStudent(doc.id, doc.data()))
    .sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
}

// ─────────────────────────────────────────────
// GET BY TEACHER
// Se ordena en JS para evitar índice compuesto.
// ─────────────────────────────────────────────

export async function getStudentsByTeacher(
  teacherId: string
): Promise<Student[]> {
  const snapshot = await adminDb
    .collection(COLLECTION_NAME)
    .where("teacherId", "==", teacherId)
    .get();

  return snapshot.docs
    .map((doc) => mapDocToStudent(doc.id, doc.data()))
    .sort((a, b) => {
      return a.firstName.localeCompare(b.firstName);
    });
}

// ─────────────────────────────────────────────
// UPDATE
// ─────────────────────────────────────────────

export async function updateStudent(
  id: string,
  input: UpdateStudentInput
): Promise<Student | null> {
  const existingStudent = await getStudentById(id);

  if (!existingStudent) return null;

  const now = Timestamp.now();

  const updates: Record<string, unknown> = {
    updatedAt: now,
  };

  // ─────────────────────────────────────────────
  // ESTATUS DE INSCRIPCIÓN
  // ─────────────────────────────────────────────

  if (input.enrollmentStatus !== undefined) {
    updates.enrollmentStatus = input.enrollmentStatus;

    if (input.enrollmentStatus === "submitted") {
      updates.submittedAt = now;

      if (existingStudent.submittedAt) {
        updates.resubmittedAt = now;
        updates.correctedAt = now;
      }
    }

    if (input.enrollmentStatus === "needs_correction") {
      updates.correctionRequestedAt = now;
    }

    if (input.enrollmentStatus === "approved") {
      updates.reviewedAt = now;
      updates.approvedAt = now;
    }

    if (input.enrollmentStatus === "active") {
      updates.activeAt = now;
    }

    if (input.enrollmentStatus === "rejected") {
      updates.reviewedAt = now;
    }
  }

  // ─────────────────────────────────────────────
  // DATOS PERSONALES DEL ALUMNO
  // ─────────────────────────────────────────────

  if (input.firstName !== undefined) {
    updates.firstName = input.firstName;
  }

  if (input.middleName !== undefined) {
    updates.middleName = input.middleName || null;
  }

  if (input.lastName !== undefined) {
    updates.lastName = input.lastName;
  }

  if (input.dateOfBirth !== undefined) {
    updates.dateOfBirth = input.dateOfBirth;
  }

  if (input.gender !== undefined) {
    updates.gender = input.gender;
  }

  if (input.primaryLanguage !== undefined) {
    updates.primaryLanguage = input.primaryLanguage;
  }

  if (input.photoUrl !== undefined) {
    updates.photoUrl = input.photoUrl || null;
  }

  // ─────────────────────────────────────────────
  // PROGRAMA / HORARIO
  // ─────────────────────────────────────────────

  if (input.program !== undefined) {
    updates.program = input.program;
  }

  if (input.desiredStartDate !== undefined) {
    updates.desiredStartDate = input.desiredStartDate;
  }

  if (input.scheduleType !== undefined) {
    updates.scheduleType = input.scheduleType;
  }

  if (input.attendanceDays !== undefined) {
    updates.attendanceDays = input.attendanceDays;
  }

  // ─────────────────────────────────────────────
  // REVISIÓN ADMIN
  // ─────────────────────────────────────────────

  if (input.reviewNotes !== undefined) {
    updates.reviewNotes = input.reviewNotes;
  }

  if (input.correctionNotes !== undefined) {
    updates.correctionNotes = input.correctionNotes;
  }

  if (input.reviewedBy !== undefined) {
    updates.reviewedBy = input.reviewedBy;
  }

  if (input.teacherId !== undefined) {
    updates.teacherId = input.teacherId || null;
  }

  // ─────────────────────────────────────────────
  // RELACIÓN CON PADRES
  // ─────────────────────────────────────────────

  if (input.parentLinks !== undefined) {
    updates.parentLinks = input.parentLinks;
    updates.parentIds = input.parentLinks.map((link) => link.parentId);
  }

  if (input.parentIds !== undefined) {
    updates.parentIds = input.parentIds;
  }

  // ─────────────────────────────────────────────
  // INFORMACIÓN MÉDICA
  // ─────────────────────────────────────────────

  if (input.medicalInfo) {
    if (input.medicalInfo.allergies !== undefined) {
      updates["medicalInfo.allergies"] = input.medicalInfo.allergies;
    }

    if (input.medicalInfo.medicalConditions !== undefined) {
      updates["medicalInfo.medicalConditions"] =
        input.medicalInfo.medicalConditions;
    }

    if (input.medicalInfo.currentMedications !== undefined) {
      updates["medicalInfo.currentMedications"] =
        input.medicalInfo.currentMedications;
    }

    if (input.medicalInfo.dietaryRestrictions !== undefined) {
      updates["medicalInfo.dietaryRestrictions"] =
        input.medicalInfo.dietaryRestrictions;
    }

    if (input.medicalInfo.specialNeeds !== undefined) {
      updates["medicalInfo.specialNeeds"] = input.medicalInfo.specialNeeds;
    }

    if (input.medicalInfo.physicianName !== undefined) {
      updates["medicalInfo.physicianName"] =
        input.medicalInfo.physicianName || null;
    }

    if (input.medicalInfo.physicianPhone !== undefined) {
      updates["medicalInfo.physicianPhone"] =
        input.medicalInfo.physicianPhone || null;
    }
  }

  // ─────────────────────────────────────────────
  // VACUNACIÓN
  // ─────────────────────────────────────────────

  if (input.vaccination) {
    if (input.vaccination.status !== undefined) {
      updates["vaccination.status"] = input.vaccination.status;
    }

    if (input.vaccination.vaccines !== undefined) {
      updates["vaccination.vaccines"] = input.vaccination.vaccines;
    }
  }

  // ─────────────────────────────────────────────
  // CONTACTOS DE EMERGENCIA
  // ─────────────────────────────────────────────

  if (input.emergencyContacts !== undefined) {
    updates.emergencyContacts = input.emergencyContacts;
  }

  // ─────────────────────────────────────────────
  // DOCUMENTOS
  // ─────────────────────────────────────────────

  if (input.documents !== undefined) {
    updates.documents = input.documents;
  }

  // ─────────────────────────────────────────────
  // COMENTARIOS DEL PADRE
  // ─────────────────────────────────────────────

  if (input.parentComments !== undefined) {
    updates.parentComments = input.parentComments;
  }

  await adminDb.collection(COLLECTION_NAME).doc(id).update(updates);

  return getStudentById(id);
}

export async function getActiveStudents(): Promise<Student[]> {
  const snapshot = await adminDb
    .collection(COLLECTION_NAME)
    .where("enrollmentStatus", "==", "active")
    .get();

  return snapshot.docs
    .map((doc) => mapDocToStudent(doc.id, doc.data()))
    .sort((a, b) => a.firstName.localeCompare(b.firstName));
}

// ─────────────────────────────────────────────
// DELETE
// ─────────────────────────────────────────────

export async function deleteStudent(id: string): Promise<void> {
  await adminDb.collection(COLLECTION_NAME).doc(id).delete();
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function toISO(value: unknown): string {
  if (!value) return "";

  if (typeof value === "object" && "toDate" in (value as object)) {
    return (value as Timestamp).toDate().toISOString();
  }

  return String(value);
}

function mapDocToStudent(
  id: string,
  d: FirebaseFirestore.DocumentData
): Student {
  return {
    id,

    firstName: String(d.firstName ?? ""),
    middleName: d.middleName ?? undefined,
    lastName: String(d.lastName ?? ""),
    dateOfBirth: String(d.dateOfBirth ?? ""),
    gender: d.gender ?? "prefer_not_to_say",
    primaryLanguage: d.primaryLanguage ?? "english",
    photoUrl: d.photoUrl ?? undefined,

    program: d.program ?? "primary",
    desiredStartDate: String(d.desiredStartDate ?? ""),
    scheduleType: d.scheduleType ?? "full_time",
    attendanceDays: Array.isArray(d.attendanceDays)
      ? d.attendanceDays
      : [],

    medicalInfo: {
      allergies: String(d.medicalInfo?.allergies ?? ""),
      medicalConditions: String(d.medicalInfo?.medicalConditions ?? ""),
      currentMedications: String(d.medicalInfo?.currentMedications ?? ""),
      dietaryRestrictions: String(d.medicalInfo?.dietaryRestrictions ?? ""),
      specialNeeds: String(d.medicalInfo?.specialNeeds ?? ""),
      physicianName: d.medicalInfo?.physicianName ?? undefined,
      physicianPhone: d.medicalInfo?.physicianPhone ?? undefined,
    },

    vaccination: {
      status: d.vaccination?.status ?? "incomplete",
      vaccines: Array.isArray(d.vaccination?.vaccines)
        ? d.vaccination.vaccines
        : [],
    },

    emergencyContacts: Array.isArray(d.emergencyContacts)
      ? d.emergencyContacts
      : [],

    documents: Array.isArray(d.documents)
      ? d.documents
      : [],

    previousSchool: d.previousSchool ?? undefined,
    howDidYouHear: d.howDidYouHear ?? "other",
    parentComments: d.parentComments ?? undefined,

    photoPermission: Boolean(d.photoPermission),
    emergencyMedicalAuthorization: Boolean(
      d.emergencyMedicalAuthorization
    ),

    parentIds: Array.isArray(d.parentIds) ? d.parentIds : [],

    parentLinks: Array.isArray(d.parentLinks)
      ? d.parentLinks
      : [],

    teacherId: d.teacherId ?? undefined,

    enrollmentStatus: d.enrollmentStatus ?? "draft",
    correctionNotes: d.correctionNotes ?? undefined,
    correctionRequestedAt: toISO(d.correctionRequestedAt) || undefined,
    correctedAt: toISO(d.correctedAt) || undefined,
    resubmittedAt: toISO(d.resubmittedAt) || undefined,
    submittedAt: toISO(d.submittedAt) || undefined,

    approvedAt: toISO(d.approvedAt) || undefined,
    activeAt: toISO(d.activeAt) || undefined,

    reviewedAt: toISO(d.reviewedAt) || undefined,
    reviewedBy: d.reviewedBy ?? undefined,
    reviewNotes: d.reviewNotes ?? undefined,

    createdAt: toISO(d.createdAt),
    updatedAt: toISO(d.updatedAt),
  };
}


export async function getActiveStudentsByTeacher(
  teacherId: string
): Promise<Student[]> {
  const snapshot = await adminDb
    .collection(COLLECTION_NAME)
    .where("teacherId", "==", teacherId)
    .where("enrollmentStatus", "==", "active")
    .get();

  return snapshot.docs
    .map((doc) => mapDocToStudent(doc.id, doc.data()))
    .sort((a, b) => a.firstName.localeCompare(b.firstName));
}
