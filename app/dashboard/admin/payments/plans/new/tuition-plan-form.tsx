"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BackButton from "@/components/navegation/back-button";

type MontessoriProgram =
  | "infant"
  | "toddler"
  | "primary"
  | "kindergarten";

type ScheduleType = "full_time" | "part_time";

function numberValue(value: string) {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : 0;
}

export default function TuitionPlanForm() {
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [program, setProgram] = useState<MontessoriProgram>("primary");
  const [scheduleType, setScheduleType] =
    useState<ScheduleType>("full_time");

  const [monthlyAmount, setMonthlyAmount] = useState("");
  const [registrationFee, setRegistrationFee] = useState("");
  const [reenrollmentFee, setReenrollmentFee] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/tuition-plans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          program,
          scheduleType,
          monthlyAmount: numberValue(monthlyAmount),
          registrationFee: numberValue(registrationFee),
          reenrollmentFee: reenrollmentFee
            ? numberValue(reenrollmentFee)
            : undefined,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error ?? "Could not create tuition plan.");
      }

      router.push("/dashboard/admin/payments/plans");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <style>{`
        .np-root {
          min-height: calc(100vh - 4rem);
          padding: 42px 22px 90px;
          background:
            radial-gradient(circle at top left, rgba(245,195,106,.22), transparent 32%),
            linear-gradient(135deg, #fffaf0, #f7efe2);
          font-family: Outfit, sans-serif;
        }

        .np-container {
          max-width: 880px;
          margin: 0 auto;
        }

        .np-hero,
        .np-card {
          background: rgba(255,255,255,.92);
          border: 1px solid rgba(210,180,140,.55);
          border-radius: 24px;
          padding: 26px;
          margin-bottom: 20px;
          box-shadow: 0 8px 24px rgba(80,45,10,.06);
        }

        .np-eyebrow {
          color: #c0410c;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: .16em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .np-title {
          font-family: "Cormorant Garamond", serif;
          font-size: 44px;
          color: #1a0f00;
          margin: 0 0 8px;
        }

        .np-subtitle {
          color: #725944;
          line-height: 1.6;
        }

        .np-card-title {
          font-family: "Cormorant Garamond", serif;
          font-size: 29px;
          color: #1a0f00;
          margin-bottom: 16px;
        }

        .np-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .np-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 14px;
        }

        .np-label {
          font-size: 12px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: .06em;
          color: #5a3a20;
        }

        .np-input,
        .np-select {
          border: 1.5px solid #d7c4aa;
          border-radius: 13px;
          padding: 12px 14px;
          background: #fffdf8;
          font-size: 15px;
          outline: none;
          color: #5a3a20;
          font-family: Outfit, sans-serif;
        }

        .np-input:focus,
        .np-select:focus {
          border-color: #c0410c;
          box-shadow: 0 0 0 3px rgba(192,65,12,.12);
          color: #c0410c;
        }

        .np-help {
          color: #725944;
          font-size: 13px;
          line-height: 1.5;
          margin-top: 4px;
        }

        .np-error {
          background: #fff0eb;
          color: #aa2e0b;
          border: 1px solid #f1a38d;
          border-radius: 14px;
          padding: 13px 16px;
          margin-bottom: 18px;
        }

        .np-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }

        .np-btn {
          border: none;
          border-radius: 15px;
          padding: 13px 24px;
          background: linear-gradient(135deg, #c0410c, #9a3008);
          color: #fff8ee;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 6px 18px rgba(192,65,12,.25);
        }

        .np-btn:disabled {
          opacity: .55;
          cursor: not-allowed;
        }

        @media(max-width: 720px) {
          .np-grid {
            grid-template-columns: 1fr;
          }

          .np-title {
            font-size: 36px;
          }
        }
      `}</style>

      <main className="np-root">
        <div className="np-container">
          <BackButton
                      label="Back to Plans"
                    />
          <section className="np-hero">
            <div className="np-eyebrow">New tuition plan</div>
            <h1 className="np-title">Create payment plan</h1>
            <p className="np-subtitle">
              Define tuition amounts for a Montessori program and schedule.
              This plan will be used to create registration and monthly tuition
              payments.
            </p>
          </section>

          {error && <div className="np-error">⚠ {error}</div>}

          <form onSubmit={handleSubmit}>
            <section className="np-card">
              <h2 className="np-card-title">Plan information</h2>

              <div className="np-field">
                <label className="np-label">Plan name *</label>
                <input
                  className="np-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Primary Full-Time 2026"
                  required
                />
                <div className="np-help">
                  Example: Toddler Full-Time, Primary Part-Time, Kindergarten
                  Full-Time.
                </div>
              </div>

              <div className="np-grid">
                <div className="np-field">
                  <label className="np-label">Program *</label>
                  <select
                    className="np-select"
                    value={program}
                    onChange={(e) =>
                      setProgram(e.target.value as MontessoriProgram)
                    }
                    required
                  >
                    <option value="infant">Infant</option>
                    <option value="toddler">Toddler</option>
                    <option value="primary">Primary</option>
                    <option value="kindergarten">Kindergarten</option>
                  </select>
                </div>

                <div className="np-field">
                  <label className="np-label">Schedule *</label>
                  <select
                    className="np-select"
                    value={scheduleType}
                    onChange={(e) =>
                      setScheduleType(e.target.value as ScheduleType)
                    }
                    required
                  >
                    <option value="full_time">Full time</option>
                    <option value="part_time">Part time</option>
                  </select>
                </div>
              </div>
            </section>

            <section className="np-card">
              <h2 className="np-card-title">Amounts</h2>

              <div className="np-grid">
                <div className="np-field">
                  <label className="np-label">Monthly tuition *</label>
                  <input
                    className="np-input"
                    type="number"
                    min="0"
                    step="0.01"
                    value={monthlyAmount}
                    onChange={(e) => setMonthlyAmount(e.target.value)}
                    placeholder="1200.00"
                    required
                  />
                </div>

                <div className="np-field">
                  <label className="np-label">Registration fee *</label>
                  <input
                    className="np-input"
                    type="number"
                    min="0"
                    step="0.01"
                    value={registrationFee}
                    onChange={(e) => setRegistrationFee(e.target.value)}
                    placeholder="500.00"
                    required
                  />
                </div>
              </div>

              <div className="np-field">
                <label className="np-label">Re-enrollment fee</label>
                <input
                  className="np-input"
                  type="number"
                  min="0"
                  step="0.01"
                  value={reenrollmentFee}
                  onChange={(e) => setReenrollmentFee(e.target.value)}
                  placeholder="300.00"
                />
                <div className="np-help">
                  Optional. Use this for yearly re-enrollment after the first
                  school year.
                </div>
              </div>
            </section>

            <div className="np-actions">
              <button className="np-btn" disabled={saving}>
                {saving ? "Creating..." : "Create plan"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}