import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function VerifyCertificatePage({
  params,
}: {
  params: { hash: string };
}) {
  const certificate = await prisma.certificate.findUnique({
    where: { certificateHash: params.hash },
  });

  if (!certificate) return notFound();

  const [user, scenario] = await Promise.all([
    prisma.user.findUnique({
      where: { id: certificate.userId },
      select: { name: true, email: true },
    }),
    prisma.scenario.findUnique({
      where: { id: certificate.scenarioId },
      select: { name: true },
    }),
  ]);

  return (
    <div className="min-h-screen bg-neu-bg flex items-center justify-center px-4">
      <div className="rounded-3xl shadow-neu p-10 max-w-lg w-full text-center bg-neu-bg">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-brand-600 mx-auto mb-6 flex items-center justify-center">
          <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-neu-text mb-2">Certificate Verified</h1>
        <div className="rounded-2xl shadow-neu-inset-sm p-6 mt-6 space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-neu-muted">Name</span>
            <span className="text-neu-text font-medium">{user?.name || user?.email || "---"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neu-muted">Guide</span>
            <span className="text-neu-text font-medium">{scenario?.name || "---"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neu-muted">Completed</span>
            <span className="text-neu-text font-medium">
              {new Date(certificate.completedAt).toLocaleDateString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-neu-muted">Certificate ID</span>
            <span className="text-neu-text font-mono text-xs">{certificate.certificateHash}</span>
          </div>
        </div>
        <p className="text-xs text-neu-muted mt-6">
          This certificate was issued by ClawSetup and is cryptographically verifiable.
        </p>
      </div>
    </div>
  );
}
