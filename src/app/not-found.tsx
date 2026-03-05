import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 rounded-2xl shadow-neu mx-auto mb-6 flex items-center justify-center">
          <span className="text-4xl font-bold text-neu-muted">404</span>
        </div>
        <h1 className="text-2xl font-bold text-neu-text mb-2">Page Not Found</h1>
        <p className="text-neu-muted text-sm mb-8">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="neu-btn-primary rounded-full px-8 py-3 inline-block"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
