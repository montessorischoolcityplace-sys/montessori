import { NextRequest, NextResponse } from "next/server";
import {
  createTuitionPayment,
  getPaymentsByParent,
  getPaymentsByStatus,
  getPaymentsByStudent,
  getTuitionPayments,
} from "@/lib/tuitions/tuition-payment.repository";
import {
  CreateTuitionPaymentInput,
  PaymentStatus,
} from "@/lib/tuitions/tuition.type";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const parentId = searchParams.get("parentId");
    const studentId = searchParams.get("studentId");
    const status = searchParams.get("status");

    if (parentId) {
      const payments = await getPaymentsByParent(parentId);
      return NextResponse.json(payments);
    }

    if (studentId) {
      const payments = await getPaymentsByStudent(studentId);
      return NextResponse.json(payments);
    }

    if (status) {
      const payments = await getPaymentsByStatus(status as PaymentStatus);
      return NextResponse.json(payments);
    }

    const payments = await getTuitionPayments();
    return NextResponse.json(payments);
  } catch (error) {
    console.error("GET /api/tuition-payments error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateTuitionPaymentInput;

    if (!body.studentId || !body.parentId || !body.type || !body.title) {
      return NextResponse.json(
        { error: "studentId, parentId, type and title are required" },
        { status: 400 }
      );
    }

    if (body.amount === undefined || !body.dueDate) {
      return NextResponse.json(
        { error: "amount and dueDate are required" },
        { status: 400 }
      );
    }

    const payment = await createTuitionPayment(body);

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error("POST /api/tuition-payments error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}