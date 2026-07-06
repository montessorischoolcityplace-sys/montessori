import { NextRequest, NextResponse } from "next/server";
import {
  deleteTuitionPlan,
  getTuitionPlanById,
  updateTuitionPlan,
} from "@/lib/tuitions/tuition-plan.repository";
import { UpdateTuitionPlanInput } from "@/lib/tuitions/tuition.type";

interface Params {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(_: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const plan = await getTuitionPlanById(id);

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    return NextResponse.json(plan);
  } catch (error) {
    console.error("GET /api/tuition-plans/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = (await req.json()) as UpdateTuitionPlanInput;

    const plan = await updateTuitionPlan(id, body);

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    return NextResponse.json(plan);
  } catch (error) {
    console.error("PUT /api/tuition-plans/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    await deleteTuitionPlan(id);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/tuition-plans/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}