import { Timestamp } from "firebase-admin/firestore";
import {
  CreateObservationInput,
  Observation,
  UpdateObservationInput,
} from "./observation.type";
import { adminDb } from "../firebase-admin";

const COLLECTION_NAME = "observations";

// ─────────────────────────────────────────────
// CREATE
// ─────────────────────────────────────────────

export async function createObservation(
  input: CreateObservationInput
): Promise<Observation> {
  const now = Timestamp.now();

  const visibleToParent = Boolean(input.visibleToParent);

  const data = {
    studentId: input.studentId,
    teacherId: input.teacherId,

    observationDate: input.observationDate,

    area: input.area,
    mood: input.mood ?? "not_observed",

    title: input.title,

    sessionSummary: input.sessionSummary,
    activitiesWorked: input.activitiesWorked,

    strengths: input.strengths ?? null,
    challenges: input.challenges ?? null,

    homeRecommendations: input.homeRecommendations ?? [],

    teacherNotes: input.teacherNotes ?? null,

    media: input.media ?? [],

    visibility: visibleToParent ? "visible_to_parent" : "draft",
    visibleToParent,
    publishedAt: visibleToParent ? now : null,

    createdAt: now,
    updatedAt: now,
  };

  const docRef = await adminDb.collection(COLLECTION_NAME).add(data);

  return mapDocToObservation(docRef.id, data);
}

// ─────────────────────────────────────────────
// GET BY STUDENT
// ─────────────────────────────────────────────

export async function getObservationsByStudent(
  studentId: string,
  options?: { onlyVisibleToParent?: boolean }
): Promise<Observation[]> {
  const snapshot = await adminDb
    .collection(COLLECTION_NAME)
    .where("studentId", "==", studentId)
    .get();

  let observations = snapshot.docs.map((doc) =>
    mapDocToObservation(doc.id, doc.data())
  );

  if (options?.onlyVisibleToParent) {
    observations = observations.filter((o) => o.visibleToParent);
  }

  return observations.sort(
    (a, b) =>
      new Date(b.observationDate || b.createdAt).getTime() -
      new Date(a.observationDate || a.createdAt).getTime()
  );
}

// ─────────────────────────────────────────────
// GET BY TEACHER
// ─────────────────────────────────────────────

export async function getObservationsByTeacher(
  teacherId: string
): Promise<Observation[]> {
  const snapshot = await adminDb
    .collection(COLLECTION_NAME)
    .where("teacherId", "==", teacherId)
    .get();

  return snapshot.docs
    .map((doc) => mapDocToObservation(doc.id, doc.data()))
    .sort(
      (a, b) =>
        new Date(b.observationDate || b.createdAt).getTime() -
        new Date(a.observationDate || a.createdAt).getTime()
    );
}

// ─────────────────────────────────────────────
// GET ONE
// ─────────────────────────────────────────────

export async function getObservationById(
  id: string
): Promise<Observation | null> {
  const doc = await adminDb.collection(COLLECTION_NAME).doc(id).get();

  if (!doc.exists) return null;

  return mapDocToObservation(doc.id, doc.data()!);
}

// ─────────────────────────────────────────────
// UPDATE
// ─────────────────────────────────────────────

export async function updateObservation(
  id: string,
  input: UpdateObservationInput
): Promise<Observation | null> {
  const existingObservation = await getObservationById(id);

  if (!existingObservation) return null;

  const now = Timestamp.now();

  const updates: Record<string, unknown> = {
    updatedAt: now,
  };

  if (input.observationDate !== undefined) {
    updates.observationDate = input.observationDate;
  }

  if (input.area !== undefined) {
    updates.area = input.area;
  }

  if (input.mood !== undefined) {
    updates.mood = input.mood;
  }

  if (input.title !== undefined) {
    updates.title = input.title;
  }

  if (input.sessionSummary !== undefined) {
    updates.sessionSummary = input.sessionSummary;
  }

  if (input.activitiesWorked !== undefined) {
    updates.activitiesWorked = input.activitiesWorked;
  }

  if (input.strengths !== undefined) {
    updates.strengths = input.strengths || null;
  }

  if (input.challenges !== undefined) {
    updates.challenges = input.challenges || null;
  }

  if (input.homeRecommendations !== undefined) {
    updates.homeRecommendations = input.homeRecommendations;
  }

  if (input.teacherNotes !== undefined) {
    updates.teacherNotes = input.teacherNotes || null;
  }

  if (input.media !== undefined) {
    updates.media = input.media;
  }

  if (input.visibleToParent !== undefined) {
    updates.visibleToParent = input.visibleToParent;
    updates.visibility = input.visibleToParent ? "visible_to_parent" : "draft";

    if (
      input.visibleToParent === true &&
      existingObservation.visibleToParent === false
    ) {
      updates.publishedAt = now;
    }

    if (input.visibleToParent === false) {
      updates.publishedAt = null;
    }
  }

  if (input.visibility !== undefined) {
    updates.visibility = input.visibility;
    updates.visibleToParent = input.visibility === "visible_to_parent";

    if (
      input.visibility === "visible_to_parent" &&
      existingObservation.visibleToParent === false
    ) {
      updates.publishedAt = now;
    }

    if (input.visibility === "draft") {
      updates.publishedAt = null;
    }
  }

  await adminDb.collection(COLLECTION_NAME).doc(id).update(updates);

  return getObservationById(id);
}

// ─────────────────────────────────────────────
// DELETE
// ─────────────────────────────────────────────

export async function deleteObservation(id: string): Promise<void> {
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

function mapDocToObservation(
  id: string,
  d: FirebaseFirestore.DocumentData
): Observation {
  return {
    id,

    studentId: String(d.studentId ?? ""),
    teacherId: String(d.teacherId ?? ""),

    observationDate: String(d.observationDate ?? ""),

    area: d.area ?? "general",
    mood: d.mood ?? "not_observed",

    title: String(d.title ?? ""),

    sessionSummary: String(d.sessionSummary ?? ""),
    activitiesWorked: String(d.activitiesWorked ?? ""),

    strengths: d.strengths ?? undefined,
    challenges: d.challenges ?? undefined,

    homeRecommendations: Array.isArray(d.homeRecommendations)
      ? d.homeRecommendations
      : [],

    teacherNotes: d.teacherNotes ?? undefined,

    media: Array.isArray(d.media) ? d.media : [],

    visibility: d.visibility ?? "draft",
    visibleToParent: Boolean(d.visibleToParent ?? false),
    publishedAt: toISO(d.publishedAt) || undefined,

    createdAt: toISO(d.createdAt),
    updatedAt: toISO(d.updatedAt),
  };
}