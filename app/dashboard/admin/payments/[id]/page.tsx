import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import PublicHeader from "@/components/layout/header";
import { adminAuth } from "@/lib/firebase-admin";
import { getUserByUid } from "@/lib/users/user.repository";
import { getTuitionPaymentById } from "@/lib/tuitions/tuition-payment.repository";
import PaymentReviewForm from "./payment-review-form";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function PaymentPage({
  params,
}: Props) {
  const { id } = await params;

  const cookieStore = await cookies();

  const session =
    cookieStore.get("__session")?.value;

  if (!session) {
    redirect(
      `/login?redirectTo=/dashboard/admin/payments/${id}`
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
      `/login?redirectTo=/dashboard/admin/payments/${id}`
    );
  }

  const user =
    await getUserByUid(uid);

  if (!user) {
    redirect("/dashboard");
  }

  if (user.role !== "admin") {
    redirect("/dashboard");
  }

  const payment =
    await getTuitionPaymentById(id);

  if (!payment) {
    notFound();
  }

  return (
    <>
      <PublicHeader />

      <PaymentReviewForm
        payment={payment}
        adminUid={uid}
      />
    </>
  );
}