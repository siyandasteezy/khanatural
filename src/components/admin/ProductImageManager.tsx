"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { addProductImage, deleteProductImage, makeProductImagePrimary } from "@/app/admin/actions";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";

type ProductImage = { id: string; url: string; alt: string };

/** Longest edge of a stored product photo. The storefront never renders one
 *  larger than this, and it keeps a phone photo well inside Netlify's ~6MB
 *  function request limit. */
const MAX_EDGE = 1600;
const QUALITY = 0.85;

/**
 * Downscale and re-encode in the browser before upload.
 *
 * A modern phone photo is 4–12MB, which would be rejected by the serverless
 * request limit and is far more than a product card needs. WebP is used because
 * it keeps transparency (a PNG cut-out would go black as JPEG); if the browser
 * cannot encode it, JPEG is the fallback.
 */
async function downscale(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((b) => (b ? resolve(b) : canvas.toBlob(resolve, "image/jpeg", QUALITY)), "image/webp", QUALITY);
  });
  if (!blob) return file;

  const ext = blob.type === "image/webp" ? "webp" : "jpg";
  const stem = file.name.replace(/\.[^.]+$/, "");
  return new File([blob], `${stem}.${ext}`, { type: blob.type });
}

export function ProductImageManager({ productId, images }: { productId: string; images: ProductImage[] }) {
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const altRef = useRef<HTMLInputElement>(null);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    if (!file.type.startsWith("image/")) {
      setError("That file isn’t an image.");
      e.target.value = "";
      return;
    }

    setBusy("Preparing image…");
    let prepared: File;
    try {
      prepared = await downscale(file);
    } catch {
      setError("Couldn’t read that image. Try a JPG or PNG.");
      setBusy(null);
      e.target.value = "";
      return;
    }

    setBusy("Uploading…");
    const fd = new FormData();
    fd.set("image", prepared);
    fd.set("alt", altRef.current?.value ?? "");
    startTransition(async () => {
      await addProductImage(productId, fd);
      setBusy(null);
      if (fileRef.current) fileRef.current.value = "";
      if (altRef.current) altRef.current.value = "";
    });
  }

  return (
    <div>
      <ul className="grid grid-cols-3 gap-3">
        {images.map((img, i) => (
          <li key={img.id} className="group relative">
            <div className="relative aspect-square overflow-hidden rounded-xl bg-sand-100 ring-1 ring-sand-200">
              <Image src={img.url} alt={img.alt} fill sizes="120px" className="object-cover" />
              {i === 0 && (
                <span className="absolute left-1 top-1 rounded-md bg-kelp-900/85 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-sand-50">
                  Main
                </span>
              )}
            </div>
            <div className="mt-1 flex gap-1">
              {i !== 0 && (
                <button
                  type="button"
                  onClick={() => startTransition(() => makeProductImagePrimary(img.id))}
                  className="flex-1 rounded-md bg-sand-100 py-1 text-[10px] font-semibold text-kelp-800 hover:bg-sand-200"
                  title="Use as the main product photo"
                >
                  Make main
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  if (!confirm("Remove this image from the product?")) return;
                  startTransition(() => deleteProductImage(img.id));
                }}
                className="flex-1 rounded-md bg-red-50 py-1 text-[10px] font-semibold text-red-700 hover:bg-red-100"
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>

      {images.length === 0 && <p className="text-sm text-ink/50">No images yet — add one below.</p>}

      <div className="mt-5 border-t border-sand-200 pt-4">
        <Label htmlFor="pi-alt">Add an image</Label>
        <Input
          id="pi-alt"
          ref={altRef}
          placeholder="Describe the photo (helps search & screen readers)"
          className="mb-2"
          disabled={pending}
        />
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          onChange={onPick}
          disabled={pending}
          className="block w-full cursor-pointer rounded-xl border border-sand-300 bg-white text-sm text-ink/70 file:mr-3 file:cursor-pointer file:rounded-l-xl file:border-0 file:bg-kelp-800 file:px-4 file:py-3 file:text-xs file:font-bold file:uppercase file:tracking-wide file:text-sand-50 hover:file:bg-kelp-700 disabled:opacity-50"
        />
        <p className="mt-1.5 text-xs text-ink/50">
          Photos are resized automatically — you can upload straight from your phone.
        </p>
        {busy && (
          <p role="status" className="mt-2 text-xs font-semibold text-kelp-700">
            {busy}
          </p>
        )}
        {error && (
          <p role="alert" className="mt-2 text-xs font-semibold text-red-700">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
