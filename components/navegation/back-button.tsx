"use client";

import { useRouter } from "next/navigation";

interface Props {
  label?: string;
}

export default function BackButton({
  label = "Back",
}: Props) {
  const router = useRouter();

  return (
    <>
      <style>{`
        .back-btn{
          display:inline-flex;
          align-items:center;
          gap:10px;

          border:none;
          cursor:pointer;

          padding:12px 18px;
          margin: 10px 0;

          border-radius:16px;

          background:
            linear-gradient(
              135deg,
              #ffffff,
              #f9f4ea
            );

          border:1px solid rgba(210,180,140,.55);

          color:#5a3a20;

          font-family:Outfit,sans-serif;
          font-weight:700;

          transition:.18s;

          box-shadow:
            0 8px 20px rgba(80,45,10,.08);
        }

        .back-btn:hover{

          transform:translateY(-2px);

          border-color:#1d5fa6;

          color:#1d5fa6;

          box-shadow:
            0 12px 26px rgba(29,95,166,.18);
        }

        .back-icon{

          width:34px;
          height:34px;

          display:flex;
          align-items:center;
          justify-content:center;

          border-radius:12px;

          background:#e8f3ff;

          font-size:18px;
        }

      `}</style>

      <button
        className="back-btn"
        onClick={() => router.back()}
      >
        <span className="back-icon">
          ←
        </span>

        {label}
      </button>
    </>
  );
}