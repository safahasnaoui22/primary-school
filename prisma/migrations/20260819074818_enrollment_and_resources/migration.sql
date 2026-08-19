/*
  Warnings:

  - You are about to drop the `EnrollmentChild` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `childrenJson` to the `EnrollmentRequest` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "EnrollmentChild" DROP CONSTRAINT "EnrollmentChild_enrollmentId_fkey";

-- AlterTable
ALTER TABLE "EnrollmentRequest" ADD COLUMN     "childrenJson" JSONB NOT NULL;

-- DropTable
DROP TABLE "EnrollmentChild";
