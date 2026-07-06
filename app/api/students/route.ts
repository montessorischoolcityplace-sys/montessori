import { NextRequest, NextResponse } from "next/server";
import {
  createStudent,
  getStudents,
  getStudentsByParent,
  getStudentsByTeacher,
  getStudentsByStatus,
  getStudentById,
  updateStudent,
  deleteStudent,
} from "@/lib/students/student.repository";
import {
  CreateStudentInput,
  UpdateStudentInput,
  EnrollmentStatus,
} from "@/lib/students/student.type";
import { getActiveTuitionPlan } from "@/lib/tuitions/tuition-plan.repository";
import {
  createTuitionPayment,
  getRegistrationPaymentByStudent,
} from "@/lib/tuitions/tuition-payment.repository";



// ─────────────────────────────────────────────
// GET
// /api/students
// /api/students?id=STUDENT_ID
// /api/students?parentId=UID
// /api/students?teacherId=UID
// /api/students?status=submitted
// ─────────────────────────────────────────────

const ENROLLMENT_STATUSES = [
  "draft",
  "submitted",
  "needs_correction",
  "approved",
  "rejected",
  "active",
  "inactive",
] as const;

function isEnrollmentStatus(value: string): value is EnrollmentStatus {
  return ENROLLMENT_STATUSES.includes(value as EnrollmentStatus);
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const id = searchParams.get("id");
    const parentId = searchParams.get("parentId");
    const teacherId = searchParams.get("teacherId");
    const status = searchParams.get("status");

    if (id) {
      const student = await getStudentById(id);

      if (!student) {
        return NextResponse.json(
          { error: "Student not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(student);
    }

    if (parentId) {
      const students = await getStudentsByParent(parentId);
      return NextResponse.json(students);
    }

    if (teacherId) {
      const students = await getStudentsByTeacher(teacherId);
      return NextResponse.json(students);
    }

    if (status) {
      if (!isEnrollmentStatus(status)) {
        return NextResponse.json(
          { error: "Invalid enrollment status" },
          { status: 400 }
        );
      }

      const students = await getStudentsByStatus(status);
      return NextResponse.json(students);
    }

    const students = await getStudents();

    return NextResponse.json(students);
  } catch (error) {
    console.error("GET /api/students error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────
// POST
// Crea un alumno nuevo
// ─────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateStudentInput;

    if (!body.firstName || !body.lastName || !body.dateOfBirth) {
      return NextResponse.json(
        { error: "firstName, lastName and dateOfBirth are required" },
        { status: 400 }
      );
    }

    if (!body.parentId) {
      return NextResponse.json(
        { error: "parentId is required" },
        { status: 400 }
      );
    }

    if (!body.relationshipToStudent) {
      return NextResponse.json(
        { error: "relationshipToStudent is required" },
        { status: 400 }
      );
    }

    if (!body.gender) {
      return NextResponse.json(
        { error: "gender is required" },
        { status: 400 }
      );
    }

    if (!body.primaryLanguage) {
      return NextResponse.json(
        { error: "primaryLanguage is required" },
        { status: 400 }
      );
    }

    if (!body.program || !body.desiredStartDate || !body.scheduleType) {
      return NextResponse.json(
        {
          error:
            "program, desiredStartDate and scheduleType are required",
        },
        { status: 400 }
      );
    }

    if (!body.attendanceDays || body.attendanceDays.length === 0) {
      return NextResponse.json(
        { error: "At least one attendance day is required" },
        { status: 400 }
      );
    }

    if (!body.medicalInfo) {
      return NextResponse.json(
        { error: "medicalInfo is required" },
        { status: 400 }
      );
    }

    if (!body.vaccination) {
      return NextResponse.json(
        { error: "vaccination is required" },
        { status: 400 }
      );
    }

    if (!body.emergencyContacts || body.emergencyContacts.length === 0) {
      return NextResponse.json(
        { error: "At least one emergency contact is required" },
        { status: 400 }
      );
    }

    const student = await createStudent(body);

    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    console.error("POST /api/students error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────
// PUT
// Actualiza alumno por id
// /api/students?id=STUDENT_ID
// ─────────────────────────────────────────────

export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Student id is required" },
        { status: 400 }
      );
    }

    const body = (await req.json()) as UpdateStudentInput;

    if (
      body.enrollmentStatus !== undefined &&
      !isEnrollmentStatus(body.enrollmentStatus)
    ) {
      return NextResponse.json(
        { error: "Invalid enrollment status" },
        { status: 400 }
      );
    }

    const previousStudent = await getStudentById(id);

    if (!previousStudent) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    const student = await updateStudent(id, body);

    if (!student) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    let paymentGeneration:
      | {
          attempted: boolean;
          created: boolean;
          reason?: string;
          paymentId?: string;
        }
      | undefined;

    const changedToApproved =
      previousStudent.enrollmentStatus !== "approved" &&
      body.enrollmentStatus === "approved";

    if (!changedToApproved) {
      paymentGeneration = {
        attempted: false,
        created: false,
        reason: `No registration payment generated. Previous status: ${previousStudent.enrollmentStatus}, requested status: ${body.enrollmentStatus ?? "not provided"}.`,
      };
    }

    if (changedToApproved) {
      paymentGeneration = {
        attempted: true,
        created: false,
      };

      const parentId = student.parentIds[0];

      if (!parentId) {
        paymentGeneration.reason =
          "Student approved, but the student does not have a parent assigned.";

        return NextResponse.json({
          student,
          paymentGeneration,
        });
      }

      const existingRegistrationPayment =
        await getRegistrationPaymentByStudent(student.id);

      if (existingRegistrationPayment) {
        paymentGeneration.reason =
          "Registration payment already exists for this student.";
        paymentGeneration.paymentId = existingRegistrationPayment.id;

        return NextResponse.json({
          student,
          paymentGeneration,
        });
      }

      const plan = await getActiveTuitionPlan(
        student.program,
        student.scheduleType
      );

      if (!plan) {
        return NextResponse.json(
          {
            error: "No active tuition plan found.",
            debug: {
              studentProgram: student.program,
              studentScheduleType: student.scheduleType,
            },
          },
          { status: 400 }
        );
      }

      const payment = await createTuitionPayment({
        studentId: student.id,
        parentId,
        type: "registration",
        title: "Registration Fee",
        description:
          "Initial registration payment required to activate enrollment.",
        amount: plan.registrationFee,
        dueDate: new Date().toISOString().slice(0, 10),
      });

      paymentGeneration.created = true;
      paymentGeneration.paymentId = payment.id;
    }

    return NextResponse.json({
      student,
      paymentGeneration,
    });
  } catch (error) {
    console.error("PUT /api/students error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────
// DELETE
// Elimina alumno por id
// /api/students?id=STUDENT_ID
// ─────────────────────────────────────────────

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Student id is required" },
        { status: 400 }
      );
    }

    const existingStudent = await getStudentById(id);

    if (!existingStudent) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    await deleteStudent(id);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/students error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}