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

export function generateMetadata({ params }: { params: { id: string } }) {
  const num = parseInt(params.id, 10);
  const phase = PHASES[num];
  return {
    title: `${phase?.title || `Phase ${params.id}`} | Gaming PM Agent`,
  };
}

export default function Page({ params }: { params: { id: string } }) {
  const num = parseInt(params.id, 10);
  const phase = PHASES[num];

  if (!phase) {
    return (
      <main className="min-h-screen bg-neutral-950 text-neutral-200 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Phase {params.id}</h1>
          <p className="text-neutral-500 mt-2">Coming soon...</p>
          <a href="/" className="mt-4 inline-block text-indigo-400 hover:text-indigo-300">
            ← Back to Home
          </a>
        </div>
      </main>
    );
  }

  const Component = phase.component;
  return <Component />;
}
