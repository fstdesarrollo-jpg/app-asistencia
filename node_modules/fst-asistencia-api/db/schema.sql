-- FST Asistencia - esquema MySQL (propuesto)
-- Charset/collation recomendados para acentos y búsquedas

CREATE DATABASE IF NOT EXISTS fst_asistencia
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_0900_ai_ci;

USE fst_asistencia;

-- Perfiles (vinculables a Firebase UID o a un auth propio)
CREATE TABLE IF NOT EXISTS users (
  uid VARCHAR(128) NOT NULL,
  email VARCHAR(255) NOT NULL,
  role ENUM('administrador','profesional') NOT NULL DEFAULT 'profesional',
  nombre VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (uid),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS madres (
  id CHAR(36) NOT NULL,
  nombre_completo VARCHAR(255) NOT NULL,
  documento VARCHAR(64) NOT NULL,
  municipio VARCHAR(128) NOT NULL,
  numero_equipo VARCHAR(64) NOT NULL,
  coordinacion VARCHAR(128) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_madres_documento (documento),
  KEY ix_madres_nombre (nombre_completo),
  KEY ix_madres_equipo_coord (numero_equipo, coordinacion)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS profesionales (
  id CHAR(36) NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  documento VARCHAR(64) NOT NULL,
  cargo VARCHAR(255) NOT NULL,
  municipio VARCHAR(128) NOT NULL,
  numero_equipo VARCHAR(64) NOT NULL,
  coordinacion VARCHAR(128) NOT NULL,
  rol_interno ENUM('equipo_psicosocial','coordinadora','coordinadora_tecnica') NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_profesionales_documento (documento),
  KEY ix_profesionales_nombre (nombre),
  KEY ix_profesionales_equipo_coord (numero_equipo, coordinacion),
  KEY ix_profesionales_rol (rol_interno)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS reuniones (
  id CHAR(36) NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  responsable_nombre VARCHAR(255) NOT NULL,
  responsable_cargo VARCHAR(255) NOT NULL,
  responsable_numero_equipo VARCHAR(64) NOT NULL,
  participantes_tipo ENUM('general','segmentada') NOT NULL DEFAULT 'general',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_reuniones_fecha (fecha)
) ENGINE=InnoDB;

-- Profesionales asignados a reunión (many-to-many)
CREATE TABLE IF NOT EXISTS reunion_profesionales (
  reunion_id CHAR(36) NOT NULL,
  profesional_id CHAR(36) NOT NULL,
  PRIMARY KEY (reunion_id, profesional_id),
  CONSTRAINT fk_rp_reunion FOREIGN KEY (reunion_id) REFERENCES reuniones(id) ON DELETE CASCADE,
  CONSTRAINT fk_rp_profesional FOREIGN KEY (profesional_id) REFERENCES profesionales(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Bloques dentro de una reunión
CREATE TABLE IF NOT EXISTS reunion_bloques (
  id CHAR(36) NOT NULL,
  reunion_id CHAR(36) NOT NULL,
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_bloques_reunion (reunion_id),
  CONSTRAINT fk_bloques_reunion FOREIGN KEY (reunion_id) REFERENCES reuniones(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Madres asignadas a un bloque (many-to-many)
CREATE TABLE IF NOT EXISTS bloque_madres (
  bloque_id CHAR(36) NOT NULL,
  madre_id CHAR(36) NOT NULL,
  PRIMARY KEY (bloque_id, madre_id),
  CONSTRAINT fk_bm_bloque FOREIGN KEY (bloque_id) REFERENCES reunion_bloques(id) ON DELETE CASCADE,
  CONSTRAINT fk_bm_madre FOREIGN KEY (madre_id) REFERENCES madres(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Asistencias (madre/profesional) por bloque/reunión
CREATE TABLE IF NOT EXISTS asistencias (
  id CHAR(36) NOT NULL,
  reunion_id CHAR(36) NOT NULL,
  bloque_id CHAR(36) NOT NULL,
  tipo ENUM('madre','profesional') NOT NULL,
  madre_id CHAR(36) NULL,
  profesional_id CHAR(36) NULL,
  madre_documento VARCHAR(64) NULL,
  profesional_documento VARCHAR(64) NULL,
  estado ENUM('si','no','excusa','presente','ausente') NOT NULL,
  hora_inicio TIME NULL,
  motivo_retraso VARCHAR(500) NULL,
  motivo_no_asiste VARCHAR(500) NULL,
  fecha_registro DATETIME NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_asistencias_reunion (reunion_id),
  KEY ix_asistencias_madre (madre_id),
  KEY ix_asistencias_prof (profesional_id),
  CONSTRAINT fk_as_reunion FOREIGN KEY (reunion_id) REFERENCES reuniones(id) ON DELETE CASCADE,
  CONSTRAINT fk_as_bloque FOREIGN KEY (bloque_id) REFERENCES reunion_bloques(id) ON DELETE CASCADE,
  CONSTRAINT fk_as_madre FOREIGN KEY (madre_id) REFERENCES madres(id) ON DELETE SET NULL,
  CONSTRAINT fk_as_prof FOREIGN KEY (profesional_id) REFERENCES profesionales(id) ON DELETE SET NULL,
  CONSTRAINT ck_as_tipo_ref CHECK (
    (tipo = 'madre' AND madre_id IS NOT NULL) OR
    (tipo = 'profesional' AND profesional_id IS NOT NULL)
  )
) ENGINE=InnoDB;

-- Evitar duplicados: misma madre/profesional por bloque + reunión
CREATE UNIQUE INDEX uq_as_madre_bloque
  ON asistencias (reunion_id, bloque_id, madre_id)
  WHERE madre_id IS NOT NULL;

CREATE UNIQUE INDEX uq_as_prof_bloque
  ON asistencias (reunion_id, bloque_id, profesional_id)
  WHERE profesional_id IS NOT NULL;

-- Log de alertas
CREATE TABLE IF NOT EXISTS alertas_log (
  id CHAR(36) NOT NULL,
  tipo ENUM('asistencia','inasistencia','excusa','reunion_programada','acompanamiento','grupo_interno') NOT NULL,
  dedupe_key VARCHAR(700) NOT NULL,
  destinatario_tipo ENUM('madre','profesional','equipo_psicosocial','coordinadora','coordinadora_tecnica') NOT NULL,
  destinatario_ref VARCHAR(255) NULL,
  mensaje TEXT NOT NULL,
  reunion_id CHAR(36) NULL,
  bloque_id CHAR(36) NULL,
  madre_id CHAR(36) NULL,
  numero_equipo VARCHAR(64) NULL,
  coordinacion VARCHAR(128) NULL,
  creado_en DATETIME NOT NULL,
  metadata JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_alertas_creado (creado_en),
  KEY ix_alertas_reunion (reunion_id),
  KEY ix_alertas_madre (madre_id)
) ENGINE=InnoDB;

-- Tabla dedupe (equivalente a 'alertasDedupe' en Firestore)
CREATE TABLE IF NOT EXISTS alertas_dedupe (
  dedupe_key VARCHAR(700) NOT NULL,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (dedupe_key)
) ENGINE=InnoDB;

-- Alertas programadas
CREATE TABLE IF NOT EXISTS alertas_programadas (
  id CHAR(36) NOT NULL,
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  municipios JSON NOT NULL,
  mensaje TEXT NULL,
  reunion_id CHAR(36) NULL,
  creado_en DATETIME NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_alertas_prog_fecha (fecha)
) ENGINE=InnoDB;

