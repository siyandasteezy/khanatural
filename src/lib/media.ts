import { mkdir, writeFile, unlink } from "node:fs/promises";
import { join } from "node:path";
import { randomBytes } from "node:crypto";

/**
 * Storage for images uploaded through the admin.
 *
 * Netlify's filesystem is read-only, so there it writes to Netlify Blobs and
 * serves back through /api/media/[...key]/. Self-hosted (`next start`) writes
 * to public/uploads/media/ and serves the file directly, which is faster and
 * keeps a plain filesystem deployment dependency-free.
 *
 * Uploads are downscaled in the browser before they get here, so what arrives
 * is a few hundred KB rather than a multi-megabyte phone photo — Netlify caps
 * a function request body near 6MB, and a customer-facing product shot does not
 * need more than ~1600px anyway.
 */

const STORE = "media";
const LOCAL_DIR = ["public", "uploads", "media"];

export const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

function onNetlify(): boolean {
  return Boolean(process.env.NETLIFY);
}

/** A collision-proof, path-safe name derived from the original. */
function buildKey(originalName: string, type: string): string {
  const ext = EXT_BY_TYPE[type] ?? "jpg";
  const stem =
    originalName
      .replace(/\.[^.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "image";
  return `${stem}-${randomBytes(4).toString("hex")}.${ext}`;
}

export type SavedImage = { url: string; key: string };

export async function saveImage(file: File): Promise<SavedImage> {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error("Please choose a JPG, PNG, WebP or AVIF image.");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("That image is too large. Please choose one under 5MB.");
  }

  const key = buildKey(file.name, file.type);
  const bytes = await file.arrayBuffer();

  if (onNetlify()) {
    const { getStore } = await import("@netlify/blobs");
    const store = getStore(STORE);
    await store.set(key, bytes, {
      metadata: { contentType: file.type, uploadedAt: new Date().toISOString() },
    });
    return { url: `/api/media/${key}`, key };
  }

  const dir = join(process.cwd(), ...LOCAL_DIR);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, key), Buffer.from(bytes));
  return { url: `/uploads/media/${key}`, key };
}

/**
 * Remove a previously uploaded file.
 *
 * Only touches files this module wrote — migrated artwork under
 * /images/ is left alone, so removing an image from a product never deletes
 * the shared original other products may still use.
 */
export async function deleteImage(url: string): Promise<void> {
  const blobKey = url.startsWith("/api/media/") ? url.slice("/api/media/".length) : null;
  const localKey = url.startsWith("/uploads/media/") ? url.slice("/uploads/media/".length) : null;
  const key = blobKey ?? localKey;
  if (!key || key.includes("/") || key.includes("..")) return;

  try {
    if (blobKey) {
      const { getStore } = await import("@netlify/blobs");
      await getStore(STORE).delete(blobKey);
    } else if (localKey) {
      await unlink(join(process.cwd(), ...LOCAL_DIR, localKey));
    }
  } catch {
    // the row is going regardless; a missing file must not block the delete
  }
}
