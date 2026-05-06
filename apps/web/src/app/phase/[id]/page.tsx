import { Suspense } from "react";
import DiscoveryPage from "@/features/discovery/page";
import SentimentPage from "@/features/sentiment/page";
import StructuringPage from "@/features/structuring/page";
import AssetGenPage from "@/features/asset_gen/page";

const PHASES: Record<number, { title: string; component: React.FC }> = {
  1: { title: "Phase 1: Niche Discovery", component: DiscoveryPage },
  2: { title: "Phase 2: Sentiment & Consensus", component: SentimentPage },
  3: { title: "Phase 3: Data Structuring", component: StructuringPage },
  4: { title: "Phase 4: Asset Generation", component: AssetGenPage },
};

// Required for static export (output: "export")
export function generateStaticParams() {
  return [{ id: "1" }, { id: "2" }, { id: "3" }, { id: "4" }];
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const num = parseInt(id, 10);
  const phase = PHASES[num];
  return {
    title: `${phase?.title || `Phase ${id}`} | Gaming PM Agent`,
  };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const num = parseInt(id, 10);
  const phase = PHASES[num];

  if (!phase) {
    return (
      <main className="min-h-screen bg-[var(--mi-bg-page)] text-gray-200 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Phase {id}</h1>
          <p className="text-neutral-500 mt-2">Coming soon...</p>
          <a href="/" className="mt-4 inline-block text-blue-400 hover:text-blue-300">← Back to Home</a>
        </div>
      </main>
    );
  }

  const Component = phase.component;

  // Wrap in Suspense — child components use useSearchParams()
  // which is not available during static prerendering
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
      </div>
    }>
      <Component />
    </Suspense>
  );
}
