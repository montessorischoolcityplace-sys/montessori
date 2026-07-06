import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import PublicHeader from "@/components/layout/header";
import { adminAuth } from "@/lib/firebase-admin";
import { getUserByUid } from "@/lib/users/user.repository";
import { getObservationById } from "@/lib/observations/observation.repository";
import EditObservationForm from "./edit-observation-form";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditObservationPage({ params }: PageProps) {
  const { id } = await params;

  const cookieStore = await cookies();
  const session = cookieStore.get("__session")?.value;

  if (!session) {
    redirect(`/login?redirectTo=/dashboard/teacher/observations/${id}/edit`);
  }

  let uid = "";

  try {
    const decoded = await adminAuth.verifySessionCookie(session, true);
    uid = decoded.uid;
  } catch {
    redirect(`/login?redirectTo=/dashboard/teacher/observations/${id}/edit`);
  }

  const user = await getUserByUid(uid);

  if (!user) redirect("/dashboard");

  if (user.role !== "teacher" && user.role !== "admin") {
    redirect("/dashboard");
  }

  const observation = await getObservationById(id);

  if (!observation) notFound();

  const canEdit = user.role === "admin" || observation.teacherId === uid;

  if (!canEdit) {
    redirect("/dashboard/teacher/observations");
  }

  return (
    <>
      <PublicHeader />
      <EditObservationForm observation={observation} />
    </>
  );
}