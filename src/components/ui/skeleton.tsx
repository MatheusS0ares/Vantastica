export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-input bg-border/70 ${className}`}
      aria-hidden
    />
  );
}
