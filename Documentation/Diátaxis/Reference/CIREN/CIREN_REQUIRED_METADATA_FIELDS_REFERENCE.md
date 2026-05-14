# Reference

Esta referencia describe los campos incluidos en `CIREN_REQUIRED_METADATA_KEYS` y su utilidad dentro del flujo de extracción CIREN del proyecto. Está pensada para desarrolladores y data scientists que necesitan interpretar estos atributos rápido, entender qué representan y reconocer sus valores más comunes antes de usarlos en cache, parquet o entrenamiento.

## Audiencia

Este documento está dirigido a:

- Personas que mantienen el extractor CIREN.
- Personas que consumen `ciren_cases.parquet` o `ciren_training_manifest.parquet`.
- Personas que preparan variables para modelos que usan `totalDeltaV` como objetivo.

## Alcance

Esta referencia cubre únicamente los campos listados en `CIREN_REQUIRED_METADATA_KEYS`:

- `vehicleClass`
- `cdc`
- `clockDirection`
- `forceDirection`
- `rolloverStatus`
- `primaryVehicleNumber`
- `damagePlaneDescription`
- `severityDescription`
- `curbWeight`
- `cargoWeight`

No intenta reemplazar una taxonomía oficial de NHTSA o CIREN. Cuando un campo usa un vocabulario externo o un código especializado, este documento explica cómo tratarlo dentro del repositorio y qué se observa en los datos actuales.

## Cómo leer esta referencia

Cada campo se documenta con la misma estructura:

- `Propósito`: para qué sirve dentro del dataset.
- `Significado`: qué representa semánticamente.
- `Tipo`: cómo debe interpretarse el valor.
- `Valores observados`: ejemplos reales o patrones observados en el parquet actual.
- `Utilidad`: por qué puede ser útil para análisis o modelado.
- `Notas`: advertencias, ambigüedades o consideraciones de limpieza.

## Resumen rápido

| Campo | Tipo práctico | Qué describe | Utilidad principal |
| --- | --- | --- | --- |
| `vehicleClass` | categórico | clase del vehículo según tamaño o segmento | proxy de masa y geometría |
| `cdc` | categórico codificado | patrón de daño reportado por CIREN | descriptor compacto del daño |
| `clockDirection` | categórico ordinal | dirección principal del impacto en formato reloj | localización angular del impacto |
| `forceDirection` | categórico ordinal | dirección de fuerza en grados | orientación física del impacto |
| `rolloverStatus` | categórico | presencia y tipo de volcadura | severidad y dinámica del evento |
| `primaryVehicleNumber` | entero | vehículo principal dentro del caso | alineación entre tablas y vistas |
| `damagePlaneDescription` | categórico | plano principal dañado | localización macroscópica del daño |
| `severityDescription` | categórico ordinal | severidad resumida del daño | proxy fuerte de severidad del choque |
| `curbWeight` | texto con unidad | peso base del vehículo | masa cruda reportada |
| `cargoWeight` | texto con unidad | carga reportada | ajuste de masa adicional |

## Referencia detallada

### `vehicleClass`

**Propósito**

Representar el segmento o clase del vehículo con más relación a tamaño y plataforma.

**Significado**

Resume la clase del vehículo usando descripciones de tamaño, wheelbase u otra clasificación estructural asociada al registro general del vehículo.

**Tipo**

Texto categórico.

**Valores observados**

- `Intermediate (wheelbase >=265 but < 278 cm)`
- `Compact utility vehicle`
- `Full size (wheelbase >=278 but < 291 cm)`
- `Compact (wheelbase >= 254 but < 265 cm)`
- `Subcompact/mini (wheelbase < 254 cm)`

**Utilidad**

Es una de las mejores variables categóricas para aproximar tamaño relativo del vehículo y, de forma indirecta, propiedades ligadas a absorción de energía y daño esperado.

### `cdc`

**Propósito**

Preservar el código compacto de daño reportado en CIREN.

**Significado**

Es un identificador codificado del patrón principal de daño. En este repositorio debe tratarse como una etiqueta estructurada de daño y no como texto libre.

**Tipo**

Texto categórico codificado.

**Valores observados**

- `12FDEW02`
- `12FDEW03`
- `06BDEW04`
- `12FZEW03`
- `12FYEN06`

**Utilidad**

Condensa información de localización y patrón de deformación en una sola clave. Puede aportar valor si se usa como categoría o si se descompone más adelante en subcomponentes.

**Notas**

Este repositorio no incluye una tabla oficial para decodificar el código. Si se usa en modelado, conviene tratarlo como categoría de alta cardinalidad o descomponerlo solo cuando exista una referencia fiable.

### `clockDirection`

**Propósito**

Indicar la dirección principal del impacto usando la convención de reloj.

**Significado**

Describe el ángulo del impacto visto como la cara de un reloj alrededor del vehículo.

**Tipo**

Texto categórico ordinal.

**Valores observados**

- `12 o'clock`
- `11 o'clock`
- `1 o'clock`
- `6 o'clock`
- `9 o'clock`

**Utilidad**

Es una señal compacta de localización angular del impacto. Puede correlacionarse con el plano de daño, despliegue de sistemas de seguridad y severidad estructural.

**Notas**

En los datos aparecen variantes como `12 o\`clock` y `0 o'clock`. Conviene normalizar formato antes de entrenar.

### `forceDirection`

**Propósito**

Representar la dirección de la fuerza principal del impacto.

**Significado**

Es la dirección del impacto expresada en grados.

**Tipo**

Texto ordinal con componente numérica.

**Valores observados**

- `0 degrees`
- `350 degrees`
- `10 degrees`
- `340 degrees`
- `180 degrees`

**Utilidad**

Es una versión más precisa que `clockDirection` para capturar orientación del impacto.

**Notas**

Conviene derivar una versión numérica en grados para análisis y modelado. Como variable angular, también puede transformarse a seno y coseno.

### `rolloverStatus`

**Propósito**

Informar si hubo volcadura y su tipo general.

**Significado**

Describe si el vehículo volcó y, cuando aplica, el eje o modalidad general de la volcadura.

**Tipo**

Texto categórico.

**Valores observados**

- `No rollover (no overturning)`
- `Rollover -- Longitudinal axis`

**Utilidad**

Es una señal fuerte de dinámica severa y de mecanismos de daño distintos a un impacto plano simple.

**Notas**

Su distribución suele ser desbalanceada. Aun así, los casos positivos pueden aportar mucha información cualitativa.

### `primaryVehicleNumber`

**Propósito**

Identificar el vehículo del caso al que se refieren las tablas y las imágenes principales.

**Significado**

Es el número de vehículo seleccionado como principal al reconciliar la vista de `cirenSummary`, `cirenGeneralVehicleVehicles` y `cirenCrashSummaryVehicles`.

**Tipo**

Entero.

**Valores observados**

- `1`
- `2`

**Utilidad**

Ayuda a alinear metadata de caso con metadata de imagen, especialmente cuando existen varios vehículos en el mismo siniestro.

**Notas**

Es importante para evitar mezclar el daño o la clase de un vehículo secundario con el vehículo objetivo del caso.

### `damagePlaneDescription`

**Propósito**

Describir el plano principal del daño.

**Significado**

Resume qué cara o zona macroscópica del vehículo fue la principal afectada.

**Tipo**

Texto categórico.

**Valores observados**

- `Front`
- `Left side`
- `Back`
- `Right side`
- `Top`
- `Undercarriage`

**Utilidad**

Es una variable de alto valor explicativo para `totalDeltaV`, porque localiza el área principal del daño con una semántica fácil de usar.

**Notas**

Conviene usarla junto con `clockDirection` y `forceDirection` porque las tres describen el impacto desde perspectivas distintas.

### `severityDescription`

**Propósito**

Representar la severidad global del daño en una escala textual corta.

**Significado**

Es una etiqueta resumida de severidad reportada en el crash summary del vehículo.

**Tipo**

Texto categórico ordinal.

**Valores observados**

- `Light`
- `Moderate`
- `Severe`

**Utilidad**

Es una de las variables categóricas más directas para aproximar magnitud del daño. Tiene un vínculo intuitivo fuerte con `totalDeltaV`.

**Notas**

Debe tratarse como ordinal, no como categoría nominal pura.

### `curbWeight`

**Propósito**

Conservar el peso base reportado del vehículo.

**Significado**

Es el peso del vehículo sin carga adicional, tal como lo entrega CIREN.

**Tipo**

Texto con unidad.

**Valores observados**

- `1340 kgs`
- `1495 kgs`
- `1194 kgs`
- `1416 kgs`
- `1050 kgs`

**Utilidad**

La masa del vehículo es una variable muy relevante para interpretar energía, daño y respuesta estructural.

**Notas**

En este repositorio conviene conservar el valor crudo y derivar una versión numérica. El parquet actual ya expone `curbWeightKg` para uso analítico.

### `cargoWeight`

**Propósito**

Conservar la carga reportada adicional al peso base.

**Significado**

Es la masa de carga reportada en el vehículo.

**Tipo**

Texto con unidad.

**Valores observados**

- `0 kgs`

**Utilidad**

Permite ajustar la masa efectiva del vehículo cuando el dato existe y es distinto de cero.

**Notas**

En la muestra actual su variabilidad es muy baja, pero conviene preservarlo. El parquet actual expone también `cargoWeightKg` como derivación numérica.

## Tablas de referencia rápida

### Convención de `Collision Deformation Classification (cdc)`

| Posición | Segmento CDC | Ejemplos | Interpretación | Descripción técnica |
|---|---|---|---|---|
| 1-2 | Dirección horaria del impacto | `12`, `01`, `03`, `06`, `09`, `11` | Dirección principal del impacto | Representa la zona del vehículo impactada usando el sistema de reloj. `12` = frontal, `03` = lado derecho, `06` = trasero, `09` = lado izquierdo. |
| 3 | Área general dañada | `F`, `B`, `L`, `R`, `T`, `U` | Región principal dañada | `F` = Front, `B` = Back/Rear, `L` = Left, `R` = Right, `T` = Top, `U` = Undercarriage. |
| 4 | Tipo o distribución del daño | `D`, `P`, `Y`, `Z`, `C` | Patrón de deformación | Describe cómo se distribuye el daño: distribuido, concentrado, angular, corner impact, etc. |
| 5 | Zona vertical del daño | `A`, `B`, `C`, `D`, `E`, `F`, `G` | Altura relativa del daño | Define la ubicación vertical estructural afectada: baja, media, alta, roofline, bumper, etc. |
| 6 | Tipo de deformación estructural | `W`, `E`, `M`, `S`, `T` | Modo de deformación | Caracteriza cómo se deformó la estructura: wrapping, crush, buckle, shear, torsion, entre otros. |
| 7-8 | Severidad / extensión del daño | `00`–`99` | Magnitud de deformación | Escala relativa de severidad estructural. Valores mayores indican deformaciones más extensas o severas. |

### Convención de `clockDirection`

| Valor | Interpretación rápida |
| --- | --- |
| `12 o'clock` o variantes equivalentes | impacto predominantemente frontal |
| `6 o'clock` | impacto predominantemente trasero |
| `3 o'clock` | impacto lateral derecho |
| `9 o'clock` | impacto lateral izquierdo |
| `1`, `2`, `10`, `11 o'clock` | impacto oblicuo |

### Convención de `forceDirection`

| Patrón | Interpretación rápida |
| --- | --- |
| `0 degrees` o cercano | alineación frontal |
| `180 degrees` o cercano | alineación trasera |
| valores cercanos a `90` o `270` | impacto lateral |
| valores intermedios | impacto oblicuo |

### Escala práctica de `severityDescription`

| Valor | Interpretación rápida |
| --- | --- |
| `Light` | daño visible pero relativamente limitado |
| `Moderate` | daño estructural intermedio |
| `Severe` | daño elevado o muy significativo |

### Valores frecuentes de `damagePlaneDescription`

| Valor | Interpretación rápida |
| --- | --- |
| `Front` | daño principal en el frente |
| `Back` | daño principal en la parte posterior |
| `Left side` | daño principal en el lado izquierdo |
| `Right side` | daño principal en el lado derecho |
| `Top` | daño principal en el techo o parte superior |
| `Undercarriage` | daño principal en la parte inferior |

### Valores frecuentes de `rolloverStatus`

| Valor | Interpretación rápida |
| --- | --- |
| `No rollover (no overturning)` | no hubo volcadura |
| `Rollover -- Longitudinal axis` | hubo volcadura sobre el eje longitudinal |

## Campos con unidad o texto semiestructurado

### `curbWeight` y `cargoWeight`

Ambos llegan como texto con unidades, por ejemplo `1340 kgs` o `0 kgs`. Esto implica lo siguiente:

- El valor original debe conservarse para trazabilidad.
- Para análisis cuantitativo conviene derivar una columna numérica.
- El parquet actual ya genera `curbWeightKg` y `cargoWeightKg` como enteros derivados.

## Notas de calidad de datos

- Algunos campos son esencialmente categóricos pero llegan como texto libre o semilibre.
- `clockDirection` presenta pequeñas inconsistencias de formato y puntuación.
- `forceDirection` es texto, aunque conceptualmente representa un ángulo.
- `curbWeight` y `cargoWeight` no deben convertirse directamente a entero sin extraer primero la parte numérica.

## Qué mirar primero

Si necesitas una lectura rápida del caso, estos campos suelen dar más contexto en menos tiempo:

1. `severityDescription`
2. `damagePlaneDescription`
3. `clockDirection`
4. `forceDirection`
5. `vehicleClass`
6. `curbWeight`

Ese orden no reemplaza un análisis formal, pero suele ser suficiente para entender de forma inmediata cómo fue el choque y qué tan útil puede ser el caso para análisis posterior.