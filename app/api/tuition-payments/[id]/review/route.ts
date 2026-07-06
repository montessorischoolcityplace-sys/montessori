import { NextRequest, NextResponse } from "next/server";
import {
  createTuitionPayment,
  getMonthlyPaymentByStudentAndMonth,
  getTuitionPaymentById,
  reviewTuitionPayment,
} from "@/lib/tuitions/tuition-payment.repository";
import { getStudentById, updateStudent } from "@/lib/students/student.repository";
import { ReviewTuitionPaymentInput } from "@/lib/tuitions/tuition.type";
import { getActiveTuitionPlan } from "@/lib/tuitions/tuition-plan.repository";
import { createBillingCycle, getBillingCycleByMonth, updateBillingCycleStats } from "@/lib/tuitions/tuition-billing-cycle.repository";
import { recalculateBillingCycleAnalytics } from "@/lib/tuitions/tuition-billing-analytics.repository";

interface Params {
  params: Promise<{
    id: string;
  }>;
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = (await req.json()) as ReviewTuitionPaymentInput;

    if (body.status !== "approved" && body.status !== "rejected") {
      return NextResponse.json(
        { error: "status must be approved or rejected" },
        { status: 400 }
      );
    }

    if (!body.reviewedBy) {
      return NextResponse.json(
        { error: "reviewedBy is required" },
        { status: 400 }
      );
    }

    const existingPayment = await getTuitionPaymentById(id);

    if (!existingPayment) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    const payment = await reviewTuitionPayment(id, body);

    if (payment?.billingCycleId) {
      await recalculateBillingCycleAnalytics(payment.billingCycleId);
    }

    if (!payment) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    if (
      body.status === "approved" &&
      existingPayment.type === "registration"
    ) {
      await updateStudent(existingPayment.studentId, {
        enrollmentStatus: "active",
      });

      const student = await getStudentById(existingPayment.studentId);

      if (student) {
        const billingMonth = getCurrentBillingMonth();
        const dueDate = getDueDateForBillingMonth(billingMonth);
        const billingTitle = getBillingTitle(billingMonth);

        const existingMonthlyPayment =
          await getMonthlyPaymentByStudentAndMonth(student.id, billingMonth);

        if (!existingMonthlyPayment) {
          const plan = await getActiveTuitionPlan(
            student.program,
            student.scheduleType
          );

          if (plan) {
            const existingCycle = await getBillingCycleByMonth(billingMonth);

            const cycle =
              existingCycle ??
              (await createBillingCycle({
                billingMonth,
                title: `${billingTitle} Tuition`,
                dueDate,
              }));

            await createTuitionPayment({
              studentId: student.id,
              parentId: student.parentIds[0],
              type: "monthly_tuition",
              title: `${billingTitle} Tuition`,
              description: `Monthly tuition for ${billingTitle}.`,
              amount: plan.monthlyAmount,
              dueDate,
              billingMonth,
              billingCycleId: cycle.id,
            });

            await updateBillingCycleStats(cycle.id, {
              createdPayments: (cycle.createdPayments ?? 0) + 1,
            });
          }
        }
      }
    }

    return NextResponse.json(payment);
  } catch (error) {
    console.error("PUT /api/tuition-payments/[id]/review error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function getCurrentBillingMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function getDueDateForBillingMonth(billingMonth: string) {
  const [year, month] = billingMonth.split("-").map(Number);
  return new Date(year, month - 1, 5).toISOString().split("T")[0];
}

function getBillingTitle(billingMonth: string) {
  const [year, month] = billingMonth.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, 1));
}