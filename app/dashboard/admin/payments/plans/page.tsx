import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import PublicHeader from "@/components/layout/header";
import { adminAuth } from "@/lib/firebase-admin";
import { getUserByUid } from "@/lib/users/user.repository";
import { getTuitionPlans } from "@/lib/tuitions/tuition-plan.repository";
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

export default async function TuitionPlansPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("__session")?.value;

  if (!session) {
    redirect("/login?redirectTo=/dashboard/admin/payments/plans");
  }

  let uid = "";

  try {
    const decoded = await adminAuth.verifySessionCookie(session, true);
    uid = decoded.uid;
  } catch {
    redirect("/login?redirectTo=/dashboard/admin/payments/plans");
  }

  const user = await getUserByUid(uid);

  if (!user) redirect("/dashboard");

  if (user.role !== "admin") {
    redirect("/dashboard");
  }

  const plans = await getTuitionPlans();

  return (
    <>
      <PublicHeader />

      <style>{`
        .tp-root {
          min-height: calc(100vh - 4rem);
          padding: 42px 22px 90px;
          background:
            radial-gradient(circle at top left, rgba(245,195,106,.22), transparent 32%),
            linear-gradient(135deg, #fffaf0, #f7efe2);
          font-family: Outfit, sans-serif;
        }

        .tp-container {
          max-width: 1120px;
          margin: 0 auto;
        }

        .tp-hero {
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

        .tp-eyebrow {
          color: #c0410c;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: .16em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .tp-title {
          font-family: "Cormorant Garamond", serif;
          font-size: 44px;
          color: #1a0f00;
          margin: 0 0 8px;
        }

        .tp-subtitle {
          color: #725944;
          line-height: 1.6;
          max-width: 680px;
        }

        .tp-btn {
          background: linear-gradient(135deg, #c0410c, #9a3008);
          color: #fff8ee;
          text-decoration: none;
          padding: 12px 18px;
          border-radius: 14px;
          font-weight: 800;
          white-space: nowrap;
          box-shadow: 0 6px 18px rgba(192,65,12,.25);
        }

        .tp-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 18px;
        }

        .tp-card {
          background: rgba(255,255,255,.92);
          border: 1px solid rgba(210,180,140,.55);
          border-radius: 22px;
          padding: 22px;
          text-decoration: none;
          box-shadow: 0 8px 24px rgba(80,45,10,.06);
          transition: transform .15s, border-color .18s, box-shadow .18s;
          display: block;
        }

        .tp-card:hover {
          transform: translateY(-2px);
          border-color: #c0410c;
          box-shadow: 0 12px 28px rgba(80,45,10,.12);
        }

        .tp-card-top {
          display: flex;
          justify-content: space-between;
          gap: 14px;
          align-items: flex-start;
          margin-bottom: 16px;
        }

        .tp-card-title {
          font-family: "Cormorant Garamond", serif;
          font-size: 28px;
          color: #1a0f00;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .tp-meta {
          color: #725944;
          font-size: 14px;
          text-transform: capitalize;
          line-height: 1.6;
        }

        .tp-status {
          display: inline-flex;
          padding: 6px 11px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 800;
          text-transform: capitalize;
          background: #e9f8ee;
          color: #287a3e;
        }

        .tp-status.inactive {
          background: #eeeeee;
          color: #666666;
        }

        .tp-fees {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-top: 16px;
        }

        .tp-fee {
          border: 1px solid #d7c4aa;
          background: #fffdf8;
          border-radius: 15px;
          padding: 13px;
        }

        .tp-fee-label {
          color: #8a6848;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: .06em;
          text-transform: uppercase;
          margin-bottom: 5px;
        }

        .tp-fee-value {
          color: #c0410c;
          font-weight: 900;
          font-size: 18px;
        }

        .tp-action {
          display: inline-flex;
          margin-top: 16px;
          font-size: 13px;
          color: #c0410c;
          font-weight: 900;
        }

        .tp-empty {
          background: rgba(255,255,255,.92);
          border: 1px dashed rgba(210,180,140,.75);
          border-radius: 22px;
          padding: 34px;
          color: #725944;
          text-align: center;
        }

        @media(max-width: 860px) {
          .tp-grid,
          .tp-fees {
            grid-template-columns: 1fr;
          }

          .tp-hero {
            flex-direction: column;
          }

          .tp-title {
            font-size: 36px;
          }
        }
      `}</style>

      <main className="tp-root">
        <div className="tp-container">
          <BackButton
                      label="Back"
                    />
          <section className="tp-hero">
            <div>
              <div className="tp-eyebrow">Tuition plans</div>
              <h1 className="tp-title">Payment plans</h1>
              <p className="tp-subtitle">
                Define monthly tuition, registration fees, and re-enrollment
                fees by Montessori program and schedule.
              </p>
            </div>

            <Link
              href="/dashboard/admin/payments/plans/new"
              className="tp-btn"
            >
              New plan →
            </Link>
          </section>

          {plans.length === 0 ? (
            <div className="tp-empty">
              No tuition plans have been created yet.
            </div>
          ) : (
            <section className="tp-grid">
              {plans.map((plan) => (
                <Link
                  key={plan.id}
                  href={`/dashboard/admin/payments/plans/${plan.id}/edit`}
                  className="tp-card"
                >
                  <div className="tp-card-top">
                    <div>
                      <div className="tp-card-title">{plan.name}</div>
                      <div className="tp-meta">
                        Program: {label(plan.program)}
                        <br />
                        Schedule: {label(plan.scheduleType)}
                      </div>
                    </div>

                    <span
                      className={`tp-status ${
                        plan.status === "inactive" ? "inactive" : ""
                      }`}
                    >
                      {label(plan.status)}
                    </span>
                  </div>

                  <div className="tp-fees">
                    <div className="tp-fee">
                      <div className="tp-fee-label">Monthly</div>
                      <div className="tp-fee-value">
                        {money(plan.monthlyAmount)}
                      </div>
                    </div>

                    <div className="tp-fee">
                      <div className="tp-fee-label">Registration</div>
                      <div className="tp-fee-value">
                        {money(plan.registrationFee)}
                      </div>
                    </div>

                    <div className="tp-fee">
                      <div className="tp-fee-label">Re-enrollment</div>
                      <div className="tp-fee-value">
                        {money(plan.reenrollmentFee ?? 0)}
                      </div>
                    </div>
                  </div>

                  <div className="tp-action">Edit plan →</div>
                </Link>
              ))}
            </section>
          )}
        </div>
      </main>
    </>
  );
}