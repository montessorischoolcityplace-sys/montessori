import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import PublicHeader from "@/components/layout/header";
import { adminAuth } from "@/lib/firebase-admin";
import { getUserByUid } from "@/lib/users/user.repository";
import { getTuitionPaymentById } from "@/lib/tuitions/tuition-payment.repository";
import BackButton from "@/components/navegation/back-button";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

function money(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function label(value?: string) {
  return value ? value.replaceAll("_", " ") : "Not provided";
}

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  pending: { bg: "#fff3d8", color: "#a5420b" },
  submitted: { bg: "#e8f1ff", color: "#1d5fa6" },
  approved: { bg: "#e9f8ee", color: "#287a3e" },
  rejected: { bg: "#fff0eb", color: "#aa2e0b" },
  cancelled: { bg: "#eeeeee", color: "#666666" },
};

function statusStyle(status: string) {
  return STATUS_STYLES[status] ?? STATUS_STYLES.pending;
}

function receiptViewerHref(receipt: {
  fileUrl: string;
  fileType: string;
}) {
  return `/dashboard/documents/view?url=${encodeURIComponent(
    receipt.fileUrl
  )}&type=${encodeURIComponent(receipt.fileType || "")}`;
}

export default async function PaymentDetailPage({ params }: PageProps) {
  const { id } = await params;

  const cookieStore = await cookies();
  const session = cookieStore.get("__session")?.value;

  if (!session) {
    redirect(`/login?redirectTo=/dashboard/payments/${id}`);
  }

  let uid = "";

  try {
    const decoded = await adminAuth.verifySessionCookie(session, true);
    uid = decoded.uid;
  } catch {
    redirect(`/login?redirectTo=/dashboard/payments/${id}`);
  }

  const user = await getUserByUid(uid);

  if (!user) redirect("/dashboard");

  const payment = await getTuitionPaymentById(id);

  if (!payment) notFound();

  if (user.role === "parent" && payment.parentId !== uid) {
    redirect("/dashboard/payments");
  }

  const styles = statusStyle(payment.status);
  const canSubmit =
    user.role === "parent" &&
    (payment.status === "pending" || payment.status === "rejected");

  return (
    <>
      <PublicHeader />

      <style>{`
        .pd-root {
          min-height: calc(100vh - 4rem);
          padding: 42px 22px 90px;
          background:
            radial-gradient(circle at top left, rgba(245,195,106,.22), transparent 32%),
            linear-gradient(135deg, #fffaf0, #f7efe2);
          font-family: Outfit, sans-serif;
        }

        .pd-container {
          max-width: 940px;
          margin: 0 auto;
        }

        .pd-hero,
        .pd-card {
          background: rgba(255,255,255,.92);
          border: 1px solid rgba(210,180,140,.55);
          border-radius: 24px;
          padding: 26px;
          margin-bottom: 20px;
          box-shadow: 0 8px 24px rgba(80,45,10,.06);
        }

        .pd-eyebrow {
          color: #c0410c;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: .16em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .pd-title {
          font-family: "Cormorant Garamond", serif;
          font-size: 44px;
          color: #1a0f00;
          margin: 0 0 8px;
        }

        .pd-subtitle {
          color: #725944;
          line-height: 1.6;
        }

        .pd-status {
          display: inline-flex;
          padding: 6px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 800;
          text-transform: capitalize;
          margin-top: 14px;
        }

        .pd-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .pd-info-box {
          border: 1px solid #d7c4aa;
          border-radius: 16px;
          padding: 16px;
          background: #fffdf8;
        }

        .pd-label {
          color: #8a6848;
          font-size: 12px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: .06em;
          margin-bottom: 6px;
        }

        .pd-value {
          color: #1a0f00;
          font-size: 18px;
          font-weight: 700;
          text-transform: capitalize;
        }

        .pd-amount {
          color: #c0410c;
          font-size: 32px;
          font-weight: 900;
        }

        .pd-card-title {
          font-family: "Cormorant Garamond", serif;
          font-size: 29px;
          color: #1a0f00;
          margin-bottom: 16px;
        }

        .pd-receipt {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 14px;
          border: 1px solid #d7c4aa;
          border-radius: 16px;
          padding: 16px;
          background: #fffdf8;
        }

        .pd-link {
          color: #c0410c;
          font-weight: 800;
          text-decoration: none;
        }

        .pd-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 20px;
        }

        .pd-btn {
          background: linear-gradient(135deg, #c0410c, #9a3008);
          color: #fff8ee;
          text-decoration: none;
          padding: 13px 20px;
          border-radius: 15px;
          font-weight: 800;
          box-shadow: 0 6px 18px rgba(192,65,12,.25);
        }

        .pd-back {
          color: #c0410c;
          font-weight: 800;
          text-decoration: none;
        }

        .pd-notes {
          color: #725944;
          line-height: 1.7;
        }

        @media(max-width: 720px) {
          .pd-grid {
            grid-template-columns: 1fr;
          }

          .pd-title {
            font-size: 36px;
          }

          .pd-receipt {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>

      <main className="pd-root">
        <div className="pd-container">
          <BackButton label="Back to Payments"/>

          <section className="pd-hero" style={{ marginTop: 18 }}>
            <div className="pd-eyebrow">Payment detail</div>
            <h1 className="pd-title">{payment.title}</h1>
            <p className="pd-subtitle">
              Review the payment details and submit your receipt when payment
              has been completed.
            </p>

            <span
              className="pd-status"
              style={{
                backgroundColor: styles.bg,
                color: styles.color,
              }}
            >
              {label(payment.status)}
            </span>
          </section>

          <section className="pd-card">
            <h2 className="pd-card-title">Payment information</h2>

            <div className="pd-grid">
              <div className="pd-info-box">
                <div className="pd-label">Amount</div>
                <div className="pd-amount">{money(payment.amount)}</div>
              </div>

              <div className="pd-info-box">
                <div className="pd-label">Due date</div>
                <div className="pd-value">{payment.dueDate || "Not set"}</div>
              </div>

              <div className="pd-info-box">
                <div className="pd-label">Type</div>
                <div className="pd-value">{label(payment.type)}</div>
              </div>

              <div className="pd-info-box">
                <div className="pd-label">Currency</div>
                <div className="pd-value">{payment.currency}</div>
              </div>
            </div>
          </section>

          <section className="pd-card">
            <h2 className="pd-card-title">Description</h2>
            <p className="pd-notes">
              {payment.description || "No additional description."}
            </p>
          </section>

          <section className="pd-card">
            <h2 className="pd-card-title">Receipt</h2>

            {payment.receipt ? (
              <div className="pd-receipt">
                <div>
                  <div className="pd-value">{payment.receipt.fileName}</div>
                  <div className="pd-notes">
                    Uploaded at: {payment.receipt.uploadedAt}
                  </div>
                </div>

                <Link
                  href={receiptViewerHref(payment.receipt)}
                  target="_blank"
                  className="pd-link"
                >
                  View receipt
                </Link>
              </div>
            ) : (
              <p className="pd-notes">No receipt has been submitted yet.</p>
            )}

            {payment.reviewNotes && (
              <p className="pd-notes" style={{ marginTop: 16 }}>
                <strong>Review notes:</strong>
                <br />
                {payment.reviewNotes}
              </p>
            )}

            {canSubmit && (
              <div className="pd-actions">
                <Link
                  href={`/dashboard/payments/${payment.id}/submit`}
                  className="pd-btn"
                >
                  Submit receipt →
                </Link>
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}