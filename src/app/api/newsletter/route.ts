import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  email: z.string().email().max(254),
  name: z.string().max(120).optional().default(""),
  source: z.enum(["newsletter", "emag-download", "emag-reader"]).optional().default("newsletter"),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
  }
  const { name, source } = parsed.data;
  const email = parsed.data.email.toLowerCase();
  await prisma.newsletterSubscriber.upsert({
    where: { email },
    create: { email, name: name.trim(), source },
    // an existing subscriber re-submitting with a name fills the gap; never blank one out
    update: name.trim() ? { name: name.trim() } : {},
  });
  return NextResponse.json({ ok: true });
}
