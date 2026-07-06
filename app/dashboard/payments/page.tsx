import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import PublicHeader from "@/components/layout/header";
import { adminAuth } from "@/lib/firebase-admin";
import { getUserByUid } from "@/lib/users/user.repository";
import { getPaymentsByParent } from "@/lib/tuitions/tuition-payment.repository";
import BackButton from "@/components/navegation/back-button";

function money(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function label(value: string) {
  return value.replaceAll("_", " ");
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

export default async function PaymentsPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("__session")?.value;

  if (!session) redirect("/login?redirectTo=/dashboard/payments");

  let uid = "";

  try {
    const decoded = await adminAuth.verifySessionCookie(session, true);
    uid = decoded.uid;
  } catch {
    redirect("/login?redirectTo=/dashboard/payments");
  }

  const user = await getUserByUid(uid);

  if (!user) redirect("/dashboard");

  if (user.role !== "parent") {
    redirect("/dashboard");
  }

  const payments = await getPaymentsByParent(uid);

  const pendingCount = payments.filter((p) => p.status === "pending").length;
  const submittedCount = payments.filter((p) => p.status === "submitted").length;
  const approvedCount = payments.filter((p) => p.status === "approved").length;

  return (
    <>
      <PublicHeader />

      <style>{`
        .pay-root {
          min-height: calc(100vh - 4rem);
          padding: 42px 22px 90px;
          background:
            radial-gradient(circle at top left, rgba(245,195,106,.22), transparent 32%),
            linear-gradient(135deg, #fffaf0, #f7efe2);
          font-family: Outfit, sans-serif;
        }

        .pay-container {
          max-width: 1120px;
          margin: 0 auto;
        }

        .pay-hero {
          background: rgba(255,255,255,.78);
          border: 1px solid rgba(210,180,140,.5);
          border-radius: 28px;
          padding: 30px;
          margin-bottom: 24px;
          box-shadow: 0 10px 30px rgba(80,45,10,.08);
        }

        .pay-eyebrow {
          color: #c0410c;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: .16em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .pay-title {
          font-family: "Cormorant Garamond", serif;
          font-size: 44px;
          color: #1a0f00;
          margin: 0 0 8px;
        }

        .pay-subtitle {
          color: #725944;
          line-height: 1.6;
          max-width: 680px;
        }

        .pay-summary {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 22px;
        }

        .pay-summary-card,
        .pay-card,
        .pay-empty {
          background: rgba(255,255,255,.92);
          border: 1px solid rgba(210,180,140,.55);
          border-radius: 22px;
          padding: 20px;
          box-shadow: 0 8px 24px rgba(80,45,10,.06);
        }

        .pay-summary-number {
          font-family: "Cormorant Garamond", serif;
          font-size: 36px;
          font-weight: 700;
          color: #1a0f00;
        }

        .pay-summary-label {
          color: #725944;
          font-size: 14px;
          text-transform: capitalize;
        }

        .pay-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 18px;
        }

        .pay-card {
          text-decoration: none;
          display: block;
          transition: transform .15s, border-color .18s, box-shadow .18s;
        }

        .pay-card:hover {
          transform: translateY(-2px);
          border-color: #c0410c;
          box-shadow: 0 12px 28px rgba(80,45,10,.12);
        }

        .pay-card-top {
          display: flex;
          justify-content: space-between;
          gap: 14px;
          align-items: flex-start;
          margin-bottom: 14px;
        }

        .pay-card-title {
          font-family: "Cormorant Garamond", serif;
          font-size: 27px;
          color: #1a0f00;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .pay-type {
          color: #725944;
          font-size: 14px;
          text-transform: capitalize;
        }

        .pay-amount {
          font-size: 24px;
          font-weight: 800;
          color: #c0410c;
          white-space: nowrap;
        }

        .pay-info {
          color: #725944;
          font-size: 14px;
          line-height: 1.7;
        }

        .pay-status {
          display: inline-flex;
          margin-top: 14px;
          padding: 6px 11px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 800;
          text-transform: capitalize;
        }

        .pay-empty {
          color: #725944;
          text-align: center;
          padding: 36px;
        }

        @media(max-width: 760px) {
          .pay-summary,
          .pay-grid {
            grid-template-columns: 1fr;
          }

          .pay-title {
            font-size: 36px;
          }

          .pay-card-top {
            flex-direction: column;
          }
        }
      `}</style>

      <main className="pay-root">
        <div className="pay-container">
          <BackButton
                                    label="Back"
                                  />
          <section className="pay-hero">
            <div className="pay-eyebrow">Tuition & fees</div>
            <h1 className="pay-title">Payments</h1>
            <p className="pay-subtitle">
              View your pending tuition payments, submit receipts, and review
              your approved payment history.
            </p>
          </section>

          <section className="pay-summary">
            <div className="pay-summary-card">
              <div className="pay-summary-number">{pendingCount}</div>
              <div className="pay-summary-label">Pending</div>
            </div>

            <div className="pay-summary-card">
              <div className="pay-summary-number">{submittedCount}</div>
              <div className="pay-summary-label">Submitted</div>
            </div>

            <div className="pay-summary-card">
              <div className="pay-summary-number">{approvedCount}</div>
              <div className="pay-summary-label">Approved</div>
            </div>
          </section>

          {payments.length === 0 ? (
            <div className="pay-empty">
              No tuition payments have been assigned yet.
            </div>
          ) : (
            <section className="pay-grid">
              {payments.map((payment) => {
                const styles = statusStyle(payment.status);

                return (
                  <Link
                    key={payment.id}
                    href={`/dashboard/payments/${payment.id}`}
                    className="pay-card"
                  >
                    <div className="pay-card-top">
                      <div>
                        <div className="pay-card-title">{payment.title}</div>
                        <div className="pay-type">{label(payment.type)}</div>
                      </div>

                      <div className="pay-amount">{money(payment.amount)}</div>
                    </div>

                    <div className="pay-info">
                      Due date: {payment.dueDate || "Not set"}
                      <br />
                      {payment.description || "No additional description."}
                    </div>

                    <span
                      className="pay-status"
                      style={{
                        backgroundColor: styles.bg,
                        color: styles.color,
                      }}
                    >
                      {label(payment.status)}
                    </span>
                  </Link>
                );
              })}
            </section>
          )}
        </div>
      </main>
    </>
  );
}