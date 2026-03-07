import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProfileClient from "./ProfileClient";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const t = await getTranslations("profile");
  const ta = await getTranslations("auth");
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
      <h1 className="text-3xl font-bold text-neu-text mb-8">{t("title")}</h1>

      {/* Account info */}
      <div className="rounded-2xl shadow-neu p-6 mb-6 bg-neu-bg">
        <h2 className="font-semibold text-neu-text mb-4">{t("accountInfo")}</h2>
        <div className="space-y-3 text-sm">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
            <span className="text-neu-muted">{ta("email")}</span>
            <span className="rounded-xl shadow-neu-inset-sm px-4 py-1.5 text-neu-text truncate max-w-[250px] sm:max-w-none">{session.user.email}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
            <span className="text-neu-muted">{ta("name")}</span>
            <span className="rounded-xl shadow-neu-inset-sm px-4 py-1.5 text-neu-text">{session.user.name || "—"}</span>
          </div>
        </div>
      </div>

      {/* Subscription */}
      <div className="rounded-2xl shadow-neu p-6 mb-6 bg-neu-bg">
        <h2 className="font-semibold text-neu-text mb-4">{t("subscription")}</h2>
        {subscription ? (
          <div className="space-y-3">
            <div className="flex justify-between text-sm items-center">
              <span className="text-neu-muted">{t("status")}</span>
              <span
                className={`neu-pill text-xs font-medium ${
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
                <span className="text-neu-muted">{t("periodEnds")}</span>
                <span className="text-neu-text">
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </span>
              </div>
            )}
            {subscription.cancelAtPeriodEnd && (
              <div className="rounded-xl shadow-neu-inset-sm bg-amber-50 text-amber-800 px-4 py-2 text-sm">
                Your subscription will be canceled at the end of the current period.
              </div>
            )}
            <ProfileClient hasSubscription={true} />
          </div>
        ) : (
          <div>
            <p className="text-neu-muted text-sm mb-4">{t("statusInactive")}</p>
            <ProfileClient hasSubscription={false} />
          </div>
        )}
      </div>

      {/* Payment history */}
      {subscription?.payments && subscription.payments.length > 0 && (
        <div className="rounded-2xl shadow-neu p-6 bg-neu-bg">
          <h2 className="font-semibold text-neu-text mb-4">{t("paymentHistory")}</h2>
          <div className="rounded-xl shadow-neu-inset-sm p-4">
            <div className="space-y-0">
              {subscription.payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 text-sm py-3 border-b border-neu-dark/15 last:border-0"
                >
                  <div>
                    <span className="text-neu-text font-medium">
                      ${(payment.amount / 100).toFixed(2)} {payment.currency.toUpperCase()}
                    </span>
                    <span className="text-neu-muted ml-2 text-xs">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <span
                    className={`neu-pill text-xs self-start sm:self-auto ${
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
        </div>
      )}
    </div>
  );
}
