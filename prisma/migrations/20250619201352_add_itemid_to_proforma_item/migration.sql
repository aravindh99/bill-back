-- AlterTable
ALTER TABLE `ProformaItem` ADD COLUMN `itemId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `ProformaItem` ADD CONSTRAINT `ProformaItem_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `Item`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
