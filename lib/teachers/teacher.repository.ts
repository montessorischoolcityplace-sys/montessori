import { Timestamp, FieldValue } from "firebase-admin/firestore";
import { adminDb } from "../firebase-admin";
import {
  CreateTeacherInput,
  UpdateTeacherInput,
  Teacher,
  TeacherProgram,
  TeacherStatus,
  TeacherContractType,
} from "./teacher.type";

const COLLECTION_NAME = "teachers";

// ─────────────────────────────────────────────
// CREATE
// ─────────────────────────────────────────────

export async function createTeacher(
  input: CreateTeacherInput
): Promise<Teacher> {
  const now = Timestamp.now();

  const teacherData = {
    uid: input.uid,
    userId: input.userId,

    email: input.email,
    firstName: input.firstName,
    lastName: input.lastName,
    photoUrl: input.photoUrl ?? null,

    employeeNumber: input.employeeNumber ?? null,
    classroom: input.classroom,
    program: input.program,
    hireDate: input.hireDate,
    contractType: input.contractType,

    contact: {
      phone: input.contact.phone,
      alternatePhone: input.contact.alternatePhone ?? null,
      emergencyContactName: input.contact.emergencyContactName ?? null,
      emergencyContactPhone: input.contact.emergencyContactPhone ?? null,
    },

    address: input.address
      ? {
          street: input.address.street ?? null,
          city: input.address.city ?? null,
          state: input.address.state ?? null,
          zipCode: input.address.zipCode ?? null,
          country: input.address.country ?? null,
        }
      : null,

    qualifications: input.qualifications ?? [],
    schedule: input.schedule ?? [],

    studentIds: input.studentIds ?? [],
    groupIds: input.groupIds ?? [],

    status: "active" as TeacherStatus,

    createdAt: now,
    updatedAt: now,
  };

  await adminDb.collection(COLLECTION_NAME).doc(input.uid).set(teacherData);

  return mapDocToTeacher(input.uid, teacherData);
}

// ─────────────────────────────────────────────
// GET ONE — por UID
// ─────────────────────────────────────────────

export async function getTeacherByUid(
  uid: string
): Promise<Teacher | null> {
  const doc = await adminDb.collection(COLLECTION_NAME).doc(uid).get();

  if (!doc.exists) return null;

  return mapDocToTeacher(doc.id, doc.data()!);
}

// ─────────────────────────────────────────────
// GET ALL
// ─────────────────────────────────────────────

export async function getTeachers(): Promise<Teacher[]> {
  const snapshot = await adminDb
    .collection(COLLECTION_NAME)
    .orderBy("createdAt", "desc")
    .get();

  return snapshot.docs.map((doc) =>
    mapDocToTeacher(doc.id, doc.data())
  );
}

// ─────────────────────────────────────────────
// GET BY PROGRAM
// ─────────────────────────────────────────────

export async function getTeachersByProgram(
  program: TeacherProgram
): Promise<Teacher[]> {
  const snapshot = await adminDb
    .collection(COLLECTION_NAME)
    .where("program", "==", program)
    .orderBy("createdAt", "desc")
    .get();

  return snapshot.docs.map((doc) =>
    mapDocToTeacher(doc.id, doc.data())
  );
}

// ─────────────────────────────────────────────
// GET BY STATUS
// ─────────────────────────────────────────────

export async function getTeachersByStatus(
  status: TeacherStatus
): Promise<Teacher[]> {
  const snapshot = await adminDb
    .collection(COLLECTION_NAME)
    .where("status", "==", status)
    .orderBy("createdAt", "desc")
    .get();

  return snapshot.docs.map((doc) =>
    mapDocToTeacher(doc.id, doc.data())
  );
}

// ─────────────────────────────────────────────
// UPDATE
// ─────────────────────────────────────────────

export async function updateTeacher(
  uid: string,
  input: UpdateTeacherInput
): Promise<Teacher | null> {
  const updates: Record<string, unknown> = {
    updatedAt: Timestamp.now(),
  };

  if (input.email !== undefined) updates.email = input.email;
  if (input.firstName !== undefined) updates.firstName = input.firstName;
  if (input.lastName !== undefined) updates.lastName = input.lastName;
  if (input.photoUrl !== undefined) updates.photoUrl = input.photoUrl;

  if (input.employeeNumber !== undefined) {
    updates.employeeNumber = input.employeeNumber;
  }

  if (input.classroom !== undefined) updates.classroom = input.classroom;
  if (input.program !== undefined) updates.program = input.program;
  if (input.hireDate !== undefined) updates.hireDate = input.hireDate;
  if (input.contractType !== undefined) {
    updates.contractType = input.contractType;
  }

  if (input.status !== undefined) updates.status = input.status;

  // Contacto con dot notation
  if (input.contact) {
    if (input.contact.phone !== undefined) {
      updates["contact.phone"] = input.contact.phone;
    }

    if (input.contact.alternatePhone !== undefined) {
      updates["contact.alternatePhone"] = input.contact.alternatePhone;
    }

    if (input.contact.emergencyContactName !== undefined) {
      updates["contact.emergencyContactName"] =
        input.contact.emergencyContactName;
    }

    if (input.contact.emergencyContactPhone !== undefined) {
      updates["contact.emergencyContactPhone"] =
        input.contact.emergencyContactPhone;
    }
  }

  // Dirección con dot notation
  if (input.address) {
    if (input.address.street !== undefined) {
      updates["address.street"] = input.address.street;
    }

    if (input.address.city !== undefined) {
      updates["address.city"] = input.address.city;
    }

    if (input.address.state !== undefined) {
      updates["address.state"] = input.address.state;
    }

    if (input.address.zipCode !== undefined) {
      updates["address.zipCode"] = input.address.zipCode;
    }

    if (input.address.country !== undefined) {
      updates["address.country"] = input.address.country;
    }
  }

  if (input.qualifications !== undefined) {
    updates.qualifications = input.qualifications;
  }

  if (input.schedule !== undefined) {
    updates.schedule = input.schedule;
  }

  if (input.studentIds !== undefined) {
    updates.studentIds = input.studentIds;
  }

  if (input.groupIds !== undefined) {
    updates.groupIds = input.groupIds;
  }

  await adminDb.collection(COLLECTION_NAME).doc(uid).update(updates);

  return getTeacherByUid(uid);
}

// ─────────────────────────────────────────────
// DELETE LÓGICO
// ─────────────────────────────────────────────

export async function deactivateTeacher(uid: string): Promise<void> {
  await adminDb.collection(COLLECTION_NAME).doc(uid).update({
    status: "inactive",
    updatedAt: Timestamp.now(),
  });
}

// ─────────────────────────────────────────────
// DELETE FÍSICO
// ─────────────────────────────────────────────

export async function deleteTeacher(uid: string): Promise<void> {
  await adminDb.collection(COLLECTION_NAME).doc(uid).delete();
}

// ─────────────────────────────────────────────
// ASSIGN STUDENT
// ─────────────────────────────────────────────

export async function assignStudentToTeacher(
  teacherUid: string,
  studentId: string
): Promise<void> {
  await adminDb.collection(COLLECTION_NAME).doc(teacherUid).update({
    studentIds: FieldValue.arrayUnion(studentId),
    updatedAt: Timestamp.now(),
  });
}

// ─────────────────────────────────────────────
// REMOVE STUDENT
// ─────────────────────────────────────────────

export async function removeStudentFromTeacher(
  teacherUid: string,
  studentId: string
): Promise<void> {
  await adminDb.collection(COLLECTION_NAME).doc(teacherUid).update({
    studentIds: FieldValue.arrayRemove(studentId),
    updatedAt: Timestamp.now(),
  });
}

// ─────────────────────────────────────────────
// ASSIGN GROUP
// ─────────────────────────────────────────────

export async function assignGroupToTeacher(
  teacherUid: string,
  groupId: string
): Promise<void> {
  await adminDb.collection(COLLECTION_NAME).doc(teacherUid).update({
    groupIds: FieldValue.arrayUnion(groupId),
    updatedAt: Timestamp.now(),
  });
}

// ─────────────────────────────────────────────
// REMOVE GROUP
// ─────────────────────────────────────────────

export async function removeGroupFromTeacher(
  teacherUid: string,
  groupId: string
): Promise<void> {
  await adminDb.collection(COLLECTION_NAME).doc(teacherUid).update({
    groupIds: FieldValue.arrayRemove(groupId),
    updatedAt: Timestamp.now(),
  });
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

function mapDocToTeacher(
  id: string,
  d: FirebaseFirestore.DocumentData
): Teacher {
  return {
    id,

    uid: String(d.uid ?? id),
    userId: String(d.userId ?? d.uid ?? id),

    email: String(d.email ?? ""),
    firstName: String(d.firstName ?? ""),
    lastName: String(d.lastName ?? ""),
    photoUrl: d.photoUrl ?? undefined,

    employeeNumber: d.employeeNumber ?? undefined,
    classroom: String(d.classroom ?? ""),
    program: (d.program ?? "primary") as TeacherProgram,
    hireDate: String(d.hireDate ?? ""),
    contractType: (d.contractType ?? "full_time") as TeacherContractType,

    contact: {
      phone: String(d.contact?.phone ?? ""),
      alternatePhone: d.contact?.alternatePhone ?? undefined,
      emergencyContactName: d.contact?.emergencyContactName ?? undefined,
      emergencyContactPhone: d.contact?.emergencyContactPhone ?? undefined,
    },

    address: d.address
      ? {
          street: d.address.street ?? undefined,
          city: d.address.city ?? undefined,
          state: d.address.state ?? undefined,
          zipCode: d.address.zipCode ?? undefined,
          country: d.address.country ?? undefined,
        }
      : undefined,

    qualifications: Array.isArray(d.qualifications)
      ? d.qualifications
      : [],

    schedule: Array.isArray(d.schedule)
      ? d.schedule
      : [],

    studentIds: Array.isArray(d.studentIds)
      ? d.studentIds
      : [],

    groupIds: Array.isArray(d.groupIds)
      ? d.groupIds
      : [],

    status: (d.status ?? "active") as TeacherStatus,

    createdAt: toISO(d.createdAt),
    updatedAt: toISO(d.updatedAt),
  };
}