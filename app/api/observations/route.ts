import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUid } from "@/lib/auth-helper";
import {
  createObservation,
  getObservationsByStudent,
  getObservationsByTeacher,
} from "@/lib/observations/observation.repository";
import { getStudentById } from "@/lib/students/student.repository";
import {
  CreateObservationInput,
  ObservationArea,
  ObservationMood,
} from "@/lib/observations/observation.type";

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthenticatedUid();
    console.log("OBSERVATION AUTH:", auth);

    if (!auth) {
      return NextResponse.json(
        { ok: false, message: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const studentId = request.nextUrl.searchParams.get("studentId");

    if (!studentId) {
      if (auth.role !== "teacher" && auth.role !== "admin") {
        return NextResponse.json(
          { ok: false, message: "studentId is required." },
          { status: 400 }
        );
      }

      const observations = await getObservationsByTeacher(auth.uid);

      return NextResponse.json({
        ok: true,
        data: observations,
      });
    }

    const student = await getStudentById(studentId);

    if (!student) {
      return NextResponse.json(
        { ok: false, message: "Student not found." },
        { status: 404 }
      );
    }

    const isAdmin = auth.role === "admin";
    const isTeacher = auth.role === "teacher" && student.teacherId === auth.uid;
    const isParent = student.parentIds.includes(auth.uid);

    if (!isAdmin && !isTeacher && !isParent) {
      return NextResponse.json(
        { ok: false, message: "Forbidden." },
        { status: 403 }
      );
    }

    const observations = await getObservationsByStudent(studentId, {
      onlyVisibleToParent: isParent && !isAdmin && !isTeacher,
    });

    return NextResponse.json({
      ok: true,
      data: observations,
    });
  } catch (error) {
    console.error("Error fetching observations:", error);

    return NextResponse.json(
      { ok: false, message: "Could not retrieve observations." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthenticatedUid();

    if (!auth) {
      return NextResponse.json(
        { ok: false, message: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    if (auth.role !== "teacher" && auth.role !== "admin") {
      return NextResponse.json(
        { ok: false, message: "Only teachers can create observations." },
        { status: 403 }
      );
    }

    const body = await request.json();

    const studentId = String(body.studentId ?? "").trim();
    const observationDate = String(body.observationDate ?? "").trim();
    const area = body.area as ObservationArea;
    const mood = (body.mood ?? "not_observed") as ObservationMood;

    const title = String(body.title ?? "").trim();
    const sessionSummary = String(body.sessionSummary ?? "").trim();
    const activitiesWorked = String(body.activitiesWorked ?? "").trim();

    const strengths =
      body.strengths !== undefined ? String(body.strengths).trim() : undefined;

    const challenges =
      body.challenges !== undefined ? String(body.challenges).trim() : undefined;

    const teacherNotes =
      body.teacherNotes !== undefined
        ? String(body.teacherNotes).trim()
        : undefined;

    const homeRecommendations = Array.isArray(body.homeRecommendations)
      ? body.homeRecommendations
      : [];

    const media = Array.isArray(body.media) ? body.media : [];

    const visibleToParent = Boolean(body.visibleToParent);

    if (!studentId) {
      return NextResponse.json(
        { ok: false, message: "studentId is required." },
        { status: 400 }
      );
    }

    if (!observationDate) {
      return NextResponse.json(
        { ok: false, message: "observationDate is required." },
        { status: 400 }
      );
    }

    if (!area) {
      return NextResponse.json(
        { ok: false, message: "Observation area is required." },
        { status: 400 }
      );
    }

    if (!title) {
      return NextResponse.json(
        { ok: false, message: "Title is required." },
        { status: 400 }
      );
    }

    if (!sessionSummary) {
      return NextResponse.json(
        { ok: false, message: "Session summary is required." },
        { status: 400 }
      );
    }

    if (!activitiesWorked) {
      return NextResponse.json(
        { ok: false, message: "Activities worked is required." },
        { status: 400 }
      );
    }

    const student = await getStudentById(studentId);

    if (!student) {
      return NextResponse.json(
        { ok: false, message: "Student not found." },
        { status: 404 }
      );
    }

    if (auth.role === "teacher" && student.enrollmentStatus !== "active") {
      return NextResponse.json(
        { ok: false, message: "Only active students can receive observations." },
        { status: 403 }
      );
    }

    const input: CreateObservationInput = {
      studentId,
      teacherId: auth.uid,
      observationDate,
      area,
      mood,
      title,
      sessionSummary,
      activitiesWorked,
      strengths,
      challenges,
      homeRecommendations,
      teacherNotes,
      media,
      visibleToParent,
    };

    const observation = await createObservation(input);

    return NextResponse.json(
      {
        ok: true,
        message: "Observation created successfully.",
        data: observation,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating observation:", error);

    return NextResponse.json(
      { ok: false, message: "Could not create the observation." },
      { status: 500 }
    );
  }
}