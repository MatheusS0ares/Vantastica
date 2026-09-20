"use client";

import { Drawer as DrawerPrimitive } from "vaul";

export const Drawer = DrawerPrimitive.Root;
export const DrawerTrigger = DrawerPrimitive.Trigger;
export const DrawerTitle = DrawerPrimitive.Title;
export const DrawerDescription = DrawerPrimitive.Description;
export const DrawerClose = DrawerPrimitive.Close;

export function DrawerContent({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <DrawerPrimitive.Portal>
      <DrawerPrimitive.Overlay className="fixed inset-0 z-30 bg-navy/40" />
      <DrawerPrimitive.Content
        className={`fixed inset-x-0 bottom-0 z-30 flex max-h-[90vh] flex-col rounded-t-card bg-surface pb-6 pt-2 shadow-card outline-none ${className}`}
      >
        <div className="mx-auto mb-3 h-1.5 w-10 shrink-0 rounded-pill bg-border" />
        <div className="flex flex-col items-center gap-4 overflow-y-auto px-6">
          {children}
        </div>
      </DrawerPrimitive.Content>
    </DrawerPrimitive.Portal>
  );
}
