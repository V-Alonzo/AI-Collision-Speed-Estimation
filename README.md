# Estimación de Velocidad tras Accidente Automovilístico mediante Análisis de Imágenes con Deep Learning

## Descripción General

Este repositorio reúne la fase de preprocesamiento de reportes de siniestros viales en PDF. El flujo combina:

- Gestión de PDFs y trazabilidad de archivos enviados a OpenAI.
- Extracción y clasificación de imágenes embebidas en los reportes.
- Extracción de evidencia visual desde bases públicas de NHTSA y CIREN.
- Generación de salidas estructuradas con GPT-5 para ambiente, siniestro, vehículos y catálogo de imágenes.

El punto de entrada para el flujo de reportes PDF es `main.py`, que ejecuta `beginPreprocessing()`.

## Alcance del Repositorio

Aunque el proyecto está orientado a estimar velocidad tras un accidente, el código disponible en este repositorio está enfocado en la preparación de datos. La ejecución principal no entrena modelos ni produce una estimación final de velocidad por sí sola; prepara insumos estructurados para etapas posteriores.

## Configuración del Entorno

### 1. Crear el Ambiente de Conda

```bash
conda env create -f environment.yml
conda activate CESVI
```

### 2. Configuración de los Modelos YOLO

**Modelo de YOLO para la Identifiación de Vehículos en Imágenes**
</br>
Modelo: `yolo11l.pt`
</br>
Instalación: Este modelo se descargará automáticamente la primera vez que se ejecute el código y se guardará en `utils/Preprocessing/ImagesExtractionClassification/models` bajo el nombre `yolo11l.pt`.

**Modelo de YOLO para la Identifiación de Piezas de Vehículos en Imágenes**
</br>
Modelo: `yolo11l.pt` con fine-tuning para identificación de piezas.
</br>
Instalación: Deberás ejecutar la porción de código bajo la sección `YOLO_Pieces_Fine-Tuning` del archivo alojado en `utils/Preprocessing/ImagesExtractionClassification/models/YOLO_Pieces_Fine_Tuning.ipynb` en una plataforma como Google Colab. Una vez que el proceso de fine-tuning finalice, deberás descargar el modelo `best.pt` y alojarlo en `utils/Preprocessing/ImagesExtractionClassification/models/` bajo el nombre `fine_tuned_yolo_car_pieces.pt`

**Modelo de yolo para la Identificación de Daños en Vehículos**
</br>
Modelo: `yolo26l.pt` con fine-tuning para identificación de daños en vehículos.
</br>
Instalación:

1. Ingresa al dataset [dando clic aquí](https://platform.ultralytics.com/senkod/datasets/car-damage-v5v4iyolo26) y descarga el dataset en formato .ndjson.
2. Abre el archivo ubicado en `utils/Preprocessing/ImagesExtractionClassification/models/YOLO_Pieces_Fine_Tuning.ipynb` haciendo uso de alguna herramienta como Kaggle o Google Colab y ejecuta la porción de código correspondiente a la sección `YOLO_CAR_DAMAGE_FINE_TUNING`. 
3. Una vez que el fine-tuning finalice, abre la carpeta creada `runs` y dirígete a `detect/train-<valor_mas_alto>/weights` para descargar el modelo `best.pt`.
4. Finalmente, renómbralo a `fine_tuned_yolo_car_damages.pt`y colócalo dentro de `utils/Preprocessing/ImagesExtractionClassification/models`.

### 3. Configurar la API de OpenAI

El código no carga un archivo `.env`. La autenticación depende de la configuración estándar del SDK de OpenAI, por lo que debe existir la variable de entorno `OPENAI_API_KEY` en la sesión donde se ejecute el proyecto.

Ejemplo:

```bash
export OPENAI_API_KEY="tu_api_key"
```

### 4. Rutas y Parámetros Locales

La configuración operativa está distribuida en dos archivos:

- `PATHS.py`: rutas de entrada, salida y modelos.
- `configurations.py`: clases objetivo, extensiones de imagen y umbral de clasificación foto/no-foto.

Parámetros relevantes:

- `REPORTS_PATH_NOT_UPLOADED`: carpeta de PDFs pendientes de procesamiento.
- `REPORTS_PATH_UPLOADED`: carpeta de PDFs ya inventariados.
- `PREPROCESSED_JSONS_PATH`: carpeta de salidas de texto generadas por GPT.
- `PREPROCESSED_IMAGES_PATH`: carpeta base de imágenes extraídas y clasificadas.
- `CARS_YOLO_MODEL_PATH`: modelo YOLO para detectar autos.
- `PIECES_YOLO_MODEL_PATH`: modelo YOLO afinado para detectar piezas.

## Ejecución

Con el ambiente activo y la API configurada:

```bash
python main.py
```

### Extracción desde NHTSA y CIREN

El módulo `utils/Preprocessing/NHTSADatabaseExtraction/orchestator.py` concentra la descarga y validación de imágenes provenientes de fuentes públicas de NHTSA y Crash Viewer CIREN.

Responsabilidades principales de `orchestator.py`:

- `get_valid_test(...)`: consulta el catálogo de pruebas instrumentadas de NHTSA, filtra configuraciones válidas, exige `closingSpeed > 0`, incorpora información de vehículos y persiste resultados en `cacheAPI.json`.
- `download_valid_images(...)`: descarga imágenes de las pruebas NHTSA aprobadas por el filtro, las valida con el pipeline visual y limpia directorios vacíos.
- `download_valid_ciren_images(...)`: recorre casos CIREN, construye la caché enriquecida del caso y conserva únicamente imágenes que pasan la validación de daño.
- `beginExtraction()`: invoca `beginCirenExtraction(ciren_ids=list(range(1, 5000)))`.
- `beginCirenExtraction(ciren_ids=None)`: ejecuta la extracción CIREN sobre el índice completo si `ciren_ids` es `None`, o sobre un subconjunto explícito si recibe una lista como `[527]`.

#### Cliente Crash Viewer CIREN

El módulo `utils/Preprocessing/NHTSADatabaseExtraction/ciren_client.py` encapsula la comunicación con Crash Viewer y entrega candidatos de imagen listos para ser evaluados por el orquestador.

Responsabilidades de `ciren_client.py`:

- `_build_session()`: crea una sesión `curl_cffi` con impersonación de Chrome para evitar los bloqueos que Crash Viewer aplica a clientes HTTP básicos.
- `fetch_ciren_case_index()`: realiza `POST /api/ciren/cases/search` con `{"filters": []}` para recuperar el índice público de casos.
- `fetch_ciren_case_detail(ciren_id)`: consulta `GET /api/Ciren/GetCirenCrashDetails` y devuelve el detalle estructurado del caso.
- `extract_case_summary(...)`: extrae la sección `cirenSummary`.
- `extract_case_general_vehicle(...)`: selecciona el vehículo general que mejor corresponde con el resumen del caso y expone metadatos como `bodyCategory`, `bodyType`, `vehicleClass` y `hasTrailer`.
- `iter_vehicle_image_candidates(...)`: consulta `GET /api/Ciren/CaseOverviewTreeResult` para identificar subtipos válidos por vehículo, usa `GET /api/ciren/GetVehThumbnailsByVehNo` para obtener miniaturas, deduplica por `objectID`, intenta descargar la foto completa con `GET /api/ciren/photo/download/{photo_id}` y usa la miniatura como respaldo si la descarga completa falla.

Reglas aplicadas durante la iteración de candidatos CIREN:

- Se descartan subtipos que contengan `INTERIOR`, `EXEMPLAR`, `INT`, `MISCELLANEOUS`, `UNDERCARRIAGE` o `TOP`.
- Se evita procesar imágenes repetidas del mismo objeto mediante `objectID`.
- La imagen completa tiene prioridad sobre la miniatura embebida en base64.

Salidas CIREN:

- Imágenes validadas: `utils/Preprocessing/NHTSADatabaseExtraction/Extraction/Images/CIREN/<CaseNumber>/`
- Cache independiente: `utils/Preprocessing/NHTSADatabaseExtraction/Extraction/JSONs/cacheCIREN.json`
- Nombre de archivo validado: `<TotalDeltaV|UnknownDeltaV>_<MAIS|UnknownSeverity>_<seq>_Vehicle<vehNo>.jpg`

Metadatos persistidos por caso en `cacheCIREN.json`:

- Identificadores del caso: `cirenId`, `caseId`, `caseNumber`.
- Resumen del evento: `mais`, `totalDeltaV`, `objectContact`, `category`.
- Vehículo principal: `vehicleMake`, `vehicleModel`, `vehicleModelYear`, `bodyCategory`, `bodyType`, `vehicleClass`, `vehicleHasTrailer`.
- Trazabilidad del proceso: `candidateImages`, `validatedImages`, `errors`.

Validación aplicada por el orquestador a imágenes CIREN:

- Cada candidata se guarda temporalmente en disco dentro del directorio del caso.
- `isValidImage(..., isFromNHTSA=False)` omite la compuerta de auto/foto usada para NHTSA y evalúa directamente daños con `classify_damages_image(...)`.
- Si la imagen contiene daño detectable, se reescribe como salida final y se elimina el archivo temporal candidato.
- Si ninguna imagen del caso supera la validación, el caso conserva el error correspondiente en caché y el directorio vacío se elimina.

Ejemplo de uso desde Python:

```python
from utils.Preprocessing.NHTSADatabaseExtraction.orchestator import beginCirenExtraction

beginCirenExtraction(ciren_ids=[527])
```

## Pipeline de Preprocesamiento

### 1. Carga y Recuperación de PDFs en OpenAI

El módulo `utils/Preprocessing/filesManager.py` centraliza la administración de reportes PDF.

Responsabilidades:

- Subir a OpenAI los PDFs ubicados en `Resources/Reports/NotUploaded`.
- Registrar la relación `ID, Nombre` en `Resources/Reports/IDs.csv`.
- Mover los PDFs cargados a `Resources/Reports/Uploaded`.
- Recuperar metadatos de archivos ya registrados en el CSV aunque no hayan sido cargados durante la ejecución en curso.

Flujo implementado:

1. `performFilesProcessing()` inicializa el cliente de OpenAI.
2. `uploadPDFFiles()` sube los PDFs pendientes con `purpose="user_data"`.
3. Cada archivo subido se registra en `IDs.csv` y se mueve a la carpeta de subidos.
4. `retrieveMissingGptFiles()` compara los IDs recuperados en la ejecución contra el inventario del CSV y recupera los faltantes.
5. Se devuelve una lista unificada de archivos GPT que alimenta la etapa de extracción estructurada.

### 2. Extracción y Clasificación de Imágenes desde PDFs

La canalización de imágenes está en `utils/Preprocessing/ImagesExtractionClassification/` y se ejecuta desde `extractImagesFromUploadedPDFs()` en `orchestator.py`.

### Etapas de la Canalización

#### a. Extracción de Imágenes Embebidas en PDF

`pdf_extractor.py` utiliza PyMuPDF (`fitz`) para extraer imágenes incrustadas por página.

Cada imagen extraída se clasifica inmediatamente con YOLO para decidir si contiene autos:

- Si detecta autos, se guarda en `CARS/`.
- Si no detecta autos, se guarda en `NOCARS/`.

#### b. Eliminación de Imágenes Duplicadas

Previo a las clasificaciones secundarias, `photos_classifier.py` ejecuta una deduplicación exacta sobre las carpetas `CARS/` y `NOCARS/`.

Características de esta etapa:

- Usa `imagededup` con `PHash` para generar hashes perceptuales.
- Busca duplicados con `max_distance_threshold=0`, es decir, coincidencia exacta a nivel de hash.
- Elimina de disco las imágenes repetidas detectadas previo al resto de etapas.
- Reporta por consola cuántos archivos fueron removidos en cada carpeta.

Esta limpieza reduce ruido en la clasificación posterior y evita procesar múltiples veces la misma evidencia visual extraída del PDF.

#### c. Clasificación de Piezas Automotrices

`pieces_classifier.py` toma las imágenes de `NOCARS/` y aplica un segundo modelo YOLO afinado para separar:

- `PIECES/`: imágenes sin auto completo pero con piezas relevantes.
- `NOPIECES/`: imágenes que no contienen ni autos ni piezas relevantes.

#### d. Clasificación Foto vs. No Foto

`photos_classifier.py` procesa las carpetas `CARS/` y `PIECES/` para decidir si una imagen es una fotografía real o material no fotográfico.

La decisión combina:

- Un modelo CLIP `ViT-B-32` (`open_clip`).
- Etiquetas de texto definidas en `configurations.py`.
- Una heurística de ruido visual.
- El umbral `IS_PHOTOGRAPH_PROBABILITY_THRESHOLD`.

Las salidas se copian en:

- `PHOTOS/`: imágenes clasificadas como fotografías.
- `NOPHOTOS/`: imágenes clasificadas como render, dibujo o material no fotográfico.

#### e. Limpieza Automática de Artefactos Intermedios

Una vez que termina la clasificación foto/no-foto, el orquestador elimina automáticamente las carpetas intermedias que solo fueron necesarias durante el procesamiento:

- `CARS/`
- `NOCARS/`
- `PIECES/`
- `NOPIECES/`
- `NOPHOTOS/`

Con esto, la salida persistente se concentra únicamente en las imágenes finales útiles para etapas posteriores.

#### f. Generación de PDF Consolidado de Evidencia Fotográfica

Una vez que se obtiene la carpeta `PHOTOS/`, el orquestador de `ImagesExtractionClassification/orchestator.py` invoca `generate_images_pdf()` de `pdf_creator.py` para crear un único PDF final por reporte.

Cómo funciona `generate_images_pdf(images_directory, output_pdf_path, pdf_name)`:

1. Lee las imágenes de `PHOTOS/`.
2. Convierte cada imagen a RGB y la serializa como PDF individual temporal en un directorio efímero (`tempfile.TemporaryDirectory`).
3. Une los PDFs temporales usando PyMuPDF (`fitz`) con `insert_pdf`.
4. Guarda el PDF consolidado en `YOLOCARS/` con nombre `<nombre_reporte>.pdf`.
5. Elimina automáticamente los archivos temporales al salir del contexto.

En consecuencia, `begin_extraction(source_pdf_path)` termina no solo con las fotos clasificadas, sino también con un entregable único que facilita revisión humana, trazabilidad y consumo por etapas posteriores.

### Estructura de Salida de Imágenes

Durante la ejecución se crea una estructura temporal con esta forma:

```text
Resources/Reports/Preprocessed/images/<nombre_pdf>/YOLOCARS/
├── CARS/
├── NOCARS/
├── NOPHOTOS/
├── NOPIECES/
├── PHOTOS/
└── PIECES/
```

Al finalizar el pipeline, solo se conserva la salida final:

```text
Resources/Reports/Preprocessed/images/<nombre_pdf>/YOLOCARS/
├── PHOTOS/
└── <nombre_pdf>.pdf
```

### 3. Ejecución Segura y Medición de Tiempo

`main.py` encapsula la ejecución dentro de `if __name__ == "__main__":`, lo que evita errores de `multiprocessing` al utilizar librerías que crean procesos hijos durante la deduplicación en macOS y otros entornos con estrategia `spawn`.

Además, el punto de entrada imprime:

- Marca temporal de inicio.
- Marca temporal de fin.
- Tiempo total de ejecución en segundos.

### 4. Extracción Estructurada con GPT-5

El módulo `utils/Preprocessing/Preprocessor.py` toma la lista de archivos GPT y ejecuta una serie ordenada de prompts definidos en `utils/Preprocessing/promptsAI.py`.

Orden de extracción:

1. `GPT_EXTRACTION_SINISTER_IMAGES`
2. `GPT_EXTRACTION_ENVIRONMENT`
3. `GPT_EXTRACTION_VEHICLES_IMAGES`
4. `GPT_EXTRACTION_VEHICLES`

Detalles importantes:

- El primer prompt genera el `CatalogoImagenes`.
- Las extracciones posteriores pueden reutilizar ese catálogo como referencia cruzada.
- El modelo usado en esta etapa es `gpt-5`.
- Cada respuesta se concatena en un archivo de texto por reporte.

Las salidas se escriben en:

`
Resources/Reports/Preprocessed/JSONs/<nombre_pdf>.txt
`

Las salidas se almacenan como archivos `.txt` con respuestas JSON concatenadas por etapa; no existe una consolidación automática a un único `.json` final por reporte.

## Esquemas de Referencia

La carpeta `utils/Preprocessing/JSONStructures/` contiene versiones de referencia de los esquemas objetivo:

- `extractionObjective.json`
- `extractionObjective2.json`

Estos archivos sirven como apoyo documental para el diseño de la extracción, mientras que la lógica efectiva usada en ejecución reside en `promptsAI.py`.

## Estructura Operativa Relevante y Modo de Uso

```text
Resources/
└── Reports/
    ├── IDs.csv
    ├── NotUploaded/
    ├── Uploaded/
    └── Preprocessed/
        ├── JSONs/
        └── images/
```

Uso recomendado:

1. Colocar PDFs en `Resources/Reports/NotUploaded`.
2. Verificar que `Resources/Reports/IDs.csv` exista y conserve las columnas `ID,Nombre`.
3. Ejecutar `python main.py`.
4. Revisar salidas en `Resources/Reports/Uploaded`, `Resources/Reports/Preprocessed/JSONs` y `Resources/Reports/Preprocessed/images`.


## Archivos Clave

- `main.py`: punto de entrada de la fase de preprocesamiento.
- `utils/Preprocessing/orchestator.py`: orquestación principal.
- `utils/Preprocessing/filesManager.py`: inventario, carga y recuperación de PDFs.
- `utils/Preprocessing/Preprocessor.py`: extracción estructurada con OpenAI.
- `utils/Preprocessing/promptsAI.py`: prompts y orden de extracción.
- `utils/Preprocessing/ImagesExtractionClassification/orchestator.py`: secuencia completa de extracción/clasificación de imágenes, limpieza de artefactos y construcción del PDF final de evidencia.
- `utils/Preprocessing/ImagesExtractionClassification/pdf_creator.py`: conversión de imágenes finales (`PHOTOS/`) a un PDF consolidado por reporte.
- `utils/Preprocessing/NHTSADatabaseExtraction/orchestator.py`: orquestación de la descarga, validación y cacheo de imágenes de NHTSA y CIREN.
- `utils/Preprocessing/NHTSADatabaseExtraction/ciren_client.py`: cliente HTTP de Crash Viewer CIREN, selección de metadatos del caso y generación de candidatos de imagen por vehículo.
- `PATHS.py`: rutas operativas.
- `configurations.py`: hiperparámetros y etiquetas de clasificación.


## Anexos

- Tabla SOTA: https://docs.google.com/document/d/1VRIYabN36LS5DunLxKg6cvVOSwVMu1Yo3Bf-Iw90KrY/edit?usp=sharing

