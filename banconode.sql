DROP DATABASE if EXISTS node;
CREATE DATABASE if NOT EXISTS node;
USE node;

CREATE TABLE
    IF NOT EXISTS `usuario` (
        `id` INT (11) NOT NULL AUTO_INCREMENT,
        `nome` VARCHAR(32) NULL DEFAULT NULL,
        `senha` VARCHAR(32) NULL DEFAULT NULL,
        `telefone` VARCHAR(32) NULL DEFAULT NULL,
        `imagem` VARCHAR(150) NULL DEFAULT NULL,
        PRIMARY KEY (`id`)
    )
