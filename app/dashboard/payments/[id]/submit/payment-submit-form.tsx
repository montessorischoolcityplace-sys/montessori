"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BackButton from "@/components/navegation/back-button";

interface Receipt {
  fileName: string;
  fileUrl: string;
  fileType: string;
  publicId: string;
  resourceType: string;
}

interface Payment {
  id: string;
  title: string;
  amount: number;
  status: string;
  receipt?: Receipt;
}

interface Props {
  payment: Payment;
  parentUid: string;
}

const ACCOUNT_NUMBER = "453180825";
const ACH_ROUTING_NUMBER = "111000614";
const WIRE_ROUTING_NUMBER = "021000021";

export default function PaymentSubmitForm({ payment }: Props) {
  const router = useRouter();

  const [receipt, setReceipt] = useState<Receipt | undefined>(payment.receipt);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  function receiptViewerHref(receipt: Receipt) {
    return `/dashboard/documents/view?url=${encodeURIComponent(
      receipt.fileUrl
    )}&type=${encodeURIComponent(receipt.fileType || "")}`;
  }

  async function copyText(value: string, label: string) {
    await navigator.clipboard.writeText(value);
    setCopied(label);
    window.setTimeout(() => setCopied(""), 1800);
  }

  async function readJsonSafe(res: Response) {
    const text = await res.text();
    if (!text) return null;

    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  }

  async function deleteReceipt() {
    if (!receipt) return;

    setError("");

    try {
      const res = await fetch("/api/upload/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          publicId: receipt.publicId,
          resourceType: receipt.resourceType,
        }),
      });

      const data = await readJsonSafe(res);

      if (!res.ok) {
        throw new Error(data?.message ?? "Could not remove receipt.");
      }

      setReceipt(undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove receipt.");
    }
  }

  async function uploadFile(file: File) {
    setUploading(true);
    setProgress(0);
    setError("");

    const interval = window.setInterval(() => {
      setProgress((p) => Math.min(p + 10, 90));
    }, 250);

    try {
      const formData = new FormData();

      formData.append("file", file);
      formData.append("folder", "montessori/payments");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await readJsonSafe(res);

      if (!res.ok || !data?.url) {
        throw new Error(data?.message ?? "Upload failed.");
      }

      setProgress(100);

      setReceipt({
        fileName: file.name,
        fileUrl: data.url,
        fileType: data.fileType ?? file.type,
        publicId: data.publicId,
        resourceType: data.resourceType,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      window.clearInterval(interval);
      setUploading(false);
    }
  }

  async function replaceFile(file: File) {
    if (receipt) {
      await deleteReceipt();
    }

    await uploadFile(file);
  }

  async function submitPayment() {
    if (!receipt) {
      setError("Please upload a payment receipt first.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/tuition-payments/${payment.id}/submit`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          receipt: {
            fileName: receipt.fileName,
            fileUrl: receipt.fileUrl,
            fileType: receipt.fileType,
            publicId: receipt.publicId,
            resourceType: receipt.resourceType,
            uploadedAt: new Date().toISOString(),
          },
        }),
      });

      const data = await readJsonSafe(res);

      if (!res.ok) {
        throw new Error(data?.error ?? "Could not submit payment.");
      }

      router.push(`/dashboard/payments/${payment.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit payment.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <style>{`
        .pay-root{
          min-height:calc(100vh - 4rem);
          padding:42px 22px 90px;
          background:
            radial-gradient(circle at top left, rgba(245,195,106,.22), transparent 32%),
            linear-gradient(135deg, #fffaf0, #f7efe2);
          font-family:Outfit,sans-serif;
        }

        .pay-container{
          max-width:960px;
          margin:0 auto;
        }

        .pay-card{
          background:rgba(255,255,255,.92);
          border-radius:24px;
          padding:28px;
          border:1px solid rgba(210,180,140,.55);
          margin-bottom:20px;
          box-shadow:0 8px 24px rgba(80,45,10,.06);
        }

        .pay-eyebrow{
          color:#c0410c;
          font-size:12px;
          font-weight:800;
          letter-spacing:.16em;
          text-transform:uppercase;
          margin-bottom:8px;
        }

        .pay-title{
          font-family:"Cormorant Garamond",serif;
          font-size:44px;
          color:#1a0f00;
          margin:0 0 8px;
        }

        .pay-subtitle{
          color:#725944;
          line-height:1.6;
          margin:0;
        }

        .pay-amount{
          color:#c0410c;
          font-size:34px;
          font-weight:900;
          margin-top:14px;
        }

        .pay-grid{
          display:grid;
          grid-template-columns:repeat(3,1fr);
          gap:14px;
          margin-top:18px;
        }

        .pay-bank-box{
          background:#fffdf8;
          border:1px solid #d7c4aa;
          border-radius:18px;
          padding:16px;
        }

        .pay-label{
          font-size:11px;
          font-weight:900;
          text-transform:uppercase;
          letter-spacing:.08em;
          color:#8a6848;
          margin-bottom:7px;
        }

        .pay-number{
          color:#1a0f00;
          font-size:20px;
          font-weight:900;
          margin-bottom:10px;
          word-break:break-all;
        }

        .copy-btn{
          border:none;
          border-radius:12px;
          padding:9px 12px;
          background:#fff3d8;
          color:#a5420b;
          font-weight:800;
          cursor:pointer;
        }

        .pay-note{
          margin-top:16px;
          padding:15px;
          border-radius:16px;
          background:#fff3e7;
          color:#7a4314;
          border:1px solid #f1c08b;
          line-height:1.6;
          font-size:14px;
        }

        .pay-upload{
          border:2px dashed #d7c4aa;
          border-radius:18px;
          padding:22px;
          background:#fffdf8;
        }

        .pay-upload-title{
          font-family:"Cormorant Garamond",serif;
          font-size:28px;
          color:#1a0f00;
          margin:0 0 8px;
        }

        .pay-upload-text{
          color:#725944;
          line-height:1.6;
          margin-bottom:16px;
        }

        .pay-progress{
          height:10px;
          background:#eee;
          border-radius:999px;
          overflow:hidden;
          margin-top:12px;
        }

        .pay-progress-fill{
          height:100%;
          background:#c0410c;
        }

        .receipt-box{
          margin-top:18px;
          padding:16px;
          border:1px solid #d7c4aa;
          border-radius:16px;
          background:#fffaf0;
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap:16px;
        }

        .receipt-name{
          color:#1a0f00;
          font-weight:900;
          margin-bottom:4px;
        }

        .receipt-actions{
          display:flex;
          gap:10px;
          flex-wrap:wrap;
        }

        .link-btn,
        .remove-btn{
          border:none;
          border-radius:12px;
          padding:10px 13px;
          font-weight:800;
          text-decoration:none;
          cursor:pointer;
        }

        .link-btn{
          background:#fff3d8;
          color:#a5420b;
        }

        .remove-btn{
          background:#fff0eb;
          color:#aa2e0b;
        }

        .pay-error{
          background:#fff0eb;
          color:#aa2e0b;
          border:1px solid #f1a38d;
          border-radius:14px;
          padding:13px 16px;
          margin-bottom:18px;
          font-weight:700;
        }

        .pay-success{
          color:#2c8a46;
          font-size:13px;
          font-weight:800;
          margin-top:10px;
        }

        .pay-btn{
          background:linear-gradient(135deg,#c0410c,#9a3008);
          color:white;
          border:none;
          border-radius:15px;
          padding:14px 22px;
          font-weight:800;
          cursor:pointer;
          box-shadow:0 8px 24px rgba(192,65,12,.25);
        }

        .pay-btn:disabled{
          opacity:.55;
          cursor:not-allowed;
        }

        @media(max-width:780px){
          .pay-grid{
            grid-template-columns:1fr;
          }

          .receipt-box{
            flex-direction:column;
            align-items:flex-start;
          }

          .pay-title{
            font-size:36px;
          }
        }
      `}</style>

      <main className="pay-root">
        <div className="pay-container">
          <BackButton label="Back"/>
          <section className="pay-card">
            <div className="pay-eyebrow">Payment instructions</div>

            <h1 className="pay-title">Submit Payment</h1>

            <p className="pay-subtitle">
              Please complete your bank transfer using the account information
              below. After sending the payment, upload your receipt in this
              section. The administrator will review the receipt and either
              approve it or reject it with a reason. If rejected, you may upload
              a new receipt and submit it again.
            </p>

            <div className="pay-amount">${payment.amount.toFixed(2)}</div>

            <p className="pay-subtitle" style={{ marginTop: 6 }}>
              {payment.title}
            </p>
          </section>

          <section className="pay-card">
            <div className="pay-eyebrow">Bank transfer details</div>

            <div className="pay-grid">
              <div className="pay-bank-box">
                <div className="pay-label">Account number</div>
                <div className="pay-number">{ACCOUNT_NUMBER}</div>
                <button
                  type="button"
                  className="copy-btn"
                  onClick={() => copyText(ACCOUNT_NUMBER, "Account number")}
                >
                  Copy
                </button>
              </div>

              <div className="pay-bank-box">
                <div className="pay-label">ACH / Direct deposit routing</div>
                <div className="pay-number">{ACH_ROUTING_NUMBER}</div>
                <button
                  type="button"
                  className="copy-btn"
                  onClick={() => copyText(ACH_ROUTING_NUMBER, "ACH routing")}
                >
                  Copy
                </button>
              </div>

              <div className="pay-bank-box">
                <div className="pay-label">Wire transfer routing</div>
                <div className="pay-number">{WIRE_ROUTING_NUMBER}</div>
                <button
                  type="button"
                  className="copy-btn"
                  onClick={() => copyText(WIRE_ROUTING_NUMBER, "Wire routing")}
                >
                  Copy
                </button>
              </div>
            </div>

            {copied && (
              <div className="pay-success">{copied} copied to clipboard.</div>
            )}

            <div className="pay-note">
              Use routing number <strong>{ACH_ROUTING_NUMBER}</strong> for ACH
              or direct deposit transactions. Use routing number{" "}
              <strong>{WIRE_ROUTING_NUMBER}</strong> only for wire transfers.
              Please confirm the correct transfer type with your bank before
              sending the payment.
            </div>
          </section>

          <section className="pay-card">
            <h2 className="pay-upload-title">Upload receipt</h2>

            <p className="pay-upload-text">
              Upload a PDF or image showing your transfer confirmation. Accepted
              formats: PDF, JPG, PNG and WEBP.
            </p>

            <div className="pay-upload">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                onChange={async (e) => {
                  const file = e.target.files?.[0];

                  if (!file) return;

                  await replaceFile(file);
                }}
              />
            </div>

            {uploading && (
              <div className="pay-progress">
                <div
                  className="pay-progress-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}

            {receipt && (
              <div className="receipt-box">
                <div>
                  <div className="receipt-name">{receipt.fileName}</div>
                  <div className="pay-subtitle">{receipt.fileType}</div>
                </div>

                <div className="receipt-actions">
                  <a
                    href={receiptViewerHref(receipt)}
                    target="_blank"
                    rel="noreferrer"
                    className="link-btn"
                  >
                    View
                  </a>

                  <button
                    type="button"
                    className="remove-btn"
                    onClick={deleteReceipt}
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </section>

          {error && <div className="pay-error">⚠ {error}</div>}

          <button
            className="pay-btn"
            onClick={submitPayment}
            disabled={saving || uploading}
          >
            {saving ? "Submitting..." : "Submit receipt for review"}
          </button>
        </div>
      </main>
    </>
  );
}