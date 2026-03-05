-- AlterTable: Add Ukrainian translation fields to Scenario
ALTER TABLE "Scenario" ADD COLUMN "nameUk" TEXT;
ALTER TABLE "Scenario" ADD COLUMN "descriptionUk" TEXT;

-- AlterTable: Add Ukrainian translation fields to Module
ALTER TABLE "Module" ADD COLUMN "titleUk" TEXT;
ALTER TABLE "Module" ADD COLUMN "descriptionUk" TEXT;

-- AlterTable: Add Ukrainian translation fields to Step
ALTER TABLE "Step" ADD COLUMN "titleUk" TEXT;
ALTER TABLE "Step" ADD COLUMN "goalUk" TEXT;
ALTER TABLE "Step" ADD COLUMN "prerequisitesUk" TEXT;
ALTER TABLE "Step" ADD COLUMN "contentMdUk" TEXT;
ALTER TABLE "Step" ADD COLUMN "expectedResultUk" TEXT;
ALTER TABLE "Step" ADD COLUMN "commonErrorsUk" TEXT;
