import { NextRequest, NextResponse } from "next/server";
import {
  createTeacher,
  getTeacherByUid,
  getTeachers,
  getTeachersByProgram,
  getTeachersByStatus,
  updateTeacher,
  deactivateTeacher,
  deleteTeacher,
  assignStudentToTeacher,
  removeStudentFromTeacher,
  assignGroupToTeacher,
  removeGroupFromTeacher,
} from "@/lib/teachers/teacher.repository";
import {
  CreateTeacherInput,
  UpdateTeacherInput,
  TeacherProgram,
  TeacherStatus,
} from "@/lib/teachers/teacher.type";

// ─────────────────────────────────────────────
// GET
// /api/teachers
// /api/teachers?uid=UID
// /api/teachers?program=primary
// /api/teachers?status=active
// ─────────────────────────────────────────────

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const uid = searchParams.get("uid");
    const program = searchParams.get("program");
    const status = searchParams.get("status");

    if (uid) {
      const teacher = await getTeacherByUid(uid);

      if (!teacher) {
        return NextResponse.json(
          { error: "Teacher not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(teacher);
    }

    if (program) {
      const teachers = await getTeachersByProgram(program as TeacherProgram);
      return NextResponse.json(teachers);
    }

    if (status) {
      const teachers = await getTeachersByStatus(status as TeacherStatus);
      return NextResponse.json(teachers);
    }

    const teachers = await getTeachers();
    return NextResponse.json(teachers);
  } catch (error) {
    console.error("GET /api/teachers error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────
// POST
// Crea un docente
// ─────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateTeacherInput;

    if (!body.uid || !body.userId || !body.email) {
      return NextResponse.json(
        { error: "uid, userId and email are required" },
        { status: 400 }
      );
    }

    if (!body.firstName || !body.lastName) {
      return NextResponse.json(
        { error: "firstName and lastName are required" },
        { status: 400 }
      );
    }

    if (!body.classroom || !body.program || !body.hireDate) {
      return NextResponse.json(
        { error: "classroom, program and hireDate are required" },
        { status: 400 }
      );
    }

    if (!body.contractType) {
      return NextResponse.json(
        { error: "contractType is required" },
        { status: 400 }
      );
    }

    if (!body.contact?.phone) {
      return NextResponse.json(
        { error: "contact.phone is required" },
        { status: 400 }
      );
    }

    const teacher = await createTeacher(body);

    return NextResponse.json(teacher, { status: 201 });
  } catch (error) {
    console.error("POST /api/teachers error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────
// PUT
// /api/teachers?uid=UID
// /api/teachers?uid=UID&action=assignStudent
// /api/teachers?uid=UID&action=removeStudent
// /api/teachers?uid=UID&action=assignGroup
// /api/teachers?uid=UID&action=removeGroup
// /api/teachers?uid=UID&action=deactivate
// ─────────────────────────────────────────────

export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const uid = searchParams.get("uid");
    const action = searchParams.get("action");

    if (!uid) {
      return NextResponse.json(
        { error: "uid is required" },
        { status: 400 }
      );
    }

    if (action === "assignStudent") {
      const { studentId } = await req.json();

      if (!studentId) {
        return NextResponse.json(
          { error: "studentId is required" },
          { status: 400 }
        );
      }

      await assignStudentToTeacher(uid, studentId);
      return NextResponse.json({ ok: true });
    }

    if (action === "removeStudent") {
      const { studentId } = await req.json();

      if (!studentId) {
        return NextResponse.json(
          { error: "studentId is required" },
          { status: 400 }
        );
      }

      await removeStudentFromTeacher(uid, studentId);
      return NextResponse.json({ ok: true });
    }

    if (action === "assignGroup") {
      const { groupId } = await req.json();

      if (!groupId) {
        return NextResponse.json(
          { error: "groupId is required" },
          { status: 400 }
        );
      }

      await assignGroupToTeacher(uid, groupId);
      return NextResponse.json({ ok: true });
    }

    if (action === "removeGroup") {
      const { groupId } = await req.json();

      if (!groupId) {
        return NextResponse.json(
          { error: "groupId is required" },
          { status: 400 }
        );
      }

      await removeGroupFromTeacher(uid, groupId);
      return NextResponse.json({ ok: true });
    }

    if (action === "deactivate") {
      await deactivateTeacher(uid);
      return NextResponse.json({ ok: true });
    }

    const body = (await req.json()) as UpdateTeacherInput;

    const teacher = await updateTeacher(uid, body);

    if (!teacher) {
      return NextResponse.json(
        { error: "Teacher not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(teacher);
  } catch (error) {
    console.error("PUT /api/teachers error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────
// DELETE
// /api/teachers?uid=UID
// ─────────────────────────────────────────────

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const uid = searchParams.get("uid");

    if (!uid) {
      return NextResponse.json(
        { error: "uid is required" },
        { status: 400 }
      );
    }

    await deleteTeacher(uid);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/teachers error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}