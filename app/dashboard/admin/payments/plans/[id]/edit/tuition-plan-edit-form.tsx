"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BackButton from "@/components/navegation/back-button";

type TuitionPlanStatus = "active" | "inactive";

type MontessoriProgram =
  | "infant"
  | "toddler"
  | "primary"
  | "kindergarten";

type ScheduleType = "full_time" | "part_time";

interface TuitionPlan {
  id: string;
  name: string;
  program: MontessoriProgram;
  scheduleType: ScheduleType;
  monthlyAmount: number;
  registrationFee: number;
  reenrollmentFee?: number;
  currency: "USD";
  status: TuitionPlanStatus;
}

interface Props {
  plan: TuitionPlan;
}

function numberValue(value: string) {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : 0;
}

export default function TuitionPlanEditForm({ plan }: Props) {
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState(plan.name);
  const [monthlyAmount, setMonthlyAmount] = useState(
    String(plan.monthlyAmount ?? 0)
  );
  const [registrationFee, setRegistrationFee] = useState(
    String(plan.registrationFee ?? 0)
  );
  const [reenrollmentFee, setReenrollmentFee] = useState(
    plan.reenrollmentFee !== undefined ? String(plan.reenrollmentFee) : ""
  );
  const [status, setStatus] = useState<TuitionPlanStatus>(plan.status);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/tuition-plans/${plan.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          monthlyAmount: numberValue(monthlyAmount),
          registrationFee: numberValue(registrationFee),
          reenrollmentFee: reenrollmentFee
            ? numberValue(reenrollmentFee)
            : undefined,
          status,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error ?? "Could not update tuition plan.");
      }

      router.push("/dashboard/admin/payments/plans");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this tuition plan?"
    );

    if (!confirmed) return;

    setDeleting(true);
    setError("");

    try {
      const res = await fetch(`/api/tuition-plans/${plan.id}`, {
        method: "DELETE",
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error ?? "Could not delete tuition plan.");
      }

      router.push("/dashboard/admin/payments/plans");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <style>{`
        .ep-root {
          min-height: calc(100vh - 4rem);
          padding: 42px 22px 90px;
          background:
            radial-gradient(circle at top left, rgba(245,195,106,.22), transparent 32%),
            linear-gradient(135deg, #fffaf0, #f7efe2);
          font-family: Outfit, sans-serif;
        }

        .ep-container {
          max-width: 880px;
          margin: 0 auto;
        }

        .ep-hero,
        .ep-card {
          background: rgba(255,255,255,.92);
          border: 1px solid rgba(210,180,140,.55);
          border-radius: 24px;
          padding: 26px;
          margin-bottom: 20px;
          box-shadow: 0 8px 24px rgba(80,45,10,.06);
        }

        .ep-eyebrow {
          color: #c0410c;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: .16em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .ep-title {
          font-family: "Cormorant Garamond", serif;
          font-size: 44px;
          color: #1a0f00;
          margin: 0 0 8px;
        }

        .ep-subtitle {
          color: #725944;
          line-height: 1.6;
        }

        .ep-card-title {
          font-family: "Cormorant Garamond", serif;
          font-size: 29px;
          color: #1a0f00;
          margin-bottom: 16px;
        }

        .ep-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .ep-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 14px;
        }

        .ep-label {
          font-size: 12px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: .06em;
          color: #5a3a20;
        }

        .ep-input,
        .ep-select,
        .ep-readonly {
          border: 1.5px solid #d7c4aa;
          border-radius: 13px;
          padding: 12px 14px;
          background: #fffdf8;
          font-size: 15px;
          outline: none;
          color: #5a3a20;
          font-family: Outfit, sans-serif;
        }

        .ep-readonly {
          background: #f7efe2;
          color: #725944;
        }

        .ep-input:focus,
        .ep-select:focus {
          border-color: #c0410c;
          box-shadow: 0 0 0 3px rgba(192,65,12,.12);
          color: #c0410c;
        }

        .ep-help {
          color: #725944;
          font-size: 13px;
          line-height: 1.5;
          margin-top: 4px;
        }

        .ep-error {
          background: #fff0eb;
          color: #aa2e0b;
          border: 1px solid #f1a38d;
          border-radius: 14px;
          padding: 13px 16px;
          margin-bottom: 18px;
        }

        .ep-actions {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }

        .ep-btn {
          border: none;
          border-radius: 15px;
          padding: 13px 24px;
          font-weight: 800;
          cursor: pointer;
        }

        .ep-btn.primary {
          background: linear-gradient(135deg, #c0410c, #9a3008);
          color: #fff8ee;
          box-shadow: 0 6px 18px rgba(192,65,12,.25);
        }

        .ep-btn.danger {
          background: #fff0eb;
          color: #aa2e0b;
          border: 1px solid #f1a38d;
        }

        .ep-btn:disabled {
          opacity: .55;
          cursor: not-allowed;
        }

        @media(max-width: 720px) {
          .ep-grid {
            grid-template-columns: 1fr;
          }

          .ep-title {
            font-size: 36px;
          }
        }
      `}</style>

      <main className="ep-root">
        <div className="ep-container">
          <BackButton
                      label="Back to Plans"
                    />
          <section className="ep-hero">
            <div className="ep-eyebrow">Edit tuition plan</div>
            <h1 className="ep-title">{plan.name}</h1>
            <p className="ep-subtitle">
              Update tuition amounts and status for this Montessori payment
              plan. Program and schedule are shown for reference.
            </p>
          </section>

          {error && <div className="ep-error">⚠ {error}</div>}

          <form onSubmit={handleSubmit}>
            <section className="ep-card">
              <h2 className="ep-card-title">Plan information</h2>

              <div className="ep-field">
                <label className="ep-label">Plan name *</label>
                <input
                  className="ep-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="ep-grid">
                <div className="ep-field">
                  <label className="ep-label">Program</label>
                  <div className="ep-readonly">{plan.program.replaceAll("_", " ")}</div>
                </div>

                <div className="ep-field">
                  <label className="ep-label">Schedule</label>
                  <div className="ep-readonly">
                    {plan.scheduleType.replaceAll("_", " ")}
                  </div>
                </div>
              </div>

              <div className="ep-field">
                <label className="ep-label">Status</label>
                <select
                  className="ep-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TuitionPlanStatus)}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <div className="ep-help">
                  Inactive plans will not be used for new automatic payment
                  generation.
                </div>
              </div>
            </section>

            <section className="ep-card">
              <h2 className="ep-card-title">Amounts</h2>

              <div className="ep-grid">
                <div className="ep-field">
                  <label className="ep-label">Monthly tuition *</label>
                  <input
                    className="ep-input"
                    type="number"
                    min="0"
                    step="0.01"
                    value={monthlyAmount}
                    onChange={(e) => setMonthlyAmount(e.target.value)}
                    required
                  />
                </div>

                <div className="ep-field">
                  <label className="ep-label">Registration fee *</label>
                  <input
                    className="ep-input"
                    type="number"
                    min="0"
                    step="0.01"
                    value={registrationFee}
                    onChange={(e) => setRegistrationFee(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="ep-field">
                <label className="ep-label">Re-enrollment fee</label>
                <input
                  className="ep-input"
                  type="number"
                  min="0"
                  step="0.01"
                  value={reenrollmentFee}
                  onChange={(e) => setReenrollmentFee(e.target.value)}
                />
                <div className="ep-help">
                  Optional annual fee used when students continue into the next
                  school year.
                </div>
              </div>
            </section>

            <div className="ep-actions">
              <button
                type="button"
                className="ep-btn danger"
                disabled={saving || deleting}
                onClick={handleDelete}
              >
                {deleting ? "Deleting..." : "Delete plan"}
              </button>

              <button
                className="ep-btn primary"
                disabled={saving || deleting}
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}