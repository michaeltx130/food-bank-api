SET @unit_column_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'productos'
    AND COLUMN_NAME = 'unit'
);

SET @add_unit_sql = IF(
  @unit_column_exists = 0,
  "ALTER TABLE productos ADD COLUMN unit VARCHAR(20) NOT NULL DEFAULT 'pz'",
  "SELECT 'productos.unit already exists'"
);

PREPARE add_unit_stmt FROM @add_unit_sql;
EXECUTE add_unit_stmt;
DEALLOCATE PREPARE add_unit_stmt;

UPDATE productos
SET unit = 'pz'
WHERE unit IS NULL OR unit = '';
