import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({ email: z.string().email().max(254) });

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
  }
  const email = parsed.data.email.toLowerCase();
  await prisma.newsletterSubscriber.upsert({ where: { email }, create: { email }, update: {} });
  return NextResponse.json({ ok: true });
}
