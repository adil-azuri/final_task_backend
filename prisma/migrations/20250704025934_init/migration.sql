/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Account` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Products_name_key";

-- CreateIndex
CREATE UNIQUE INDEX "Account_name_key" ON "Account"("name");
