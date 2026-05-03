CREATE DATABASE IF NOT EXISTS Comondu;
USE Comondu;

CREATE TABLE categorias (
  id TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL
);

CREATE TABLE donantes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100),
  telefono VARCHAR(20)
);

CREATE TABLE productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100),
  categoria_id TINYINT,
  cantidad INT DEFAULT 0
);

CREATE TABLE movimientos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  producto_id INT,
  tipo ENUM('entrada','salida','transferencia'),
  cantidad INT,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


INSERT INTO categorias (nombre) VALUES ('Granos'), ('Enlatados');
INSERT INTO productos (nombre, categoria_id, cantidad) VALUES ('Arroz',1,100);