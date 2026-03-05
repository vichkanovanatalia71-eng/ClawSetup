export default function DashboardLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-40 rounded-xl bg-neu-dark/20" />
        <div className="h-4 w-56 rounded-lg bg-neu-dark/15" />
        <div className="grid md:grid-cols-2 gap-6 mt-6">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-2xl shadow-neu p-6 bg-neu-bg">
              <div className="h-5 w-2/3 rounded-lg bg-neu-dark/15 mb-3" />
              <div className="h-3 w-full rounded bg-neu-dark/10 mb-2" />
              <div className="h-3 w-1/2 rounded bg-neu-dark/10 mb-4" />
              <div className="h-2.5 w-full rounded-full bg-neu-dark/10 mb-4" />
              <div className="h-10 w-28 rounded-full bg-neu-dark/15" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
