import { Timestamp } from "firebase-admin/firestore";
import { adminDb } from "../firebase-admin";

const PAYMENTS_COLLECTION = "tuitionPayments";
const CYCLES_COLLECTION = "tuitionBillingCycles";

export async function recalculateBillingCycleAnalytics(
  billingCycleId: string
): Promise<void> {
  const cycleRef = adminDb.collection(CYCLES_COLLECTION).doc(billingCycleId);

  const paymentsSnapshot = await adminDb
    .collection(PAYMENTS_COLLECTION)
    .where("billingCycleId", "==", billingCycleId)
    .get();

  const payments = paymentsSnapshot.docs.map((doc) => doc.data());

  const today = new Date().toISOString().split("T")[0];

  let expectedRevenue = 0;
  let collectedRevenue = 0;
  let pendingRevenue = 0;
  let overdueRevenue = 0;

  const studentIds = new Set<string>();

  const planMap = new Map<
    string,
    {
      program: string;
      scheduleType: string;
      expectedRevenue: number;
      collectedRevenue: number;
      pendingRevenue: number;
      students: Set<string>;
    }
  >();

  for (const payment of payments) {
    const amount = Number(payment.amount ?? 0);
    const status = String(payment.status ?? "pending");
    const dueDate = String(payment.dueDate ?? "");
    const studentId = String(payment.studentId ?? "");

    const program = String(payment.program ?? "unknown");
    const scheduleType = String(payment.scheduleType ?? "unknown");
    const planKey = `${program}_${scheduleType}`;

    expectedRevenue += amount;

    if (studentId) studentIds.add(studentId);

    if (!planMap.has(planKey)) {
      planMap.set(planKey, {
        program,
        scheduleType,
        expectedRevenue: 0,
        collectedRevenue: 0,
        pendingRevenue: 0,
        students: new Set<string>(),
      });
    }

    const plan = planMap.get(planKey)!;

    plan.expectedRevenue += amount;
    if (studentId) plan.students.add(studentId);

    if (status === "approved") {
      collectedRevenue += amount;
      plan.collectedRevenue += amount;
    } else {
      pendingRevenue += amount;
      plan.pendingRevenue += amount;

      if (dueDate && dueDate < today) {
        overdueRevenue += amount;
      }
    }
  }

  const collectionRate =
    expectedRevenue > 0
      ? Math.round((collectedRevenue / expectedRevenue) * 100)
      : 0;

  const plans = Array.from(planMap.values()).map((plan) => ({
    program: plan.program,
    scheduleType: plan.scheduleType,
    expectedRevenue: plan.expectedRevenue,
    collectedRevenue: plan.collectedRevenue,
    pendingRevenue: plan.pendingRevenue,
    students: plan.students.size,
  }));

  await cycleRef.update({
    expectedRevenue,
    collectedRevenue,
    pendingRevenue,
    overdueRevenue,
    collectionRate,
    students: studentIds.size,
    plans,
    updatedAt: Timestamp.now(),
  });
}