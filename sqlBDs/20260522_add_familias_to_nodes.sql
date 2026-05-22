CREATE TABLE IF NOT EXISTS familias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100),
  telefono VARCHAR(20),
  cantidad_miembros INT,
  direccion VARCHAR(255)
);

ALTER TABLE familias ADD COLUMN beneficiario_id INT NULL;

ALTER TABLE beneficiarios ADD COLUMN familia_migration_id INT NULL;

INSERT INTO beneficiarios (nombre, familia_migration_id)
SELECT nombre, id
FROM familias
WHERE beneficiario_id IS NULL;

UPDATE familias f
JOIN beneficiarios b ON b.familia_migration_id = f.id
SET f.beneficiario_id = b.id
WHERE f.beneficiario_id IS NULL;

ALTER TABLE beneficiarios DROP COLUMN familia_migration_id;

ALTER TABLE familias MODIFY beneficiario_id INT NOT NULL;
CREATE UNIQUE INDEX familias_beneficiario_id_unique ON familias (beneficiario_id);
ALTER TABLE familias
  ADD CONSTRAINT familias_beneficiario_id_fk
  FOREIGN KEY (beneficiario_id) REFERENCES beneficiarios(id);
