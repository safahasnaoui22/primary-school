/*
  Warnings:

  - You are about to drop the column `gradeValue` on the `Grade` table. All the data in the column will be lost.
  - Added the required column `value` to the `Grade` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ResourceType" AS ENUM ('PDF', 'WORKSHEET', 'VIDEO', 'IMAGE', 'LINK', 'REVISION');

-- CreateEnum
CREATE TYPE "CalendarEventType" AS ENUM ('EXAM', 'ACTIVITY', 'TRIP', 'MEETING', 'EVENT');

-- CreateEnum
CREATE TYPE "ProgressCategory" AS ENUM ('READING', 'MATH', 'PARTICIPATION', 'WRITING', 'GENERAL');

-- CreateEnum
CREATE TYPE "ProgressLevel" AS ENUM ('EXCELLENT', 'GOOD', 'IMPROVING', 'NEEDS_PRACTICE');

-- AlterEnum
ALTER TYPE "AttendanceStatus" ADD VALUE 'EXCUSED';

-- AlterTable
ALTER TABLE "Grade" DROP COLUMN "gradeValue",
ADD COLUMN     "value" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "Resource" ADD COLUMN     "type" "ResourceType" NOT NULL DEFAULT 'PDF';

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "birthDate" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Homework" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "instructions" TEXT,
    "fileUrl" TEXT,
    "deadline" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Homework_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomeworkStatus" (
    "id" TEXT NOT NULL,
    "homeworkId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomeworkStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalendarEvent" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "classId" TEXT,
    "authorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "type" "CalendarEventType" NOT NULL DEFAULT 'EVENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CalendarEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgressUpdate" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "category" "ProgressCategory" NOT NULL,
    "level" "ProgressLevel" NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProgressUpdate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3),
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "teacherId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HomeworkStatus_homeworkId_studentId_key" ON "HomeworkStatus"("homeworkId", "studentId");

-- AddForeignKey
ALTER TABLE "Homework" ADD CONSTRAINT "Homework_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Homework" ADD CONSTRAINT "Homework_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomeworkStatus" ADD CONSTRAINT "HomeworkStatus_homeworkId_fkey" FOREIGN KEY ("homeworkId") REFERENCES "Homework"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomeworkStatus" ADD CONSTRAINT "HomeworkStatus_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarEvent" ADD CONSTRAINT "CalendarEvent_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarEvent" ADD CONSTRAINT "CalendarEvent_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarEvent" ADD CONSTRAINT "CalendarEvent_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgressUpdate" ADD CONSTRAINT "ProgressUpdate_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgressUpdate" ADD CONSTRAINT "ProgressUpdate_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
