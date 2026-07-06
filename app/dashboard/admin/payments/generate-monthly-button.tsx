"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function GenerateMonthlyButton() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [summary, setSummary] = useState<{
    billingMonth: string;
    title: string;
    created: number;
    skipped: number;
    totalStudents: number;
  } | null>(null);
  const [error, setError] = useState("");

  async function generateMonthlyPayments() {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      setSummary(null);
      const res = await fetch(
        "/api/tuition-payments/generate-monthly",
        {
          method: "POST",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error ??
            "Could not generate monthly payments."
        );
      }

      setMessage(data.message);

      setSummary({
        billingMonth: data.billingMonth,
        title: data.title,
        created: data.created,
        skipped: data.skipped,
        totalStudents: data.totalStudents,
      });

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unexpected error."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        .gm-wrapper{
          display:flex;
          flex-direction:column;
          gap:14px;
          align-items:flex-start;
        }

        .gm-btn{
          background:
            linear-gradient(
              135deg,
              #c0410c,
              #9a3008
            );
          color:white;
          border:none;
          border-radius:16px;
          padding:14px 22px;
          font-weight:700;
          cursor:pointer;
          box-shadow:
            0 8px 24px
            rgba(192,65,12,.25);
          transition:.2s;
        }

        .gm-btn:hover{
          transform:translateY(-2px);
        }

        .gm-btn:disabled{
          opacity:.6;
          cursor:not-allowed;
          transform:none;
        }

        .gm-success{
          color:#2c8a46;
          font-weight:600;
        }

        .gm-summary{
          width:100%;
          margin-top:16px;
          background:#fffdf8;
          border:1px solid #ead9c0;
          border-radius:18px;
          padding:18px;
        }

        .gm-summary h4{
          margin:0 0 12px;
          font-size:18px;
          color:#1a0f00;
        }

        .gm-summary-item{
          display:flex;
          justify-content:space-between;
          margin-bottom:8px;
          color:#5a3a20;
        }

        .gm-summary strong{
          color:#c0410c;
        }

        .gm-error{
          color:#aa2e0b;
          font-weight:600;
        }
      `}</style>

      <div className="gm-wrapper">
        <button
          className="gm-btn"
          disabled={loading}
          onClick={generateMonthlyPayments}
        >
          {loading
            ? "Generating..."
            : "Generate Monthly Tuition"}
        </button>

        {message && (
          <div className="gm-success">
            {message}
          </div>
        )}

        {summary && (
          <div className="gm-summary">

            <h4>
              Billing Cycle
            </h4>

            <div className="gm-summary-item">
              <span>Month</span>
              <strong>{summary.billingMonth}</strong>
            </div>

            <div className="gm-summary-item">
              <span>Title</span>
              <strong>{summary.title}</strong>
            </div>

            <div className="gm-summary-item">
              <span>Students</span>
              <strong>{summary.totalStudents}</strong>
            </div>

            <div className="gm-summary-item">
              <span>Payments created</span>
              <strong>{summary.created}</strong>
            </div>

            <div className="gm-summary-item">
              <span>Skipped</span>
              <strong>{summary.skipped}</strong>
            </div>

          </div>
        )}

        {error && (
          <div className="gm-error">
            {error}
          </div>
        )}
      </div>
    </>
  );
}