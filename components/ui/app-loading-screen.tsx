import { LoaderCircle } from "lucide-react";

type AppLoadingScreenProps = {
  title?: string;
  subtitle?: string;
  compact?: boolean;
};

export function AppLoadingScreen({
  title = "Loading your workspace",
  subtitle = "Preparing data and polishing the UI for you...",
  compact = false,
}: AppLoadingScreenProps) {
  return (
    <section
      className={`relative overflow-hidden rounded-2xl border border-border/70 bg-card/70 backdrop-blur-sm ${compact ? "px-5 py-6" : "px-7 py-8"}`}
      aria-live="polite"
      aria-busy="true"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.26),transparent_48%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.07),transparent_48%)]" />
      <div className="relative flex items-start gap-4">
        <div className="relative mt-0.5 flex h-11 w-11 items-center justify-center rounded-xl border border-border/70 bg-background/80">
          <LoaderCircle className="loader-orbit h-5 w-5 text-foreground/85" />
        </div>

        <div className="flex-1 space-y-3">
          <div>
            <h3 className="text-base font-semibold tracking-tight text-foreground">
              {title}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          </div>

          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="loader-dot h-1.5 w-1.5 rounded-full bg-foreground/70" />
            <span className="loader-dot loader-dot-delay h-1.5 w-1.5 rounded-full bg-foreground/65" />
            <span className="loader-dot loader-dot-delay-2 h-1.5 w-1.5 rounded-full bg-foreground/60" />
          </div>
        </div>
      </div>
    </section>
  );
}
