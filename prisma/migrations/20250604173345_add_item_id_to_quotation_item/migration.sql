/*
  Warnings:

  - Added the required column `itemId` to the `QuotationItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `QuotationItem` ADD COLUMN `itemId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `QuotationItem` ADD CONSTRAINT `QuotationItem_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `Item`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
