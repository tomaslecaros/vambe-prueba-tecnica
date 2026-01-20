/*
  Warnings:

  - A unique constraint covering the columns `[email,phone]` on the table `clients` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "clients_email_key";

-- CreateIndex
CREATE UNIQUE INDEX "clients_email_phone_key" ON "clients"("email", "phone");
