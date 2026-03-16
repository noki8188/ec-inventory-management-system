-- CreateTable
CREATE TABLE `DailyReportSnapshot` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `reportDate` DATETIME(3) NOT NULL,
  `summary` TEXT NOT NULL,
  `metricsJson` JSON NOT NULL,
  `sectionsJson` JSON NOT NULL,
  `generatedByUserId` INTEGER NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  UNIQUE INDEX `DailyReportSnapshot_reportDate_key`(`reportDate`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `DailyReportSnapshot`
  ADD CONSTRAINT `DailyReportSnapshot_generatedByUserId_fkey`
  FOREIGN KEY (`generatedByUserId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
