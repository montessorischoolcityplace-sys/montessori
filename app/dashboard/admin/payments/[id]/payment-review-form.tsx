"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BackButton from "@/components/navegation/back-button";

interface Receipt {
  fileName: string;
  fileUrl: string;
  fileType: string;
}

interface Payment {
  id: string;
  title: string;
  amount: number;
  type: string;
  status: string;
  dueDate?: string;
  receipt?: Receipt;
  reviewNotes?: string;
}

interface Props {
  payment: Payment;
  adminUid: string;
}

function receiptViewerHref(receipt: Receipt) {
  return `/dashboard/documents/view?url=${encodeURIComponent(
    receipt.fileUrl
  )}&type=${encodeURIComponent(receipt.fileType || "")}`;
}

export default function PaymentReviewForm({ payment, adminUid }: Props) {
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [reviewNotes, setReviewNotes] = useState(payment.reviewNotes ?? "");

  async function updateStatus(status: "approved" | "rejected") {
    setSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/tuition-payments/${payment.id}/review`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          reviewedBy: adminUid,
          reviewNotes,
        }),
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : null;

      if (!res.ok) {
        throw new Error(data?.error ?? "Could not update payment.");
      }

      router.push("/dashboard/admin/payments");
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
        .pr-root{
          min-height:calc(100vh - 4rem);
          padding:42px 22px 90px;
          background:
            radial-gradient(circle at top left, rgba(245,195,106,.22), transparent 32%),
            linear-gradient(135deg, #fffaf0, #f7efe2);
          font-family:Outfit,sans-serif;
        }

        .pr-container{
          max-width:1100px;
          margin:0 auto;
        }

        .pr-card{
          background:rgba(255,255,255,.92);
          border-radius:24px;
          padding:28px;
          border:1px solid rgba(210,180,140,.55);
          margin-bottom:22px;
          box-shadow:0 8px 24px rgba(80,45,10,.06);
        }

        .pr-eyebrow{
          color:#c0410c;
          font-size:12px;
          font-weight:700;
          letter-spacing:.16em;
          text-transform:uppercase;
          margin-bottom:8px;
        }

        .pr-title{
          font-family:"Cormorant Garamond",serif;
          font-size:42px;
          color:#1a0f00;
          margin:0 0 8px;
        }

        .pr-subtitle{
          color:#725944;
          line-height:1.6;
        }

        .pr-amount{
          color:#c0410c;
          font-size:32px;
          font-weight:900;
          margin-top:12px;
        }

        .pr-label{
          font-size:12px;
          font-weight:700;
          text-transform:uppercase;
          letter-spacing:.08em;
          color:#5a3a20;
          margin-bottom:6px;
        }

        .pr-input{
          width:100%;
          padding:14px;
          border-radius:15px;
          border:1px solid #d7c4aa;
          background:#fffdf8;
          color:#5a3a20;
          font-family:Outfit,sans-serif;
          outline:none;
          resize:vertical;
        }

        .pr-input:focus{
          border-color:#c0410c;
          color:#c0410c;
          box-shadow:0 0 0 3px rgba(192,65,12,.12);
        }

        .pr-receipt-box{
          border:1px solid #d7c4aa;
          border-radius:18px;
          padding:18px;
          background:#fffdf8;
          display:flex;
          justify-content:space-between;
          gap:16px;
          align-items:center;
        }

        .pr-file-name{
          color:#1a0f00;
          font-weight:800;
        }

        .pr-file-meta{
          color:#725944;
          font-size:13px;
          margin-top:4px;
        }

        .pr-link{
          color:#c0410c;
          font-weight:900;
          text-decoration:none;
        }

        .pr-error{
          background:#fff0eb;
          color:#aa2e0b;
          border:1px solid #f1a38d;
          border-radius:14px;
          padding:13px 16px;
          margin-bottom:18px;
        }

        .pr-buttons{
          display:flex;
          gap:14px;
          flex-wrap:wrap;
          justify-content:flex-end;
        }

        .pr-btn{
          border:none;
          border-radius:15px;
          padding:14px 22px;
          font-weight:800;
          cursor:pointer;
        }

        .pr-btn.approve{
          background:#2c8a46;
          color:white;
        }

        .pr-btn.reject{
          background:#aa2e0b;
          color:white;
        }

        .pr-btn:disabled{
          opacity:.55;
          cursor:not-allowed;
        }

        @media(max-width:640px){
          .pr-receipt-box{
            flex-direction:column;
            align-items:flex-start;
          }
        }
      `}</style>

      <main className="pr-root">
        <div className="pr-container">
          <BackButton
                      label="Back to Payments"
                    />
          <section className="pr-card">
            <div className="pr-eyebrow">Payment review</div>

            <h1 className="pr-title">{payment.title}</h1>

            <p className="pr-subtitle">
              Review the submitted receipt and approve or reject this payment.
            </p>

            <div className="pr-amount">${payment.amount.toFixed(2)}</div>
          </section>

          {error && <div className="pr-error">⚠ {error}</div>}

          <section className="pr-card">
            <h2 className="pr-title" style={{ fontSize: 30 }}>
              Receipt
            </h2>

            {payment.receipt ? (
              <div className="pr-receipt-box">
                <div>
                  <div className="pr-file-name">
                    {payment.receipt.fileName}
                  </div>

                  <div className="pr-file-meta">
                    {payment.receipt.fileType}
                  </div>
                </div>

                <a
                  href={receiptViewerHref(payment.receipt)}
                  target="_blank"
                  rel="noreferrer"
                  className="pr-link"
                >
                  View receipt
                </a>
              </div>
            ) : (
              <p className="pr-subtitle">No receipt has been submitted yet.</p>
            )}
          </section>

          <section className="pr-card">
            <div className="pr-label">Review notes</div>

            <textarea
              className="pr-input"
              rows={5}
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="Write notes for the parent if the receipt is rejected..."
            />
          </section>

          <div className="pr-buttons">
            <button
              className="pr-btn reject"
              disabled={saving}
              onClick={() => updateStatus("rejected")}
            >
              Reject Payment
            </button>

            <button
              className="pr-btn approve"
              disabled={saving}
              onClick={() => updateStatus("approved")}
            >
              Approve Payment
            </button>
          </div>
        </div>
      </main>
    </>
  );
}