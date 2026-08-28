import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Yoco Checkout integration.
 *
 * Flow (per Yoco's guide): create a checkout server-side, redirect the customer
 * to `redirectUrl`, and treat the *webhook* as the only proof of payment.
 * The successUrl is just where the browser lands — a customer can reach it
 * without paying, so it must never mark an order paid.
 *
 * Docs: https://developer.yoco.com/online/api-reference/checkout/payments/accept-payments/
 */

const API_BASE = "https://payments.yoco.com/api";

export type YocoCheckout = {
  id: string;
  redirectUrl: string;
  status: "created" | "started" | "processing" | "completed";
  processingMode: "live" | "test";
};

export class YocoError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly body?: string,
  ) {
    super(message);
    this.name = "YocoError";
  }
}

function secretKey(): string {
  const key = process.env.YOCO_SECRET_KEY;
  if (!key) throw new YocoError("YOCO_SECRET_KEY is not set");
  return key;
}

/** True when Yoco is configured — lets checkout fall back rather than 500. */
export function isYocoConfigured(): boolean {
  return Boolean(process.env.YOCO_SECRET_KEY);
}

export type CheckoutLineItem = {
  displayName: string;
  quantity: number;
  pricingDetails: { price: number };
};

export async function createCheckout(input: {
  /** total in cents — the same minor units the order is stored in */
  amountCents: number;
  currency?: string;
  successUrl: string;
  cancelUrl: string;
  failureUrl: string;
  /** echoed back on the webhook, and how we find the order again */
  metadata: Record<string, string>;
  lineItems?: CheckoutLineItem[];
  /** our order id, for reconciliation in the Yoco dashboard */
  externalId?: string;
  /** safe to retry the same order without creating a second checkout */
  idempotencyKey?: string;
}): Promise<YocoCheckout> {
  const res = await fetch(`${API_BASE}/checkouts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      "Content-Type": "application/json",
      ...(input.idempotencyKey ? { "Idempotency-Key": input.idempotencyKey } : {}),
    },
    body: JSON.stringify({
      amount: input.amountCents,
      currency: input.currency ?? "ZAR",
      successUrl: input.successUrl,
      cancelUrl: input.cancelUrl,
      failureUrl: input.failureUrl,
      metadata: input.metadata,
      ...(input.lineItems ? { lineItems: input.lineItems } : {}),
      ...(input.externalId ? { externalId: input.externalId } : {}),
    }),
  });

  const text = await res.text();
  if (!res.ok) {
    throw new YocoError(`Yoco checkout failed (${res.status})`, res.status, text.slice(0, 500));
  }

  const json = JSON.parse(text) as YocoCheckout;
  if (!json.redirectUrl || !json.id) {
    throw new YocoError("Yoco checkout response missing redirectUrl or id", res.status, text.slice(0, 500));
  }
  return json;
}

/**
 * Verify a webhook against the `webhook-signature` header.
 *
 * Yoco signs `{webhook-id}.{webhook-timestamp}.{raw body}` with HMAC-SHA256,
 * keyed on the base64-decoded secret (after stripping the `whsec_` prefix), and
 * sends the result base64-encoded. The header holds a space-separated list of
 * `v1,<signature>` entries, so a rotating secret can publish several at once —
 * a match on any one is a pass.
 *
 * The body MUST be the exact bytes received: re-serialising parsed JSON changes
 * key order and whitespace, and the signature will never match.
 */
export function verifyWebhookSignature(input: {
  id: string;
  timestamp: string;
  signatureHeader: string;
  rawBody: string;
  secret: string;
  /** reject replays; Yoco recommends 3 minutes */
  toleranceSeconds?: number;
}): { valid: boolean; reason?: string } {
  const { id, timestamp, signatureHeader, rawBody, secret } = input;
  if (!id || !timestamp || !signatureHeader) return { valid: false, reason: "missing webhook headers" };

  const sentAt = Number(timestamp);
  if (!Number.isFinite(sentAt)) return { valid: false, reason: "bad webhook-timestamp" };
  const tolerance = input.toleranceSeconds ?? 180;
  const drift = Math.abs(Date.now() / 1000 - sentAt);
  if (drift > tolerance) return { valid: false, reason: `timestamp outside ${tolerance}s tolerance` };

  const secretBytes = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  if (secretBytes.length === 0) return { valid: false, reason: "malformed webhook secret" };

  const expected = createHmac("sha256", secretBytes).update(`${id}.${timestamp}.${rawBody}`).digest();

  // header looks like "v1,<sig> v1,<sig2>"
  for (const part of signatureHeader.split(" ")) {
    const candidate = part.includes(",") ? part.slice(part.indexOf(",") + 1) : part;
    const bytes = Buffer.from(candidate, "base64");
    if (bytes.length === expected.length && timingSafeEqual(bytes, expected)) {
      return { valid: true };
    }
  }
  return { valid: false, reason: "no matching signature" };
}

export type YocoWebhookEvent = {
  id: string;
  type: string; // "payment.succeeded" | "payment.failed"
  createdDate: string;
  payload: {
    id: string;
    type: string;
    status: string;
    amount: number;
    currency: string;
    mode: "live" | "test";
    metadata?: Record<string, string>;
    paymentMethodDetails?: {
      type?: string;
      card?: { maskedCard?: string; scheme?: string };
    };
  };
};
