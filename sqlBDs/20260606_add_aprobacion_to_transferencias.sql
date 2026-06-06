ALTER TABLE transferencias 
ADD COLUMN aprobacion ENUM('en_espera', 'aceptado', 'denegado') NOT NULL DEFAULT 'en_espera';