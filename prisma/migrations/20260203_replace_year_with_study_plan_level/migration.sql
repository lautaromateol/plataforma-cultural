-- Migration: Replace Year with StudyPlan + Level
-- This migration preserves existing data by creating a default StudyPlan

-- 1. Create the study_plans table
CREATE TABLE "study_plans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "durationYears" INTEGER NOT NULL,
    "targetAudience" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "study_plans_pkey" PRIMARY KEY ("id")
);

-- 2. Create the levels table
CREATE TABLE "levels" (
    "id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "studyPlanId" TEXT NOT NULL,

    CONSTRAINT "levels_pkey" PRIMARY KEY ("id")
);

-- 3. Create unique indexes for study_plans
CREATE UNIQUE INDEX "study_plans_name_key" ON "study_plans"("name");
CREATE UNIQUE INDEX "study_plans_code_key" ON "study_plans"("code");

-- 4. Create unique indexes for levels
CREATE UNIQUE INDEX "levels_studyPlanId_order_key" ON "levels"("studyPlanId", "order");
CREATE UNIQUE INDEX "levels_studyPlanId_name_key" ON "levels"("studyPlanId", "name");

-- 5. Add foreign key constraint from levels to study_plans
ALTER TABLE "levels" ADD CONSTRAINT "levels_studyPlanId_fkey" FOREIGN KEY ("studyPlanId") REFERENCES "study_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 6. Create a default StudyPlan for existing data migration
INSERT INTO "study_plans" ("id", "name", "code", "description", "durationYears", "targetAudience", "isActive", "createdAt", "updatedAt")
SELECT
    'default_plan_standard',
    'Plan Estándar',
    'PE',
    'Plan de estudio estándar migrado desde la estructura anterior',
    (SELECT COALESCE(MAX("level"), 6) FROM "years"),
    'General',
    true,
    NOW(),
    NOW()
WHERE EXISTS (SELECT 1 FROM "years" LIMIT 1);

-- 7. Migrate Years to Levels (preserving IDs for referential integrity)
INSERT INTO "levels" ("id", "order", "name", "description", "createdAt", "updatedAt", "studyPlanId")
SELECT
    "id",
    "level",
    "name",
    "description",
    "createdAt",
    "updatedAt",
    'default_plan_standard'
FROM "years"
WHERE EXISTS (SELECT 1 FROM "study_plans" WHERE "id" = 'default_plan_standard');

-- 8. Add levelId column to subjects (initially nullable)
ALTER TABLE "subjects" ADD COLUMN "levelId" TEXT;

-- 9. Migrate data from yearId to levelId in subjects
UPDATE "subjects" SET "levelId" = "yearId";

-- 10. Make levelId NOT NULL after migration
ALTER TABLE "subjects" ALTER COLUMN "levelId" SET NOT NULL;

-- 11. Add foreign key constraint for subjects.levelId
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "levels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 12. Add levelId column to courses (initially nullable)
ALTER TABLE "courses" ADD COLUMN "levelId" TEXT;

-- 13. Migrate data from yearId to levelId in courses
UPDATE "courses" SET "levelId" = "yearId";

-- 14. Make levelId NOT NULL after migration
ALTER TABLE "courses" ALTER COLUMN "levelId" SET NOT NULL;

-- 15. Add foreign key constraint for courses.levelId
ALTER TABLE "courses" ADD CONSTRAINT "courses_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "levels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 16. Add shift column to courses
ALTER TABLE "courses" ADD COLUMN "shift" TEXT;

-- 17. Drop old unique constraints
DROP INDEX IF EXISTS "subjects_yearId_name_key";
DROP INDEX IF EXISTS "courses_name_academicYear_key";

-- 18. Create new unique constraints
CREATE UNIQUE INDEX "subjects_levelId_name_key" ON "subjects"("levelId", "name");
CREATE UNIQUE INDEX "courses_levelId_name_academicYear_key" ON "courses"("levelId", "name", "academicYear");

-- 19. Drop old foreign key constraints
ALTER TABLE "subjects" DROP CONSTRAINT IF EXISTS "subjects_yearId_fkey";
ALTER TABLE "courses" DROP CONSTRAINT IF EXISTS "courses_yearId_fkey";

-- 20. Drop old yearId columns
ALTER TABLE "subjects" DROP COLUMN "yearId";
ALTER TABLE "courses" DROP COLUMN "yearId";

-- 21. Drop the years table
DROP TABLE "years";
