# Estimación de Velocidad tras Accidente Automovilístico mediante Análisis de Imágenes con Deep Learning

## Descripción General

Este repositorio concentra la preparación de datos para etapas posteriores de análisis y modelado. Actualmente conviven dos flujos principales:

- Extracción pública de imágenes y metadatos desde CIREN y NHTSA.
- Preprocesamiento histórico de reportes PDF con extracción visual y salidas estructuradas asistidas por OpenAI.

El punto de entrada activo en `main.py` ya no ejecuta el preprocesamiento PDF por defecto. Hoy dispara la extracción pública CIREN y después exporta la caché resultante a parquet.

## Alcance Actual del Repositorio

Aunque el proyecto está orientado a estimar velocidad antes del impacto, el código disponible en este repositorio sigue enfocado en generar insumos limpios y reutilizables. No entrena un modelo final ni produce una estimación de velocidad por sí solo.

## Configuración del Entorno

### 1. Crear el ambiente Conda

```bash
conda env create -f environment.yml
conda activate VelocityEstimationAI
```

### 2. Verificar modelos locales

El flujo actual usa tres modelos visuales:

- Autos: `utils/Preprocessing/ImagesExtractionClassification/models/yolo11l.pt`
- Piezas: `utils/Preprocessing/ImagesExtractionClassification/models/fine_tuned_yolo_car_pieces.pt`
- Daños: `utils/Preprocessing/ImagesExtractionClassification/models/fine_tuned_yolo_car_damages.pt`

El modelo base de autos puede descargarse automáticamente cuando Ultralytics lo necesite. Los modelos afinados de piezas y daños deben existir localmente dentro de la carpeta `utils/Preprocessing/ImagesExtractionClassification/models/`.

### 3. Configurar OpenAI solo si usarás el flujo PDF

La extracción pública CIREN/NHTSA no requiere `OPENAI_API_KEY`. Esa variable sigue siendo necesaria únicamente para el flujo de preprocesamiento de PDFs que genera salidas estructuradas con OpenAI.

Ejemplo:

```bash
export OPENAI_API_KEY="tu_api_key"
```

### 4. Rutas y parámetros relevantes

La configuración operativa está distribuida principalmente en dos archivos:

- `PATHS.py`: rutas de modelos, cachés y salidas.
- `configurations.py`: clases YOLO, umbrales y parámetros de extracción pública.

Parámetros relevantes del estado actual:

- `CIREN_IMAGES_OUTPUT_DIR`: carpeta de imágenes validadas de CIREN.
- `CIREN_CACHE_OUTPUT_PATH`: caché JSON de casos CIREN.
- `CIREN_PARQUET_OUTPUT_DIR`: carpeta de exportación parquet.
- `CIREN_DEFAULT_CASE_ID_RANGE`: rango por defecto que usa `main.py` al lanzar CIREN.
- `NHTSA_ALLOWED_TEST_CONFIGURATIONS`: configuraciones válidas para descargar pruebas NHTSA.
- `YOLO_CONFIDENCE_THRESHOLD`: umbral global de confianza para inferencia visual.

## Puntos de Entrada Actuales

### Ejecución por defecto

Con el ambiente activo:

```bash
python main.py
```

En el estado actual, este comando ejecuta:

1. `beginExtraction(extraction_from="ciren", just_refresh_cache_and_parquet=False)`.
2. Catalogación de candidatos CIREN.
3. Descarga y validación de imágenes dañadas.
4. Exportación de la caché a parquet.

### Comandos útiles del flujo público

Extraer un caso CIREN concreto:

```bash
python -c "from utils.Preprocessing.NHTSADatabaseExtraction.ciren_extractor import beginCirenExtraction; beginCirenExtraction(ciren_ids=[527])"
```

Refrescar solo metadatos CIREN y regenerar parquet sin reextraer imágenes:

```bash
python -c "from utils.Preprocessing.NHTSADatabaseExtraction.orchestator import beginExtraction; beginExtraction('ciren', just_refresh_cache_and_parquet=True)"
```

Ejecutar la extracción NHTSA desde el orquestador:

```bash
python -c "from utils.Preprocessing.NHTSADatabaseExtraction.orchestator import beginExtraction; beginExtraction('nhtsa')"
```

### Flujo PDF histórico

El preprocesamiento de reportes PDF sigue existiendo, pero ya no es el entrypoint por defecto. Si necesitas ese flujo, debes invocar `beginPreprocessing()` manualmente desde `utils/Preprocessing/orchestator.py` o volver a habilitarlo en `main.py`.

## Flujo Público de Extracción

### CIREN

El flujo CIREN vive en `utils/Preprocessing/NHTSADatabaseExtraction/` y opera en dos etapas desacopladas:

1. Catalogación de casos y candidatos.
2. Descarga y validación de imágenes candidatas.

Resumen del comportamiento actual:

- Consulta el índice público de casos CIREN en Crash Viewer.
- Obtiene metadatos detallados por caso y por vehículo.
- Descubre subtipos válidos de galerías a partir del árbol de overview del caso.
- Guarda candidatos de imagen en caché antes de descargar los bytes finales.
- Reanuda corridas incompletas usando `candidateImages`, `revisedImages`, `validImages` y `validatedImageRecords`.
- Filtra imágenes con el pipeline visual de daños.
- Exporta casos, imágenes y training manifest a parquet.

Metadatos CIREN hoy priorizados en caché y parquet:

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
- `totalDeltaV`
- `mais`

### NHTSA

El flujo NHTSA consulta el catálogo público de pruebas, filtra pruebas compatibles y valida sus imágenes multimedia.

Resumen del comportamiento actual:

- Consulta páginas del endpoint público de resultados de prueba.
- Filtra configuraciones válidas y exige `closingSpeed > 0`.
- Descarga multimedia asociada a cada prueba aprobada.
- Rechaza imágenes sin auto, no fotográficas o sin daño visible.
- Conserva las imágenes finales válidas y actualiza `cacheAPI.json`.

## Artefactos Generados por la Extracción Pública

La extracción pública escribe sus salidas en esta estructura:

```text
utils/Preprocessing/NHTSADatabaseExtraction/Extraction/
├── Images/
│   ├── CIREN/
│   └── <TestNo>/
├── JSONs/
│   ├── cacheCIREN.json
│   └── cacheAPI.json
└── Parquets/
    └── CIREN/
        ├── ciren_cases.parquet
        ├── ciren_images.parquet
        └── ciren_training_manifest.parquet
```

Contenido de los artefactos principales:

- `cacheCIREN.json`: estado reanudable por caso, candidatos catalogados, revisión de objetos y metadatos de salida.
- `ciren_cases.parquet`: tabla de casos con delta-v, severidad y metadata vehicular.
- `ciren_images.parquet`: tabla de imágenes validadas con rutas, secuencia y referencias de origen.
- `ciren_training_manifest.parquet`: unión analítica entre casos e imágenes para modelado posterior.

## Documentación Disponible

El PR más reciente añadió documentación específica para el flujo CIREN:

- Tutorial de primera ejecución: `Documentation/Diátaxis/Tutorials/ImagesExtraction/CIREN_EXTRACTION_TUTORIAL.md`
- Referencia de metadatos requeridos: `Documentation/Diátaxis/Reference/CIREN/CIREN_REQUIRED_METADATA_FIELDS_REFERENCE.md`

Si vas a tocar el extractor CIREN o a consumir los parquet, estos dos documentos deberían leerse antes de modificar configuración o cache.

## Flujo Histórico de Preprocesamiento PDF

Además del extractor público, el repositorio conserva el pipeline de PDFs en `utils/Preprocessing/`. Ese flujo sigue cubriendo:

- Gestión de PDFs y trazabilidad de archivos enviados a OpenAI.
- Extracción de imágenes embebidas en reportes.
- Clasificación de autos, piezas y fotografías.
- Generación de salidas de texto estructuradas para ambiente, siniestro, vehículos y catálogo de imágenes.

Salida relevante del flujo PDF:

- `Resources/Reports/Uploaded/`
- `Resources/Reports/Preprocessed/JSONs/`
- `Resources/Reports/Preprocessed/images/`

Ese pipeline sigue siendo útil, pero ya no describe el comportamiento por defecto de `main.py`.

## Estructura Operativa Relevante

```text
Resources/
└── Reports/
    ├── IDs.csv
    ├── NotUploaded/
    ├── Uploaded/
    └── Preprocessed/
        ├── JSONs/
        └── images/

utils/
└── Preprocessing/
    ├── ImagesExtractionClassification/
    └── NHTSADatabaseExtraction/
        └── Extraction/
```

## Uso Recomendado

Si tu objetivo es trabajar con extracción pública:

1. Activa el ambiente `VelocityEstimationAI`.
2. Verifica que los modelos afinados estén disponibles localmente.
3. Ejecuta una corrida CIREN pequeña o `python main.py`.
4. Revisa `cacheCIREN.json`, las imágenes finales y los parquet generados.

Si tu objetivo es trabajar con PDFs internos del proyecto:

1. Coloca PDFs nuevos en `Resources/Reports/NotUploaded`.
2. Configura `OPENAI_API_KEY`.
3. Invoca el flujo `beginPreprocessing()`.
4. Revisa `Resources/Reports/Uploaded`, `Resources/Reports/Preprocessed/JSONs` y `Resources/Reports/Preprocessed/images`.


## Archivos Clave

- `main.py`: punto de entrada de la fase de preprocesamiento.
- `utils/Preprocessing/orchestator.py`: orquestación principal.
- `utils/Preprocessing/filesManager.py`: inventario, carga y recuperación de PDFs.
- `utils/Preprocessing/Preprocessor.py`: extracción estructurada con OpenAI.
- `utils/Preprocessing/promptsAI.py`: prompts y orden de extracción.
- `utils/Preprocessing/ImagesExtractionClassification/orchestator.py`: secuencia completa de extracción/clasificación de imágenes, limpieza de artefactos y construcción del PDF final de evidencia.
- `utils/Preprocessing/ImagesExtractionClassification/pdf_creator.py`: conversión de imágenes finales (`PHOTOS/`) a un PDF consolidado por reporte.
- `PATHS.py`: rutas operativas.
- `configurations.py`: hiperparámetros y etiquetas de clasificación.


## Anexos

- Tabla SOTA: https://docs.google.com/document/d/1VRIYabN36LS5DunLxKg6cvVOSwVMu1Yo3Bf-Iw90KrY/edit?usp=sharing

