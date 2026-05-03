CREATE DATABASE IF NOT EXISTS PeruFood;

-- Bancos: Comondu, La Paz, Mulege, Loreto, cada banco tiene un propio script/querytabs con sus tablas, cada uno es de un sistema independiente y estaran montados en 
-- distintas laptos (Michi, Javi, Dann, Ale) 

-- Mas o menos tendran una estructura parecida a la de este ejemplo, no necesitan ser identicas pero tampoco seran tan diferentes

USE PeruFood;

CREATE TABLE categorias (
  id     TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
);
 
CREATE TABLE donantes (
  id       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY
);
 
CREATE TABLE productos (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  categoria_id    TINYINT UNSIGNED NOT NULL
);
 
CREATE TABLE beneficiarios (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY
);
 
CREATE TABLE donaciones (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  donante_id INT UNSIGNED  NOT NULL,
  producto_id INT UNSIGNED NOT NULL
);
 
CREATE TABLE movimientos (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  producto_id   INT UNSIGNED  NOT NULL
);
 
CREATE TABLE entregas (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  beneficiario_id INT UNSIGNED  NOT NULL,
  producto_id     INT UNSIGNED  NOT NULL
);
 

