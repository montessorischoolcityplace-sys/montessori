import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import PublicHeader from "@/components/layout/header";
import { adminAuth } from "@/lib/firebase-admin";
import { getUserByUid } from "@/lib/users/user.repository";
import { getTuitionPaymentById } from "@/lib/tuitions/tuition-payment.repository";
import PaymentSubmitForm from "./payment-submit-form";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function SubmitPaymentPage({
  params,
}: PageProps) {
  const { id } = await params;

  const cookieStore = await cookies();

  const session =
    cookieStore.get("__session")?.value;

  if (!session) {
    redirect(
      `/login?redirectTo=/dashboard/payments/${id}/submit`
    );
  }

  let uid = "";

  try {
    const decoded =
      await adminAuth.verifySessionCookie(
        session,
        true
      );

    uid = decoded.uid;
  } catch {
    redirect(
      `/login?redirectTo=/dashboard/payments/${id}/submit`
    );
  }

  const user =
    await getUserByUid(uid);

  if (!user) {
    redirect("/dashboard");
  }

  if (user.role !== "parent") {
    redirect("/dashboard");
  }

  const payment =
    await getTuitionPaymentById(id);

  if (!payment) {
    notFound();
  }

  if (payment.parentId !== uid) {
    redirect("/dashboard/payments");
  }

  return (
    <>
      <PublicHeader />

      <PaymentSubmitForm
        payment={payment}
        parentUid={uid}
      />
    </>
  );
}