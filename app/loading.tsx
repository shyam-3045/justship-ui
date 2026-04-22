import { CenterLoader } from "@/components/ui/center-loader";

export default function AppLoading() {
  return (
    <main className="min-h-screen bg-background bg-glow">
      <CenterLoader label="Loading..." className="min-h-screen" />
    </main>
  );
}
