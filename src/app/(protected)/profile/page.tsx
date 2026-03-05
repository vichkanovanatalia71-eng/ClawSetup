import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProfileClient from "./ProfileClient";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const subscription = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
    include: {
      payments: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile</h1>

      {/* Account info */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Account</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Email</span>
            <span className="text-gray-900">{session.user.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Name</span>
            <span className="text-gray-900">{session.user.name || "—"}</span>
          </div>
        </div>
      </div>

      {/* Subscription */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Subscription</h2>
        {subscription ? (
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Status</span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  subscription.status === "ACTIVE"
                    ? "bg-green-100 text-green-700"
                    : subscription.status === "PAST_DUE"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {subscription.status}
              </span>
            </div>
            {subscription.currentPeriodEnd && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Current period ends</span>
                <span className="text-gray-900">
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </span>
              </div>
            )}
            {subscription.cancelAtPeriodEnd && (
              <div className="bg-amber-50 text-amber-800 px-3 py-2 rounded text-sm">
                Your subscription will be canceled at the end of the current period.
              </div>
            )}
            <ProfileClient hasSubscription={true} />
          </div>
        ) : (
          <div>
            <p className="text-gray-500 text-sm mb-4">No active subscription.</p>
            <ProfileClient hasSubscription={false} />
          </div>
        )}
      </div>

      {/* Payment history */}
      {subscription?.payments && subscription.payments.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Payment History</h2>
          <div className="space-y-3">
            {subscription.payments.map((payment) => (
              <div
                key={payment.id}
                className="flex justify-between items-center text-sm py-2 border-b border-gray-100 last:border-0"
              >
                <div>
                  <span className="text-gray-900">
                    ${(payment.amount / 100).toFixed(2)} {payment.currency.toUpperCase()}
                  </span>
                  <span className="text-gray-400 ml-2">
                    {new Date(payment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs ${
                    payment.status === "succeeded"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {payment.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
