-- AlterTable
ALTER TABLE `Invoice` ADD COLUMN `proformaInvoiceId` INTEGER NULL,
    ADD COLUMN `quotationId` INTEGER NULL;

-- AlterTable
ALTER TABLE `Profile` ADD COLUMN `companyCode` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `ProformaInvoice` ADD COLUMN `quotationId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Invoice` ADD CONSTRAINT `Invoice_proformaInvoiceId_fkey` FOREIGN KEY (`proformaInvoiceId`) REFERENCES `ProformaInvoice`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Invoice` ADD CONSTRAINT `Invoice_quotationId_fkey` FOREIGN KEY (`quotationId`) REFERENCES `Quotation`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProformaInvoice` ADD CONSTRAINT `ProformaInvoice_quotationId_fkey` FOREIGN KEY (`quotationId`) REFERENCES `Quotation`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
