CREATE TABLE IF NOT EXISTS donantes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100),
  telefono VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS donaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  donante VARCHAR(100),
  producto_id INT,
  cantidad INT,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS movimientos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  producto_id INT,
  tipo ENUM('entrada','salida','transferencia'),
  cantidad INT,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transferencias (
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
