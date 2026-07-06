import { redirect } from "next/navigation";
import PublicHeader from "@/components/layout/header";

interface PageProps {
  searchParams: Promise<{
    url?: string;
    type?: string;
  }>;
}

export default async function DocumentViewerPage({ searchParams }: PageProps) {
  const { url, type } = await searchParams;

  if (!url) redirect("/dashboard/students");

  const isPdf = type === "application/pdf";

  const viewerUrl = isPdf
    ? `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(
        url
      )}`
    : url;

  return (
    <>
      <PublicHeader />

      <main
        style={{
          minHeight: "calc(100vh - 4rem)",
          background: "#fffaf0",
          padding: "24px",
        }}
      >
        <iframe
          src={viewerUrl}
          style={{
            width: "100%",
            height: "calc(100vh - 8rem)",
            border: "1px solid #d7c4aa",
            borderRadius: "18px",
            background: "#fff",
          }}
        />
      </main>
    </>
  );
}