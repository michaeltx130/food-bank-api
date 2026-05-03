CREATE DATABASE IF NOT EXISTS LaPaz;
USE LaPaz;

CREATE TABLE categorias (
  id TINYINT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100)
);

CREATE TABLE productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100),
  categoria_id TINYINT,
  cantidad INT
);

CREATE TABLE beneficiarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100)
);

CREATE TABLE entregas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  beneficiario_id INT,
  producto_id INT,
  cantidad INT,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO categorias (nombre) VALUES ('Lácteos');
INSERT INTO productos (nombre, categoria_id, cantidad) VALUES ('Leche',1,50);