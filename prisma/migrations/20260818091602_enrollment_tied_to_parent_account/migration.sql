/*
  Warnings:

  - You are about to drop the column `city` on the `EnrollmentRequest` table. All the data in the column will be lost.
  - You are about to drop the column `parentEmail` on the `EnrollmentRequest` table. All the data in the column will be lost.
  - You are about to drop the column `parentName` on the `EnrollmentRequest` table. All the data in the column will be lost.
  - You are about to drop the column `street` on the `EnrollmentRequest` table. All the data in the column will be lost.
  - Added the required column `parentId` to the `EnrollmentRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EnrollmentRequest" DROP COLUMN "city",
DROP COLUMN "parentEmail",
DROP COLUMN "parentName",
DROP COLUMN "street",
ADD COLUMN     "parentId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "EnrollmentRequest" ADD CONSTRAINT "EnrollmentRequest_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
