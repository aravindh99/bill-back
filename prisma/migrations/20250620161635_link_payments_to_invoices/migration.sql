-- AlterTable
ALTER TABLE `Payment` ADD COLUMN `invoiceId` INTEGER NULL,
    MODIFY `availableCredit` DECIMAL(65, 30) NULL;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `Invoice`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
