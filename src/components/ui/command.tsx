"use client";

import { Command as CommandPrimitive } from "cmdk";

export function Command({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <CommandPrimitive className={`flex flex-col gap-1 ${className}`}>
      {children}
    </CommandPrimitive>
  );
}

export function CommandInput(props: React.ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div className="border-b border-border px-3 py-2">
      <CommandPrimitive.Input
        {...props}
        className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
      />
    </div>
  );
}

export function CommandList({ children }: { children: React.ReactNode }) {
  return (
    <CommandPrimitive.List className="max-h-56 overflow-y-auto p-1">
      {children}
    </CommandPrimitive.List>
  );
}

export function CommandEmpty({ children }: { children: React.ReactNode }) {
  return (
    <CommandPrimitive.Empty className="px-3 py-4 text-center text-sm text-muted">
      {children}
    </CommandPrimitive.Empty>
  );
}

export function CommandItem({
  children,
  value,
  onSelect,
}: {
  children: React.ReactNode;
  value: string;
  onSelect: (value: string) => void;
}) {
  return (
    <CommandPrimitive.Item
      value={value}
      onSelect={onSelect}
      className="cursor-pointer rounded-input px-3 py-2 text-sm text-text data-[selected=true]:bg-blue/10 data-[selected=true]:text-blue"
    >
      {children}
    </CommandPrimitive.Item>
  );
}
