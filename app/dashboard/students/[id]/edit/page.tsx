import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import PublicHeader from "@/components/layout/header";
import { adminAuth } from "@/lib/firebase-admin";
import { getUserByUid } from "@/lib/users/user.repository";
import { getStudentById } from "@/lib/students/student.repository";
import StudentReviewForm from "./student-review-form";
import StudentCorrectionForm from "./student-correction-form";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

const EDITABLE_PARENT_STATUSES = ["draft", "needs_correction"] as const;

export default async function EditStudentPage({ params }: PageProps) {
  const { id } = await params;

  const cookieStore = await cookies();
  const session = cookieStore.get("__session")?.value;

  if (!session) {
    redirect(`/login?redirectTo=/dashboard/students/${id}/edit`);
  }

  let uid = "";

  try {
    const decoded = await adminAuth.verifySessionCookie(session, true);
    uid = decoded.uid;
  } catch {
    redirect(`/login?redirectTo=/dashboard/students/${id}/edit`);
  }

  const user = await getUserByUid(uid);

  if (!user) {
    redirect("/dashboard");
  }

  const student = await getStudentById(id);

  if (!student) {
    notFound();
  }

  const isAdmin = user.role === "admin";

  const isParentOwner =
    user.role === "parent" && student.parentIds.includes(uid);

  const parentCanCorrect =
    isParentOwner &&
    EDITABLE_PARENT_STATUSES.includes(
      student.enrollmentStatus as (typeof EDITABLE_PARENT_STATUSES)[number]
    );

  if (!isAdmin && !parentCanCorrect) {
    redirect(`/dashboard/students/${id}`);
  }

  return (
    <>
      <PublicHeader />

      {isAdmin ? (
        <StudentReviewForm student={student} adminUid={uid} />
      ) : (
        <StudentCorrectionForm student={student} parentUid={uid} />
      )}
    </>
  );
}