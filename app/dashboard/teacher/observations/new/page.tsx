import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import PublicHeader from "@/components/layout/header";
import { adminAuth } from "@/lib/firebase-admin";
import { getUserByUid } from "@/lib/users/user.repository";
import { getActiveStudents } from "@/lib/students/student.repository";
import NewObservationForm from "./new-observation-form";
import BackButton from "@/components/navegation/back-button";

export default async function NewObservationPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("__session")?.value;

  if (!session) {
    redirect("/login?redirectTo=/dashboard/teacher/observations/new");
  }

  let uid = "";

  try {
    const decoded = await adminAuth.verifySessionCookie(session, true);
    uid = decoded.uid;
  } catch {
    redirect("/login?redirectTo=/dashboard/teacher/observations/new");
  }

  const user = await getUserByUid(uid);

  if (!user) redirect("/dashboard");

  if (user.role !== "teacher" && user.role !== "admin") {
    redirect("/dashboard");
  }

  const students = await getActiveStudents();

  return (
    <>
      <PublicHeader />
      <NewObservationForm teacherUid={uid} students={students} />
    </>
  );
}