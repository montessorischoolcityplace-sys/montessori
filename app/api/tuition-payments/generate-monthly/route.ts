import { NextResponse } from "next/server";

import { getActiveStudents } from "@/lib/students/student.repository";

import { getActiveTuitionPlan } from "@/lib/tuitions/tuition-plan.repository";
import { recalculateBillingCycleAnalytics } from "@/lib/tuitions/tuition-billing-analytics.repository";

import {
  createTuitionPayment,
  getMonthlyPaymentByStudentAndMonth,
} from "@/lib/tuitions/tuition-payment.repository";

import {
  createBillingCycle,
  getBillingCycleByMonth,
  updateBillingCycleStats,
} from "@/lib/tuitions/tuition-billing-cycle.repository";

function getCurrentBillingMonth() {
  const now = new Date();

  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}`;
}

function getDueDateForBillingMonth(billingMonth: string) {
  const [year, month] = billingMonth.split("-").map(Number);

  const dueDate = new Date(year, month - 1, 5);

  return dueDate.toISOString().split("T")[0];
}

function getBillingTitle(billingMonth: string) {
  const [year, month] = billingMonth.split("-").map(Number);

  const date = new Date(year, month - 1, 1);

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(date);
}

export async function POST() {
  try {
    const billingMonth = getCurrentBillingMonth();
    const dueDate = getDueDateForBillingMonth(billingMonth);
    const billingTitle = getBillingTitle(billingMonth);

    const existingCycle = await getBillingCycleByMonth(billingMonth);

    const cycle =
      existingCycle ??
      (await createBillingCycle({
        billingMonth,
        title: `${billingTitle} Tuition`,
        dueDate,
      }));

    const students = await getActiveStudents();

    let created = 0;
    let skipped = 0;

    for (const student of students) {
      const parentId = student.parentIds?.[0];

      if (!parentId) {
        skipped++;
        continue;
      }

      const existingPayment =
        await getMonthlyPaymentByStudentAndMonth(student.id, billingMonth);

      if (existingPayment) {
        skipped++;
        continue;
      }

      const plan = await getActiveTuitionPlan(
        student.program,
        student.scheduleType
      );

      if (!plan) {
        skipped++;
        continue;
      }

      await createTuitionPayment({
        studentId: student.id,
        parentId,
        type: "monthly_tuition",
        title: `${billingTitle} Tuition`,
        description: `Monthly tuition for ${billingTitle}.`,
        amount: plan.monthlyAmount,
        dueDate,
        billingMonth,
        billingCycleId: cycle.id,
        program: student.program,
        scheduleType: student.scheduleType,
      });

      created++;
    }

    await updateBillingCycleStats(cycle.id, {
      totalActiveStudents: students.length,
      createdPayments: (cycle.createdPayments ?? 0) + created,
      skippedStudents: skipped,
    });

    await recalculateBillingCycleAnalytics(cycle.id);

    return NextResponse.json({
      ok: true,
      billingCycleId: cycle.id,
      billingMonth,
      title: cycle.title,
      dueDate,
      created,
      skipped,
      totalStudents: students.length,
      message: `${created} monthly payments generated for ${billingTitle}.`,
    });
  } catch (error) {
    console.error(
      "POST /api/tuition-payments/generate-monthly error:",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
}