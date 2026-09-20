"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";

export const Tabs = TabsPrimitive.Root;

export function TabsList({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <TabsPrimitive.List className={`flex gap-2 ${className}`}>
      {children}
    </TabsPrimitive.List>
  );
}

export function TabsTrigger({
  value,
  children,
}: {
  value: string;
  children: React.ReactNode;
}) {
  return (
    <TabsPrimitive.Trigger
      value={value}
      asChild
      className="flex-1 rounded-pill px-3 py-2 text-center text-sm font-medium transition data-[state=active]:bg-navy data-[state=active]:text-white data-[state=inactive]:bg-surface data-[state=inactive]:text-muted data-[state=inactive]:shadow-card"
    >
      {children}
    </TabsPrimitive.Trigger>
  );
}
