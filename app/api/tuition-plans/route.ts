import { NextRequest, NextResponse } from "next/server";
import {
  createTuitionPlan,
  getTuitionPlans,
  getActiveTuitionPlan,
} from "@/lib/tuitions/tuition-plan.repository";
import { CreateTuitionPlanInput } from "@/lib/tuitions/tuition.type";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const program = searchParams.get("program");
    const scheduleType = searchParams.get("scheduleType");

    if (program && scheduleType) {
      const plan = await getActiveTuitionPlan(program, scheduleType);
      return NextResponse.json(plan);
    }

    const plans = await getTuitionPlans();
    return NextResponse.json(plans);
  } catch (error) {
    console.error("GET /api/tuition-plans error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateTuitionPlanInput;

    if (!body.name || !body.program || !body.scheduleType) {
      return NextResponse.json(
        { error: "name, program and scheduleType are required" },
        { status: 400 }
      );
    }

    if (
      body.monthlyAmount === undefined ||
      body.registrationFee === undefined
    ) {
      return NextResponse.json(
        { error: "monthlyAmount and registrationFee are required" },
        { status: 400 }
      );
    }

    const plan = await createTuitionPlan({
      name: body.name,
      program: body.program,
      scheduleType: body.scheduleType,
      monthlyAmount: Number(body.monthlyAmount),
      registrationFee: Number(body.registrationFee),
      reenrollmentFee:
        body.reenrollmentFee !== undefined
          ? Number(body.reenrollmentFee)
          : undefined,
    });

    return NextResponse.json(plan, { status: 201 });
  } catch (error) {
    console.error("POST /api/tuition-plans error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Internal server error",
      },
      { status: 500 }
    );
  }
}