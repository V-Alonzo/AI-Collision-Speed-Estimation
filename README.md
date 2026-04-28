# Estimación de Velocidad tras Accidente Automovilístico mediante Análisis de Imágenes con Deep Learning

## Descripción General

Este repositorio concentra actualmente la fase de preprocesamiento de reportes de siniestros viales en PDF. El flujo vigente combina:

- Gestión de PDFs y trazabilidad de archivos enviados a OpenAI.
- Extracción y clasificación de imágenes embebidas en los reportes.
- Generación de salidas estructuradas con GPT-5 para ambiente, siniestro, vehículos y catálogo de imágenes.

El punto de entrada actual es `main.py` que ejecuta `beginPreprocessing()`.

## Alcance Actual del Repositorio

Aunque el proyecto está orientado a estimar velocidad tras un accidente, el código disponible en este repositorio está enfocado en la preparación de datos. La ejecución principal no entrena modelos ni produce una estimación final de velocidad por sí sola; prepara insumos estructurados para etapas posteriores.

## Configuración del Entorno

### 1. Crear el Ambiente de Conda

```bash
conda env create -f environment.yml
conda activate CESVI
```

### 2. Configuración de los Modelos YOLO

**Modelo de YOLO para la Identifiación de Autos en Imágenes**
Modelo: `yolo11l.pt``
Instalación: Este modelo se descargará automáticamente la primera vez que se ejecute el código y se guardará en `utils/Preprocessing/ImagesExtractionClassification/models` bajo el nombre `yolo11l.pt`.

**Modelo de YOLO para la Identifiación de Piezas de Autos en Imágenes**
Modelo: `yolo11l.pt` con fine-tuning para identificación de piezas.
Instalación: Deberás ejecutar el código alojado en `utils/Preprocessing/ImagesExtractionClassification/models/YOLO_Pieces_Fine_Tuning.ipynb` en una plataforma como
Google Colab. Una vez que el proceso de fine-tuning finalice, deberás descargar el modelo "best.pt" y alojarlo en `utils/Preprocessing/ImagesExtractionClassification/models/` bajo el nombre `fine_tuned_yolo_car_pieces.pt`


### 3. Configurar la API de OpenAI

El código actual no carga un archivo `.env`. La autenticación depende de la configuración estándar del SDK de OpenAI, por lo que debe existir la variable de entorno `OPENAI_API_KEY` en la sesión donde se ejecute el proyecto.

Ejemplo:

```bash
export OPENAI_API_KEY="tu_api_key"
```

### 4. Rutas y Parámetros Locales

La configuración operativa está distribuida en dos archivos:

- `PATHS.py`: rutas de entrada, salida y modelos.
- `configurations.py`: clases objetivo, extensiones de imagen y umbral de clasificación foto/no-foto.

Parámetros relevantes:

- `REPORTS_PATH_NOT_UPLOADED`: carpeta de PDFs nuevos.
- `REPORTS_PATH_UPLOADED`: carpeta de PDFs ya procesados o inventariados.
- `PREPROCESSED_JSONS_PATH`: carpeta de salidas de texto generadas por GPT.
- `PREPROCESSED_IMAGES_PATH`: carpeta base de imágenes extraídas y clasificadas.
- `CARS_YOLO_MODEL_PATH`: modelo YOLO para detectar autos.
- `PIECES_YOLO_MODEL_PATH`: modelo YOLO afinado para detectar piezas.

## Ejecución

Con el ambiente activo y la API configurada:

```bash
python main.py
```

La ejecución actual dispara el flujo completo de preprocesamiento definido en `utils/Preprocessing/orchestator.py`.

## Pipeline Actual de Preprocesamiento

### 1. Carga y Recuperación de PDFs en OpenAI

El módulo `utils/Preprocessing/filesManager.py` centraliza la administración de reportes PDF.

Responsabilidades actuales:

- Subir a OpenAI los PDFs ubicados en `Resources/Reports/NotUploaded`,
- Registrar la relación `ID, Nombre` en `Resources/Reports/IDs.csv`,
- Mover los PDFs cargados a `Resources/Reports/Uploaded`,
- Recuperar metadatos de archivos ya registrados en el CSV aunque no hayan sido cargados en la ejecución actual.

Flujo implementado:

1. `performFilesProcessing()` inicializa el cliente de OpenAI.
2. `uploadPDFFiles()` sube los PDFs nuevos con `purpose="user_data"`.
3. Cada archivo subido se registra en `IDs.csv` y se mueve a la carpeta de subidos.
4. `retrieveMissingGptFiles()` compara los IDs recuperados en la ejecución contra el inventario del CSV y recupera los faltantes.
5. Se devuelve una lista unificada de archivos GPT que alimenta la etapa de extracción estructurada.

### 2. Extracción y Clasificación de Imágenes desde PDFs

La canalización de imágenes está en `utils/Preprocessing/ImagesExtractionClassification/` y se ejecuta desde `extractImagesFromUploadedPDFs()` en `orchestator.py`.

### Etapas de la Canalización

#### a. Extracción de Imágenes Embebidas en PDF

`pdf_extractor.py` utiliza PyMuPDF (`fitz`) para extraer imágenes incrustadas por página.

Cada imagen extraída se clasifica inmediatamente con YOLO para decidir si contiene autos:

- si detecta autos, se guarda en `CARS/`,
- si no detecta autos, se guarda en `NOCARS/`.

#### b. Clasificación de Piezas Automotrices

`pieces_classifier.py` toma las imágenes de `NOCARS/` y aplica un segundo modelo YOLO afinado para separar:

- `PIECES/`: imágenes sin auto completo pero con piezas relevantes,
- `NOPIECES/`: imágenes que no contienen ni autos ni piezas relevantes.

#### c. Clasificación Foto vs. No Foto

`photos_classifier.py` procesa las carpetas `CARS/` y `PIECES/` para decidir si una imagen es una fotografía real o material no fotográfico.

La decisión combina:

- Un modelo CLIP `ViT-B-32` (`open_clip`).
- Etiquetas de texto definidas en `configurations.py`.
- Una heurística de ruido visual.
- El umbral `IS_PHOTOGRAPH_PROBABILITY_THRESHOLD`.

Las salidas se copian en:

- `PHOTOS/`: imágenes clasificadas como fotografías,
- `NOPHOTOS/`: imágenes clasificadas como render, dibujo o material no fotográfico.

### Estructura de Salida de Imágenes

Para cada PDF se crea una carpeta con esta forma:

```text
Resources/Reports/Preprocessed/images/<nombre_pdf>/YOLOCARS/
├── CARS/
├── NOCARS/
├── NOPHOTOS/
├── NOPIECES/
├── PHOTOS/
└── PIECES/
```

### 3. Extracción Estructurada con GPT-5

El módulo `utils/Preprocessing/Preprocessor.py` toma la lista de archivos GPT y ejecuta una serie ordenada de prompts definidos en `utils/Preprocessing/promptsAI.py`.

Orden actual de extracción:

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

```text
Resources/Reports/Preprocessed/JSONs/<nombre_pdf>.txt
```

En el estado actual, estos archivos son `.txt` con respuestas JSON concatenadas por etapa; no existe todavía una consolidación automática a un único `.json` final por reporte.

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

1. Colocar PDFs nuevos en `Resources/Reports/NotUploaded`.
2. Verificar que `Resources/Reports/IDs.csv` exista y conserve las columnas `ID,Nombre`.
3. Ejecutar `python main.py`.
4. Revisar salidas en `Resources/Reports/Uploaded`, `Resources/Reports/Preprocessed/JSONs` y `Resources/Reports/Preprocessed/images`.


## Archivos Clave

- `main.py`: punto de entrada de la fase de preprocesamiento.
- `utils/Preprocessing/orchestator.py`: orquestación principal.
- `utils/Preprocessing/filesManager.py`: inventario, carga y recuperación de PDFs.
- `utils/Preprocessing/Preprocessor.py`: extracción estructurada con OpenAI.
- `utils/Preprocessing/promptsAI.py`: prompts y orden de extracción.
- `utils/Preprocessing/ImagesExtractionClassification/`: extracción y clasificación de imágenes.
- `PATHS.py`: rutas operativas.
- `configurations.py`: hiperparámetros y etiquetas de clasificación.


## Anexos

- Tabla SOTA: https://docs.google.com/document/d/1VRIYabN36LS5DunLxKg6cvVOSwVMu1Yo3Bf-Iw90KrY/edit?usp=sharing

