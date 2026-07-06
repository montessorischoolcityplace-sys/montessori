import { Timestamp } from "firebase-admin/firestore";
import { adminDb } from "../firebase-admin";
import { TuitionBillingCycle } from "./tuition.type";

const COLLECTION_NAME = "tuitionBillingCycles";

export async function createBillingCycle(input: {
  billingMonth: string;
  title: string;
  dueDate: string;
  totalActiveStudents?: number;
  createdPayments?: number;
  skippedStudents?: number;
}): Promise<TuitionBillingCycle> {
  const now = Timestamp.now();

  const data = {
    billingMonth: input.billingMonth,
    title: input.title,
    dueDate: input.dueDate,
    status: "open" as const,

    totalActiveStudents: input.totalActiveStudents ?? 0,
    createdPayments: input.createdPayments ?? 0,
    skippedStudents: input.skippedStudents ?? 0,

    expectedRevenue: 0,
    collectedRevenue: 0,
    pendingRevenue: 0,
    overdueRevenue: 0,
    collectionRate: 0,
    students: 0,
    plans: [],

    createdAt: now,
    updatedAt: now,
  };

  const ref = await adminDb
    .collection(COLLECTION_NAME)
    .add(data);

  return mapDocToBillingCycle(ref.id, data);
}

export async function getBillingCycleByMonth(
  billingMonth: string
): Promise<TuitionBillingCycle | null> {
  const snapshot = await adminDb
    .collection(COLLECTION_NAME)
    .where("billingMonth", "==", billingMonth)
    .limit(1)
    .get();

  if (snapshot.empty) return null;

  const doc = snapshot.docs[0];

  return mapDocToBillingCycle(doc.id, doc.data());
}

export async function getBillingCycles(): Promise<TuitionBillingCycle[]> {
  const snapshot = await adminDb
    .collection(COLLECTION_NAME)
    .orderBy("createdAt", "desc")
    .get();

  return snapshot.docs.map((doc) =>
    mapDocToBillingCycle(doc.id, doc.data())
  );
}

export async function updateBillingCycleStats(
  id: string,
  input: {
    totalActiveStudents?: number;
    createdPayments?: number;
    skippedStudents?: number;
  }
): Promise<TuitionBillingCycle | null> {
  const updates: Record<string, unknown> = {
    updatedAt: Timestamp.now(),
  };

  if (input.totalActiveStudents !== undefined) {
    updates.totalActiveStudents = input.totalActiveStudents;
  }

  if (input.createdPayments !== undefined) {
    updates.createdPayments = input.createdPayments;
  }

  if (input.skippedStudents !== undefined) {
    updates.skippedStudents = input.skippedStudents;
  }

  await adminDb
    .collection(COLLECTION_NAME)
    .doc(id)
    .update(updates);

  return getBillingCycleById(id);
}

export async function updateBillingCycleStatus(
  id: string,
  status: TuitionBillingCycle["status"]
): Promise<TuitionBillingCycle | null> {
  await adminDb
    .collection(COLLECTION_NAME)
    .doc(id)
    .update({
      status,
      updatedAt: Timestamp.now(),
    });

  return getBillingCycleById(id);
}

export async function getBillingCycleById(
  id: string
): Promise<TuitionBillingCycle | null> {
  const doc = await adminDb
    .collection(COLLECTION_NAME)
    .doc(id)
    .get();

  if (!doc.exists) return null;

  return mapDocToBillingCycle(doc.id, doc.data()!);
}

function toISO(value: unknown): string {
  if (!value) return "";

  if (typeof value === "object" && "toDate" in (value as object)) {
    return (value as Timestamp).toDate().toISOString();
  }

  return String(value);
}

function mapDocToBillingCycle(
  id: string,
  d: FirebaseFirestore.DocumentData
): TuitionBillingCycle {
  return {
    id,
    billingMonth: String(d.billingMonth ?? ""),
    title: String(d.title ?? ""),
    dueDate: String(d.dueDate ?? ""),
    status: d.status ?? "open",

    totalActiveStudents: Number(d.totalActiveStudents ?? 0),
    createdPayments: Number(d.createdPayments ?? 0),
    skippedStudents: Number(d.skippedStudents ?? 0),

    expectedRevenue: Number(d.expectedRevenue ?? 0),
    collectedRevenue: Number(d.collectedRevenue ?? 0),
    pendingRevenue: Number(d.pendingRevenue ?? 0),
    overdueRevenue: Number(d.overdueRevenue ?? 0),
    collectionRate: Number(d.collectionRate ?? 0),
    students: Number(d.students ?? 0),
    plans: Array.isArray(d.plans) ? d.plans : [],

    createdAt: toISO(d.createdAt),
    updatedAt: toISO(d.updatedAt),
  };
}