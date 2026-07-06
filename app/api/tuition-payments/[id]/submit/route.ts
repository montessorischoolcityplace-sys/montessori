import { NextRequest, NextResponse } from "next/server";
import { submitTuitionPayment } from "@/lib/tuitions/tuition-payment.repository";
import { SubmitTuitionPaymentInput } from "@/lib/tuitions/tuition.type";

interface Params {
  params: Promise<{
    id: string;
  }>;
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = (await req.json()) as SubmitTuitionPaymentInput;

    if (!body.receipt?.fileUrl || !body.receipt?.publicId) {
      return NextResponse.json(
        { error: "receipt fileUrl and publicId are required" },
        { status: 400 }
      );
    }

    const payment = await submitTuitionPayment(id, body);

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    return NextResponse.json(payment);
  } catch (error) {
    console.error("PUT /api/tuition-payments/[id]/submit error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}