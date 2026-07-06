import { Timestamp, FieldValue } from "firebase-admin/firestore";
import {
  CreateUserInput,
  UpdateUserInput,
  User,
  UserRole,
} from "./user.type";
import { adminDb } from "../firebase-admin";

const COLLECTION_NAME = "users";

// ─────────────────────────────────────────────
//  CREATE — se llama justo después del registro
//  en Firebase Auth. El documento usa el UID
//  como ID para lectura O(1) sin índices extra.
// ─────────────────────────────────────────────

export async function createUser(input: CreateUserInput): Promise<User> {
  const now = Timestamp.now();

  const userData = {
    uid:       input.uid,
    email:     input.email,
    firstName: input.firstName,
    lastName:  input.lastName,
    photoUrl:  input.photoUrl ?? null,

    role: input.role,

    contact: {
      phone:          input.contact.phone,
      alternatePhone: input.contact.alternatePhone ?? null,
    },

    preferredLanguage: input.preferredLanguage,

    // Permisos por defecto según el rol
    permissions: input.role === "admin" ? defaultAdminPermissions() : null,

    teacherInfo: input.role === "teacher"
      ? {
          classroom:  input.teacherInfo?.classroom  ?? "",
          program:    input.teacherInfo?.program    ?? "primary",
          hireDate:   input.teacherInfo?.hireDate   ?? now.toDate().toISOString().slice(0, 10),
          studentIds: input.teacherInfo?.studentIds ?? [],
        }
      : null,

    parentInfo: input.role === "parent"
      ? {
          studentIds:            input.parentInfo?.studentIds ?? [],
          relationshipToStudent: input.parentInfo?.relationshipToStudent ?? "legal_guardian",
        }
      : null,

    accountStatus: "pending_verification" as const,
    createdAt: now,
    updatedAt: now,
    lastLoginAt: null,
  };

  // Usamos el UID como ID del documento
  await adminDb.collection(COLLECTION_NAME).doc(input.uid).set(userData);

  return mapDocToUser(input.uid, userData);
}

// ─────────────────────────────────────────────
//  GET ONE — por UID (lectura directa por ID)
// ─────────────────────────────────────────────

export async function getUserByUid(uid: string): Promise<User | null> {
  const doc = await adminDb.collection(COLLECTION_NAME).doc(uid).get();
  if (!doc.exists) return null;
  return mapDocToUser(doc.id, doc.data()!);
}

// ─────────────────────────────────────────────
//  GET ALL — solo administradores
// ─────────────────────────────────────────────

export async function getUsers(): Promise<User[]> {
  const snapshot = await adminDb
    .collection(COLLECTION_NAME)
    .orderBy("createdAt", "desc")
    .get();

  return snapshot.docs.map((doc) => mapDocToUser(doc.id, doc.data()));
}

// ─────────────────────────────────────────────
//  GET BY ROLE — ej. listar todos los docentes
//  o todos los padres
// ─────────────────────────────────────────────

export async function getUsersByRole(role: UserRole): Promise<User[]> {
  const snapshot = await adminDb
    .collection(COLLECTION_NAME)
    .where("role", "==", role)
    .orderBy("createdAt", "desc")
    .get();

  return snapshot.docs.map((doc) => mapDocToUser(doc.id, doc.data()));
}

// ─────────────────────────────────────────────
//  UPDATE — actualización parcial de perfil
// ─────────────────────────────────────────────

export async function updateUser(
  uid: string,
  input: UpdateUserInput
): Promise<User | null> {
  const now = Timestamp.now();
  const updates: Record<string, unknown> = { updatedAt: now };

  if (input.firstName !== undefined) updates.firstName = input.firstName;
  if (input.lastName  !== undefined) updates.lastName  = input.lastName;
  if (input.photoUrl  !== undefined) updates.photoUrl  = input.photoUrl;
  if (input.preferredLanguage !== undefined) updates.preferredLanguage = input.preferredLanguage;

  // Solo admin
  if (input.role          !== undefined) updates.role          = input.role;
  if (input.accountStatus !== undefined) updates.accountStatus = input.accountStatus;

  // Contacto — dot-notation para no pisar el objeto completo
  if (input.contact) {
    if (input.contact.phone          !== undefined) updates["contact.phone"]          = input.contact.phone;
    if (input.contact.alternatePhone !== undefined) updates["contact.alternatePhone"] = input.contact.alternatePhone;
  }

  // Permisos de admin
  if (input.permissions) {
    if (input.permissions.canManageUsers       !== undefined) updates["permissions.canManageUsers"]       = input.permissions.canManageUsers;
    if (input.permissions.canManagePayments    !== undefined) updates["permissions.canManagePayments"]    = input.permissions.canManagePayments;
    if (input.permissions.canManageEnrollments !== undefined) updates["permissions.canManageEnrollments"] = input.permissions.canManageEnrollments;
    if (input.permissions.canManageContent     !== undefined) updates["permissions.canManageContent"]     = input.permissions.canManageContent;
  }

  // Info de docente
  if (input.teacherInfo) {
    if (input.teacherInfo.classroom  !== undefined) updates["teacherInfo.classroom"]  = input.teacherInfo.classroom;
    if (input.teacherInfo.program    !== undefined) updates["teacherInfo.program"]    = input.teacherInfo.program;
    if (input.teacherInfo.hireDate   !== undefined) updates["teacherInfo.hireDate"]   = input.teacherInfo.hireDate;
    if (input.teacherInfo.studentIds !== undefined) updates["teacherInfo.studentIds"] = input.teacherInfo.studentIds;
  }

  // Info de padre
  if (input.parentInfo) {
    if (input.parentInfo.studentIds            !== undefined) updates["parentInfo.studentIds"]            = input.parentInfo.studentIds;
    if (input.parentInfo.relationshipToStudent !== undefined) updates["parentInfo.relationshipToStudent"] = input.parentInfo.relationshipToStudent;
  }

  await adminDb.collection(COLLECTION_NAME).doc(uid).update(updates);
  return getUserByUid(uid);
}

// ─────────────────────────────────────────────
//  LINK STUDENT — vincula un alumno a un padre
//  o lo asigna al salón de un docente
// ─────────────────────────────────────────────

export async function linkStudentToParent(
  parentUid: string,
  studentId: string
): Promise<void> {
  await adminDb.collection(COLLECTION_NAME).doc(parentUid).update({
    "parentInfo.studentIds": FieldValue.arrayUnion(studentId),
    updatedAt: Timestamp.now(),
  });
}

export async function assignStudentToTeacher(
  teacherUid: string,
  studentId: string
): Promise<void> {
  await adminDb.collection(COLLECTION_NAME).doc(teacherUid).update({
    "teacherInfo.studentIds": FieldValue.arrayUnion(studentId),
    updatedAt: Timestamp.now(),
  });
}

// ─────────────────────────────────────────────
//  UPDATE LAST LOGIN — útil para auditoría
// ─────────────────────────────────────────────

export async function touchLastLogin(uid: string): Promise<void> {
  await adminDb.collection(COLLECTION_NAME).doc(uid).update({
    lastLoginAt: Timestamp.now(),
  });
}

// ─────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────

function defaultAdminPermissions() {
  return {
    canManageUsers:       true,
    canManagePayments:    true,
    canManageEnrollments: true,
    canManageContent:     true,
  };
}

function toISO(value: unknown): string {
  if (!value) return "";
  if (typeof value === "object" && "toDate" in (value as object)) {
    return (value as Timestamp).toDate().toISOString();
  }
  return String(value);
}

function mapDocToUser(id: string, d: FirebaseFirestore.DocumentData): User {
  const role: UserRole = d.role ?? "parent";

  return {
    id,
    uid:       String(d.uid   ?? id),
    email:     String(d.email ?? ""),
    firstName: String(d.firstName ?? ""),
    lastName:  String(d.lastName  ?? ""),
    photoUrl:  d.photoUrl ?? undefined,

    role,

    contact: {
      phone:          String(d.contact?.phone ?? ""),
      alternatePhone: d.contact?.alternatePhone ?? undefined,
    },

    preferredLanguage: d.preferredLanguage ?? "english",

    permissions: role === "admin" && d.permissions
      ? {
          canManageUsers:       Boolean(d.permissions.canManageUsers),
          canManagePayments:    Boolean(d.permissions.canManagePayments),
          canManageEnrollments: Boolean(d.permissions.canManageEnrollments),
          canManageContent:     Boolean(d.permissions.canManageContent),
        }
      : undefined,

    teacherInfo: role === "teacher" && d.teacherInfo
      ? {
          classroom:  String(d.teacherInfo.classroom ?? ""),
          program:    d.teacherInfo.program ?? "primary",
          hireDate:   String(d.teacherInfo.hireDate ?? ""),
          studentIds: Array.isArray(d.teacherInfo.studentIds) ? d.teacherInfo.studentIds : [],
        }
      : undefined,

    parentInfo: role === "parent" && d.parentInfo
      ? {
          studentIds:            Array.isArray(d.parentInfo.studentIds) ? d.parentInfo.studentIds : [],
          relationshipToStudent: d.parentInfo.relationshipToStudent ?? "legal_guardian",
        }
      : undefined,

    accountStatus: d.accountStatus ?? "pending_verification",
    createdAt:   toISO(d.createdAt),
    updatedAt:   toISO(d.updatedAt),
    lastLoginAt: toISO(d.lastLoginAt) || undefined,
  };
}