type CenterLoaderProps = {
  label?: string;
  className?: string;
};

export function CenterLoader({
  label = "Loading...",
  className = "min-h-[60vh]",
}: CenterLoaderProps) {
  return (
    <div
      className={`flex w-full items-center justify-center px-6 py-10 ${className}`}
    >
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-foreground" />
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
