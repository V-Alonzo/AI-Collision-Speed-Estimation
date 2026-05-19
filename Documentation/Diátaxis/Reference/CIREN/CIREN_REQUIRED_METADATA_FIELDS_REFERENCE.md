# Reference

Esta referencia documenta los campos que aparecen en el flujo CIREN del repositorio, no solo los metadatos configurados en `CIREN_REQUIRED_METADATA_KEYS`. El objetivo es que cualquier persona que lea el cache JSON, las tablas parquet o el código Python del extractor pueda ubicar rápidamente qué significa cada variable y cómo debe interpretarla.

## Audiencia

Este documento está dirigido a:

- Personas que mantienen el extractor CIREN.
- Personas que consumen `ciren_cases.parquet`, `ciren_images.parquet` o `ciren_training_manifest.parquet`.
- Personas que revisan `cacheCIREN.json` para reanudar corridas o depurar casos.
- Personas que preparan variables para modelos que usan `totalDeltaV` o severidad como objetivo.

## Alcance

Esta referencia cubre cuatro grupos de variables que existen en los artefactos que genera el flujo:

- Metadatos requeridos configurados en `CIREN_REQUIRED_METADATA_KEYS`.
- Columnas derivadas que `storage_utils.py` escribe en parquet.
- Campos de imagen y trazabilidad usados por `ciren_extractor.py` y `ciren_client.py`.
- Campos operativos de cache y de error que aparecen durante la extracción.

No intenta reemplazar una taxonomía oficial de NHTSA o CIREN. Cuando un campo usa un vocabulario externo o un código especializado, este documento explica cómo tratarlo dentro del repositorio y qué se observa en los datos actuales.

## Mapa rápido de artefactos

| Artefacto | Variables principales | Uso |
| --- | --- | --- |
| `cacheCIREN.json` | `cirenId`, `caseId`, `caseNumber`, metadatos CIREN, `candidateImages`, `revisedImages`, `validImages`, `validatedImageRecords`, `errors` | estado reanudable del extractor |
| `ciren_cases.parquet` | `cirenId`, `caseId`, `mais`, `totalDeltaVKph`, `totalDeltaVMph`, `cdc`, `clockDirection`, `forceDirection`, `rolloverStatus`, `primaryVehicleNumber`, `damagePlaneDescription`, `severityDescription`, `vehicleClass`, `curbWeight`, `curbWeightKg`, `cargoWeight`, `cargoWeightKg` | tabla de casos para análisis |
| `ciren_images.parquet` | `image_id`, `cirenId`, `caseId`, `image_relpath`, `image_filename`, `vehicleNumber`, `image_sequence`, `photoId`, `objectID`, `description`, `subtype` | tabla de imágenes validadas |
| `ciren_training_manifest.parquet` | columnas de `ciren_images.parquet` más los metadatos de caso incluidos en `CIREN_REQUIRED_METADATA_KEYS` | unión analítica para modelado |
| tabla interna de errores | `cirenId`, `caseId`, `errorIndex`, `errorMessage` | normalización interna de errores. |

## Cómo leer esta referencia

Cada campo se documenta con una de estas dos profundidades:

- Sección detallada para variables de negocio o modelado con semántica propia.
- Tabla operativa para identificadores, rutas, campos de cache o columnas derivadas cuyo significado es directo, pero conviene fijar explícitamente.

## Resumen de metadatos requeridos

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
| `totalDeltaV` | texto semiestructurado | delta-v total reportado por CIREN | variable objetivo y fuente de columnas numéricas derivadas |
| `mais` | entero o texto numérico corto | severidad máxima de lesión reportada | target alterno y estratificación de gravedad |

## Esquema actual por tabla

### `ciren_cases.parquet`

Esta tabla contiene:

- `cirenId`
- `caseId`
- `mais`
- `totalDeltaVKph`
- `totalDeltaVMph`
- `cdc`
- `clockDirection`
- `forceDirection`
- `rolloverStatus`
- `primaryVehicleNumber`
- `damagePlaneDescription`
- `severityDescription`
- `vehicleClass`
- `curbWeight`
- `curbWeightKg`
- `cargoWeight`
- `cargoWeightKg`

### `ciren_images.parquet`

Esta tabla contiene:

- `image_id`
- `cirenId`
- `caseId`
- `image_relpath`
- `image_filename`
- `vehicleNumber`
- `image_sequence`
- `photoId`
- `objectID`
- `description`
- `subtype`

### `ciren_training_manifest.parquet`

Esta tabla se genera con un `merge` entre `ciren_images.parquet` y `ciren_cases.parquet` por `cirenId` y `caseId`. Debido a esto, contiene:

- Todas las columnas de `ciren_images.parquet`.
- Todas las columnas de caso habilitadas por `CIREN_REQUIRED_METADATA_KEYS` después de sus derivaciones numéricas.

Esto incluye: `mais`, `totalDeltaVKph`, `totalDeltaVMph`, `cdc`, `clockDirection`, `forceDirection`, `rolloverStatus`, `primaryVehicleNumber`, `damagePlaneDescription`, `severityDescription`, `vehicleClass`, `curbWeight`, `curbWeightKg`, `cargoWeight` y `cargoWeightKg`.

## Referencia detallada de metadatos

### `totalDeltaV`

**Propósito**

Conservar el delta-v total reportado por CIREN en su forma original.

**Significado**

Representa el cambio total de velocidad asociado al evento, normalmente expresado simultáneamente en `kmph` y `mph` dentro del texto fuente.

**Tipo**

Texto semiestructurado.

**Valores observados**

- `52 kmph 32 mph`
- `34 kmph 21 mph`

**Utilidad**

Es una de las variables objetivo más valiosas del flujo. En parquet no se conserva como texto crudo; se descompone en `totalDeltaVKph` y `totalDeltaVMph` para análisis y modelado.

**Notas**

Si el valor crudo viene incompleto o con formato distinto, alguna de las derivaciones numéricas puede quedar nula.

### `mais`

**Propósito**

Preservar la severidad máxima de lesión asociada al caso.

**Significado**

Corresponde al nivel máximo AIS observado en el caso, tratado en el repositorio como una señal compacta de gravedad humana.

**Tipo**

Entero o texto numérico corto.

**Valores observados**

- `1`
- `2`
- `3`
- `4`

**Utilidad**

Sirve para estratificar casos, construir cortes de severidad y contrastar daño vehicular contra lesión humana.

**Notas**

En parquet se intenta coercer a entero nullable de pandas. Si la fuente no es numérica, puede terminar como nulo.

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

Su distribución suele ser desbalanceada. Aún así, los casos positivos pueden aportar información cualitativa.

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

No debe confundirse con `vehicleNumber`. `primaryVehicleNumber` describe el vehículo principal del caso; `vehicleNumber` identifica el vehículo concreto al que pertenece una imagen validada.

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

En este repositorio conviene conservar el valor crudo y derivar una versión numérica. El parquet actual expone `curbWeightKg` para uso analítico.

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

## Columnas derivadas e identificadores

### Identificadores y joins

| Campo | Dónde aparece | Tipo práctico | Explicación |
| --- | --- | --- | --- |
| `cirenId` | cache, casos, imágenes, manifest, errores | entero o string numérico | identificador principal del caso CIREN; es la llave de unión dominante del flujo |
| `caseId` | cache, casos, imágenes, manifest, errores | entero nullable | identificador interno adicional del caso reportado por el summary del Crash Viewer |
| `caseNumber` | cache y nombres de carpeta | entero o string | identificador usado para construir directorios de salida; normalmente coincide con el caso CIREN visible |
| `image_id` | imágenes y manifest | string | identificador determinista construido como `ciren_<cirenId>_<image_stem>` para mantener estabilidad entre corridas |
| `image_relpath` | imágenes y manifest | string | ruta relativa normalizada de la imagen validada, con separadores `/` |
| `image_filename` | imágenes y manifest | string | nombre de archivo final de la imagen validada |

### Variables derivadas para análisis

| Campo | Fuente | Tipo práctico | Explicación |
| --- | --- | --- | --- |
| `totalDeltaVKph` | parseo de `totalDeltaV` | entero nullable | componente en kilómetros por hora extraída del texto crudo |
| `totalDeltaVMph` | parseo de `totalDeltaV` | entero nullable | componente en millas por hora extraída del texto crudo |
| `curbWeightKg` | extracción numérica de `curbWeight` | entero nullable | parte numérica del peso base, lista para análisis cuantitativo |
| `cargoWeightKg` | extracción numérica de `cargoWeight` | entero nullable | parte numérica de la carga reportada |
| `image_sequence` | parseo del nombre de archivo | entero nullable | secuencia ordinal de la imagen validada dentro del caso |

## Campos de imagen usados por Python y parquet

| Campo | Dónde aparece | Tipo práctico | Explicación |
| --- | --- | --- | --- |
| `vehicleNumber` | candidatos, imágenes validadas, parquet | entero nullable | número del vehículo al que pertenece una imagen concreta; puede venir del candidato o inferirse del nombre del archivo |
| `photoId` | candidatos, imágenes validadas, parquet | entero nullable | identificador de foto de Crash Viewer usado para descargar la versión full-resolution cuando existe |
| `objectID` | candidatos, imágenes validadas, parquet | string | identificador estable del elemento de galería de CIREN; se usa para deduplicar y seguir el estado del candidato |
| `description` | candidatos, imágenes validadas, parquet | string | descripción textual de la imagen según la galería CIREN |
| `subtype` | candidatos, imágenes validadas, parquet | string | subtipo de galería del Crash Viewer del que proviene la imagen, por ejemplo vistas exteriores o categorías afines |
| `imagePath` | `validatedImageRecords` en cache | string | ruta del archivo validado guardado localmente antes de normalizarse a `image_relpath` e `image_filename` |

## Campos operativos del cache

| Campo | Tipo práctico | Explicación |
| --- | --- | --- |
| `candidateImages` | lista de objetos | candidatos descubiertos en la galería antes de pasar por validación visual; cada elemento incluye `vehicleNumber`, `description`, `objectID`, `photoId` y `subtype` |
| `revisedImages` | lista de strings | conjunto de `objectID` ya revisados por el pipeline, independientemente de si fueron aceptados o rechazados |
| `validImages` | lista de strings | conjunto de `objectID` que sí produjo al menos una imagen validada |
| `validatedImageRecords` | lista de objetos | registros persistidos de imágenes aceptadas; cada elemento incluye `imagePath`, `vehicleNumber`, `photoId`, `objectID`, `description` y `subtype` |
| `errors` | lista de strings | mensajes de error y también marcadores de metadata faltante; no contiene solo excepciones de ejecución |

## Variables de error normalizadas internamente

| Campo | Tipo práctico | Explicación |
| --- | --- | --- |
| `errorIndex` | entero nullable | posición ordinal del mensaje de error dentro del caso cuando el error proviene de la lista `errors` |
| `errorMessage` | string | mensaje normalizado del error, por ejemplo faltantes de metadata o imágenes validadas ausentes en disco |

## Tablas de referencia rápida

### Convención de `Collision Deformation Classification (cdc)`

| Posición | Segmento CDC | Ejemplos | Interpretación | Descripción técnica |
| --- | --- | --- | --- | --- |
| 1-2 | Dirección horaria del impacto | `12`, `01`, `03`, `06`, `09`, `11` | Dirección principal del impacto | representa la zona del vehículo impactada usando el sistema de reloj |
| 3 | Área general dañada | `F`, `B`, `L`, `R`, `T`, `U` | Región principal dañada | `F` = Front, `B` = Back/Rear, `L` = Left, `R` = Right, `T` = Top, `U` = Undercarriage |
| 4 | Tipo o distribución del daño | `D`, `P`, `Y`, `Z`, `C` | Patrón de deformación | describe cómo se distribuye el daño |
| 5 | Zona vertical del daño | `A`, `B`, `C`, `D`, `E`, `F`, `G` | Altura relativa del daño | ubica la deformación en la estructura vertical del vehículo |
| 6 | Tipo de deformación estructural | `W`, `E`, `M`, `S`, `T` | Modo de deformación | caracteriza cómo se deformó la estructura |
| 7-8 | Severidad o extensión del daño | `00`-`99` | Magnitud de deformación | valores mayores suelen indicar deformaciones más extensas o severas |

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

### `totalDeltaV`

Hoy se almacena en cache como texto y luego se parsea con dos expresiones regulares separadas para construir `totalDeltaVKph` y `totalDeltaVMph`.

Esto implica lo siguiente:

- El formato fuente importa.
- Una sola parte mal formada puede dejar solo una de las dos columnas derivadas poblada.
- Para entrenamiento suele ser mejor consumir las columnas numéricas, no el texto original.

## Notas de calidad de datos

- Algunos campos son esencialmente categóricos pero llegan como texto libre o semilibre.
- `clockDirection` presenta pequeñas inconsistencias de formato y puntuación.
- `forceDirection` es texto, aunque conceptualmente representa un ángulo.
- `curbWeight` y `cargoWeight` no deben convertirse directamente a entero sin extraer primero la parte numérica.
- `errors` mezcla faltantes de metadata y errores operativos, por lo que no debe interpretarse como un log homogéneo.
- `vehicleNumber` y `primaryVehicleNumber` no son sinónimos y pueden divergir en casos con múltiples vehículos.