import { Timestamp } from "firebase-admin/firestore";
import { adminDb } from "../firebase-admin";
import {
  CreateParentInput,
  UpdateParentInput,
  Parent,
  ParentStatus,
  PreferredContactMethod,
} from "./parent.type";

const COLLECTION_NAME = "parents";

// ─────────────────────────────────────────────
// CREATE
// ─────────────────────────────────────────────

export async function createParent(
  input: CreateParentInput
): Promise<Parent> {
  const now = Timestamp.now();

  const parentData = {
    uid: input.uid,
    userId: input.userId,

    email: input.email,
    firstName: input.firstName,
    lastName: input.lastName,
    photoUrl: input.photoUrl ?? null,

    contact: {
      phone: input.contact.phone,
      alternatePhone: input.contact.alternatePhone ?? null,
      whatsapp: input.contact.whatsapp ?? null,
    },

    address: {
      street: input.address.street,
      exteriorNumber: input.address.exteriorNumber ?? null,
      interiorNumber: input.address.interiorNumber ?? null,
      neighborhood: input.address.neighborhood ?? null,
      city: input.address.city,
      state: input.address.state,
      zipCode: input.address.zipCode,
      country: input.address.country,
      references: input.address.references ?? null,
    },

    preferredContactMethod:
      input.preferredContactMethod ?? "app_notification",

    emergencyContacts: input.emergencyContacts ?? [],
    authorizedPickupPeople: input.authorizedPickupPeople ?? [],

    occupation: input.occupation ?? null,
    workplace: input.workplace ?? null,

    profileCompleted: true,
    status: "active" as ParentStatus,

    createdAt: now,
    updatedAt: now,
  };

  await adminDb.collection(COLLECTION_NAME).doc(input.uid).set(parentData);

  return mapDocToParent(input.uid, parentData);
}

// ─────────────────────────────────────────────
// GET ONE
// ─────────────────────────────────────────────

export async function getParentByUid(
  uid: string
): Promise<Parent | null> {
  const doc = await adminDb.collection(COLLECTION_NAME).doc(uid).get();

  if (!doc.exists) return null;

  return mapDocToParent(doc.id, doc.data()!);
}

// ─────────────────────────────────────────────
// GET ALL
// ─────────────────────────────────────────────

export async function getParents(): Promise<Parent[]> {
  const snapshot = await adminDb
    .collection(COLLECTION_NAME)
    .orderBy("createdAt", "desc")
    .get();

  return snapshot.docs.map((doc) =>
    mapDocToParent(doc.id, doc.data())
  );
}

// ─────────────────────────────────────────────
// GET BY STATUS
// ─────────────────────────────────────────────

export async function getParentsByStatus(
  status: ParentStatus
): Promise<Parent[]> {
  const snapshot = await adminDb
    .collection(COLLECTION_NAME)
    .where("status", "==", status)
    .orderBy("createdAt", "desc")
    .get();

  return snapshot.docs.map((doc) =>
    mapDocToParent(doc.id, doc.data())
  );
}

// ─────────────────────────────────────────────
// UPDATE
// ─────────────────────────────────────────────

export async function updateParent(
  uid: string,
  input: UpdateParentInput
): Promise<Parent | null> {
  const existingParent = await getParentByUid(uid);

  if (!existingParent) return null;

  const updates: Record<string, unknown> = {
    updatedAt: Timestamp.now(),
  };

  if (input.email !== undefined) updates.email = input.email;
  if (input.firstName !== undefined) updates.firstName = input.firstName;
  if (input.lastName !== undefined) updates.lastName = input.lastName;
  if (input.photoUrl !== undefined) updates.photoUrl = input.photoUrl;

  if (input.preferredContactMethod !== undefined) {
    updates.preferredContactMethod = input.preferredContactMethod;
  }

  if (input.occupation !== undefined) updates.occupation = input.occupation;
  if (input.workplace !== undefined) updates.workplace = input.workplace;

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

    if (input.contact.whatsapp !== undefined) {
      updates["contact.whatsapp"] = input.contact.whatsapp;
    }
  }

  if (input.address) {
    if (input.address.street !== undefined) {
      updates["address.street"] = input.address.street;
    }

    if (input.address.exteriorNumber !== undefined) {
      updates["address.exteriorNumber"] = input.address.exteriorNumber;
    }

    if (input.address.interiorNumber !== undefined) {
      updates["address.interiorNumber"] = input.address.interiorNumber;
    }

    if (input.address.neighborhood !== undefined) {
      updates["address.neighborhood"] = input.address.neighborhood;
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

    if (input.address.references !== undefined) {
      updates["address.references"] = input.address.references;
    }
  }

  if (input.emergencyContacts !== undefined) {
    updates.emergencyContacts = input.emergencyContacts;
  }

  if (input.authorizedPickupPeople !== undefined) {
    updates.authorizedPickupPeople = input.authorizedPickupPeople;
  }

  await adminDb.collection(COLLECTION_NAME).doc(uid).update(updates);

  return getParentByUid(uid);
}

// ─────────────────────────────────────────────
// COMPLETE PROFILE
// ─────────────────────────────────────────────

export async function completeParentProfile(
  uid: string,
  input: UpdateParentInput
): Promise<Parent | null> {
  return updateParent(uid, {
    ...input,
    profileCompleted: true,
    status: "active",
  });
}

// ─────────────────────────────────────────────
// DELETE LÓGICO
// ─────────────────────────────────────────────

export async function deactivateParent(uid: string): Promise<void> {
  await adminDb.collection(COLLECTION_NAME).doc(uid).update({
    status: "inactive",
    updatedAt: Timestamp.now(),
  });
}

// ─────────────────────────────────────────────
// DELETE FÍSICO
// ─────────────────────────────────────────────

export async function deleteParent(uid: string): Promise<void> {
  await adminDb.collection(COLLECTION_NAME).doc(uid).delete();
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

function mapDocToParent(
  id: string,
  d: FirebaseFirestore.DocumentData
): Parent {
  return {
    id,

    uid: String(d.uid ?? id),
    userId: String(d.userId ?? d.uid ?? id),

    email: String(d.email ?? ""),
    firstName: String(d.firstName ?? ""),
    lastName: String(d.lastName ?? ""),
    photoUrl: d.photoUrl ?? undefined,

    contact: {
      phone: String(d.contact?.phone ?? ""),
      alternatePhone: d.contact?.alternatePhone ?? undefined,
      whatsapp: d.contact?.whatsapp ?? undefined,
    },

    address: {
      street: String(d.address?.street ?? ""),
      exteriorNumber: d.address?.exteriorNumber ?? undefined,
      interiorNumber: d.address?.interiorNumber ?? undefined,
      neighborhood: d.address?.neighborhood ?? undefined,
      city: String(d.address?.city ?? ""),
      state: String(d.address?.state ?? ""),
      zipCode: String(d.address?.zipCode ?? ""),
      country: String(d.address?.country ?? ""),
      references: d.address?.references ?? undefined,
    },

    preferredContactMethod:
      (d.preferredContactMethod ??
        "app_notification") as PreferredContactMethod,

    emergencyContacts: Array.isArray(d.emergencyContacts)
      ? d.emergencyContacts
      : [],

    authorizedPickupPeople: Array.isArray(d.authorizedPickupPeople)
      ? d.authorizedPickupPeople
      : [],

    occupation: d.occupation ?? undefined,
    workplace: d.workplace ?? undefined,

    profileCompleted: Boolean(d.profileCompleted),
    status: (d.status ?? "pending_profile") as ParentStatus,

    createdAt: toISO(d.createdAt),
    updatedAt: toISO(d.updatedAt),
  };
}