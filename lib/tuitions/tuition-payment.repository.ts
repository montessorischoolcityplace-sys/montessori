import { Timestamp } from "firebase-admin/firestore";
import { adminDb } from "../firebase-admin";
import {
  CreateTuitionPaymentInput,
  ReviewTuitionPaymentInput,
  SubmitTuitionPaymentInput,
  TuitionPayment,
} from "./tuition.type";

const COLLECTION_NAME = "tuitionPayments";

export async function createTuitionPayment(
  input: CreateTuitionPaymentInput
): Promise<TuitionPayment> {
  const now = Timestamp.now();

  console.log("CREATE TUITION PAYMENT INPUT:", input);

  const data = {
    studentId: input.studentId,
    parentId: input.parentId,
    type: input.type,
    title: input.title,
    description: input.description ?? null,
    amount: input.amount,
    currency: "USD" as const,
    dueDate: input.dueDate,
    status: "pending" as const,
    receipt: null,
    submittedAt: null,
    reviewedAt: null,
    reviewedBy: null,
    reviewNotes: null,
    billingMonth: input.billingMonth ?? null,
    billingCycleId: input.billingCycleId ?? null,
    program: input.program ?? null,
    scheduleType: input.scheduleType ?? null,
    createdAt: now,
    updatedAt: now,
  };

  const ref = await adminDb.collection(COLLECTION_NAME).add(data);

  console.log("CREATED TUITION PAYMENT ID:", ref.id);

  return mapDocToTuitionPayment(ref.id, data);
}

export async function getTuitionPayments(): Promise<TuitionPayment[]> {
  const snapshot = await adminDb
    .collection(COLLECTION_NAME)
    .orderBy("createdAt", "desc")
    .get();

  return snapshot.docs.map((doc) =>
    mapDocToTuitionPayment(doc.id, doc.data())
  );
}

export async function getTuitionPaymentById(
  id: string
): Promise<TuitionPayment | null> {
  const doc = await adminDb.collection(COLLECTION_NAME).doc(id).get();

  if (!doc.exists) return null;

  return mapDocToTuitionPayment(doc.id, doc.data()!);
}

export async function getPaymentsByParent(
  parentId: string
): Promise<TuitionPayment[]> {
  const snapshot = await adminDb
    .collection(COLLECTION_NAME)
    .where("parentId", "==", parentId)
    .get();

  return snapshot.docs
    .map((doc) => mapDocToTuitionPayment(doc.id, doc.data()))
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}

export async function getPaymentsByStudent(
  studentId: string
): Promise<TuitionPayment[]> {
  const snapshot = await adminDb
    .collection(COLLECTION_NAME)
    .where("studentId", "==", studentId)
    .get();

  return snapshot.docs
    .map((doc) => mapDocToTuitionPayment(doc.id, doc.data()))
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}

export async function getPaymentsByStatus(
  status: TuitionPayment["status"]
): Promise<TuitionPayment[]> {
  const snapshot = await adminDb
    .collection(COLLECTION_NAME)
    .where("status", "==", status)
    .get();

  return snapshot.docs
    .map((doc) => mapDocToTuitionPayment(doc.id, doc.data()))
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}

export async function submitTuitionPayment(
  id: string,
  input: SubmitTuitionPaymentInput
): Promise<TuitionPayment | null> {
  const existing = await getTuitionPaymentById(id);

  if (!existing) return null;

  await adminDb.collection(COLLECTION_NAME).doc(id).update({
    receipt: input.receipt,
    status: "submitted",
    submittedAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });

  return getTuitionPaymentById(id);
}

export async function reviewTuitionPayment(
  id: string,
  input: ReviewTuitionPaymentInput
): Promise<TuitionPayment | null> {
  const existing = await getTuitionPaymentById(id);

  if (!existing) return null;

  await adminDb.collection(COLLECTION_NAME).doc(id).update({
    status: input.status,
    reviewedBy: input.reviewedBy,
    reviewNotes: input.reviewNotes ?? null,
    reviewedAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });

  return getTuitionPaymentById(id);
}

export async function cancelTuitionPayment(id: string): Promise<void> {
  await adminDb.collection(COLLECTION_NAME).doc(id).update({
    status: "cancelled",
    updatedAt: Timestamp.now(),
  });
}

function toISO(value: unknown): string {
  if (!value) return "";
  if (typeof value === "object" && "toDate" in (value as object)) {
    return (value as Timestamp).toDate().toISOString();
  }
  return String(value);
}

function mapDocToTuitionPayment(
  id: string,
  d: FirebaseFirestore.DocumentData
): TuitionPayment {
  return {
    id,
    studentId: String(d.studentId ?? ""),
    parentId: String(d.parentId ?? ""),
    type: d.type ?? "monthly_tuition",
    title: String(d.title ?? ""),
    description: d.description ?? undefined,
    amount: Number(d.amount ?? 0),
    currency: "USD",
    dueDate: String(d.dueDate ?? ""),
    status: d.status ?? "pending",
    receipt: d.receipt ?? undefined,
    submittedAt: toISO(d.submittedAt) || undefined,
    reviewedAt: toISO(d.reviewedAt) || undefined,
    reviewedBy: d.reviewedBy ?? undefined,
    reviewNotes: d.reviewNotes ?? undefined,
    billingMonth: d.billingMonth ?? undefined,
    billingCycleId: d.billingCycleId ?? undefined,
    createdAt: toISO(d.createdAt),
    updatedAt: toISO(d.updatedAt),
  };
}

export async function getMonthlyPaymentByStudentAndMonth(
  studentId: string,
  billingMonth: string
): Promise<TuitionPayment | null> {
  const snapshot = await adminDb
    .collection(COLLECTION_NAME)
    .where("studentId", "==", studentId)
    .where("type", "==", "monthly_tuition")
    .where("billingMonth", "==", billingMonth)
    .limit(1)
    .get();

  if (snapshot.empty) return null;

  const doc = snapshot.docs[0];
  return mapDocToTuitionPayment(doc.id, doc.data());
}

export async function getRegistrationPaymentByStudent(
  studentId: string
): Promise<TuitionPayment | null> {
  console.log("CHECKING REGISTRATION PAYMENT FOR STUDENT:", studentId);

  const snapshot = await adminDb
    .collection(COLLECTION_NAME)
    .where("studentId", "==", studentId)
    .where("type", "==", "registration")
    .limit(1)
    .get();

  console.log("REGISTRATION PAYMENT EXISTS:", !snapshot.empty);

  if (snapshot.empty) return null;

  const doc = snapshot.docs[0];

  return mapDocToTuitionPayment(doc.id, doc.data());
}