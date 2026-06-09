CREATE TABLE IF NOT EXISTS productos_replica (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_producto INT,
  banco_origen VARCHAR(50),
  nombre VARCHAR(100),
  categoria_id INT,
  cantidad INT,
  unit VARCHAR(20) DEFAULT 'pz',
  ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);