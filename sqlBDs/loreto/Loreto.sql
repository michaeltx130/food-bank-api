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
  transferencia_id VARCHAR(80) UNIQUE,
  producto_id INT,
  producto_nombre VARCHAR(100),
  categoria_id INT,
  cantidad INT NOT NULL DEFAULT 0,
  origen VARCHAR(100),
  destino VARCHAR(100),
  estado VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE',
  evento_id VARCHAR(80),
  error TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE sync_events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  evento_id VARCHAR(80) NOT NULL UNIQUE,
  topic VARCHAR(100),
  tipo VARCHAR(60) NOT NULL,
  origen VARCHAR(100) NOT NULL,
  destino VARCHAR(100),
  payload LONGTEXT NOT NULL,
  estado VARCHAR(30) NOT NULL DEFAULT 'pendiente',
  intentos INT NOT NULL DEFAULT 0,
  ultimo_error TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE sync_events_recibidos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  evento_id VARCHAR(80) NOT NULL UNIQUE,
  tipo VARCHAR(60) NOT NULL,
  origen VARCHAR(100) NOT NULL,
  payload LONGTEXT NOT NULL,
  estado VARCHAR(30) NOT NULL DEFAULT 'recibido',
  error TEXT,
  received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  applied_at TIMESTAMP NULL
);


INSERT INTO categorias (nombre) VALUES ('Bebidas');
INSERT INTO productos (nombre, categoria_id, cantidad) VALUES ('Coca cola',1,20000);
