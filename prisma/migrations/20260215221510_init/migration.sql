-- CreateTable
CREATE TABLE `usuarios` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `password_hash` VARCHAR(191) NOT NULL,
    `tipo` ENUM('ADMIN', 'GESTOR', 'PARTICIPANTE') NOT NULL,
    `cpf` VARCHAR(191) NULL,
    `nome` VARCHAR(191) NULL,
    `data_criacao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ultimo_acesso` DATETIME(3) NULL,

    UNIQUE INDEX `usuarios_email_key`(`email`),
    UNIQUE INDEX `usuarios_cpf_key`(`cpf`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sessoes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `titulo` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NULL,
    `data_inicio` DATETIME(3) NOT NULL,
    `data_fim` DATETIME(3) NOT NULL,
    `ativa` BOOLEAN NOT NULL DEFAULT true,
    `criador_id` INTEGER NOT NULL,
    `comunidade_id` INTEGER NOT NULL,

    INDEX `sessoes_criador_id_idx`(`criador_id`),
    INDEX `sessoes_comunidade_id_idx`(`comunidade_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `projetos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `titulo` VARCHAR(191) NOT NULL,
    `descricao_detalhada` VARCHAR(191) NULL,
    `autor_responsavel` VARCHAR(191) NULL,
    `sessao_id` INTEGER NOT NULL,

    UNIQUE INDEX `projetos_sessao_id_titulo_key`(`sessao_id`, `titulo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `votos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `comentario` VARCHAR(191) NULL,
    `data_voto` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `sessao_id` INTEGER NOT NULL,
    `projeto_id` INTEGER NOT NULL,
    `usuario_id` INTEGER NOT NULL,

    UNIQUE INDEX `votos_sessao_id_usuario_id_key`(`sessao_id`, `usuario_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `comunidades` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NULL,
    `codigo` VARCHAR(191) NOT NULL,
    `data_criacao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `criador_id` INTEGER NULL,

    UNIQUE INDEX `comunidades_nome_key`(`nome`),
    UNIQUE INDEX `comunidades_codigo_key`(`codigo`),
    INDEX `comunidades_criador_id_idx`(`criador_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `participantes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuario_id` INTEGER NOT NULL,
    `comunidade_id` INTEGER NOT NULL,
    `data_entrada` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `participantes_usuario_id_comunidade_id_key`(`usuario_id`, `comunidade_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `sessoes` ADD CONSTRAINT `sessoes_criador_id_fkey` FOREIGN KEY (`criador_id`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sessoes` ADD CONSTRAINT `sessoes_comunidade_id_fkey` FOREIGN KEY (`comunidade_id`) REFERENCES `comunidades`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `projetos` ADD CONSTRAINT `projetos_sessao_id_fkey` FOREIGN KEY (`sessao_id`) REFERENCES `sessoes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `votos` ADD CONSTRAINT `votos_sessao_id_fkey` FOREIGN KEY (`sessao_id`) REFERENCES `sessoes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `votos` ADD CONSTRAINT `votos_projeto_id_fkey` FOREIGN KEY (`projeto_id`) REFERENCES `projetos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `votos` ADD CONSTRAINT `votos_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comunidades` ADD CONSTRAINT `comunidades_criador_id_fkey` FOREIGN KEY (`criador_id`) REFERENCES `usuarios`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `participantes` ADD CONSTRAINT `participantes_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `participantes` ADD CONSTRAINT `participantes_comunidade_id_fkey` FOREIGN KEY (`comunidade_id`) REFERENCES `comunidades`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
