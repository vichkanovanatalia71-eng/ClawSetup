export default function AdminLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-7 w-40 rounded-xl bg-neu-dark/20" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl shadow-neu p-6 bg-neu-bg">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-neu-dark/10" />
              <div className="h-4 w-20 rounded bg-neu-dark/10" />
            </div>
            <div className="h-8 w-16 rounded-lg bg-neu-dark/15" />
          </div>
        ))}
      </div>
    </div>
  );
}
