import { Timestamp } from "firebase-admin/firestore";
import { adminDb } from "../firebase-admin";
import {
  Admin,
  AdminLevel,
  AdminPermissions,
  AdminStatus,
  CreateAdminInput,
  UpdateAdminInput,
} from "./admin.type";

const COLLECTION_NAME = "admins";

// ─────────────────────────────────────────────
// CREATE
// ─────────────────────────────────────────────

export async function createAdmin(
  input: CreateAdminInput
): Promise<Admin> {
  const now = Timestamp.now();

  const adminData = {
    uid: input.uid,
    userId: input.userId,

    email: input.email,
    firstName: input.firstName,
    lastName: input.lastName,
    photoUrl: input.photoUrl ?? null,

    position: input.position,
    department: input.department ?? null,

    adminLevel: input.adminLevel,
    permissions: {
      ...defaultPermissionsByLevel(input.adminLevel),
      ...input.permissions,
    },

    contact: {
      phone: input.contact.phone,
      alternatePhone: input.contact.alternatePhone ?? null,
    },

    profileCompleted: true,
    status: "active" as AdminStatus,

    createdAt: now,
    updatedAt: now,
    lastAccessAt: null,
  };

  await adminDb.collection(COLLECTION_NAME).doc(input.uid).set(adminData);

  return mapDocToAdmin(input.uid, adminData);
}

// ─────────────────────────────────────────────
// GET ONE
// ─────────────────────────────────────────────

export async function getAdminByUid(
  uid: string
): Promise<Admin | null> {
  const doc = await adminDb.collection(COLLECTION_NAME).doc(uid).get();

  if (!doc.exists) return null;

  return mapDocToAdmin(doc.id, doc.data()!);
}

// ─────────────────────────────────────────────
// GET ALL
// ─────────────────────────────────────────────

export async function getAdmins(): Promise<Admin[]> {
  const snapshot = await adminDb
    .collection(COLLECTION_NAME)
    .orderBy("createdAt", "desc")
    .get();

  return snapshot.docs.map((doc) =>
    mapDocToAdmin(doc.id, doc.data())
  );
}

// ─────────────────────────────────────────────
// GET BY LEVEL
// ─────────────────────────────────────────────

export async function getAdminsByLevel(
  adminLevel: AdminLevel
): Promise<Admin[]> {
  const snapshot = await adminDb
    .collection(COLLECTION_NAME)
    .where("adminLevel", "==", adminLevel)
    .orderBy("createdAt", "desc")
    .get();

  return snapshot.docs.map((doc) =>
    mapDocToAdmin(doc.id, doc.data())
  );
}

// ─────────────────────────────────────────────
// GET BY STATUS
// ─────────────────────────────────────────────

export async function getAdminsByStatus(
  status: AdminStatus
): Promise<Admin[]> {
  const snapshot = await adminDb
    .collection(COLLECTION_NAME)
    .where("status", "==", status)
    .orderBy("createdAt", "desc")
    .get();

  return snapshot.docs.map((doc) =>
    mapDocToAdmin(doc.id, doc.data())
  );
}

// ─────────────────────────────────────────────
// UPDATE
// ─────────────────────────────────────────────

export async function updateAdmin(
  uid: string,
  input: UpdateAdminInput
): Promise<Admin | null> {
  const updates: Record<string, unknown> = {
    updatedAt: Timestamp.now(),
  };

  if (input.email !== undefined) updates.email = input.email;
  if (input.firstName !== undefined) updates.firstName = input.firstName;
  if (input.lastName !== undefined) updates.lastName = input.lastName;
  if (input.photoUrl !== undefined) updates.photoUrl = input.photoUrl;

  if (input.position !== undefined) updates.position = input.position;
  if (input.department !== undefined) updates.department = input.department;

  if (input.adminLevel !== undefined) {
    updates.adminLevel = input.adminLevel;
  }

  if (input.profileCompleted !== undefined) {
    updates.profileCompleted = input.profileCompleted;
  }

  if (input.status !== undefined) {
    updates.status = input.status;
  }

  if (input.contact) {
    if (input.contact.phone !== undefined) {
      updates["contact.phone"] = input.contact.phone;
    }

    if (input.contact.alternatePhone !== undefined) {
      updates["contact.alternatePhone"] = input.contact.alternatePhone;
    }
  }

  if (input.permissions) {
    if (input.permissions.canManageUsers !== undefined) {
      updates["permissions.canManageUsers"] =
        input.permissions.canManageUsers;
    }

    if (input.permissions.canManageTeachers !== undefined) {
      updates["permissions.canManageTeachers"] =
        input.permissions.canManageTeachers;
    }

    if (input.permissions.canManageParents !== undefined) {
      updates["permissions.canManageParents"] =
        input.permissions.canManageParents;
    }

    if (input.permissions.canManageStudents !== undefined) {
      updates["permissions.canManageStudents"] =
        input.permissions.canManageStudents;
    }

    if (input.permissions.canManageGroups !== undefined) {
      updates["permissions.canManageGroups"] =
        input.permissions.canManageGroups;
    }

    if (input.permissions.canManagePayments !== undefined) {
      updates["permissions.canManagePayments"] =
        input.permissions.canManagePayments;
    }

    if (input.permissions.canManageEnrollments !== undefined) {
      updates["permissions.canManageEnrollments"] =
        input.permissions.canManageEnrollments;
    }

    if (input.permissions.canManageContent !== undefined) {
      updates["permissions.canManageContent"] =
        input.permissions.canManageContent;
    }

    if (input.permissions.canViewReports !== undefined) {
      updates["permissions.canViewReports"] =
        input.permissions.canViewReports;
    }

    if (input.permissions.canManageSettings !== undefined) {
      updates["permissions.canManageSettings"] =
        input.permissions.canManageSettings;
    }
  }

  await adminDb.collection(COLLECTION_NAME).doc(uid).update(updates);

  return getAdminByUid(uid);
}

// ─────────────────────────────────────────────
// COMPLETE PROFILE
// ─────────────────────────────────────────────

export async function completeAdminProfile(
  uid: string,
  input: UpdateAdminInput
): Promise<Admin | null> {
  return updateAdmin(uid, {
    ...input,
    profileCompleted: true,
    status: "active",
  });
}

// ─────────────────────────────────────────────
// UPDATE LAST ACCESS
// ─────────────────────────────────────────────

export async function touchAdminLastAccess(
  uid: string
): Promise<void> {
  await adminDb.collection(COLLECTION_NAME).doc(uid).update({
    lastAccessAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
}

// ─────────────────────────────────────────────
// DELETE LÓGICO
// ─────────────────────────────────────────────

export async function deactivateAdmin(uid: string): Promise<void> {
  await adminDb.collection(COLLECTION_NAME).doc(uid).update({
    status: "inactive",
    updatedAt: Timestamp.now(),
  });
}

// ─────────────────────────────────────────────
// SUSPEND
// ─────────────────────────────────────────────

export async function suspendAdmin(uid: string): Promise<void> {
  await adminDb.collection(COLLECTION_NAME).doc(uid).update({
    status: "suspended",
    updatedAt: Timestamp.now(),
  });
}

// ─────────────────────────────────────────────
// DELETE FÍSICO
// ─────────────────────────────────────────────

export async function deleteAdmin(uid: string): Promise<void> {
  await adminDb.collection(COLLECTION_NAME).doc(uid).delete();
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function defaultPermissionsByLevel(
  level: AdminLevel
): AdminPermissions {
  if (level === "super_admin") {
    return {
      canManageUsers: true,
      canManageTeachers: true,
      canManageParents: true,
      canManageStudents: true,
      canManageGroups: true,
      canManagePayments: true,
      canManageEnrollments: true,
      canManageContent: true,
      canViewReports: true,
      canManageSettings: true,
    };
  }

  if (level === "school_admin") {
    return {
      canManageUsers: true,
      canManageTeachers: true,
      canManageParents: true,
      canManageStudents: true,
      canManageGroups: true,
      canManagePayments: true,
      canManageEnrollments: true,
      canManageContent: true,
      canViewReports: true,
      canManageSettings: false,
    };
  }

  return {
    canManageUsers: false,
    canManageTeachers: true,
    canManageParents: true,
    canManageStudents: true,
    canManageGroups: true,
    canManagePayments: false,
    canManageEnrollments: false,
    canManageContent: true,
    canViewReports: true,
    canManageSettings: false,
  };
}

function toISO(value: unknown): string {
  if (!value) return "";

  if (typeof value === "object" && "toDate" in (value as object)) {
    return (value as Timestamp).toDate().toISOString();
  }

  return String(value);
}

function mapDocToAdmin(
  id: string,
  d: FirebaseFirestore.DocumentData
): Admin {
  const adminLevel = (d.adminLevel ?? "staff_admin") as AdminLevel;

  return {
    id,

    uid: String(d.uid ?? id),
    userId: String(d.userId ?? d.uid ?? id),

    email: String(d.email ?? ""),
    firstName: String(d.firstName ?? ""),
    lastName: String(d.lastName ?? ""),
    photoUrl: d.photoUrl ?? undefined,

    position: String(d.position ?? ""),
    department: d.department ?? undefined,

    adminLevel,

    permissions: {
      ...defaultPermissionsByLevel(adminLevel),
      ...(d.permissions ?? {}),
    },

    contact: {
      phone: String(d.contact?.phone ?? ""),
      alternatePhone: d.contact?.alternatePhone ?? undefined,
    },

    profileCompleted: Boolean(d.profileCompleted),
    status: (d.status ?? "pending_profile") as AdminStatus,

    createdAt: toISO(d.createdAt),
    updatedAt: toISO(d.updatedAt),
    lastAccessAt: toISO(d.lastAccessAt) || undefined,
  };
}