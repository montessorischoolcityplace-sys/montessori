import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import PublicHeader from "@/components/layout/header";
import { adminAuth } from "@/lib/firebase-admin";
import { getUserByUid } from "@/lib/users/user.repository";
import { getTuitionPayments } from "@/lib/tuitions/tuition-payment.repository";
import GenerateMonthlyButton from "./generate-monthly-button";
import BackButton from "@/components/navegation/back-button";


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

export default async function AdminPaymentsPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("__session")?.value;

  if (!session) {
    redirect("/login?redirectTo=/dashboard/admin/payments");
  }

  let uid = "";

  try {
    const decoded = await adminAuth.verifySessionCookie(session, true);
    uid = decoded.uid;
  } catch {
    redirect("/login?redirectTo=/dashboard/admin/payments");
  }

  const user = await getUserByUid(uid);

  if (!user) redirect("/dashboard");

  if (user.role !== "admin") {
    redirect("/dashboard");
  }

  const payments = await getTuitionPayments();

  const pendingCount = payments.filter((p) => p.status === "pending").length;
  const submittedCount = payments.filter((p) => p.status === "submitted").length;
  const approvedCount = payments.filter((p) => p.status === "approved").length;
  const rejectedCount = payments.filter((p) => p.status === "rejected").length;

  return (
    <>
      <PublicHeader />

      <style>{`
        .ap-root {
          min-height: calc(100vh - 4rem);
          padding: 42px 22px 90px;
          background:
            radial-gradient(circle at top left, rgba(245,195,106,.22), transparent 32%),
            linear-gradient(135deg, #fffaf0, #f7efe2);
          font-family: Outfit, sans-serif;
        }

        .ap-container {
          max-width: 1180px;
          margin: 0 auto;
        }

        .ap-hero {
          background: rgba(255,255,255,.78);
          border: 1px solid rgba(210,180,140,.5);
          border-radius: 28px;
          padding: 30px;
          margin-bottom: 24px;
          box-shadow: 0 10px 30px rgba(80,45,10,.08);
          display: flex;
          justify-content: space-between;
          gap: 20px;
          align-items: flex-start;
        }

        .ap-eyebrow {
          color: #c0410c;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: .16em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .ap-title {
          font-family: "Cormorant Garamond", serif;
          font-size: 44px;
          color: #1a0f00;
          margin: 0 0 8px;
        }

        .ap-subtitle {
          color: #725944;
          line-height: 1.6;
          max-width: 680px;
        }

        .ap-btn {
          background: linear-gradient(135deg, #c0410c, #9a3008);
          color: #fff8ee;
          text-decoration: none;
          padding: 12px 18px;
          border-radius: 14px;
          font-weight: 800;
          white-space: nowrap;
          box-shadow: 0 6px 18px rgba(192,65,12,.25);
        }

        .ap-actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
          align-items: flex-end;
        }

        @media(max-width: 860px) {
          .ap-actions {
            align-items: flex-start;
          }
        }

        .ap-summary {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        .ap-summary-card {
          background: rgba(255,255,255,.92);
          border: 1px solid rgba(210,180,140,.55);
          border-radius: 22px;
          padding: 20px;
          box-shadow: 0 8px 24px rgba(80,45,10,.06);
        }

        .ap-summary-number {
          font-family: "Cormorant Garamond", serif;
          font-size: 36px;
          font-weight: 700;
          color: #1a0f00;
        }

        .ap-summary-label {
          color: #725944;
          font-size: 14px;
          text-transform: capitalize;
        }

        .ap-section-title {
          font-family: "Cormorant Garamond", serif;
          font-size: 30px;
          color: #1a0f00;
          margin: 28px 0 14px;
        }

        .ap-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 18px;
        }

        .ap-card {
          background: rgba(255,255,255,.92);
          border: 1px solid rgba(210,180,140,.55);
          border-radius: 22px;
          padding: 22px;
          text-decoration: none;
          box-shadow: 0 8px 24px rgba(80,45,10,.06);
          transition: transform .15s, border-color .18s, box-shadow .18s;
          display: block;
        }

        .ap-card:hover {
          transform: translateY(-2px);
          border-color: #c0410c;
          box-shadow: 0 12px 28px rgba(80,45,10,.12);
        }

        .ap-card.submitted {
          border-color: #c0410c;
        }

        .ap-card-top {
          display: flex;
          justify-content: space-between;
          gap: 14px;
          align-items: flex-start;
          margin-bottom: 14px;
        }

        .ap-card-title {
          font-family: "Cormorant Garamond", serif;
          font-size: 27px;
          color: #1a0f00;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .ap-type {
          color: #725944;
          font-size: 14px;
          text-transform: capitalize;
        }

        .ap-amount {
          font-size: 24px;
          font-weight: 900;
          color: #c0410c;
          white-space: nowrap;
        }

        .ap-info {
          color: #725944;
          font-size: 14px;
          line-height: 1.7;
        }

        .ap-status {
          display: inline-flex;
          margin-top: 14px;
          padding: 6px 11px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 800;
          text-transform: capitalize;
        }

        .ap-action {
          display: inline-flex;
          margin-top: 14px;
          font-size: 13px;
          color: #c0410c;
          font-weight: 900;
        }

        .ap-empty {
          background: rgba(255,255,255,.92);
          border: 1px dashed rgba(210,180,140,.75);
          border-radius: 22px;
          padding: 34px;
          color: #725944;
          text-align: center;
        }

        @media(max-width: 860px) {
          .ap-summary {
            grid-template-columns: repeat(2, 1fr);
          }

          .ap-grid {
            grid-template-columns: 1fr;
          }

          .ap-hero {
            flex-direction: column;
          }
        }

        @media(max-width: 560px) {
          .ap-summary {
            grid-template-columns: 1fr;
          }

          .ap-title {
            font-size: 36px;
          }

          .ap-card-top {
            flex-direction: column;
          }
        }
      `}</style>

      <main className="ap-root">
        <div className="ap-container">
          <BackButton
                      label="Back"
                    />
          <section className="ap-hero">
            <div>
              <div className="ap-eyebrow">Admin payments</div>
              <h1 className="ap-title">Tuition payments</h1>
              <p className="ap-subtitle">
                Generate monthly billing cycles, review submitted receipts, and monitor
                tuition payments across the school.
              </p>
            </div>

            <div className="ap-actions">
              <GenerateMonthlyButton />

              <Link href="/dashboard/admin/payments/plans" className="ap-btn">
                Tuition plans →
              </Link>
            </div>
          </section>

          <section className="ap-summary">
            <div className="ap-summary-card">
              <div className="ap-summary-number">{pendingCount}</div>
              <div className="ap-summary-label">Pending</div>
            </div>

            <div className="ap-summary-card">
              <div className="ap-summary-number">{submittedCount}</div>
              <div className="ap-summary-label">Submitted</div>
            </div>

            <div className="ap-summary-card">
              <div className="ap-summary-number">{approvedCount}</div>
              <div className="ap-summary-label">Approved</div>
            </div>

            <div className="ap-summary-card">
              <div className="ap-summary-number">{rejectedCount}</div>
              <div className="ap-summary-label">Rejected</div>
            </div>
          </section>

          <h2 className="ap-section-title">Payments</h2>

          {payments.length === 0 ? (
            <div className="ap-empty">There are no payments registered yet.</div>
          ) : (
            <section className="ap-grid">
              {payments.map((payment) => {
                const styles = statusStyle(payment.status);
                const needsReview = payment.status === "submitted";

                return (
                  <Link
                    key={payment.id}
                    href={`/dashboard/admin/payments/${payment.id}`}
                    className={`ap-card ${needsReview ? "submitted" : ""}`}
                  >
                    <div className="ap-card-top">
                      <div>
                        <div className="ap-card-title">{payment.title}</div>
                        <div className="ap-type">{label(payment.type)}</div>
                      </div>

                      <div className="ap-amount">{money(payment.amount)}</div>
                    </div>

                    <div className="ap-info">
                      Student ID: {payment.studentId}
                      <br />
                      Parent ID: {payment.parentId}
                      <br />
                      Billing month: {payment.billingMonth || "N/A"}
                      <br />
                      Due date: {payment.dueDate || "Not set"}
                    </div>

                    <span
                      className="ap-status"
                      style={{
                        backgroundColor: styles.bg,
                        color: styles.color,
                      }}
                    >
                      {label(payment.status)}
                    </span>

                    {needsReview && (
                      <div className="ap-action">Receipt ready for review →</div>
                    )}
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