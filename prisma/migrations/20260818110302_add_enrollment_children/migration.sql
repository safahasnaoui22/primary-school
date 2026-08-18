/*
  Warnings:

  - You are about to drop the column `childrenJson` on the `EnrollmentRequest` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "EnrollmentRequest" DROP COLUMN "childrenJson";

-- CreateTable
CREATE TABLE "EnrollmentChild" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "gender" TEXT,
    "className" TEXT NOT NULL,
    "previousSchool" TEXT,
    "status" "EnrollmentStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EnrollmentChild_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EnrollmentChild" ADD CONSTRAINT "EnrollmentChild_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "EnrollmentRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
