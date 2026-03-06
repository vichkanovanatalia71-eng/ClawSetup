/**
 * Grant full subscription access to a user by email.
 *
 * Usage (on Railway or locally with DATABASE_URL set):
 *   npx tsx scripts/grant-access.ts roman.kolontaj@gmail.com
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: npx tsx scripts/grant-access.ts <email>");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error(`User with email ${email} not found`);
    process.exit(1);
  }

  const farFuture = new Date("2099-12-31T23:59:59Z");

  const subscription = await prisma.subscription.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      status: "ACTIVE",
      plan: "annual",
      currentPeriodStart: new Date(),
      currentPeriodEnd: farFuture,
    },
    update: {
      status: "ACTIVE",
      plan: "annual",
      currentPeriodEnd: farFuture,
      cancelAtPeriodEnd: false,
    },
  });

  console.log(`Granted full access to ${email} (userId: ${user.id})`);
  console.log(`Subscription ID: ${subscription.id}, status: ${subscription.status}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
