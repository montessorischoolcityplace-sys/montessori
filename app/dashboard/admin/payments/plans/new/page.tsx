import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import PublicHeader from "@/components/layout/header";
import { adminAuth } from "@/lib/firebase-admin";
import { getUserByUid } from "@/lib/users/user.repository";
import TuitionPlanForm from "./tuition-plan-form";

export default async function NewTuitionPlanPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("__session")?.value;

  if (!session) {
    redirect("/login?redirectTo=/dashboard/admin/payments/plans/new");
  }

  let uid = "";

  try {
    const decoded = await adminAuth.verifySessionCookie(session, true);
    uid = decoded.uid;
  } catch {
    redirect("/login?redirectTo=/dashboard/admin/payments/plans/new");
  }

  const user = await getUserByUid(uid);

  if (!user) redirect("/dashboard");

  if (user.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <>
      <PublicHeader />
      <TuitionPlanForm />
    </>
  );
}