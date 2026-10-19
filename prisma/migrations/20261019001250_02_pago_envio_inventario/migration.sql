-- CreateTable
CREATE TABLE `pagos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ordenId` INTEGER NOT NULL,
    `metodo` ENUM('TARJETA', 'EFECTIVO', 'TRANSFERENCIA') NOT NULL,
    `estado` ENUM('PENDIENTE', 'PAGADO', 'FALLIDO') NOT NULL DEFAULT 'PENDIENTE',
    `monto` DECIMAL(10, 2) NOT NULL,

    UNIQUE INDEX `pagos_ordenId_key`(`ordenId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `envios` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ordenId` INTEGER NOT NULL,
    `nombrePaqueteria` VARCHAR(191) NOT NULL,
    `numeroGuia` VARCHAR(191) NOT NULL,
    `fechaEnvio` DATETIME(3) NOT NULL,
    `fechaEntrega` DATETIME(3) NULL,

    UNIQUE INDEX `envios_ordenId_key`(`ordenId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ajustes_inventario` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `varianteId` INTEGER NOT NULL,
    `usuarioId` INTEGER NOT NULL,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `cantidad` INTEGER NOT NULL,
    `motivo` ENUM('ENTRADA', 'MERMA', 'CORRECCION') NOT NULL,

    INDEX `ajustes_inventario_varianteId_idx`(`varianteId`),
    INDEX `ajustes_inventario_usuarioId_idx`(`usuarioId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `pagos` ADD CONSTRAINT `pagos_ordenId_fkey` FOREIGN KEY (`ordenId`) REFERENCES `ordenes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `envios` ADD CONSTRAINT `envios_ordenId_fkey` FOREIGN KEY (`ordenId`) REFERENCES `ordenes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ajustes_inventario` ADD CONSTRAINT `ajustes_inventario_varianteId_fkey` FOREIGN KEY (`varianteId`) REFERENCES `variantes_producto`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ajustes_inventario` ADD CONSTRAINT `ajustes_inventario_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
