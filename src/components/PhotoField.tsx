"use client";

import { compressFileInput } from "@/lib/compressImage";

export function PhotoField() {
  return (
    <input
      type="file"
      name="photo"
      accept="image/*"
      onChange={(event) => compressFileInput(event.currentTarget)}
      className="rounded-input border border-border bg-surface px-3 py-2 text-base outline-none file:mr-3 file:rounded-pill file:border-0 file:bg-navy file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white"
    />
  );
}
