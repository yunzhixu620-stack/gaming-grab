export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full text-center space-y-6">
        {/* Logo / Title */}
        <h1 className="text-3xl font-bold tracking-tight text-neutral-100">
          Gaming PM Agent
        </h1>
        <p className="text-neutral-400 text-lg">
          Data-driven niche game discovery &amp; product design
        </p>

        {/* Phase Navigation Cards — placeholder */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
          {[
            { phase: 1, title: "Discovery", status: "Ready" },
            { phase: 2, title: "Sentiment", status: "Coming" },
            { phase: 3, title: "Structure", status: "Coming" },
            { phase: 4, title: "Assets", status: "Coming" },
          ].map((item) => (
            <a
              key={item.phase}
              href={`/phase/${item.phase}`}
              className={`rounded-lg border p-4 transition-colors ${
                item.phase === 1
                  ? "border-indigo-800/50 bg-indigo-950/20 hover:border-indigo-700"
                  : "border-neutral-800 bg-neutral-900/50 hover:border-neutral-700"
              }`}
            >
              <div className="text-xs text-neutral-500 font-mono">P{item.phase}</div>
              <div className="text-sm font-medium mt-1">{item.title}</div>
              <div className="text-xs text-neutral-600 mt-2">{item.status}</div>
            </a>
          ))}
        </div>

        {/* API Status */}
        <div className="mt-8 text-xs text-neutral-600 font-mono">
          API: <span id="api-status">checking...</span>
        </div>
      </div>

      {/* Simple health check on load */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            fetch('/health')
              .then(r => r.json())
              .then(d => {
                document.getElementById('api-status').textContent =
                  d.status === 'ok' ? '✓ connected' : '✗ error';
              })
              .catch(() => {
                document.getElementById('api-status').textContent = '✗ unreachable';
              });
          `,
        }}
      />
    </main>
  );
}
