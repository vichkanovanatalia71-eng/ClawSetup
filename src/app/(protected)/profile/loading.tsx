export default function ProfileLoading() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-32 rounded-xl bg-neu-dark/20" />
        <div className="rounded-2xl shadow-neu p-6 bg-neu-bg space-y-4">
          <div className="h-5 w-24 rounded-lg bg-neu-dark/15" />
          <div className="flex justify-between">
            <div className="h-4 w-16 rounded bg-neu-dark/10" />
            <div className="h-7 w-48 rounded-xl bg-neu-dark/10" />
          </div>
          <div className="flex justify-between">
            <div className="h-4 w-16 rounded bg-neu-dark/10" />
            <div className="h-7 w-32 rounded-xl bg-neu-dark/10" />
          </div>
        </div>
        <div className="rounded-2xl shadow-neu p-6 bg-neu-bg space-y-4">
          <div className="h-5 w-32 rounded-lg bg-neu-dark/15" />
          <div className="h-4 w-48 rounded bg-neu-dark/10" />
          <div className="h-10 w-40 rounded-full bg-neu-dark/15" />
        </div>
      </div>
    </div>
  );
}
