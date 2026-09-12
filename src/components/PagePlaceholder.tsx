export function PagePlaceholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
      <h1 className="font-heading text-xl font-semibold text-navy">
        {title}
      </h1>
      <p className="max-w-sm text-sm text-muted">{description}</p>
    </div>
  );
}
