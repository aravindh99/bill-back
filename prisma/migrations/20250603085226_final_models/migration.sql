-- CreateTable
CREATE TABLE `Quotation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `clientId` INTEGER NOT NULL,
    `quotationNo` VARCHAR(191) NOT NULL,
    `poNumber` VARCHAR(191) NULL,
    `quotationDate` DATETIME(3) NOT NULL,
    `validUntil` DATETIME(3) NOT NULL,
    `subtotal` DECIMAL(65, 30) NOT NULL,
    `total` DECIMAL(65, 30) NOT NULL,

    UNIQUE INDEX `Quotation_quotationNo_key`(`quotationNo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `QuotationItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `quotationId` INTEGER NOT NULL,
    `unit` VARCHAR(191) NOT NULL,
    `quantity` DECIMAL(65, 30) NOT NULL,
    `price` DECIMAL(65, 30) NOT NULL,
    `discountPercent` DECIMAL(65, 30) NULL,
    `total` DECIMAL(65, 30) NOT NULL,
    `description` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProformaInvoice` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `clientId` INTEGER NOT NULL,
    `proformaNo` VARCHAR(191) NOT NULL,
    `poNumber` VARCHAR(191) NULL,
    `proformaDate` DATETIME(3) NOT NULL,
    `validUntil` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ProformaInvoice_proformaNo_key`(`proformaNo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProformaItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `proformaId` INTEGER NOT NULL,
    `unit` VARCHAR(191) NOT NULL,
    `quantity` DECIMAL(65, 30) NOT NULL,
    `price` DECIMAL(65, 30) NOT NULL,
    `discountPercent` DECIMAL(65, 30) NULL,
    `total` DECIMAL(65, 30) NOT NULL,
    `description` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DeliveryChalan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `invoiceId` INTEGER NULL,
    `clientId` INTEGER NOT NULL,
    `chalanDate` DATETIME(3) NOT NULL,
    `docNo` VARCHAR(191) NOT NULL,
    `notes` VARCHAR(191) NULL,

    UNIQUE INDEX `DeliveryChalan_docNo_key`(`docNo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CreditNote` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `invoiceId` INTEGER NULL,
    `clientId` INTEGER NOT NULL,
    `issueDate` DATETIME(3) NOT NULL,
    `docNo` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(65, 30) NOT NULL,
    `description` VARCHAR(191) NULL,

    UNIQUE INDEX `CreditNote_docNo_key`(`docNo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DebitNote` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `invoiceId` INTEGER NULL,
    `clientId` INTEGER NOT NULL,
    `issueDate` DATETIME(3) NOT NULL,
    `docNo` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(65, 30) NOT NULL,
    `description` VARCHAR(191) NULL,

    UNIQUE INDEX `DebitNote_docNo_key`(`docNo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PurchaseOrder` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `vendorId` INTEGER NOT NULL,
    `poNo` VARCHAR(191) NOT NULL,
    `orderDate` DATETIME(3) NOT NULL,
    `validUntil` DATETIME(3) NOT NULL,
    `subtotal` DECIMAL(65, 30) NOT NULL,
    `total` DECIMAL(65, 30) NOT NULL,

    UNIQUE INDEX `PurchaseOrder_poNo_key`(`poNo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Payment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATETIME(3) NOT NULL,
    `number` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `accountName` VARCHAR(191) NOT NULL,
    `documentMethod` VARCHAR(191) NULL,
    `amount` DECIMAL(65, 30) NOT NULL,
    `availableCredit` DECIMAL(65, 30) NOT NULL DEFAULT 0.00,

    UNIQUE INDEX `Payment_number_key`(`number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PaymentDetail` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `paymentId` INTEGER NOT NULL,
    `clientId` INTEGER NOT NULL,
    `number` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `amount` DECIMAL(65, 30) NOT NULL,
    `method` VARCHAR(191) NOT NULL,
    `bankCharges` DECIMAL(65, 30) NULL,
    `reference` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Profile` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `logo` VARCHAR(191) NULL,
    `companyName` VARCHAR(191) NOT NULL,
    `country` VARCHAR(191) NOT NULL,
    `city` VARCHAR(191) NOT NULL,
    `pinCode` VARCHAR(191) NULL,
    `defaultCurrency` VARCHAR(191) NOT NULL DEFAULT 'INR',
    `state` VARCHAR(191) NULL,
    `address` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `serviceTaxNo` VARCHAR(191) NULL,
    `website` VARCHAR(191) NULL,
    `taxationType` VARCHAR(191) NULL,
    `contactName` VARCHAR(191) NULL,

    UNIQUE INDEX `Profile_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BankDetail` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `profileId` INTEGER NOT NULL,
    `bankName` VARCHAR(191) NOT NULL,
    `branchName` VARCHAR(191) NULL,
    `adCode` VARCHAR(191) NULL,
    `upiId` VARCHAR(191) NULL,
    `accountNumber` VARCHAR(191) NOT NULL,
    `ifscCode` VARCHAR(191) NOT NULL,
    `swiftCode` VARCHAR(191) NULL,
    `accountHolderName` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Quotation` ADD CONSTRAINT `Quotation_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QuotationItem` ADD CONSTRAINT `QuotationItem_quotationId_fkey` FOREIGN KEY (`quotationId`) REFERENCES `Quotation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProformaInvoice` ADD CONSTRAINT `ProformaInvoice_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProformaItem` ADD CONSTRAINT `ProformaItem_proformaId_fkey` FOREIGN KEY (`proformaId`) REFERENCES `ProformaInvoice`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DeliveryChalan` ADD CONSTRAINT `DeliveryChalan_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DeliveryChalan` ADD CONSTRAINT `DeliveryChalan_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `Invoice`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CreditNote` ADD CONSTRAINT `CreditNote_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CreditNote` ADD CONSTRAINT `CreditNote_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `Invoice`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DebitNote` ADD CONSTRAINT `DebitNote_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DebitNote` ADD CONSTRAINT `DebitNote_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `Invoice`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseOrder` ADD CONSTRAINT `PurchaseOrder_vendorId_fkey` FOREIGN KEY (`vendorId`) REFERENCES `Vendor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PaymentDetail` ADD CONSTRAINT `PaymentDetail_paymentId_fkey` FOREIGN KEY (`paymentId`) REFERENCES `Payment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PaymentDetail` ADD CONSTRAINT `PaymentDetail_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BankDetail` ADD CONSTRAINT `BankDetail_profileId_fkey` FOREIGN KEY (`profileId`) REFERENCES `Profile`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
