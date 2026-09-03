"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";

/**
 * Submit button for product deletion, gated behind a typed confirmation.
 *
 * Deleting a product cannot be undone from the admin, and the button sits on a
 * page the owner visits to make ordinary edits — a stray click should not be
 * enough. Typing the product name is deliberate friction proportionate to that.
 */
export function DeleteProductButton({ name }: { name: string }) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant="outline"
      disabled={pending}
      onClick={(e) => {
        const typed = window.prompt(`This can’t be undone.\n\nType the product name to delete it:\n${name}`);
        if (typed === null) {
          e.preventDefault();
          return;
        }
        if (typed.trim().toLowerCase() !== name.trim().toLowerCase()) {
          e.preventDefault();
          window.alert("That didn’t match the product name, so nothing was deleted.");
        }
      }}
      className="w-full border-red-300 text-red-700 hover:bg-red-600 hover:text-white"
    >
      {pending ? "Deleting…" : "Delete product"}
    </Button>
  );
}
