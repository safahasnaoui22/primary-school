-- CreateEnum
CREATE TYPE "EnrollmentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "EnrollmentRequest" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "parentName" TEXT NOT NULL,
    "parentEmail" TEXT NOT NULL,
    "parentPhone" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "childrenJson" JSONB NOT NULL,
    "medical" TEXT,
    "consent" BOOLEAN NOT NULL DEFAULT false,
    "status" "EnrollmentStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "EnrollmentRequest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EnrollmentRequest" ADD CONSTRAINT "EnrollmentRequest_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
