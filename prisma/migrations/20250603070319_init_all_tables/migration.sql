-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('ADMIN', 'STAFF') NOT NULL DEFAULT 'STAFF',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Client` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `companyName` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `gstTreatment` VARCHAR(191) NULL,
    `gstin` VARCHAR(191) NULL,
    `pan` VARCHAR(191) NULL,
    `tin` VARCHAR(191) NULL,
    `vat` VARCHAR(191) NULL,
    `website` VARCHAR(191) NULL,
    `billingAddress` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `openingBalance` DECIMAL(65, 30) NOT NULL DEFAULT 0.00,
    `isVendor` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `Client_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ClientContact` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `clientId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Vendor` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `companyName` VARCHAR(191) NOT NULL,
    `contactName` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `gstTreatment` VARCHAR(191) NULL,
    `gstin` VARCHAR(191) NULL,
    `pan` VARCHAR(191) NULL,
    `tin` VARCHAR(191) NULL,
    `vat` VARCHAR(191) NULL,
    `website` VARCHAR(191) NULL,
    `billingAddress` VARCHAR(191) NULL,
    `shippingAddress` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `isClient` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `Vendor_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Item` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `sku` VARCHAR(191) NOT NULL,
    `type` ENUM('product', 'service') NOT NULL,
    `unit` VARCHAR(191) NOT NULL,
    `openingQuantity` DECIMAL(65, 30) NULL,
    `tax` DECIMAL(65, 30) NULL,
    `code` VARCHAR(191) NULL,
    `salesUnitPrice` DECIMAL(65, 30) NOT NULL,
    `salesCurrency` VARCHAR(191) NOT NULL DEFAULT 'INR',
    `salesCessPercentage` DECIMAL(65, 30) NULL,
    `salesCess` DECIMAL(65, 30) NULL,
    `purchaseUnitPrice` DECIMAL(65, 30) NOT NULL,
    `purchaseCurrency` VARCHAR(191) NOT NULL DEFAULT 'INR',
    `purchaseCessPercentage` DECIMAL(65, 30) NULL,
    `purchaseCess` DECIMAL(65, 30) NULL,

    UNIQUE INDEX `Item_sku_key`(`sku`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Invoice` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `clientId` INTEGER NOT NULL,
    `invoiceNo` VARCHAR(191) NOT NULL,
    `poNo` VARCHAR(191) NULL,
    `invoiceDate` DATETIME(3) NOT NULL,
    `poDate` DATETIME(3) NULL,
    `dueDate` DATETIME(3) NOT NULL,
    `paymentTerms` VARCHAR(191) NOT NULL,
    `shippingCharges` DECIMAL(65, 30) NOT NULL DEFAULT 0.00,
    `subtotal` DECIMAL(65, 30) NOT NULL,
    `tax` DECIMAL(65, 30) NULL,
    `amount` DECIMAL(65, 30) NOT NULL,
    `balance` DECIMAL(65, 30) NOT NULL DEFAULT 0.00,
    `drCr` ENUM('DR', 'CR') NOT NULL,
    `termsConditions` VARCHAR(191) NULL,
    `paymentDate` DATETIME(3) NULL,

    UNIQUE INDEX `Invoice_invoiceNo_key`(`invoiceNo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InvoiceItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `invoiceId` INTEGER NOT NULL,
    `itemId` INTEGER NOT NULL,
    `unit` VARCHAR(191) NOT NULL,
    `quantity` DECIMAL(65, 30) NOT NULL,
    `price` DECIMAL(65, 30) NOT NULL,
    `discountPercent` DECIMAL(65, 30) NULL,
    `total` DECIMAL(65, 30) NOT NULL,
    `description` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ClientContact` ADD CONSTRAINT `ClientContact_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Invoice` ADD CONSTRAINT `Invoice_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InvoiceItem` ADD CONSTRAINT `InvoiceItem_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `Invoice`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InvoiceItem` ADD CONSTRAINT `InvoiceItem_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `Item`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

