"use client";

import * as SelectPrimitive from "@radix-ui/react-select";

export const Select = SelectPrimitive.Root;
export const SelectValue = SelectPrimitive.Value;

export function SelectTrigger({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <SelectPrimitive.Trigger
      className={`flex w-full items-center justify-between rounded-input border border-border bg-surface px-3 py-2 text-left text-base outline-none focus:border-blue data-[placeholder]:text-muted ${className}`}
    >
      {children}
      <SelectPrimitive.Icon className="text-muted">⌄</SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

export function SelectContent({ children }: { children: React.ReactNode }) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        position="popper"
        sideOffset={6}
        className="popover-content z-30 w-[var(--radix-select-trigger-width)] overflow-hidden rounded-input border border-border bg-surface shadow-card"
      >
        <SelectPrimitive.Viewport className="p-1">
          {children}
        </SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

export function SelectItem({
  children,
  value,
}: {
  children: React.ReactNode;
  value: string;
}) {
  return (
    <SelectPrimitive.Item
      value={value}
      className="cursor-pointer rounded-input px-3 py-2 text-sm text-text outline-none data-[highlighted]:bg-blue/10 data-[highlighted]:text-blue"
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}
