-- AlterTable
ALTER TABLE "User" ADD COLUMN     "classesTaught" TEXT[] DEFAULT ARRAY[]::TEXT[];
