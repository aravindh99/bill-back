-- DropIndex
DROP INDEX `Profile_email_key` ON `Profile`;

-- AlterTable
ALTER TABLE `Profile` ALTER COLUMN `defaultCurrency` DROP DEFAULT;
