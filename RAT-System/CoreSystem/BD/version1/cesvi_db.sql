-- =============================================================================
-- CESVI MÉXICO — Base de Datos de Peritaje y Análisis Forense de Tránsito
-- =============================================================================

SET FOREIGN_KEY_CHECKS = 0;
SET NAMES utf8mb4;

CREATE DATABASE IF NOT EXISTS cesvi_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE cesvi_db;

-- =============================================================================
-- 1. CATÁLOGOS
-- =============================================================================

CREATE TABLE CAT_TIPO_HECHO (
  id          INT           NOT NULL AUTO_INCREMENT,
  categoria   VARCHAR(100)  NOT NULL,
  subcategoria VARCHAR(100) NOT NULL,
  nombre      VARCHAR(200)  NOT NULL,
  CONSTRAINT pk_cat_tipo_hecho PRIMARY KEY (id),
  CONSTRAINT uq_cat_tipo_hecho_nombre UNIQUE (nombre)
) ENGINE=InnoDB;

INSERT INTO CAT_TIPO_HECHO (categoria, subcategoria, nombre) VALUES
  ('Colisiones perpendiculares', 'Central',                      'Colisión perpendicular central'),
  ('Colisiones perpendiculares', 'Anterior',                     'Colisión perpendicular anterior'),
  ('Colisiones perpendiculares', 'Posterior',                    'Colisión perpendicular posterior'),
  ('Colisión oblicua',           'Central',                      'Colisión oblicua central'),
  ('Colisión oblicua',           'Anterior',                     'Colisión oblicua anterior'),
  ('Colisión oblicua',           'Posterior',                    'Colisión oblicua posterior'),
  ('Colisiones por alcance',     'Excéntrico',                   'Colisión por alcance excéntrico'),
  ('Colisiones por alcance',     'Central',                      'Colisión por alcance central'),
  ('Colisiones por alcance',     'Angular',                      'Colisión por alcance angular'),
  ('Choque',                     'Frontal',                      'Choque frontal'),
  ('Choque',                     'Trasero',                      'Choque trasero'),
  ('Choque',                     'Lateral',                      'Choque lateral'),
  ('Atropello',                  'Transporte sobre el vehículo', 'Atropello transporte sobre vehículo'),
  ('Atropello',                  'Proyección',                   'Atropello proyección'),
  ('Atropello',                  'Volteo',                       'Atropello volteo'),
  ('Atropello',                  'Levantamiento hacia arriba',   'Atropello levantamiento'),
  ('Atropello',                  'Impulso mortal',               'Atropello impulso mortal'),
  ('Volcadura',                  'Tonel',                        'Volcadura tonel'),
  ('Volcadura',                  'Tonel campana',                'Volcadura tonel campana'),
  ('Volcadura',                  'Múltiples giros',              'Volcadura múltiples giros'),
  ('Colisiones múltiples',       'Más de 3 vehículos',           'Colisión múltiple'),
  ('Colisiones laterales',       'Raspado positivo',             'Colisión lateral raspado positivo'),
  ('Colisiones laterales',       'Raspado negativo',             'Colisión lateral raspado negativo');

-- -----------------------------------------------------------------------------

CREATE TABLE CAT_TIPO_VIA (
  id     INT          NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  CONSTRAINT pk_cat_tipo_via PRIMARY KEY (id),
  CONSTRAINT uq_cat_tipo_via UNIQUE (nombre)
) ENGINE=InnoDB;

INSERT INTO CAT_TIPO_VIA (nombre) VALUES
  ('Primaria'), ('Secundaria'), ('Carretera'), ('Autopista'), ('Calle'), ('Avenida');

-- -----------------------------------------------------------------------------

CREATE TABLE CAT_TIPO_TRAZO (
  id     INT          NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  CONSTRAINT pk_cat_tipo_trazo PRIMARY KEY (id),
  CONSTRAINT uq_cat_tipo_trazo UNIQUE (nombre)
) ENGINE=InnoDB;

INSERT INTO CAT_TIPO_TRAZO (nombre) VALUES
  ('Recto'), ('Curva'), ('Rampa'), ('Pendiente');

-- -----------------------------------------------------------------------------

CREATE TABLE CAT_TIPO_INTERSECCION (
  id     INT          NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  CONSTRAINT pk_cat_tipo_interseccion PRIMARY KEY (id),
  CONSTRAINT uq_cat_tipo_interseccion UNIQUE (nombre)
) ENGINE=InnoDB;

INSERT INTO CAT_TIPO_INTERSECCION (nombre) VALUES
  ('Cruce simple'), ('Glorieta'), ('T'), ('Y'), ('Paso a desnivel');

-- -----------------------------------------------------------------------------

CREATE TABLE CAT_SENALAMIENTO_VERTICAL (
  id     INT          NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  CONSTRAINT pk_cat_sen_vertical PRIMARY KEY (id),
  CONSTRAINT uq_cat_sen_vertical UNIQUE (nombre)
) ENGINE=InnoDB;

INSERT INTO CAT_SENALAMIENTO_VERTICAL (nombre) VALUES
  ('Alto'), ('Ceda el paso'), ('Límite de velocidad'), ('Otro');

-- -----------------------------------------------------------------------------

CREATE TABLE CAT_SENALAMIENTO_HORIZONTAL (
  id     INT          NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  CONSTRAINT pk_cat_sen_horizontal PRIMARY KEY (id),
  CONSTRAINT uq_cat_sen_horizontal UNIQUE (nombre)
) ENGINE=InnoDB;

INSERT INTO CAT_SENALAMIENTO_HORIZONTAL (nombre) VALUES
  ('Líneas continuas'), ('Líneas discontinuas'), ('Paso peatonal'),
  ('Sentidos de circulación'), ('Otro');

-- -----------------------------------------------------------------------------

CREATE TABLE CAT_CONDICION_SUPERFICIE (
  id     INT          NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  CONSTRAINT pk_cat_cond_sup PRIMARY KEY (id),
  CONSTRAINT uq_cat_cond_sup UNIQUE (nombre)
) ENGINE=InnoDB;

INSERT INTO CAT_CONDICION_SUPERFICIE (nombre) VALUES
  ('Seco'), ('Mojado'), ('Hielo'), ('Nieve');

-- -----------------------------------------------------------------------------

CREATE TABLE CAT_CONDICION_PAVIMENTO (
  id     INT          NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  CONSTRAINT pk_cat_cond_pav PRIMARY KEY (id),
  CONSTRAINT uq_cat_cond_pav UNIQUE (nombre)
) ENGINE=InnoDB;

INSERT INTO CAT_CONDICION_PAVIMENTO (nombre) VALUES
  ('Buenas condiciones'), ('Malas condiciones');

-- -----------------------------------------------------------------------------

CREATE TABLE CAT_TIPO_PAVIMENTO (
  id     INT          NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  CONSTRAINT pk_cat_tipo_pav PRIMARY KEY (id),
  CONSTRAINT uq_cat_tipo_pav UNIQUE (nombre)
) ENGINE=InnoDB;

INSERT INTO CAT_TIPO_PAVIMENTO (nombre) VALUES
  ('Asfalto'), ('Concreto'), ('Adoquín'), ('Terracería'), ('Grava');

-- -----------------------------------------------------------------------------

CREATE TABLE CAT_CLIMA (
  id     INT          NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  CONSTRAINT pk_cat_clima PRIMARY KEY (id),
  CONSTRAINT uq_cat_clima UNIQUE (nombre)
) ENGINE=InnoDB;

INSERT INTO CAT_CLIMA (nombre) VALUES
  ('Soleado'), ('Lluvioso'), ('Nublado'), ('Niebla / Neblina'), ('Granizo'), ('Noche');

-- -----------------------------------------------------------------------------

CREATE TABLE CAT_ORIENTACION_VIA (
  id     INT          NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  CONSTRAINT pk_cat_orientacion PRIMARY KEY (id),
  CONSTRAINT uq_cat_orientacion UNIQUE (nombre)
) ENGINE=InnoDB;

INSERT INTO CAT_ORIENTACION_VIA (nombre) VALUES
  ('Norte - Sur'), ('Sur - Norte'), ('Este - Oeste'), ('Oeste - Este'),
  ('Noroeste - Sureste'), ('Sureste - Noroeste'), ('Noreste - Sureste'),
  ('Sureste - Noreste'), ('Suroeste - Noreste'), ('Noreste - Suroeste'),
  ('Noroeste - Suroeste'), ('Suroeste - Noroeste');

-- -----------------------------------------------------------------------------

CREATE TABLE CAT_SENTIDO_VIALIDAD (
  id     INT          NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  CONSTRAINT pk_cat_sentido PRIMARY KEY (id),
  CONSTRAINT uq_cat_sentido UNIQUE (nombre)
) ENGINE=InnoDB;

INSERT INTO CAT_SENTIDO_VIALIDAD (nombre) VALUES
  ('Un sentido'), ('Doble sentido');

-- -----------------------------------------------------------------------------

CREATE TABLE CAT_ESTADO_NEUMATICO (
  id     INT          NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  CONSTRAINT pk_cat_est_neum PRIMARY KEY (id),
  CONSTRAINT uq_cat_est_neum UNIQUE (nombre)
) ENGINE=InnoDB;

INSERT INTO CAT_ESTADO_NEUMATICO (nombre) VALUES
  ('Nuevo'), ('Usado');

-- -----------------------------------------------------------------------------

CREATE TABLE CAT_COLOR (
  id     INT          NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  CONSTRAINT pk_cat_color PRIMARY KEY (id),
  CONSTRAINT uq_cat_color UNIQUE (nombre)
) ENGINE=InnoDB;

INSERT INTO CAT_COLOR (nombre) VALUES
  ('Blanco'), ('Negro'), ('Gris'), ('Azul'), ('Rojo'),
  ('Café / Marrón'), ('Verde'), ('Naranja'), ('Otro');

-- -----------------------------------------------------------------------------

CREATE TABLE CAT_TIPO_FOTO (
  id     INT          NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  CONSTRAINT pk_cat_tipo_foto PRIMARY KEY (id),
  CONSTRAINT uq_cat_tipo_foto UNIQUE (nombre)
) ENGINE=InnoDB;

INSERT INTO CAT_TIPO_FOTO (nombre) VALUES
  ('Frontal'), ('Lateral Derecho'), ('Lateral Izquierdo'), ('Posterior'),
  ('Partes Bajas'), ('Habitáculo'), ('Lugar de los Hechos'), ('Objeto Involucrado');

-- -----------------------------------------------------------------------------

CREATE TABLE CAT_TIPO_GOLPE (
  id     INT          NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  CONSTRAINT pk_cat_tipo_golpe PRIMARY KEY (id),
  CONSTRAINT uq_cat_tipo_golpe UNIQUE (nombre)
) ENGINE=InnoDB;

INSERT INTO CAT_TIPO_GOLPE (nombre) VALUES
  ('Frontal'), ('Trasero'), ('Lateral'), ('Inferior'), ('Superior');

-- -----------------------------------------------------------------------------

CREATE TABLE CAT_NUMERO_MEDICIONES (
  id    INT NOT NULL AUTO_INCREMENT,
  valor INT NOT NULL,
  CONSTRAINT pk_cat_num_med PRIMARY KEY (id),
  CONSTRAINT uq_cat_num_med UNIQUE (valor)
) ENGINE=InnoDB;

INSERT INTO CAT_NUMERO_MEDICIONES (valor) VALUES (2), (4), (6);

-- -----------------------------------------------------------------------------

CREATE TABLE CAT_TIPO_INDICIO (
  id     INT          NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  CONSTRAINT pk_cat_tipo_indicio PRIMARY KEY (id),
  CONSTRAINT uq_cat_tipo_indicio UNIQUE (nombre)
) ENGINE=InnoDB;

INSERT INTO CAT_TIPO_INDICIO (nombre) VALUES
  ('Plástico'), ('Vidrio'), ('Pintura'), ('Neumático'), ('Metal'), ('Otro');

-- -----------------------------------------------------------------------------

CREATE TABLE CAT_POSICION_INICIAL (
  id     INT          NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  CONSTRAINT pk_cat_pos_ini PRIMARY KEY (id),
  CONSTRAINT uq_cat_pos_ini UNIQUE (nombre)
) ENGINE=InnoDB;

INSERT INTO CAT_POSICION_INICIAL (nombre) VALUES
  ('Estacionado'), ('Circulando'), ('Detenido'),
  ('Reversa'), ('Invasión de carril'), ('Cambio de carril');

-- -----------------------------------------------------------------------------

CREATE TABLE CAT_PERCEPCION_REAL (
  id     INT          NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  CONSTRAINT pk_cat_ppr PRIMARY KEY (id),
  CONSTRAINT uq_cat_ppr UNIQUE (nombre)
) ENGINE=InnoDB;

INSERT INTO CAT_PERCEPCION_REAL (nombre) VALUES
  ('Distracción'), ('Visibilidad reducida'), ('Punto ciego'),
  ('Obstáculo repentino'), ('Fatiga');

-- -----------------------------------------------------------------------------

CREATE TABLE CAT_PUNTO_CLAVE (
  id     INT          NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  CONSTRAINT pk_cat_pc PRIMARY KEY (id),
  CONSTRAINT uq_cat_pc UNIQUE (nombre)
) ENGINE=InnoDB;

INSERT INTO CAT_PUNTO_CLAVE (nombre) VALUES
  ('Freno brusco'), ('Volanteo'), ('Aceleración'),
  ('Sin reacción'), ('Rebase fallido');

-- -----------------------------------------------------------------------------

CREATE TABLE CAT_TRAYECTORIA_POST (
  id     INT          NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  CONSTRAINT pk_cat_tray PRIMARY KEY (id),
  CONSTRAINT uq_cat_tray UNIQUE (nombre)
) ENGINE=InnoDB;

INSERT INTO CAT_TRAYECTORIA_POST (nombre) VALUES
  ('Recta'), ('Rotación'), ('Derrape'),
  ('Vuelco lateral'), ('Vuelco total'), ('Proyección fuera de vía');

-- -----------------------------------------------------------------------------

CREATE TABLE CAT_ZONA_VEHICULO (
  id     INT          NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  CONSTRAINT pk_cat_zona PRIMARY KEY (id),
  CONSTRAINT uq_cat_zona UNIQUE (nombre)
) ENGINE=InnoDB;

INSERT INTO CAT_ZONA_VEHICULO (nombre) VALUES
  ('Parte Frontal'), ('Vértice Delantero Derecho'), ('Lado Derecho'),
  ('Vértice Trasero Derecho'), ('Parte Trasera'), ('Vértice Trasero Izquierdo'),
  ('Lado Izquierdo'), ('Vértice Delantero Izquierdo'), ('Toldo'),
  ('Habitáculo'), ('Partes Bajas');

-- -----------------------------------------------------------------------------

CREATE TABLE CAT_PARTE_VEHICULO (
  id           INT          NOT NULL AUTO_INCREMENT,
  zona_id      INT          NOT NULL,
  tipo_vehiculo VARCHAR(10) NOT NULL COMMENT 'ligero / pesado',
  subzona      VARCHAR(50)  NULL     COMMENT 'Frontal / Media / Trasera — para laterales',
  nombre       VARCHAR(200) NOT NULL,
  CONSTRAINT pk_cat_parte PRIMARY KEY (id),
  CONSTRAINT fk_parte_zona FOREIGN KEY (zona_id) REFERENCES CAT_ZONA_VEHICULO(id)
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------

CREATE TABLE CAT_TIPO_DANO (
  id     INT          NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  CONSTRAINT pk_cat_tipo_dano PRIMARY KEY (id),
  CONSTRAINT uq_cat_tipo_dano UNIQUE (nombre)
) ENGINE=InnoDB;

INSERT INTO CAT_TIPO_DANO (nombre) VALUES
  ('Hundimiento'), ('Corrimiento'), ('Tallón'), ('Ruptura'), ('Repercusión');

-- -----------------------------------------------------------------------------

CREATE TABLE CAT_CUERPO_GENERADOR (
  id     INT          NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(50)  NOT NULL,
  CONSTRAINT pk_cat_cuerpo PRIMARY KEY (id),
  CONSTRAINT uq_cat_cuerpo UNIQUE (nombre)
) ENGINE=InnoDB;

INSERT INTO CAT_CUERPO_GENERADOR (nombre) VALUES ('Duro'), ('Blando');

-- -----------------------------------------------------------------------------

CREATE TABLE CAT_DIRECCION_DANO (
  id     INT          NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  CONSTRAINT pk_cat_dir_dano PRIMARY KEY (id),
  CONSTRAINT uq_cat_dir_dano UNIQUE (nombre)
) ENGINE=InnoDB;

INSERT INTO CAT_DIRECCION_DANO (nombre) VALUES
  ('Adelante hacia atrás'), ('Atrás hacia adelante'),
  ('Izquierda a derecha'),  ('Derecha a izquierda'),
  ('Arriba hacia abajo'),   ('Abajo hacia arriba');

-- -----------------------------------------------------------------------------

CREATE TABLE CAT_CONSECUENCIA_DANO (
  id     INT          NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  CONSTRAINT pk_cat_consec PRIMARY KEY (id),
  CONSTRAINT uq_cat_consec UNIQUE (nombre)
) ENGINE=InnoDB;

INSERT INTO CAT_CONSECUENCIA_DANO (nombre) VALUES
  ('Desprendimiento'), ('Desplazamiento'), ('Impregnación'),
  ('Resquebrajamiento'), ('Oxidación'), ('Desacople'),
  ('Derrame de líquidos automotrices'), ('Desacople de componentes mecánicos');

-- =============================================================================
-- 2. TABLAS TÉCNICAS
-- =============================================================================

CREATE TABLE TABLA_RIGIDEZ_AB (
  id                  BIGINT         NOT NULL AUTO_INCREMENT,
  categoria_mchenry   INT            NOT NULL COMMENT '1-5 / 6=Furgón',
  batalla_min_m       DECIMAL(6,3)   NOT NULL,
  batalla_max_m       DECIMAL(6,3)   NOT NULL,
  via_delantera_ref_m DECIMAL(6,3)   NULL,
  longitud_ref_m      DECIMAL(6,3)   NULL,
  anchura_ref_m       DECIMAL(6,3)   NULL,
  tara_ref_kg         DECIMAL(8,2)   NULL,
  tipo_golpe_id       INT            NOT NULL,
  a_rigidez_n_m       DECIMAL(12,3)  NOT NULL,
  b_rigidez_n_m2      DECIMAL(12,3)  NOT NULL,
  CONSTRAINT pk_rigidez PRIMARY KEY (id),
  CONSTRAINT fk_rigidez_golpe FOREIGN KEY (tipo_golpe_id) REFERENCES CAT_TIPO_GOLPE(id)
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------

CREATE TABLE TABLA_MU (
  id                    BIGINT        NOT NULL AUTO_INCREMENT,
  tipo_pavimento_id     INT           NOT NULL,
  condicion_superficie_id INT         NOT NULL,
  estado_neumatico_id   INT           NOT NULL,
  vel_min_kmh           DECIMAL(6,2)  NULL,
  vel_max_kmh           DECIMAL(6,2)  NULL,
  mu                    DECIMAL(5,4)  NOT NULL COMMENT 'Coeficiente de adherencia',
  CONSTRAINT pk_tabla_mu PRIMARY KEY (id),
  CONSTRAINT fk_mu_pavimento   FOREIGN KEY (tipo_pavimento_id)      REFERENCES CAT_TIPO_PAVIMENTO(id),
  CONSTRAINT fk_mu_superficie  FOREIGN KEY (condicion_superficie_id) REFERENCES CAT_CONDICION_SUPERFICIE(id),
  CONSTRAINT fk_mu_neumatico   FOREIGN KEY (estado_neumatico_id)    REFERENCES CAT_ESTADO_NEUMATICO(id)
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------

CREATE TABLE TABLA_TIEMPO_RESPUESTA_FRENOS (
  id          INT           NOT NULL AUTO_INCREMENT,
  eficacia_pct DECIMAL(5,2) NOT NULL COMMENT '70 / 80 / 100',
  tiempo_s    DECIMAL(4,2)  NOT NULL COMMENT '0.2 / 0.1',
  CONSTRAINT pk_t_frenos PRIMARY KEY (id)
) ENGINE=InnoDB;

INSERT INTO TABLA_TIEMPO_RESPUESTA_FRENOS (eficacia_pct, tiempo_s) VALUES
  (70.00, 0.20),
  (80.00, 0.20),
  (100.00, 0.10);

-- =============================================================================
-- 3. USUARIOS
-- =============================================================================

CREATE TABLE USUARIO (
  id            BIGINT        NOT NULL AUTO_INCREMENT,
  nombre        VARCHAR(200)  NOT NULL,
  email         VARCHAR(200)  NOT NULL,
  password_hash VARCHAR(255)  NOT NULL,
  rol           VARCHAR(20)   NOT NULL DEFAULT 'perito' COMMENT 'perito / admin / visualizador',
  activo        TINYINT(1)    NOT NULL DEFAULT 1,
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT pk_usuario PRIMARY KEY (id),
  CONSTRAINT uq_usuario_email UNIQUE (email),
  CONSTRAINT chk_usuario_rol CHECK (rol IN ('perito','admin','visualizador'))
) ENGINE=InnoDB;

-- =============================================================================
-- 4. SINIESTRO
-- =============================================================================

CREATE TABLE INCIDENTE (
  id               BIGINT       NOT NULL AUTO_INCREMENT,
  numero_siniestro VARCHAR(100) NOT NULL,
  fecha_hecho      DATE         NOT NULL,
  hora_hecho       TIME         NULL,
  tipo_hecho_id    INT          NOT NULL,
  usuario_perito_id BIGINT      NOT NULL,
  created_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT pk_incidente PRIMARY KEY (id),
  CONSTRAINT uq_incidente_siniestro UNIQUE (numero_siniestro),
  CONSTRAINT fk_inc_tipo_hecho  FOREIGN KEY (tipo_hecho_id)     REFERENCES CAT_TIPO_HECHO(id),
  CONSTRAINT fk_inc_perito      FOREIGN KEY (usuario_perito_id) REFERENCES USUARIO(id)
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------

CREATE TABLE UBICACION_VIA (
  id                             BIGINT        NOT NULL AUTO_INCREMENT,
  incidente_id                   BIGINT        NOT NULL,
  calle                          VARCHAR(200)  NULL,
  numero_exterior                VARCHAR(20)   NULL,
  colonia                        VARCHAR(100)  NULL,
  codigo_postal                  VARCHAR(10)   NULL,
  municipio                      VARCHAR(100)  NULL,
  estado                         VARCHAR(100)  NULL,
  pais                           VARCHAR(100)  NOT NULL DEFAULT 'México',
  referencia_adicional           TEXT          NULL,
  km_punto                       VARCHAR(50)   NULL     COMMENT 'Ej: Km 93+500',
  lat                            DECIMAL(10,7) NULL,
  lng                            DECIMAL(10,7) NULL,
  velocidad_maxima_permitida_kmh INT           NULL,
  tipo_via_id                    INT           NULL,
  tipo_trazo_id                  INT           NULL,
  tipo_interseccion_id           INT           NULL,
  senalamiento_vertical_id       INT           NULL,
  senalamiento_horizontal_id     INT           NULL,
  medidas_via_m                  DECIMAL(6,2)  NULL     COMMENT 'Ancho de la vía en metros',
  condicion_superficie_id        INT           NULL,
  condicion_pavimento_id         INT           NULL,
  tipo_pavimento_id              INT           NULL,
  estado_neumatico_id            INT           NULL,
  clima_id                       INT           NULL,
  orientacion_id                 INT           NULL,
  sentido_vialidad_id            INT           NULL,
  mu_coeficiente_adherencia      DECIMAL(5,4)  NULL     COMMENT 'Lookup TABLA_MU',
  inclinacion_pct                DECIMAL(6,3)  NULL     COMMENT '+ rampa / - pendiente',
  mu_corregido                   DECIMAL(5,4)  NULL     COMMENT 'CALCULADO: mu ± inclinacion/100',
  radio_curva_m                  DECIMAL(8,2)  NULL     COMMENT 'Para vel. derrape/vuelco',
  peraltaje_pct                  DECIMAL(6,3)  NULL     COMMENT 'Para vel. derrape',
  CONSTRAINT pk_ubicacion PRIMARY KEY (id),
  CONSTRAINT uq_ubicacion_incidente UNIQUE (incidente_id),
  CONSTRAINT fk_ubic_incidente      FOREIGN KEY (incidente_id)               REFERENCES INCIDENTE(id),
  CONSTRAINT fk_ubic_tipo_via       FOREIGN KEY (tipo_via_id)                REFERENCES CAT_TIPO_VIA(id),
  CONSTRAINT fk_ubic_trazo          FOREIGN KEY (tipo_trazo_id)              REFERENCES CAT_TIPO_TRAZO(id),
  CONSTRAINT fk_ubic_interseccion   FOREIGN KEY (tipo_interseccion_id)       REFERENCES CAT_TIPO_INTERSECCION(id),
  CONSTRAINT fk_ubic_sen_vert       FOREIGN KEY (senalamiento_vertical_id)   REFERENCES CAT_SENALAMIENTO_VERTICAL(id),
  CONSTRAINT fk_ubic_sen_horiz      FOREIGN KEY (senalamiento_horizontal_id) REFERENCES CAT_SENALAMIENTO_HORIZONTAL(id),
  CONSTRAINT fk_ubic_cond_sup       FOREIGN KEY (condicion_superficie_id)    REFERENCES CAT_CONDICION_SUPERFICIE(id),
  CONSTRAINT fk_ubic_cond_pav       FOREIGN KEY (condicion_pavimento_id)     REFERENCES CAT_CONDICION_PAVIMENTO(id),
  CONSTRAINT fk_ubic_pavimento      FOREIGN KEY (tipo_pavimento_id)          REFERENCES CAT_TIPO_PAVIMENTO(id),
  CONSTRAINT fk_ubic_neumatico      FOREIGN KEY (estado_neumatico_id)        REFERENCES CAT_ESTADO_NEUMATICO(id),
  CONSTRAINT fk_ubic_clima          FOREIGN KEY (clima_id)                   REFERENCES CAT_CLIMA(id),
  CONSTRAINT fk_ubic_orientacion    FOREIGN KEY (orientacion_id)             REFERENCES CAT_ORIENTACION_VIA(id),
  CONSTRAINT fk_ubic_sentido        FOREIGN KEY (sentido_vialidad_id)        REFERENCES CAT_SENTIDO_VIALIDAD(id)
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------

CREATE TABLE HUELLA_ESCENA (
  id                   BIGINT        NOT NULL AUTO_INCREMENT,
  ubicacion_via_id     BIGINT        NOT NULL,
  tipo_indicio_id      INT           NOT NULL,
  longitud_frenado_m   DECIMAL(8,2)  NULL,
  longitud_derrape_m   DECIMAL(8,2)  NULL,
  mu_corregido_derrape DECIMAL(5,4)  NULL COMMENT 'CALCULADO: mu × Σsen(αi)/n',
  descripcion_indicio  TEXT          NULL,
  CONSTRAINT pk_huella PRIMARY KEY (id),
  CONSTRAINT fk_huella_ubicacion FOREIGN KEY (ubicacion_via_id) REFERENCES UBICACION_VIA(id),
  CONSTRAINT fk_huella_indicio   FOREIGN KEY (tipo_indicio_id)  REFERENCES CAT_TIPO_INDICIO(id)
) ENGINE=InnoDB;

-- =============================================================================
-- 5. VEHÍCULOS
-- =============================================================================

CREATE TABLE VEHICULO (
  id                        BIGINT        NOT NULL AUTO_INCREMENT,
  vin                       VARCHAR(17)   NOT NULL,
  tipo_clase                VARCHAR(100)  NULL     COMMENT 'Sedán, SUV, Camioneta, Motocicleta…',
  marca                     VARCHAR(100)  NOT NULL,
  submarca                  VARCHAR(100)  NULL     COMMENT 'Corolla, Hilux, Aveo…',
  nombre_modelo             VARCHAR(200)  NULL     COMMENT 'Versión o trim del modelo',
  anio_modelo               YEAR          NOT NULL,
  tipo_vehiculo             VARCHAR(10)   NOT NULL COMMENT 'ligero / pesado',
  peso_tara_kg              DECIMAL(8,2)  NULL,
  masa_maxima_autorizada_kg DECIMAL(8,2)  NULL     COMMENT 'MMA',
  ancho_mm                  DECIMAL(8,1)  NULL     COMMENT 'L en fórmula McHenry',
  largo_mm                  DECIMAL(8,1)  NULL,
  alto_mm                   DECIMAL(8,1)  NULL     COMMENT 'Para CG (h)',
  batalla_mm                DECIMAL(8,1)  NULL     COMMENT 'CRÍTICO: determina categoría McHenry',
  voladizo_anterior_mm      DECIMAL(8,1)  NULL,
  voladizo_posterior_mm     DECIMAL(8,1)  NULL,
  entrevia_delantera_mm     DECIMAL(8,1)  NULL,
  entrevia_trasera_mm       DECIMAL(8,1)  NULL,
  redondez_vertices_mm      DECIMAL(8,1)  NULL,
  centro_gravedad_m         DECIMAL(5,3)  NULL     COMMENT 'Altura del CG desde el piso — para E_vuelco',
  created_at                DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at                DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT pk_vehiculo PRIMARY KEY (id),
  CONSTRAINT uq_vehiculo_vin UNIQUE (vin),
  CONSTRAINT chk_vehiculo_tipo CHECK (tipo_vehiculo IN ('ligero','pesado'))
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------

CREATE TABLE INCIDENTE_VEHICULO (
  id           BIGINT      NOT NULL AUTO_INCREMENT,
  incidente_id BIGINT      NOT NULL,
  vehiculo_id  BIGINT      NOT NULL,
  numero_placas VARCHAR(20) NULL,
  color_id     INT          NULL,
  rol          CHAR(1)      NOT NULL COMMENT 'A=principal / B=tercero / C=otro',
  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT pk_inc_veh PRIMARY KEY (id),
  CONSTRAINT fk_iv_incidente FOREIGN KEY (incidente_id) REFERENCES INCIDENTE(id),
  CONSTRAINT fk_iv_vehiculo  FOREIGN KEY (vehiculo_id)  REFERENCES VEHICULO(id),
  CONSTRAINT fk_iv_color     FOREIGN KEY (color_id)     REFERENCES CAT_COLOR(id),
  CONSTRAINT chk_iv_rol      CHECK (rol IN ('A','B','C'))
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------

CREATE TABLE OCUPACION_CARGA (
  id                      BIGINT        NOT NULL AUTO_INCREMENT,
  incidente_vehiculo_id   BIGINT        NOT NULL,
  numero_ocupantes        INT           NULL,
  peso_conductor_kg       DECIMAL(6,2)  NULL,
  peso_pasajeros_kg       DECIMAL(7,2)  NULL COMMENT 'Suma de todos los pasajeros',
  peso_equipaje_kg        DECIMAL(7,2)  NULL COMMENT 'Incluye carga, canastilla y accesorios',
  masa_total_kg           DECIMAL(8,2)  NULL COMMENT 'CALCULADA: tara + conductor + pasajeros + equipaje',
  CONSTRAINT pk_ocup PRIMARY KEY (id),
  CONSTRAINT uq_ocup_iv UNIQUE (incidente_vehiculo_id),
  CONSTRAINT fk_ocup_iv FOREIGN KEY (incidente_vehiculo_id) REFERENCES INCIDENTE_VEHICULO(id)
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------

CREATE TABLE FOTO (
  id                    BIGINT        NOT NULL AUTO_INCREMENT,
  incidente_vehiculo_id BIGINT        NOT NULL,
  tipo_foto_id          INT           NOT NULL,
  url                   VARCHAR(500)  NOT NULL,
  descripcion           VARCHAR(500)  NULL,
  tomada_en             DATETIME      NULL,
  CONSTRAINT pk_foto PRIMARY KEY (id),
  CONSTRAINT fk_foto_iv        FOREIGN KEY (incidente_vehiculo_id) REFERENCES INCIDENTE_VEHICULO(id),
  CONSTRAINT fk_foto_tipo      FOREIGN KEY (tipo_foto_id)          REFERENCES CAT_TIPO_FOTO(id)
) ENGINE=InnoDB;

-- =============================================================================
-- 6. ANÁLISIS TÉCNICO
-- =============================================================================

CREATE TABLE DEFORMACION_MEDICION (
  id                    BIGINT        NOT NULL AUTO_INCREMENT,
  incidente_vehiculo_id BIGINT        NOT NULL,
  tipo_golpe_id         INT           NOT NULL,
  numero_mediciones_id  INT           NOT NULL,
  c1_m                  DECIMAL(5,3)  NOT NULL,
  c2_m                  DECIMAL(5,3)  NOT NULL,
  c3_m                  DECIMAL(5,3)  NOT NULL,
  c4_m                  DECIMAL(5,3)  NULL COMMENT 'null si mediciones < 4',
  c5_m                  DECIMAL(5,3)  NULL COMMENT 'null si mediciones < 4',
  c6_m                  DECIMAL(5,3)  NULL COMMENT 'null si mediciones < 6',
  l_ancho_contacto_m    DECIMAL(6,3)  NULL COMMENT 'CALCULADA o medida',
  angulo_fpi_grados     DECIMAL(6,2)  NULL COMMENT 'Ángulo fuerza principal de impacto',
  arqueamiento_cm       DECIMAL(6,2)  NULL COMMENT 'Si > 10 cm se suma lateralmente',
  linea_referencia_mm   DECIMAL(8,1)  NULL COMMENT 'CALCULADA: batalla + voladizo',
  CONSTRAINT pk_deform PRIMARY KEY (id),
  CONSTRAINT uq_deform_iv UNIQUE (incidente_vehiculo_id),
  CONSTRAINT fk_def_iv      FOREIGN KEY (incidente_vehiculo_id) REFERENCES INCIDENTE_VEHICULO(id),
  CONSTRAINT fk_def_golpe   FOREIGN KEY (tipo_golpe_id)         REFERENCES CAT_TIPO_GOLPE(id),
  CONSTRAINT fk_def_nmed    FOREIGN KEY (numero_mediciones_id)  REFERENCES CAT_NUMERO_MEDICIONES(id)
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------

CREATE TABLE MODALIDAD_DANO (
  id                    BIGINT        NOT NULL AUTO_INCREMENT,
  incidente_vehiculo_id BIGINT        NOT NULL,
  zona_vehiculo_id      INT           NOT NULL,
  parte_vehiculo_id     INT           NOT NULL,
  tipo_dano_id          INT           NOT NULL,
  cuerpo_generador_id   INT           NOT NULL,
  direccion_dano_id     INT           NOT NULL,
  consecuencia_id       INT           NOT NULL,
  descripcion_libre     TEXT          NULL,
  CONSTRAINT pk_modalidad PRIMARY KEY (id),
  CONSTRAINT fk_mod_iv       FOREIGN KEY (incidente_vehiculo_id) REFERENCES INCIDENTE_VEHICULO(id),
  CONSTRAINT fk_mod_zona     FOREIGN KEY (zona_vehiculo_id)      REFERENCES CAT_ZONA_VEHICULO(id),
  CONSTRAINT fk_mod_parte    FOREIGN KEY (parte_vehiculo_id)     REFERENCES CAT_PARTE_VEHICULO(id),
  CONSTRAINT fk_mod_tipo     FOREIGN KEY (tipo_dano_id)          REFERENCES CAT_TIPO_DANO(id),
  CONSTRAINT fk_mod_cuerpo   FOREIGN KEY (cuerpo_generador_id)   REFERENCES CAT_CUERPO_GENERADOR(id),
  CONSTRAINT fk_mod_dir      FOREIGN KEY (direccion_dano_id)     REFERENCES CAT_DIRECCION_DANO(id),
  CONSTRAINT fk_mod_consec   FOREIGN KEY (consecuencia_id)       REFERENCES CAT_CONSECUENCIA_DANO(id)
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------

CREATE TABLE CALCULO_VELOCIDAD (
  id                          BIGINT        NOT NULL AUTO_INCREMENT,
  incidente_vehiculo_id       BIGINT        NOT NULL,
  -- McHenry deformación
  categoria_mchenry           INT           NULL  COMMENT 'CALCULADA desde batalla_mm',
  a_rigidez_n_m               DECIMAL(12,3) NULL  COMMENT 'Lookup TABLA_RIGIDEZ_AB',
  b_rigidez_n_m2              DECIMAL(12,3) NULL  COMMENT 'Lookup TABLA_RIGIDEZ_AB',
  e_deformacion_julios        DECIMAL(14,3) NULL  COMMENT 'CALCULADA: fórmula McHenry 2/4/6 puntos',
  e_def_corregida_julios      DECIMAL(14,3) NULL  COMMENT 'CALCULADA: Edef × (1 + tan α)',
  -- Energía de vuelco (v3.0)
  aplica_vuelco               TINYINT(1)    NOT NULL DEFAULT 0 COMMENT '0=no / 1=sí',
  angulo_vuelco_grados        DECIMAL(6,2)  NULL  COMMENT 'Ángulo de inclinación para calcular H',
  hipotenusa_vuelco_m         DECIMAL(6,3)  NULL  COMMENT 'Generalmente ancho_mm / 2',
  h_altura_critica_m          DECIMAL(6,3)  NULL  COMMENT 'CALCULADA: sin(angulo) × hipotenusa',
  centro_gravedad_m           DECIMAL(5,3)  NULL  COMMENT 'Desnorm. desde VEHICULO.centro_gravedad_m',
  e_vuelco_julios             DECIMAL(14,3) NULL  COMMENT 'CALCULADA: m × g × (H - h)',
  e_total_julios              DECIMAL(14,3) NULL  COMMENT 'CALCULADA: e_def_corregida + e_vuelco',
  -- EBS y velocidad de impacto
  ebs_m_s                     DECIMAL(8,4)  NULL  COMMENT 'CALCULADA: sqrt(2 × E_total / masa_total)',
  velocidad_impacto_kmh       DECIMAL(8,2)  NULL  COMMENT 'CALCULADA: EBS × 3.6',
  -- Verificación Limpert
  dmed_m                      DECIMAL(6,3)  NULL  COMMENT 'CALCULADA: media Ci',
  velocidad_limpert_kmh       DECIMAL(8,2)  NULL  COMMENT 'CALCULADA: verificación Limpert',
  vel_limpert_margenerror_kmh DECIMAL(8,2)  NULL  COMMENT '± 4.4 × Dmed',
  -- Pre-impacto (frenado)
  e_frenado_julios            DECIMAL(14,3) NULL  COMMENT 'CALCULADA: mu × m × g × d',
  velocidad_pre_impacto_kmh   DECIMAL(8,2)  NULL  COMMENT 'CALCULADA',
  tiempo_frenos_id            INT           NULL,
  tiempo_respuesta_frenos_s   DECIMAL(4,2)  NULL  COMMENT 'Desnorm. para auditoría',
  -- Resultado final
  velocidad_final_kmh         DECIMAL(8,2)  NULL  COMMENT 'Resultado final reportado en el dictamen',
  exceso_velocidad            TINYINT(1)    NULL  COMMENT 'CALCULADA: 0=no / 1=sí',
  delta_exceso_kmh            DECIMAL(8,2)  NULL  COMMENT 'CALCULADA: vel_final − vel_max_permitida',
  margen_error_kmh            DECIMAL(6,2)  NULL  DEFAULT 10.00 COMMENT 'Estándar ± 10 km/h',
  CONSTRAINT pk_calculo PRIMARY KEY (id),
  CONSTRAINT uq_calculo_iv UNIQUE (incidente_vehiculo_id),
  CONSTRAINT fk_calc_iv      FOREIGN KEY (incidente_vehiculo_id) REFERENCES INCIDENTE_VEHICULO(id),
  CONSTRAINT fk_calc_frenos  FOREIGN KEY (tiempo_frenos_id)      REFERENCES TABLA_TIEMPO_RESPUESTA_FRENOS(id)
) ENGINE=InnoDB;

-- =============================================================================
-- 7. ANÁLISIS FORENSE
-- =============================================================================

CREATE TABLE FASE_ACCIDENTE (
  id                    BIGINT        NOT NULL AUTO_INCREMENT,
  incidente_vehiculo_id BIGINT        NOT NULL,
  posicion_inicial_id   INT           NULL,
  percepcion_real_id    INT           NULL COMMENT 'PPR',
  factores_percepcion   VARCHAR(500)  NULL COMMENT 'visibilidad / señalamiento / iluminación / velocidad / distancia',
  punto_clave_id        INT           NULL COMMENT 'PC',
  factores_punto_clave  VARCHAR(500)  NULL COMMENT 'oportuno / viable / eficaz / condición mecánica / condición vía',
  zona_impacto_id       INT           NULL,
  trayectoria_post_id   INT           NULL,
  CONSTRAINT pk_fase PRIMARY KEY (id),
  CONSTRAINT uq_fase_iv UNIQUE (incidente_vehiculo_id),
  CONSTRAINT fk_fase_iv       FOREIGN KEY (incidente_vehiculo_id) REFERENCES INCIDENTE_VEHICULO(id),
  CONSTRAINT fk_fase_pos      FOREIGN KEY (posicion_inicial_id)   REFERENCES CAT_POSICION_INICIAL(id),
  CONSTRAINT fk_fase_ppr      FOREIGN KEY (percepcion_real_id)    REFERENCES CAT_PERCEPCION_REAL(id),
  CONSTRAINT fk_fase_pc       FOREIGN KEY (punto_clave_id)        REFERENCES CAT_PUNTO_CLAVE(id),
  CONSTRAINT fk_fase_zona     FOREIGN KEY (zona_impacto_id)       REFERENCES CAT_ZONA_VEHICULO(id),
  CONSTRAINT fk_fase_tray     FOREIGN KEY (trayectoria_post_id)   REFERENCES CAT_TRAYECTORIA_POST(id)
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------

CREATE TABLE NARRATIVA_DINAMICA (
  id                      BIGINT        NOT NULL AUTO_INCREMENT,
  incidente_vehiculo_id   BIGINT        NOT NULL,
  narracion_hechos        TEXT          NULL COMMENT 'Narración libre del perito',
  objeto_involucrado      VARCHAR(200)  NULL COMMENT 'Barrera / Poste / Otro vehículo',
  descripcion_objeto_fijo TEXT          NULL,
  posicion_final_vehiculo VARCHAR(300)  NULL COMMENT 'Ángulo y distancia desde el PC',
  direccion_circulacion   VARCHAR(200)  NULL,
  distancia_ppr_al_pc_m   DECIMAL(8,2)  NULL COMMENT 'CALCULADA: PPR-PD-frenada-PC',
  tiempo_reaccion_conductor_s DECIMAL(4,2) NULL DEFAULT 1.00 COMMENT 'Estándar 1 s',
  huellas_frenado_m       DECIMAL(8,2)  NULL,
  huellas_derrape_m       DECIMAL(8,2)  NULL,
  CONSTRAINT pk_narrativa PRIMARY KEY (id),
  CONSTRAINT uq_narr_iv UNIQUE (incidente_vehiculo_id),
  CONSTRAINT fk_narr_iv FOREIGN KEY (incidente_vehiculo_id) REFERENCES INCIDENTE_VEHICULO(id)
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------

CREATE TABLE PRINCIPIOS_FORENSES (
  id                               BIGINT  NOT NULL AUTO_INCREMENT,
  incidente_vehiculo_id            BIGINT  NOT NULL,
  principio_intercambio_materiales TEXT    NULL,
  principio_correspondencia        TEXT    NULL,
  dinamica_colision_fases          TEXT    NULL COMMENT 'Percepción-Decisión-Frenada-Impacto-Post',
  CONSTRAINT pk_principios PRIMARY KEY (id),
  CONSTRAINT uq_princ_iv UNIQUE (incidente_vehiculo_id),
  CONSTRAINT fk_princ_iv FOREIGN KEY (incidente_vehiculo_id) REFERENCES INCIDENTE_VEHICULO(id)
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------

CREATE TABLE CONCLUSION (
  id                    BIGINT      NOT NULL AUTO_INCREMENT,
  principios_forenses_id BIGINT     NOT NULL,
  orden                 INT         NOT NULL,
  texto_conclusion      TEXT        NOT NULL,
  validado_perito       TINYINT(1)  NOT NULL DEFAULT 0 COMMENT '0=pendiente / 1=validado',
  validado_por_id       BIGINT      NULL,
  validado_en           DATETIME    NULL,
  CONSTRAINT pk_conclusion PRIMARY KEY (id),
  CONSTRAINT fk_conc_princ   FOREIGN KEY (principios_forenses_id) REFERENCES PRINCIPIOS_FORENSES(id),
  CONSTRAINT fk_conc_usuario FOREIGN KEY (validado_por_id)        REFERENCES USUARIO(id)
) ENGINE=InnoDB;

-- =============================================================================
-- 8. REPORTE
-- =============================================================================

CREATE TABLE REPORTE (
  id                  BIGINT        NOT NULL AUTO_INCREMENT,
  incidente_id        BIGINT        NOT NULL,
  usuario_perito_id   BIGINT        NOT NULL,
  numero_formato      VARCHAR(50)   NULL COMMENT 'FOR-MPT-RAT-XX Rev.XX',
  tipo_documento      VARCHAR(20)   NOT NULL COMMENT 'informe / dictamen',
  nivel_emergencia    TINYINT       NULL COMMENT '1 / 2 / 3',
  fecha_elaboracion   DATE          NULL,
  ubicacion_taller    VARCHAR(300)  NULL,
  ruta_documento_word VARCHAR(500)  NULL,
  estado              TINYINT       NOT NULL DEFAULT 0 COMMENT '0=borrador / 1=revisión / 2=emitido',
  intentos_emision    INT           NOT NULL DEFAULT 0,
  fecha_inicio        DATETIME      NULL,
  fecha_emision       DATETIME      NULL,
  created_at          DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT pk_reporte PRIMARY KEY (id),
  CONSTRAINT fk_rep_incidente FOREIGN KEY (incidente_id)      REFERENCES INCIDENTE(id),
  CONSTRAINT fk_rep_perito    FOREIGN KEY (usuario_perito_id) REFERENCES USUARIO(id),
  CONSTRAINT chk_rep_tipo     CHECK (tipo_documento IN ('informe','dictamen')),
  CONSTRAINT chk_rep_estado   CHECK (estado IN (0,1,2))
) ENGINE=InnoDB;

-- =============================================================================
-- 9. PLANTILLA PARA GENERACIÓN AUTOMÁTICA DEL DOCUMENTO
-- =============================================================================

CREATE TABLE PLANTILLA (
  id             INT          NOT NULL AUTO_INCREMENT,
  tipo_documento VARCHAR(20)  NOT NULL COMMENT 'informe / dictamen',
  version        VARCHAR(20)  NOT NULL COMMENT 'Rev.00, Rev.01…',
  activa         TINYINT(1)   NOT NULL DEFAULT 0 COMMENT '0=inactiva / 1=activa',
  descripcion    VARCHAR(300) NULL,
  created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT pk_plantilla PRIMARY KEY (id),
  CONSTRAINT chk_plant_tipo CHECK (tipo_documento IN ('informe','dictamen'))
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------

CREATE TABLE PLANTILLA_SECCION (
  id               INT          NOT NULL AUTO_INCREMENT,
  plantilla_id     INT          NOT NULL,
  numero_seccion   VARCHAR(20)  NOT NULL COMMENT 'Ej: 1, 4.1.1, 7.1',
  titulo           VARCHAR(300) NOT NULL,
  orden            INT          NOT NULL,
  es_visible       TINYINT(1)   NOT NULL DEFAULT 1 COMMENT '0=oculta / 1=visible',
  CONSTRAINT pk_seccion PRIMARY KEY (id),
  CONSTRAINT fk_sec_plantilla FOREIGN KEY (plantilla_id) REFERENCES PLANTILLA(id)
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------

CREATE TABLE PLANTILLA_PARRAFO (
  id               INT          NOT NULL AUTO_INCREMENT,
  seccion_id       INT          NOT NULL,
  orden            INT          NOT NULL,
  tipo             VARCHAR(30)  NOT NULL COMMENT 'texto_fijo / texto_variable / tabla / foto / formula / dinamica',
  contenido_fijo   TEXT         NULL     COMMENT 'Texto base con {{claves}} embebidas',
  fuente_variable  VARCHAR(200) NULL     COMMENT 'Tabla.columna — null si es fijo',
  condicion        VARCHAR(200) NULL     COMMENT 'Ej: aplica_vuelco=1 — null si siempre aplica',
  CONSTRAINT pk_parrafo PRIMARY KEY (id),
  CONSTRAINT fk_parr_seccion FOREIGN KEY (seccion_id) REFERENCES PLANTILLA_SECCION(id)
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------

CREATE TABLE PLANTILLA_VARIABLE (
  id             INT          NOT NULL AUTO_INCREMENT,
  clave          VARCHAR(100) NOT NULL COMMENT 'Ej: {{marca}}, {{velocidad_final_kmh}}',
  descripcion    VARCHAR(300) NULL,
  tabla_origen   VARCHAR(100) NOT NULL COMMENT 'Ej: VEHICULO',
  columna_origen VARCHAR(100) NOT NULL COMMENT 'Ej: marca',
  formato        VARCHAR(50)  NULL     COMMENT 'texto / decimal_2 / fecha_larga / mayusculas',
  CONSTRAINT pk_variable PRIMARY KEY (id),
  CONSTRAINT uq_variable_clave UNIQUE (clave)
) ENGINE=InnoDB;

INSERT INTO PLANTILLA_VARIABLE (clave, descripcion, tabla_origen, columna_origen, formato) VALUES
  ('{{marca}}',                'Marca del vehículo',                    'VEHICULO',           'marca',                           'mayusculas'),
  ('{{submarca}}',             'Submarca / tipo del vehículo',          'VEHICULO',           'submarca',                        'mayusculas'),
  ('{{color}}',                'Color del vehículo',                    'CAT_COLOR',          'nombre',                          'texto'),
  ('{{placas}}',               'Número de placas',                      'INCIDENTE_VEHICULO', 'numero_placas',                   'mayusculas'),
  ('{{anio_modelo}}',          'Año modelo del vehículo',               'VEHICULO',           'anio_modelo',                     'texto'),
  ('{{vin}}',                  'Número de serie (VIN)',                  'VEHICULO',           'vin',                             'mayusculas'),
  ('{{fecha_hecho}}',          'Fecha del siniestro',                   'INCIDENTE',          'fecha_hecho',                     'fecha_larga'),
  ('{{hora_hecho}}',           'Hora del siniestro',                    'INCIDENTE',          'hora_hecho',                      'texto'),
  ('{{tipo_hecho}}',           'Tipo de hecho de tránsito',             'CAT_TIPO_HECHO',     'nombre',                          'texto'),
  ('{{km_punto}}',             'Kilómetro del punto del hecho',         'UBICACION_VIA',      'km_punto',                        'texto'),
  ('{{municipio}}',            'Municipio del hecho',                   'UBICACION_VIA',      'municipio',                       'texto'),
  ('{{estado}}',               'Estado de la república',                'UBICACION_VIA',      'estado',                          'texto'),
  ('{{tipo_via}}',             'Tipo de vía',                           'CAT_TIPO_VIA',       'nombre',                          'texto'),
  ('{{velocidad_max_kmh}}',    'Velocidad máxima permitida',            'UBICACION_VIA',      'velocidad_maxima_permitida_kmh',  'texto'),
  ('{{numero_siniestro}}',     'Número de siniestro',                   'INCIDENTE',          'numero_siniestro',                'mayusculas'),
  ('{{numero_formato}}',       'Número de formato del reporte',         'REPORTE',            'numero_formato',                  'texto'),
  ('{{velocidad_final_kmh}}',  'Velocidad final calculada (km/h)',       'CALCULO_VELOCIDAD',  'velocidad_final_kmh',             'decimal_2'),
  ('{{exceso_velocidad}}',     'Indica si hubo exceso de velocidad',    'CALCULO_VELOCIDAD',  'exceso_velocidad',                'texto'),
  ('{{e_deformacion_julios}}', 'Energía de deformación (J)',            'CALCULO_VELOCIDAD',  'e_deformacion_julios',            'decimal_3'),
  ('{{e_vuelco_julios}}',      'Energía de vuelco (J)',                 'CALCULO_VELOCIDAD',  'e_vuelco_julios',                 'decimal_3'),
  ('{{e_total_julios}}',       'Energía total (J)',                     'CALCULO_VELOCIDAD',  'e_total_julios',                  'decimal_3'),
  ('{{narracion_hechos}}',     'Narración dinámica del hecho',          'NARRATIVA_DINAMICA', 'narracion_hechos',                'texto'),
  ('{{objeto_involucrado}}',   'Objeto fijo / vehículo involucrado',    'NARRATIVA_DINAMICA', 'objeto_involucrado',              'texto'),
  ('{{perito_nombre}}',        'Nombre del perito elaborador',          'USUARIO',            'nombre',                          'mayusculas'),
  ('{{fecha_elaboracion}}',    'Fecha de elaboración del documento',    'REPORTE',            'fecha_elaboracion',               'fecha_larga'),
  ('{{ubicacion_taller}}',     'Taller donde se encuentra el vehículo', 'REPORTE',            'ubicacion_taller',                'texto');

-- =============================================================================

SET FOREIGN_KEY_CHECKS = 1;

-- =============================================================================
-- FIN DEL SCRIPT
-- Tablas creadas: 40
--   Catálogos    : 27  (CAT_*)
--   Técnicas     :  3  (TABLA_*)
--   Transaccionales: 10 (INCIDENTE → CONCLUSION)
--   Plantilla    :  4  (PLANTILLA*)
--   Usuarios     :  1
-- =============================================================================
