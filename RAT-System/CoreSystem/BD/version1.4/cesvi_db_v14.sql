-- =============================================================================
-- CESVI MEXICO - Base de Datos de Peritaje y Analisis Forense de Transito
-- Version 1.4 | MySQL 8.0+ | Abril 2026
-- =============================================================================
-- INSTRUCCIONES DE USO (plug-and-play):
--   1. Abrir MySQL Workbench o ejecutar desde terminal
--   2. Correr este script completo: mysql -u root -p < cesvi_db_v14.sql
--   3. El script crea la base de datos si no existe y selecciona
-- =============================================================================
-- NOTAS DE INTEGRACION:
--   - Esta BD coexiste con el sistema base (dynamic template) de Cesvi
--   - NO se crea tabla USUARIO: se referencia sys_users.id_user via FK
--   - sys_users_stub es una tabla temporal para desarrollo local;
--     en produccion viene de la plataforma base de CESVI
--   - Prefijo RAT_ en todas las tablas del modulo para convivir con sys_*
--   - jwt_tokens y audit_logs NO llevan prefijo RAT_ (infraestructura global)
-- =============================================================================

CREATE DATABASE IF NOT EXISTS cesvi_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE cesvi_db;

SET FOREIGN_KEY_CHECKS = 0;
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- =============================================================================
-- STUB: sys_users (tabla de la plataforma base de CESVI)
-- Solo para desarrollo local. En produccion NO recrear.
-- =============================================================================
CREATE TABLE IF NOT EXISTS sys_users (
  id_user   INT          NOT NULL AUTO_INCREMENT,
  name      VARCHAR(200) NOT NULL,
  email     VARCHAR(200) NOT NULL,
  CONSTRAINT pk_sys_users   PRIMARY KEY (id_user),
  CONSTRAINT uq_sys_email   UNIQUE (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================================================
-- 1. PERFIL DEL PERITO
-- =============================================================================
CREATE TABLE RAT_PERITO_PERFIL (
  id_user            INT          NOT NULL,
  telefono           VARCHAR(20)  NULL,
  cedula_profesional VARCHAR(30)  NULL,
  especialidad       VARCHAR(200) NULL,
  numero_empleado    VARCHAR(30)  NULL,
  calificacion       DECIMAL(3,1) NULL,
  fecha_alta         DATE         NULL,
  CONSTRAINT pk_perito_perfil  PRIMARY KEY (id_user),
  CONSTRAINT fk_perfil_sysuser FOREIGN KEY (id_user) REFERENCES sys_users(id_user)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================================================
-- 2. CATALOGOS PROPIOS DEL MODULO RAT
-- =============================================================================

CREATE TABLE RAT_CAT_TIPO_HECHO (
  id     INT          NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  CONSTRAINT pk_cat_tipo_hecho PRIMARY KEY (id),
  CONSTRAINT uq_cat_tipo_hecho UNIQUE (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO RAT_CAT_TIPO_HECHO (nombre) VALUES
  ('Colision entre vehiculos'),
  ('Atropellamiento'),
  ('Caida de pasajero'),
  ('Volcadura'),
  ('Salida del camino'),
  ('Colision con objeto fijo'),
  ('Otro');

-- -----------------------------------------------------------------------------
CREATE TABLE RAT_CAT_TIPO_VIA (
  id     INT          NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  CONSTRAINT pk_cat_tipo_via PRIMARY KEY (id),
  CONSTRAINT uq_cat_tipo_via UNIQUE (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO RAT_CAT_TIPO_VIA (nombre) VALUES
  ('Autopista'),
  ('Carretera federal'),
  ('Carretera estatal'),
  ('Vialidad urbana primaria'),
  ('Vialidad urbana secundaria'),
  ('Camino rural'),
  ('Otra');

-- -----------------------------------------------------------------------------
CREATE TABLE RAT_CAT_TIPO_TRAZO (
  id     INT          NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  CONSTRAINT pk_cat_trazo PRIMARY KEY (id),
  CONSTRAINT uq_cat_trazo UNIQUE (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO RAT_CAT_TIPO_TRAZO (nombre) VALUES
  ('Recto'), ('Curva'), ('Rampa'), ('Pendiente');

-- -----------------------------------------------------------------------------
CREATE TABLE RAT_CAT_TIPO_INTERSECCION (
  id     INT          NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  CONSTRAINT pk_cat_interseccion PRIMARY KEY (id),
  CONSTRAINT uq_cat_interseccion UNIQUE (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO RAT_CAT_TIPO_INTERSECCION (nombre) VALUES
  ('Cruce simple'), ('Glorieta'), ('T'), ('Y'), ('Paso a desnivel');

-- -----------------------------------------------------------------------------
CREATE TABLE RAT_CAT_SENALAMIENTO_VERTICAL (
  id     INT          NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  CONSTRAINT pk_cat_sen_vert PRIMARY KEY (id),
  CONSTRAINT uq_cat_sen_vert UNIQUE (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO RAT_CAT_SENALAMIENTO_VERTICAL (nombre) VALUES
  ('Alto'), ('Ceda el paso'), ('Limite de velocidad'), ('Otro');

-- -----------------------------------------------------------------------------
CREATE TABLE RAT_CAT_SENALAMIENTO_HORIZONTAL (
  id     INT          NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  CONSTRAINT pk_cat_sen_horiz PRIMARY KEY (id),
  CONSTRAINT uq_cat_sen_horiz UNIQUE (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO RAT_CAT_SENALAMIENTO_HORIZONTAL (nombre) VALUES
  ('Lineas continuas'), ('Lineas discontinuas'), ('Paso peatonal'),
  ('Sentidos de circulacion'), ('Otro');

-- -----------------------------------------------------------------------------
CREATE TABLE RAT_CAT_CONDICION_SUPERFICIE (
  id     INT          NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  CONSTRAINT pk_cat_cond_sup PRIMARY KEY (id),
  CONSTRAINT uq_cat_cond_sup UNIQUE (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO RAT_CAT_CONDICION_SUPERFICIE (nombre) VALUES
  ('Seco'), ('Mojado'), ('Hielo'), ('Nieve');

-- -----------------------------------------------------------------------------
CREATE TABLE RAT_CAT_CONDICION_PAVIMENTO (
  id     INT          NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  CONSTRAINT pk_cat_cond_pav PRIMARY KEY (id),
  CONSTRAINT uq_cat_cond_pav UNIQUE (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO RAT_CAT_CONDICION_PAVIMENTO (nombre) VALUES
  ('Buenas condiciones'), ('Malas condiciones');

-- -----------------------------------------------------------------------------
CREATE TABLE RAT_CAT_TIPO_PAVIMENTO (
  id     INT          NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  CONSTRAINT pk_cat_tipo_pav PRIMARY KEY (id),
  CONSTRAINT uq_cat_tipo_pav UNIQUE (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO RAT_CAT_TIPO_PAVIMENTO (nombre) VALUES
  ('Asfalto'), ('Concreto'), ('Adoquin'), ('Terraceria'), ('Grava');

-- -----------------------------------------------------------------------------
CREATE TABLE RAT_CAT_CLIMA (
  id     INT          NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  CONSTRAINT pk_cat_clima PRIMARY KEY (id),
  CONSTRAINT uq_cat_clima UNIQUE (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO RAT_CAT_CLIMA (nombre) VALUES
  ('Soleado'), ('Lluvioso'), ('Nublado'), ('Niebla / Neblina'), ('Granizo'), ('Noche');

-- -----------------------------------------------------------------------------
CREATE TABLE RAT_CAT_ORIENTACION_VIA (
  id     INT          NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  CONSTRAINT pk_cat_orient PRIMARY KEY (id),
  CONSTRAINT uq_cat_orient UNIQUE (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO RAT_CAT_ORIENTACION_VIA (nombre) VALUES
  ('Norte - Sur'), ('Sur - Norte'), ('Este - Oeste'), ('Oeste - Este'),
  ('Noroeste - Sureste'), ('Sureste - Noroeste'), ('Noreste - Sureste'),
  ('Sureste - Noreste'), ('Suroeste - Noreste'), ('Noreste - Suroeste'),
  ('Noroeste - Suroeste'), ('Suroeste - Noroeste');

-- -----------------------------------------------------------------------------
CREATE TABLE RAT_CAT_SENTIDO_VIALIDAD (
  id     INT          NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  CONSTRAINT pk_cat_sentido PRIMARY KEY (id),
  CONSTRAINT uq_cat_sentido UNIQUE (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO RAT_CAT_SENTIDO_VIALIDAD (nombre) VALUES
  ('Un sentido'), ('Doble sentido');

-- -----------------------------------------------------------------------------
CREATE TABLE RAT_CAT_ESTADO_NEUMATICO (
  id     INT          NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  CONSTRAINT pk_cat_est_neum PRIMARY KEY (id),
  CONSTRAINT uq_cat_est_neum UNIQUE (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO RAT_CAT_ESTADO_NEUMATICO (nombre) VALUES ('Nuevo'), ('Usado');

-- -----------------------------------------------------------------------------
CREATE TABLE RAT_CAT_COLOR (
  id     INT          NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  CONSTRAINT pk_cat_color PRIMARY KEY (id),
  CONSTRAINT uq_cat_color UNIQUE (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO RAT_CAT_COLOR (nombre) VALUES
  ('Blanco'), ('Negro'), ('Gris'), ('Azul'), ('Rojo'),
  ('Cafe / Marron'), ('Verde'), ('Naranja'), ('Otro');

-- -----------------------------------------------------------------------------
CREATE TABLE RAT_CAT_TIPO_FOTO (
  id     INT          NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  CONSTRAINT pk_cat_tipo_foto PRIMARY KEY (id),
  CONSTRAINT uq_cat_tipo_foto UNIQUE (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO RAT_CAT_TIPO_FOTO (nombre) VALUES
  ('Frontal'), ('Lateral Derecho'), ('Lateral Izquierdo'), ('Posterior'),
  ('Partes Bajas'), ('Habitaculo'), ('Lugar de los Hechos'), ('Objeto Involucrado');

-- -----------------------------------------------------------------------------
CREATE TABLE RAT_CAT_TIPO_GOLPE (
  id     INT          NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  CONSTRAINT pk_cat_tipo_golpe PRIMARY KEY (id),
  CONSTRAINT uq_cat_tipo_golpe UNIQUE (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO RAT_CAT_TIPO_GOLPE (nombre) VALUES
  ('Frontal'), ('Trasero'), ('Lateral'), ('Inferior'), ('Superior');

-- -----------------------------------------------------------------------------
CREATE TABLE RAT_CAT_NUMERO_MEDICIONES (
  id    INT NOT NULL AUTO_INCREMENT,
  valor INT NOT NULL,
  CONSTRAINT pk_cat_num_med PRIMARY KEY (id),
  CONSTRAINT uq_cat_num_med UNIQUE (valor)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO RAT_CAT_NUMERO_MEDICIONES (valor) VALUES (2), (4), (6);

-- -----------------------------------------------------------------------------
CREATE TABLE RAT_CAT_TIPO_INDICIO (
  id     INT          NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  CONSTRAINT pk_cat_indicio PRIMARY KEY (id),
  CONSTRAINT uq_cat_indicio UNIQUE (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO RAT_CAT_TIPO_INDICIO (nombre) VALUES
  ('Plastico'), ('Vidrio'), ('Pintura'), ('Neumatico'), ('Metal'), ('Otro');

-- -----------------------------------------------------------------------------
CREATE TABLE RAT_CAT_POSICION_INICIAL (
  id     INT          NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  CONSTRAINT pk_cat_pos_ini PRIMARY KEY (id),
  CONSTRAINT uq_cat_pos_ini UNIQUE (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO RAT_CAT_POSICION_INICIAL (nombre) VALUES
  ('Estacionado'), ('Circulando'), ('Detenido'),
  ('Reversa'), ('Invasion de carril'), ('Cambio de carril');

-- -----------------------------------------------------------------------------
CREATE TABLE RAT_CAT_PERCEPCION_REAL (
  id     INT          NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  CONSTRAINT pk_cat_ppr PRIMARY KEY (id),
  CONSTRAINT uq_cat_ppr UNIQUE (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO RAT_CAT_PERCEPCION_REAL (nombre) VALUES
  ('Distraccion'), ('Visibilidad reducida'), ('Punto ciego'),
  ('Obstaculo repentino'), ('Fatiga');

-- -----------------------------------------------------------------------------
CREATE TABLE RAT_CAT_PUNTO_CLAVE (
  id     INT          NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  CONSTRAINT pk_cat_pc PRIMARY KEY (id),
  CONSTRAINT uq_cat_pc UNIQUE (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO RAT_CAT_PUNTO_CLAVE (nombre) VALUES
  ('Freno brusco'), ('Volanteo'), ('Aceleracion'),
  ('Sin reaccion'), ('Rebase fallido');

-- -----------------------------------------------------------------------------
CREATE TABLE RAT_CAT_TRAYECTORIA_POST (
  id     INT          NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  CONSTRAINT pk_cat_tray PRIMARY KEY (id),
  CONSTRAINT uq_cat_tray UNIQUE (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO RAT_CAT_TRAYECTORIA_POST (nombre) VALUES
  ('Recta'), ('Rotacion'), ('Derrape'),
  ('Vuelco lateral'), ('Vuelco total'), ('Proyeccion fuera de via');

-- -----------------------------------------------------------------------------
CREATE TABLE RAT_CAT_ZONA_VEHICULO (
  id     INT          NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  CONSTRAINT pk_cat_zona PRIMARY KEY (id),
  CONSTRAINT uq_cat_zona UNIQUE (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO RAT_CAT_ZONA_VEHICULO (nombre) VALUES
  ('Parte Frontal'), ('Vertice Delantero Derecho'), ('Lado Derecho'),
  ('Vertice Trasero Derecho'), ('Parte Trasera'), ('Vertice Trasero Izquierdo'),
  ('Lado Izquierdo'), ('Vertice Delantero Izquierdo'), ('Toldo'),
  ('Habitaculo'), ('Partes Bajas');

-- -----------------------------------------------------------------------------
CREATE TABLE RAT_CAT_PARTE_VEHICULO (
  id            INT          NOT NULL AUTO_INCREMENT,
  zona_id       INT          NOT NULL,
  tipo_vehiculo VARCHAR(10)  NOT NULL,
  subzona       VARCHAR(50)  NULL,
  nombre        VARCHAR(200) NOT NULL,
  CONSTRAINT pk_cat_parte  PRIMARY KEY (id),
  CONSTRAINT fk_parte_zona FOREIGN KEY (zona_id) REFERENCES RAT_CAT_ZONA_VEHICULO(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------------------------------
CREATE TABLE RAT_CAT_TIPO_DANO (
  id     INT          NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  CONSTRAINT pk_cat_tipo_dano PRIMARY KEY (id),
  CONSTRAINT uq_cat_tipo_dano UNIQUE (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO RAT_CAT_TIPO_DANO (nombre) VALUES
  ('Hundimiento'), ('Corrimiento'), ('Tallon'), ('Ruptura'), ('Repercusion');

-- -----------------------------------------------------------------------------
CREATE TABLE RAT_CAT_CUERPO_GENERADOR (
  id     INT         NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(50) NOT NULL,
  CONSTRAINT pk_cat_cuerpo PRIMARY KEY (id),
  CONSTRAINT uq_cat_cuerpo UNIQUE (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO RAT_CAT_CUERPO_GENERADOR (nombre) VALUES ('Duro'), ('Blando');

-- -----------------------------------------------------------------------------
CREATE TABLE RAT_CAT_DIRECCION_DANO (
  id     INT          NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  CONSTRAINT pk_cat_dir_dano PRIMARY KEY (id),
  CONSTRAINT uq_cat_dir_dano UNIQUE (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO RAT_CAT_DIRECCION_DANO (nombre) VALUES
  ('Adelante hacia atras'), ('Atras hacia adelante'),
  ('Izquierda a derecha'),  ('Derecha a izquierda'),
  ('Arriba hacia abajo'),   ('Abajo hacia arriba');

-- -----------------------------------------------------------------------------
CREATE TABLE RAT_CAT_CONSECUENCIA_DANO (
  id     INT          NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  CONSTRAINT pk_cat_consec PRIMARY KEY (id),
  CONSTRAINT uq_cat_consec UNIQUE (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO RAT_CAT_CONSECUENCIA_DANO (nombre) VALUES
  ('Desprendimiento'), ('Desplazamiento'), ('Impregnacion'),
  ('Resquebrajamiento'), ('Oxidacion'), ('Desacople'),
  ('Derrame de liquidos automotrices'), ('Desacople de componentes mecanicos');

-- =============================================================================
-- 3. TABLAS TECNICAS McHenry
-- =============================================================================
CREATE TABLE RAT_TABLA_RIGIDEZ_AB (
  id                  BIGINT        NOT NULL AUTO_INCREMENT,
  categoria_mchenry   INT           NOT NULL,
  batalla_min_m       DECIMAL(6,3)  NOT NULL,
  batalla_max_m       DECIMAL(6,3)  NOT NULL,
  via_delantera_ref_m DECIMAL(6,3)  NULL,
  longitud_ref_m      DECIMAL(6,3)  NULL,
  anchura_ref_m       DECIMAL(6,3)  NULL,
  tara_ref_kg         DECIMAL(8,2)  NULL,
  tipo_golpe_id       INT           NOT NULL,
  a_rigidez_n_m       DECIMAL(12,3) NOT NULL,
  b_rigidez_n_m2      DECIMAL(12,3) NOT NULL,
  CONSTRAINT pk_rigidez   PRIMARY KEY (id),
  CONSTRAINT fk_rig_golpe FOREIGN KEY (tipo_golpe_id) REFERENCES RAT_CAT_TIPO_GOLPE(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------------------------------
CREATE TABLE RAT_TABLA_MU (
  id                      BIGINT       NOT NULL AUTO_INCREMENT,
  tipo_pavimento_id       INT          NOT NULL,
  condicion_superficie_id INT          NOT NULL,
  estado_neumatico_id     INT          NOT NULL,
  vel_min_kmh             DECIMAL(6,2) NULL,
  vel_max_kmh             DECIMAL(6,2) NULL,
  mu                      DECIMAL(5,4) NOT NULL,
  CONSTRAINT pk_tabla_mu      PRIMARY KEY (id),
  CONSTRAINT fk_mu_pavimento  FOREIGN KEY (tipo_pavimento_id)       REFERENCES RAT_CAT_TIPO_PAVIMENTO(id),
  CONSTRAINT fk_mu_superficie FOREIGN KEY (condicion_superficie_id) REFERENCES RAT_CAT_CONDICION_SUPERFICIE(id),
  CONSTRAINT fk_mu_neumatico  FOREIGN KEY (estado_neumatico_id)     REFERENCES RAT_CAT_ESTADO_NEUMATICO(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------------------------------
CREATE TABLE RAT_TABLA_TIEMPO_FRENOS (
  id           INT          NOT NULL AUTO_INCREMENT,
  eficacia_pct DECIMAL(5,2) NOT NULL,
  tiempo_s     DECIMAL(4,2) NOT NULL,
  CONSTRAINT pk_t_frenos PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO RAT_TABLA_TIEMPO_FRENOS (eficacia_pct, tiempo_s) VALUES
  (70.00, 0.20), (80.00, 0.20), (100.00, 0.10);

-- =============================================================================
-- 4. INCIDENTE  [UUID]
-- uuid: clave publica para URLs y API
-- id:   clave interna para JOINs
-- =============================================================================
CREATE TABLE RAT_INCIDENTE (
  id                BIGINT       NOT NULL AUTO_INCREMENT,
  uuid              CHAR(36)     NOT NULL,
  numero_siniestro  VARCHAR(100) NOT NULL,
  fecha_hecho       DATE         NOT NULL,
  hora_hecho        TIME         NULL,
  tipo_hecho_id     INT          NOT NULL,
  id_usuario_perito INT          NOT NULL,
  estado            TINYINT      NOT NULL DEFAULT 0,
  created_at        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT pk_incidente      PRIMARY KEY (id),
  CONSTRAINT uq_incidente_uuid UNIQUE (uuid),
  CONSTRAINT uq_incidente_num  UNIQUE (numero_siniestro),
  CONSTRAINT fk_inc_tipo_hecho FOREIGN KEY (tipo_hecho_id)     REFERENCES RAT_CAT_TIPO_HECHO(id),
  CONSTRAINT fk_inc_perito     FOREIGN KEY (id_usuario_perito) REFERENCES sys_users(id_user),
  CONSTRAINT chk_inc_estado    CHECK (estado IN (0, 1, 2))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================================================
-- 5. UBICACION DE LA VIA  [UUID]
-- =============================================================================
CREATE TABLE RAT_UBICACION_VIA (
  id                             BIGINT        NOT NULL AUTO_INCREMENT,
  uuid                           CHAR(36)      NOT NULL,
  incidente_id                   BIGINT        NOT NULL,
  calle                          VARCHAR(200)  NULL,
  numero_exterior                VARCHAR(20)   NULL,
  colonia                        VARCHAR(100)  NULL,
  codigo_postal                  VARCHAR(10)   NULL,
  municipio                      VARCHAR(100)  NULL,
  estado_republica               VARCHAR(100)  NULL,
  pais                           VARCHAR(100)  NOT NULL DEFAULT 'Mexico',
  referencia_adicional           TEXT          NULL,
  km_punto                       VARCHAR(50)   NULL,
  lat                            DECIMAL(10,7) NULL,
  lng                            DECIMAL(10,7) NULL,
  velocidad_maxima_permitida_kmh INT           NULL,
  tipo_via_id                    INT           NULL,
  tipo_trazo_id                  INT           NULL,
  tipo_interseccion_id           INT           NULL,
  senalamiento_vertical_id       INT           NULL,
  senalamiento_horizontal_id     INT           NULL,
  medidas_via_m                  DECIMAL(6,2)  NULL,
  orientacion_id                 INT           NULL,
  sentido_vialidad_id            INT           NULL,
  condicion_superficie_id        INT           NULL,
  condicion_pavimento_id         INT           NULL,
  tipo_pavimento_id              INT           NULL,
  clima_id                       INT           NULL,
  mu_coeficiente_adherencia      DECIMAL(5,4)  NULL,
  inclinacion_pct                DECIMAL(6,3)  NULL,
  mu_corregido                   DECIMAL(5,4)  NULL,
  radio_curva_m                  DECIMAL(8,2)  NULL,
  peraltaje_pct                  DECIMAL(6,3)  NULL,
  CONSTRAINT pk_ubicacion           PRIMARY KEY (id),
  CONSTRAINT uq_ubicacion_uuid      UNIQUE (uuid),
  CONSTRAINT uq_ubic_incidente      UNIQUE (incidente_id),
  CONSTRAINT fk_ubic_incidente      FOREIGN KEY (incidente_id)               REFERENCES RAT_INCIDENTE(id),
  CONSTRAINT fk_ubic_tipo_via       FOREIGN KEY (tipo_via_id)                REFERENCES RAT_CAT_TIPO_VIA(id),
  CONSTRAINT fk_ubic_trazo          FOREIGN KEY (tipo_trazo_id)              REFERENCES RAT_CAT_TIPO_TRAZO(id),
  CONSTRAINT fk_ubic_interseccion   FOREIGN KEY (tipo_interseccion_id)       REFERENCES RAT_CAT_TIPO_INTERSECCION(id),
  CONSTRAINT fk_ubic_sen_vert       FOREIGN KEY (senalamiento_vertical_id)   REFERENCES RAT_CAT_SENALAMIENTO_VERTICAL(id),
  CONSTRAINT fk_ubic_sen_horiz      FOREIGN KEY (senalamiento_horizontal_id) REFERENCES RAT_CAT_SENALAMIENTO_HORIZONTAL(id),
  CONSTRAINT fk_ubic_orientacion    FOREIGN KEY (orientacion_id)             REFERENCES RAT_CAT_ORIENTACION_VIA(id),
  CONSTRAINT fk_ubic_sentido        FOREIGN KEY (sentido_vialidad_id)        REFERENCES RAT_CAT_SENTIDO_VIALIDAD(id),
  CONSTRAINT fk_ubic_cond_sup       FOREIGN KEY (condicion_superficie_id)    REFERENCES RAT_CAT_CONDICION_SUPERFICIE(id),
  CONSTRAINT fk_ubic_cond_pav       FOREIGN KEY (condicion_pavimento_id)     REFERENCES RAT_CAT_CONDICION_PAVIMENTO(id),
  CONSTRAINT fk_ubic_pavimento      FOREIGN KEY (tipo_pavimento_id)          REFERENCES RAT_CAT_TIPO_PAVIMENTO(id),
  CONSTRAINT fk_ubic_clima          FOREIGN KEY (clima_id)                   REFERENCES RAT_CAT_CLIMA(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------------------------------
CREATE TABLE RAT_HUELLA_ESCENA (
  id                   BIGINT       NOT NULL AUTO_INCREMENT,
  ubicacion_via_id     BIGINT       NOT NULL,
  tipo_indicio_id      INT          NOT NULL,
  longitud_frenado_m   DECIMAL(8,2) NULL,
  longitud_derrape_m   DECIMAL(8,2) NULL,
  mu_corregido_derrape DECIMAL(5,4) NULL,
  descripcion_indicio  TEXT         NULL,
  CONSTRAINT pk_huella         PRIMARY KEY (id),
  CONSTRAINT fk_huella_ubic    FOREIGN KEY (ubicacion_via_id) REFERENCES RAT_UBICACION_VIA(id),
  CONSTRAINT fk_huella_indicio FOREIGN KEY (tipo_indicio_id)  REFERENCES RAT_CAT_TIPO_INDICIO(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================================================
-- 6. VEHICULOS  [UUID]
-- =============================================================================
CREATE TABLE RAT_VEHICULO (
  id                        BIGINT        NOT NULL AUTO_INCREMENT,
  uuid                      CHAR(36)      NOT NULL,
  vin                       VARCHAR(17)   NOT NULL,
  tipo_clase                VARCHAR(100)  NULL,
  marca                     VARCHAR(100)  NOT NULL,
  submarca                  VARCHAR(100)  NULL,
  nombre_modelo             VARCHAR(200)  NULL,
  anio_modelo               YEAR          NOT NULL,
  tipo_vehiculo             VARCHAR(10)   NOT NULL,
  peso_tara_kg              DECIMAL(8,2)  NULL,
  masa_maxima_autorizada_kg DECIMAL(8,2)  NULL,
  ancho_mm                  DECIMAL(8,1)  NULL,
  largo_mm                  DECIMAL(8,1)  NULL,
  alto_mm                   DECIMAL(8,1)  NULL,
  batalla_mm                DECIMAL(8,1)  NULL,
  voladizo_anterior_mm      DECIMAL(8,1)  NULL,
  voladizo_posterior_mm     DECIMAL(8,1)  NULL,
  entrevia_delantera_mm     DECIMAL(8,1)  NULL,
  entrevia_trasera_mm       DECIMAL(8,1)  NULL,
  redondez_vertices_mm      DECIMAL(8,1)  NULL,
  centro_gravedad_m         DECIMAL(5,3)  NULL,
  created_at                DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at                DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT pk_vehiculo      PRIMARY KEY (id),
  CONSTRAINT uq_vehiculo_uuid UNIQUE (uuid),
  CONSTRAINT uq_vehiculo_vin  UNIQUE (vin),
  CONSTRAINT chk_veh_tipo     CHECK (tipo_vehiculo IN ('ligero', 'pesado'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================================================
-- 6b. INCIDENTE_VEHICULO  [UUID]
-- =============================================================================
CREATE TABLE RAT_INCIDENTE_VEHICULO (
  id                  BIGINT      NOT NULL AUTO_INCREMENT,
  uuid                CHAR(36)    NOT NULL,
  incidente_id        BIGINT      NOT NULL,
  vehiculo_id         BIGINT      NOT NULL,
  numero_placas       VARCHAR(20) NULL,
  color_id            INT         NULL,
  estado_neumatico_id INT         NULL,
  rol                 CHAR(1)     NOT NULL,
  created_at          DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT pk_inc_veh      PRIMARY KEY (id),
  CONSTRAINT uq_inc_veh_uuid UNIQUE (uuid),
  CONSTRAINT fk_iv_incidente FOREIGN KEY (incidente_id)        REFERENCES RAT_INCIDENTE(id),
  CONSTRAINT fk_iv_vehiculo  FOREIGN KEY (vehiculo_id)         REFERENCES RAT_VEHICULO(id),
  CONSTRAINT fk_iv_color     FOREIGN KEY (color_id)            REFERENCES RAT_CAT_COLOR(id),
  CONSTRAINT fk_iv_neumatico FOREIGN KEY (estado_neumatico_id) REFERENCES RAT_CAT_ESTADO_NEUMATICO(id),
  CONSTRAINT chk_iv_rol      CHECK (rol IN ('A', 'B', 'C'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------------------------------
CREATE TABLE RAT_OCUPACION_CARGA (
  id                    BIGINT       NOT NULL AUTO_INCREMENT,
  incidente_vehiculo_id BIGINT       NOT NULL,
  numero_ocupantes      INT          NULL,
  peso_conductor_kg     DECIMAL(6,2) NULL,
  peso_pasajeros_kg     DECIMAL(7,2) NULL,
  peso_equipaje_kg      DECIMAL(7,2) NULL,
  masa_total_kg         DECIMAL(8,2) NULL,
  CONSTRAINT pk_ocup    PRIMARY KEY (id),
  CONSTRAINT uq_ocup_iv UNIQUE (incidente_vehiculo_id),
  CONSTRAINT fk_ocup_iv FOREIGN KEY (incidente_vehiculo_id) REFERENCES RAT_INCIDENTE_VEHICULO(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------------------------------
CREATE TABLE RAT_FOTO (
  id                    BIGINT       NOT NULL AUTO_INCREMENT,
  incidente_vehiculo_id BIGINT       NOT NULL,
  tipo_foto_id          INT          NOT NULL,
  url                   VARCHAR(500) NOT NULL,
  descripcion           VARCHAR(500) NULL,
  tomada_en             DATETIME     NULL,
  CONSTRAINT pk_foto      PRIMARY KEY (id),
  CONSTRAINT fk_foto_iv   FOREIGN KEY (incidente_vehiculo_id) REFERENCES RAT_INCIDENTE_VEHICULO(id),
  CONSTRAINT fk_foto_tipo FOREIGN KEY (tipo_foto_id)          REFERENCES RAT_CAT_TIPO_FOTO(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================================================
-- 7. ANALISIS TECNICO
-- =============================================================================
CREATE TABLE RAT_DEFORMACION_MEDICION (
  id                    BIGINT       NOT NULL AUTO_INCREMENT,
  incidente_vehiculo_id BIGINT       NOT NULL,
  tipo_golpe_id         INT          NOT NULL,
  numero_mediciones_id  INT          NOT NULL,
  c1_m                  DECIMAL(5,3) NOT NULL,
  c2_m                  DECIMAL(5,3) NOT NULL,
  c3_m                  DECIMAL(5,3) NOT NULL,
  c4_m                  DECIMAL(5,3) NULL,
  c5_m                  DECIMAL(5,3) NULL,
  c6_m                  DECIMAL(5,3) NULL,
  l_ancho_contacto_m    DECIMAL(6,3) NULL,
  angulo_fpi_grados     DECIMAL(6,2) NULL,
  arqueamiento_cm       DECIMAL(6,2) NULL,
  linea_referencia_mm   DECIMAL(8,1) NULL,
  CONSTRAINT pk_deform    PRIMARY KEY (id),
  CONSTRAINT uq_deform_iv UNIQUE (incidente_vehiculo_id),
  CONSTRAINT fk_def_iv    FOREIGN KEY (incidente_vehiculo_id) REFERENCES RAT_INCIDENTE_VEHICULO(id),
  CONSTRAINT fk_def_golpe FOREIGN KEY (tipo_golpe_id)         REFERENCES RAT_CAT_TIPO_GOLPE(id),
  CONSTRAINT fk_def_nmed  FOREIGN KEY (numero_mediciones_id)  REFERENCES RAT_CAT_NUMERO_MEDICIONES(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------------------------------
CREATE TABLE RAT_MODALIDAD_DANO (
  id                    BIGINT NOT NULL AUTO_INCREMENT,
  incidente_vehiculo_id BIGINT NOT NULL,
  zona_vehiculo_id      INT    NOT NULL,
  parte_vehiculo_id     INT    NOT NULL,
  tipo_dano_id          INT    NOT NULL,
  cuerpo_generador_id   INT    NOT NULL,
  direccion_dano_id     INT    NOT NULL,
  consecuencia_id       INT    NOT NULL,
  descripcion_libre     TEXT   NULL,
  CONSTRAINT pk_modalidad  PRIMARY KEY (id),
  CONSTRAINT fk_mod_iv     FOREIGN KEY (incidente_vehiculo_id) REFERENCES RAT_INCIDENTE_VEHICULO(id),
  CONSTRAINT fk_mod_zona   FOREIGN KEY (zona_vehiculo_id)      REFERENCES RAT_CAT_ZONA_VEHICULO(id),
  CONSTRAINT fk_mod_parte  FOREIGN KEY (parte_vehiculo_id)     REFERENCES RAT_CAT_PARTE_VEHICULO(id),
  CONSTRAINT fk_mod_tipo   FOREIGN KEY (tipo_dano_id)          REFERENCES RAT_CAT_TIPO_DANO(id),
  CONSTRAINT fk_mod_cuerpo FOREIGN KEY (cuerpo_generador_id)   REFERENCES RAT_CAT_CUERPO_GENERADOR(id),
  CONSTRAINT fk_mod_dir    FOREIGN KEY (direccion_dano_id)     REFERENCES RAT_CAT_DIRECCION_DANO(id),
  CONSTRAINT fk_mod_consec FOREIGN KEY (consecuencia_id)       REFERENCES RAT_CAT_CONSECUENCIA_DANO(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------------------------------
CREATE TABLE RAT_CALCULO_VELOCIDAD (
  id                          BIGINT        NOT NULL AUTO_INCREMENT,
  incidente_vehiculo_id       BIGINT        NOT NULL,
  categoria_mchenry           INT           NULL,
  a_rigidez_n_m               DECIMAL(12,3) NULL,
  b_rigidez_n_m2              DECIMAL(12,3) NULL,
  e_deformacion_julios        DECIMAL(14,3) NULL,
  e_def_corregida_julios      DECIMAL(14,3) NULL,
  aplica_vuelco               TINYINT(1)    NOT NULL DEFAULT 0,
  angulo_vuelco_grados        DECIMAL(6,2)  NULL,
  hipotenusa_vuelco_m         DECIMAL(6,3)  NULL,
  h_altura_critica_m          DECIMAL(6,3)  NULL,
  centro_gravedad_m           DECIMAL(5,3)  NULL,
  e_vuelco_julios             DECIMAL(14,3) NULL,
  e_total_julios              DECIMAL(14,3) NULL,
  ebs_m_s                     DECIMAL(8,4)  NULL,
  velocidad_impacto_kmh       DECIMAL(8,2)  NULL,
  dmed_m                      DECIMAL(6,3)  NULL,
  velocidad_limpert_kmh       DECIMAL(8,2)  NULL,
  vel_limpert_margenerror_kmh DECIMAL(8,2)  NULL,
  e_frenado_julios            DECIMAL(14,3) NULL,
  velocidad_pre_impacto_kmh   DECIMAL(8,2)  NULL,
  tiempo_frenos_id            INT           NULL,
  tiempo_respuesta_frenos_s   DECIMAL(4,2)  NULL,
  velocidad_final_kmh         DECIMAL(8,2)  NULL,
  exceso_velocidad            TINYINT(1)    NULL,
  delta_exceso_kmh            DECIMAL(8,2)  NULL,
  margen_error_kmh            DECIMAL(6,2)  NULL DEFAULT 10.00,
  CONSTRAINT pk_calculo     PRIMARY KEY (id),
  CONSTRAINT uq_calculo_iv  UNIQUE (incidente_vehiculo_id),
  CONSTRAINT fk_calc_iv     FOREIGN KEY (incidente_vehiculo_id) REFERENCES RAT_INCIDENTE_VEHICULO(id),
  CONSTRAINT fk_calc_frenos FOREIGN KEY (tiempo_frenos_id)      REFERENCES RAT_TABLA_TIEMPO_FRENOS(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================================================
-- 8. ANALISIS FORENSE
-- =============================================================================
CREATE TABLE RAT_FASE_ACCIDENTE (
  id                    BIGINT       NOT NULL AUTO_INCREMENT,
  incidente_vehiculo_id BIGINT       NOT NULL,
  posicion_inicial_id   INT          NULL,
  percepcion_real_id    INT          NULL,
  factores_percepcion   VARCHAR(500) NULL,
  punto_clave_id        INT          NULL,
  factores_punto_clave  VARCHAR(500) NULL,
  zona_impacto_id       INT          NULL,
  trayectoria_post_id   INT          NULL,
  CONSTRAINT pk_fase     PRIMARY KEY (id),
  CONSTRAINT uq_fase_iv  UNIQUE (incidente_vehiculo_id),
  CONSTRAINT fk_fase_iv  FOREIGN KEY (incidente_vehiculo_id) REFERENCES RAT_INCIDENTE_VEHICULO(id),
  CONSTRAINT fk_fase_pos FOREIGN KEY (posicion_inicial_id)   REFERENCES RAT_CAT_POSICION_INICIAL(id),
  CONSTRAINT fk_fase_ppr FOREIGN KEY (percepcion_real_id)    REFERENCES RAT_CAT_PERCEPCION_REAL(id),
  CONSTRAINT fk_fase_pc  FOREIGN KEY (punto_clave_id)        REFERENCES RAT_CAT_PUNTO_CLAVE(id),
  CONSTRAINT fk_fase_zona FOREIGN KEY (zona_impacto_id)      REFERENCES RAT_CAT_ZONA_VEHICULO(id),
  CONSTRAINT fk_fase_tray FOREIGN KEY (trayectoria_post_id)  REFERENCES RAT_CAT_TRAYECTORIA_POST(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------------------------------
CREATE TABLE RAT_NARRATIVA_DINAMICA (
  id                          BIGINT       NOT NULL AUTO_INCREMENT,
  incidente_vehiculo_id       BIGINT       NOT NULL,
  narracion_hechos            TEXT         NULL,
  objeto_involucrado          VARCHAR(200) NULL,
  descripcion_objeto_fijo     TEXT         NULL,
  posicion_final_vehiculo     VARCHAR(300) NULL,
  direccion_circulacion       VARCHAR(200) NULL,
  distancia_ppr_al_pc_m       DECIMAL(8,2) NULL,
  tiempo_reaccion_conductor_s DECIMAL(4,2) NULL DEFAULT 1.00,
  huellas_frenado_m           DECIMAL(8,2) NULL,
  huellas_derrape_m           DECIMAL(8,2) NULL,
  CONSTRAINT pk_narrativa  PRIMARY KEY (id),
  CONSTRAINT uq_narr_iv    UNIQUE (incidente_vehiculo_id),
  CONSTRAINT fk_narr_iv    FOREIGN KEY (incidente_vehiculo_id) REFERENCES RAT_INCIDENTE_VEHICULO(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------------------------------
CREATE TABLE RAT_PRINCIPIOS_FORENSES (
  id                               BIGINT NOT NULL AUTO_INCREMENT,
  incidente_vehiculo_id            BIGINT NOT NULL,
  principio_intercambio_materiales TEXT   NULL,
  principio_correspondencia        TEXT   NULL,
  dinamica_colision_fases          TEXT   NULL,
  CONSTRAINT pk_principios PRIMARY KEY (id),
  CONSTRAINT uq_princ_iv   UNIQUE (incidente_vehiculo_id),
  CONSTRAINT fk_princ_iv   FOREIGN KEY (incidente_vehiculo_id) REFERENCES RAT_INCIDENTE_VEHICULO(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------------------------------
CREATE TABLE RAT_CONCLUSION (
  id                     BIGINT     NOT NULL AUTO_INCREMENT,
  principios_forenses_id BIGINT     NOT NULL,
  orden                  INT        NOT NULL,
  texto_conclusion       TEXT       NOT NULL,
  validado_perito        TINYINT(1) NOT NULL DEFAULT 0,
  validado_por_id        INT        NULL,
  validado_en            DATETIME   NULL,
  CONSTRAINT pk_conclusion   PRIMARY KEY (id),
  CONSTRAINT fk_conc_princ   FOREIGN KEY (principios_forenses_id) REFERENCES RAT_PRINCIPIOS_FORENSES(id),
  CONSTRAINT fk_conc_usuario FOREIGN KEY (validado_por_id)        REFERENCES sys_users(id_user)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================================================
-- 9. REPORTE  [UUID]
-- =============================================================================
CREATE TABLE RAT_REPORTE (
  id                  BIGINT       NOT NULL AUTO_INCREMENT,
  uuid                CHAR(36)     NOT NULL,
  incidente_id        BIGINT       NOT NULL,
  id_usuario_perito   INT          NOT NULL,
  numero_formato      VARCHAR(50)  NULL,
  tipo_documento      VARCHAR(20)  NOT NULL,
  nivel_emergencia    TINYINT      NULL,
  fecha_elaboracion   DATE         NULL,
  ubicacion_taller    VARCHAR(300) NULL,
  ruta_documento_word VARCHAR(500) NULL,
  estado              TINYINT      NOT NULL DEFAULT 0,
  intentos_emision    INT          NOT NULL DEFAULT 0,
  fecha_inicio        DATETIME     NULL,
  fecha_emision       DATETIME     NULL,
  created_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT pk_reporte       PRIMARY KEY (id),
  CONSTRAINT uq_reporte_uuid  UNIQUE (uuid),
  CONSTRAINT fk_rep_incidente FOREIGN KEY (incidente_id)      REFERENCES RAT_INCIDENTE(id),
  CONSTRAINT fk_rep_perito    FOREIGN KEY (id_usuario_perito) REFERENCES sys_users(id_user),
  CONSTRAINT chk_rep_tipo     CHECK (tipo_documento IN ('informe', 'dictamen')),
  CONSTRAINT chk_rep_estado   CHECK (estado IN (0, 1, 2))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================================================
-- 10. PLANTILLAS
-- =============================================================================
CREATE TABLE RAT_PLANTILLA (
  id             INT          NOT NULL AUTO_INCREMENT,
  tipo_documento VARCHAR(20)  NOT NULL,
  version        VARCHAR(20)  NOT NULL,
  activa         TINYINT(1)   NOT NULL DEFAULT 0,
  descripcion    VARCHAR(300) NULL,
  created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT pk_plantilla   PRIMARY KEY (id),
  CONSTRAINT chk_plant_tipo CHECK (tipo_documento IN ('informe', 'dictamen'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------------------------------
CREATE TABLE RAT_PLANTILLA_SECCION (
  id             INT          NOT NULL AUTO_INCREMENT,
  plantilla_id   INT          NOT NULL,
  numero_seccion VARCHAR(20)  NOT NULL,
  titulo         VARCHAR(300) NOT NULL,
  orden          INT          NOT NULL,
  es_visible     TINYINT(1)   NOT NULL DEFAULT 1,
  CONSTRAINT pk_seccion       PRIMARY KEY (id),
  CONSTRAINT fk_sec_plantilla FOREIGN KEY (plantilla_id) REFERENCES RAT_PLANTILLA(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------------------------------
CREATE TABLE RAT_PLANTILLA_PARRAFO (
  id              INT          NOT NULL AUTO_INCREMENT,
  seccion_id      INT          NOT NULL,
  orden           INT          NOT NULL,
  tipo            VARCHAR(30)  NOT NULL,
  contenido_fijo  TEXT         NULL,
  fuente_variable VARCHAR(200) NULL,
  condicion       VARCHAR(200) NULL,
  CONSTRAINT pk_parrafo      PRIMARY KEY (id),
  CONSTRAINT fk_parr_seccion FOREIGN KEY (seccion_id) REFERENCES RAT_PLANTILLA_SECCION(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------------------------------
CREATE TABLE RAT_PLANTILLA_VARIABLE (
  id             INT          NOT NULL AUTO_INCREMENT,
  clave          VARCHAR(100) NOT NULL,
  descripcion    VARCHAR(300) NULL,
  tabla_origen   VARCHAR(100) NOT NULL,
  columna_origen VARCHAR(100) NOT NULL,
  formato        VARCHAR(50)  NULL,
  CONSTRAINT pk_variable  PRIMARY KEY (id),
  CONSTRAINT uq_var_clave UNIQUE (clave)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO RAT_PLANTILLA_VARIABLE (clave, descripcion, tabla_origen, columna_origen, formato) VALUES
  ('{{marca}}',                'Marca del vehiculo',                   'RAT_VEHICULO',           'marca',                          'mayusculas'),
  ('{{submarca}}',             'Submarca del vehiculo',                'RAT_VEHICULO',           'submarca',                       'mayusculas'),
  ('{{color}}',                'Color del vehiculo',                   'RAT_CAT_COLOR',          'nombre',                         'texto'),
  ('{{placas}}',               'Numero de placas',                     'RAT_INCIDENTE_VEHICULO', 'numero_placas',                  'mayusculas'),
  ('{{anio_modelo}}',          'Anio modelo del vehiculo',             'RAT_VEHICULO',           'anio_modelo',                    'texto'),
  ('{{vin}}',                  'Numero de serie (VIN)',                 'RAT_VEHICULO',           'vin',                            'mayusculas'),
  ('{{fecha_hecho}}',          'Fecha del siniestro',                  'RAT_INCIDENTE',          'fecha_hecho',                    'fecha_larga'),
  ('{{hora_hecho}}',           'Hora del siniestro',                   'RAT_INCIDENTE',          'hora_hecho',                     'texto'),
  ('{{tipo_hecho}}',           'Tipo de hecho de transito',            'RAT_CAT_TIPO_HECHO',     'nombre',                         'texto'),
  ('{{km_punto}}',             'Kilometro del punto del hecho',        'RAT_UBICACION_VIA',      'km_punto',                       'texto'),
  ('{{municipio}}',            'Municipio del hecho',                  'RAT_UBICACION_VIA',      'municipio',                      'texto'),
  ('{{estado_republica}}',     'Estado de la republica',               'RAT_UBICACION_VIA',      'estado_republica',               'texto'),
  ('{{tipo_via}}',             'Tipo de via',                          'RAT_CAT_TIPO_VIA',       'nombre',                         'texto'),
  ('{{velocidad_max_kmh}}',    'Velocidad maxima permitida',           'RAT_UBICACION_VIA',      'velocidad_maxima_permitida_kmh', 'texto'),
  ('{{numero_siniestro}}',     'Numero de siniestro',                  'RAT_INCIDENTE',          'numero_siniestro',               'mayusculas'),
  ('{{numero_formato}}',       'Numero de formato del reporte',        'RAT_REPORTE',            'numero_formato',                 'texto'),
  ('{{velocidad_final_kmh}}',  'Velocidad final calculada (km/h)',     'RAT_CALCULO_VELOCIDAD',  'velocidad_final_kmh',            'decimal_2'),
  ('{{exceso_velocidad}}',     'Indica si hubo exceso de velocidad',  'RAT_CALCULO_VELOCIDAD',  'exceso_velocidad',               'texto'),
  ('{{e_deformacion_julios}}', 'Energia de deformacion (J)',          'RAT_CALCULO_VELOCIDAD',  'e_deformacion_julios',           'decimal_3'),
  ('{{e_vuelco_julios}}',      'Energia de vuelco (J)',               'RAT_CALCULO_VELOCIDAD',  'e_vuelco_julios',                'decimal_3'),
  ('{{e_total_julios}}',       'Energia total (J)',                   'RAT_CALCULO_VELOCIDAD',  'e_total_julios',                 'decimal_3'),
  ('{{narracion_hechos}}',     'Narracion dinamica del hecho',        'RAT_NARRATIVA_DINAMICA', 'narracion_hechos',               'texto'),
  ('{{objeto_involucrado}}',   'Objeto fijo o vehiculo involucrado',  'RAT_NARRATIVA_DINAMICA', 'objeto_involucrado',             'texto'),
  ('{{perito_nombre}}',        'Nombre del perito elaborador',        'sys_users',              'name',                           'mayusculas'),
  ('{{perito_cedula}}',        'Cedula profesional del perito',       'RAT_PERITO_PERFIL',      'cedula_profesional',             'texto'),
  ('{{perito_especialidad}}',  'Especialidad del perito',             'RAT_PERITO_PERFIL',      'especialidad',                   'texto'),
  ('{{fecha_elaboracion}}',    'Fecha de elaboracion del documento',  'RAT_REPORTE',            'fecha_elaboracion',              'fecha_larga'),
  ('{{ubicacion_taller}}',     'Taller donde se encuentra el vehiculo','RAT_REPORTE',           'ubicacion_taller',               'texto');

-- =============================================================================
-- 11a. JWT_TOKENS - Blacklist para logout inmediato
-- =============================================================================
CREATE TABLE jwt_tokens (
  id         INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  user_id    INT           NOT NULL,
  token_hash VARCHAR(64)   NOT NULL,
  expires_at DATETIME      NOT NULL,
  created_at DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT pk_jwt_tokens     PRIMARY KEY (id),
  CONSTRAINT uq_jwt_token_hash UNIQUE (token_hash),
  CONSTRAINT fk_jwt_user       FOREIGN KEY (user_id) REFERENCES sys_users(id_user)
                                  ON DELETE CASCADE,
  INDEX idx_jwt_token_hash (token_hash),
  INDEX idx_jwt_expires    (expires_at),
  INDEX idx_jwt_user       (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DELIMITER //
CREATE PROCEDURE CleanExpiredTokens()
BEGIN
  DELETE FROM jwt_tokens WHERE expires_at < NOW();
END //
DELIMITER ;

-- =============================================================================
-- 11b. AUDIT_LOGS - Cadena de custodia legal
-- =============================================================================
CREATE TABLE audit_logs (
  id             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id        INT             NOT NULL,
  tabla_afectada VARCHAR(100)    NOT NULL,
  registro_id    BIGINT          NOT NULL,
  registro_uuid  CHAR(36)        NULL,
  campo_afectado VARCHAR(100)    NULL,
  valor_anterior TEXT            NULL,
  valor_nuevo    TEXT            NULL,
  accion         ENUM('INSERT','UPDATE','DELETE') NOT NULL,
  ip_origen      VARCHAR(45)     NULL,
  user_agent     VARCHAR(500)    NULL,
  created_at     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT pk_audit_logs PRIMARY KEY (id),
  CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES sys_users(id_user),
  INDEX idx_audit_tabla    (tabla_afectada),
  INDEX idx_audit_registro (tabla_afectada, registro_id),
  INDEX idx_audit_user     (user_id),
  INDEX idx_audit_fecha    (created_at),
  INDEX idx_audit_accion   (accion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================================================
-- 12. RAT_IA_SOLICITUD - Registro de llamadas a IA
-- =============================================================================
CREATE TABLE RAT_IA_SOLICITUD (
  id                    BIGINT      NOT NULL AUTO_INCREMENT,
  incidente_vehiculo_id BIGINT      NULL,
  incidente_id          BIGINT      NULL,
  user_id               INT         NOT NULL,
  tipo                  VARCHAR(50) NOT NULL,
  estado                ENUM('pendiente','completado','error','rechazado','aceptado')
                                    NOT NULL DEFAULT 'pendiente',
  contexto_json         JSON        NULL,
  prompt_enviado        TEXT        NULL,
  respuesta_ia          JSON        NULL,
  texto_sugerido        TEXT        NULL,
  texto_final           TEXT        NULL,
  fue_editado           TINYINT(1)  NULL,
  tokens_entrada        INT         NULL,
  tokens_salida         INT         NULL,
  latencia_ms           INT         NULL,
  detalle_error         TEXT        NULL,
  created_at            DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  respondido_en         DATETIME    NULL,
  CONSTRAINT pk_ia_solicitud PRIMARY KEY (id),
  CONSTRAINT fk_ia_inc_veh   FOREIGN KEY (incidente_vehiculo_id) REFERENCES RAT_INCIDENTE_VEHICULO(id),
  CONSTRAINT fk_ia_incidente FOREIGN KEY (incidente_id)          REFERENCES RAT_INCIDENTE(id),
  CONSTRAINT fk_ia_user      FOREIGN KEY (user_id)               REFERENCES sys_users(id_user),
  CONSTRAINT chk_ia_tipo     CHECK (tipo IN ('autocompletar_vehiculo','sugerencia_deformacion','narrativa_dinamica')),
  INDEX idx_ia_tipo    (tipo),
  INDEX idx_ia_estado  (estado),
  INDEX idx_ia_inc_veh (incidente_vehiculo_id),
  INDEX idx_ia_user    (user_id),
  INDEX idx_ia_fecha   (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================================================

SET FOREIGN_KEY_CHECKS = 1;

-- =============================================================================
-- RESUMEN v1.4 (MySQL - limpio, plug-and-play)
-- Total tablas: 55 (incluyendo sys_users stub)
--   sys_users stub              : 1
--   Infraestructura transversal : 2  (jwt_tokens, audit_logs)
--   IA                          : 1  (RAT_IA_SOLICITUD)
--   Perfil perito               : 1  (RAT_PERITO_PERFIL)
--   Catalogos propios           : 27 (RAT_CAT_*)
--   Tablas tecnicas             : 3  (RAT_TABLA_*)
--   Transaccionales             : 16 (RAT_INCIDENTE a RAT_CONCLUSION)
--   Plantilla                   : 4  (RAT_PLANTILLA*)
-- =============================================================================
