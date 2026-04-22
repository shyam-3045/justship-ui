import { AppLoadingScreen } from "@/components/ui/app-loading-screen";

export default function AppLoading() {
  return (
    <main className="min-h-screen bg-background bg-glow px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <AppLoadingScreen />
      </div>
    </main>
  );
}
