CREATE DATABASE IF NOT EXISTS Mulege;
USE Mulege;

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

CREATE TABLE donaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  donante VARCHAR(100),
  producto_id INT,
  cantidad INT,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


INSERT INTO categorias (nombre) VALUES ('Verduras');
INSERT INTO productos (nombre, categoria_id, cantidad) VALUES ('Tomate',1,80);