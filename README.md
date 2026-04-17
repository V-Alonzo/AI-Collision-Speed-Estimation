# Fase de Preprocesamiento de Datos.
## Configuración Previa
### Configuración del Entorno de Conda.

```
conda env create -f environment.yml
```

### Preprocesamiento

#### Preprocesamiento de Archivos

##### Carga y Recuperación de Archivos desde OpenAI

El archivo `utils/Preprocessing/filesManager.py` centraliza la gestión de PDFs para su procesamiento con OpenAI. Su objetivo es automatizar tres tareas: cargar reportes nuevos, registrar sus IDs y recuperar archivos ya registrados que no se hayan incluido en la ejecución actual.

**Propósito principal**
- Subir a OpenAI los PDFs ubicados en la carpeta de entrada (no subidos).
- Guardar la relación `ID de OpenAI, nombre de archivo` en `Recursos/Reportes/IDs.csv` para trazabilidad.
- Mover cada PDF procesado a la carpeta de reportes subidos para evitar reprocesamientos.
- Recuperar metadatos de archivos previamente registrados en el CSV cuando no aparecen en la carga actual.

**Lógica de funcionamiento**
1. `beginInitialConfiguration()` carga variables del archivo `.env` e inicializa el cliente `OpenAI()`.
2. `uploadPDFFiles(folderPath)` recorre la carpeta de entrada y, por cada PDF:
	 - llama a `uploadPDFFileOpenAI(filePath)` para subirlo con `purpose="user_data"`,
	 - registra el ID retornado en `IDs.csv`,
	 - mueve el archivo a la carpeta de subidos.
3. `retrieveMissingGptFiles(filesGPT, IDsFilePath)` compara los IDs presentes en OpenAI (ejecución actual) contra los IDs registrados en CSV y recupera los faltantes con `retrieveGPTFile(fileId)`.
4. `performFilesProcessing()` ejecuta el flujo completo y devuelve una lista unificada con archivos recién cargados y recuperados.

**Uso recomendado**
- Definir en `.env` las rutas:
	- `CESVI_REPORTS_PATH_NOT_UPLOADED`
	- `CESVI_REPORTS_PATH_UPLOADED`
	- `CESVI_REPORTS_PATH_GENERAL`
	- `INFORMATION_EXTRACTION_GPT_PROMPT`
- Colocar los PDFs nuevos en la carpeta indicada por `CESVI_REPORTS_PATH_NOT_UPLOADED`.
- Ejecutar el flujo desde tu orquestador llamando `performFilesProcessing()`.
- Usar la lista resultante como entrada para la etapa de extracción de información.

Este módulo actúa como capa de control de inventario de archivos, asegurando continuidad entre ejecuciones y evitando perder referencia de reportes ya cargados.




### Preguntas Cesvi - 23 Abr
- Necesitamos hacer una muestra paso a paso del calculo y obtención de resultados actuales con las variables que se tienen y que pasos se quieren omitir.
- Preguntar exactamente sobre su necesidad principal

# Anexos
- Tabla SOTA: https://docs.google.com/document/d/1VRIYabN36LS5DunLxKg6cvVOSwVMu1Yo3Bf-Iw90KrY/edit?usp=sharing

