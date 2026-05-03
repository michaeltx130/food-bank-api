CREATE DATABASE IF NOT EXISTS Loreto;
USE Loreto;

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

CREATE TABLE transferencias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  producto_id INT,
  cantidad INT,
  destino VARCHAR(100),
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


INSERT INTO categorias (nombre) VALUES ('Bebidas');
INSERT INTO productos (nombre, categoria_id, cantidad) VALUES ('Coca cola',1,20000);