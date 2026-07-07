import { NextResponse } from "next/server";

/**
 * Serves e-Mag PDFs uploaded through the admin on Netlify, where they live in
 * Netlify Blobs instead of the (read-only) public/ directory. Self-hosted
 * deployments serve uploads straight from /uploads/emag/ and never hit this.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { getStore } = await import("@netlify/blobs");
  const store = getStore("emag");
  const pdf = await store.get(`${slug}.pdf`, { type: "arrayBuffer" });
  if (!pdf) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return new Response(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${slug}.pdf"`,
      // issues are immutable per slug upload; let the CDN cache for a day
      "Cache-Control": "public, max-age=86400",
    },
  });
}
