import { Timestamp } from "firebase-admin/firestore";
import { adminDb } from "../firebase-admin";
import {
  CreateTuitionPlanInput,
  TuitionPlan,
  UpdateTuitionPlanInput,
} from "./tuition.type";

const COLLECTION_NAME = "tuitionPlans";

export async function createTuitionPlan(
  input: CreateTuitionPlanInput
): Promise<TuitionPlan> {
  const now = Timestamp.now();

  const data = {
    name: input.name,
    program: input.program,
    scheduleType: input.scheduleType,
    monthlyAmount: input.monthlyAmount,
    registrationFee: input.registrationFee,
    reenrollmentFee: input.reenrollmentFee ?? null,
    currency: "USD" as const,
    status: "active" as const,
    createdAt: now,
    updatedAt: now,
  };

  const ref = await adminDb.collection(COLLECTION_NAME).add(data);

  return mapDocToTuitionPlan(ref.id, data);
}

export async function getTuitionPlans(): Promise<TuitionPlan[]> {
  const snapshot = await adminDb
    .collection(COLLECTION_NAME)
    .orderBy("createdAt", "desc")
    .get();

  return snapshot.docs.map((doc) =>
    mapDocToTuitionPlan(doc.id, doc.data())
  );
}

export async function getTuitionPlanById(
  id: string
): Promise<TuitionPlan | null> {
  const doc = await adminDb.collection(COLLECTION_NAME).doc(id).get();

  if (!doc.exists) return null;

  return mapDocToTuitionPlan(doc.id, doc.data()!);
}

export async function getActiveTuitionPlan(
  program: string,
  scheduleType: string
): Promise<TuitionPlan | null> {
  console.log("SEARCHING TUITION PLAN:", {
    program,
    scheduleType,
    status: "active",
  });

  const snapshot = await adminDb
    .collection(COLLECTION_NAME)
    .where("program", "==", program)
    .where("scheduleType", "==", scheduleType)
    .where("status", "==", "active")
    .limit(1)
    .get();

  console.log("TUITION PLAN FOUND:", !snapshot.empty);

  if (snapshot.empty) {
    const allPlansSnapshot = await adminDb.collection(COLLECTION_NAME).get();

    console.log(
      "AVAILABLE TUITION PLANS:",
      allPlansSnapshot.docs.map((doc) => ({
        id: doc.id,
        program: doc.data().program,
        scheduleType: doc.data().scheduleType,
        status: doc.data().status,
      }))
    );

    return null;
  }

  const doc = snapshot.docs[0];

  return mapDocToTuitionPlan(doc.id, doc.data());
}

export async function updateTuitionPlan(
  id: string,
  input: UpdateTuitionPlanInput
): Promise<TuitionPlan | null> {
  const updates: Record<string, unknown> = {
    updatedAt: Timestamp.now(),
  };

  if (input.name !== undefined) updates.name = input.name;
  if (input.monthlyAmount !== undefined) updates.monthlyAmount = input.monthlyAmount;
  if (input.registrationFee !== undefined) updates.registrationFee = input.registrationFee;
  if (input.reenrollmentFee !== undefined) updates.reenrollmentFee = input.reenrollmentFee;
  if (input.status !== undefined) updates.status = input.status;

  await adminDb.collection(COLLECTION_NAME).doc(id).update(updates);

  return getTuitionPlanById(id);
}

export async function deleteTuitionPlan(id: string): Promise<void> {
  await adminDb.collection(COLLECTION_NAME).doc(id).delete();
}

function toISO(value: unknown): string {
  if (!value) return "";
  if (typeof value === "object" && "toDate" in (value as object)) {
    return (value as Timestamp).toDate().toISOString();
  }
  return String(value);
}

function mapDocToTuitionPlan(
  id: string,
  d: FirebaseFirestore.DocumentData
): TuitionPlan {
  return {
    id,
    name: String(d.name ?? ""),
    program: d.program ?? "primary",
    scheduleType: d.scheduleType ?? "full_time",
    monthlyAmount: Number(d.monthlyAmount ?? 0),
    registrationFee: Number(d.registrationFee ?? 0),
    reenrollmentFee:
      d.reenrollmentFee !== null && d.reenrollmentFee !== undefined
        ? Number(d.reenrollmentFee)
        : undefined,
    currency: "USD",
    status: d.status ?? "active",
    createdAt: toISO(d.createdAt),
    updatedAt: toISO(d.updatedAt),
  };
}