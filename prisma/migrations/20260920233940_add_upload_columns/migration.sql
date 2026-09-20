-- AlterTable
ALTER TABLE "Upload" ADD COLUMN     "columns" TEXT[] DEFAULT ARRAY[]::TEXT[];
