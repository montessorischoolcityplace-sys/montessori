import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUid } from "@/lib/auth-helper";
import {
  deleteObservation,
  getObservationById,
  updateObservation,
} from "@/lib/observations/observation.repository";
import { UpdateObservationInput } from "@/lib/observations/observation.type";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthenticatedUid();

    if (!auth) {
      return NextResponse.json(
        { ok: false, message: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const observation = await getObservationById(id);

    if (!observation) {
      return NextResponse.json(
        { ok: false, message: "Observation not found." },
        { status: 404 }
      );
    }

    const isOwner = observation.teacherId === auth.uid;
    const isAdmin = auth.role === "admin";

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { ok: false, message: "Forbidden." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const input: UpdateObservationInput = {};

    if (body.observationDate !== undefined) {
      input.observationDate = String(body.observationDate).trim();
    }

    if (body.area !== undefined) {
      input.area = body.area;
    }

    if (body.mood !== undefined) {
      input.mood = body.mood;
    }

    if (body.title !== undefined) {
      input.title = String(body.title).trim();
    }

    if (body.sessionSummary !== undefined) {
      input.sessionSummary = String(body.sessionSummary).trim();
    }

    if (body.activitiesWorked !== undefined) {
      input.activitiesWorked = String(body.activitiesWorked).trim();
    }

    if (body.strengths !== undefined) {
      input.strengths = String(body.strengths).trim();
    }

    if (body.challenges !== undefined) {
      input.challenges = String(body.challenges).trim();
    }

    if (body.homeRecommendations !== undefined) {
      input.homeRecommendations = Array.isArray(body.homeRecommendations)
        ? body.homeRecommendations
        : [];
    }

    if (body.teacherNotes !== undefined) {
      input.teacherNotes = String(body.teacherNotes).trim();
    }

    if (body.media !== undefined) {
      input.media = Array.isArray(body.media) ? body.media : [];
    }

    if (body.visibleToParent !== undefined) {
      input.visibleToParent = Boolean(body.visibleToParent);
    }

    if (body.visibility !== undefined) {
      input.visibility = body.visibility;
    }

    if (Object.keys(input).length === 0) {
      return NextResponse.json(
        { ok: false, message: "No fields to update were provided." },
        { status: 400 }
      );
    }

    const updated = await updateObservation(id, input);

    return NextResponse.json({
      ok: true,
      message: "Observation updated successfully.",
      data: updated,
    });
  } catch (error) {
    console.error("Error updating observation:", error);

    return NextResponse.json(
      { ok: false, message: "Could not update the observation." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthenticatedUid();

    if (!auth) {
      return NextResponse.json(
        { ok: false, message: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const observation = await getObservationById(id);

    if (!observation) {
      return NextResponse.json(
        { ok: false, message: "Observation not found." },
        { status: 404 }
      );
    }

    const isOwner = observation.teacherId === auth.uid;
    const isAdmin = auth.role === "admin";

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { ok: false, message: "Forbidden." },
        { status: 403 }
      );
    }

    await deleteObservation(id);

    return NextResponse.json({
      ok: true,
      message: "Observation deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting observation:", error);

    return NextResponse.json(
      { ok: false, message: "Could not delete the observation." },
      { status: 500 }
    );
  }
}