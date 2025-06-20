-- DropForeignKey
ALTER TABLE `PaymentDetail` DROP FOREIGN KEY `PaymentDetail_paymentId_fkey`;

-- DropIndex
DROP INDEX `PaymentDetail_paymentId_fkey` ON `PaymentDetail`;

-- AddForeignKey
ALTER TABLE `PaymentDetail` ADD CONSTRAINT `PaymentDetail_paymentId_fkey` FOREIGN KEY (`paymentId`) REFERENCES `Payment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
