import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CertificatesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const certificates = await prisma.certificate.findMany({
    where: { userId: session.user.id },
    include: {
      scenario: { select: { name: true, slug: true } },
    },
    orderBy: { completedAt: "desc" },
  });

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold text-neu-text mb-6">My Certificates</h1>

      {certificates.length === 0 ? (
        <div className="rounded-2xl shadow-neu p-8 bg-neu-bg text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-brand-100 mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <p className="text-neu-muted text-sm mb-4">
            You haven&apos;t earned any certificates yet. Complete all steps in a scenario to get one!
          </p>
          <Link
            href="/dashboard"
            className="neu-btn-primary rounded-full px-6 py-2.5 text-sm inline-block"
          >
            Go to Dashboard
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="rounded-2xl shadow-neu p-6 bg-neu-bg flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-neu-text">{cert.scenario.name}</p>
                  <p className="text-xs text-neu-muted">
                    Completed on {new Date(cert.completedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href={`/verify/${cert.certificateHash}`}
                  className="text-xs text-brand-500 hover:text-brand-600 transition-colors"
                >
                  View
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
