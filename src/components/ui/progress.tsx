"use client";

import * as ProgressPrimitive from "@radix-ui/react-progress";

export function Progress({
  value,
  className = "",
}: {
  value: number;
  className?: string;
}) {
  return (
    <ProgressPrimitive.Root
      value={value}
      className={`h-1.5 w-full overflow-hidden rounded-pill bg-border ${className}`}
    >
      <ProgressPrimitive.Indicator
        className="h-full bg-mint transition-transform duration-300 ease-out"
        style={{ transform: `translateX(-${100 - value}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}
