/*
  Warnings:

  - You are about to drop the column `endDatetime` on the `schedules` table. All the data in the column will be lost.
  - Added the required column `endDateTime` to the `schedules` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "schedules" DROP COLUMN "endDatetime",
ADD COLUMN     "endDateTime" TIMESTAMP(3) NOT NULL;
