"use client";

import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";

export const Collapsible = CollapsiblePrimitive.Root;

export function CollapsibleTrigger({
  children,
  className = "text-sm text-blue",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <CollapsiblePrimitive.Trigger
      className={`group flex cursor-pointer items-center gap-1.5 font-medium ${className}`}
    >
      <span className="inline-block transition-transform duration-200 group-data-[state=open]:rotate-90">
        ▸
      </span>
      {children}
    </CollapsiblePrimitive.Trigger>
  );
}

export function CollapsibleContent({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <CollapsiblePrimitive.Content
      className={`collapsible-content overflow-hidden ${className}`}
    >
      <div className="pt-3">{children}</div>
    </CollapsiblePrimitive.Content>
  );
}
