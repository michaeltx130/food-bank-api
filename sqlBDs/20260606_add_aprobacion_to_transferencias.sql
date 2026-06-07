SET @aprobacion_column_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'transferencias'
    AND COLUMN_NAME = 'aprobacion'
);

SET @add_aprobacion_sql = IF(
  @aprobacion_column_exists = 0,
  'ALTER TABLE transferencias ADD COLUMN aprobacion ENUM(''en_espera'', ''aceptado'', ''denegado'') NOT NULL DEFAULT ''en_espera''',
  'SELECT ''transferencias.aprobacion already exists'''
);

PREPARE add_aprobacion_stmt FROM @add_aprobacion_sql;
EXECUTE add_aprobacion_stmt;
DEALLOCATE PREPARE add_aprobacion_stmt;
