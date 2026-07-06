import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import PublicHeader from "@/components/layout/header";
import { adminAuth } from "@/lib/firebase-admin";
import { getUserByUid } from "@/lib/users/user.repository";
import { getTuitionPlanById } from "@/lib/tuitions/tuition-plan.repository";
import TuitionPlanEditForm from "./tuition-plan-edit-form";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditTuitionPlanPage({ params }: PageProps) {
  const { id } = await params;

  const cookieStore = await cookies();
  const session = cookieStore.get("__session")?.value;

  if (!session) {
    redirect(`/login?redirectTo=/dashboard/admin/payments/plans/${id}/edit`);
  }

  let uid = "";

  try {
    const decoded = await adminAuth.verifySessionCookie(session, true);
    uid = decoded.uid;
  } catch {
    redirect(`/login?redirectTo=/dashboard/admin/payments/plans/${id}/edit`);
  }

  const user = await getUserByUid(uid);

  if (!user) redirect("/dashboard");

  if (user.role !== "admin") {
    redirect("/dashboard");
  }

  const plan = await getTuitionPlanById(id);

  if (!plan) notFound();

  return (
    <>
      <PublicHeader />
      <TuitionPlanEditForm plan={plan} />
    </>
  );
}