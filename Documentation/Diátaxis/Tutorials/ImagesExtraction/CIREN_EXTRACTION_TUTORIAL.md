# Tutorial

Este tutorial sigue la metodología de Diátaxis: su objetivo es llevarte paso a paso hasta una primera ejecución real del pipeline de extracción de imágenes públicas del proyecto. Al terminar, habrás levantado el entorno, ejecutado una extracción CIREN controlada sobre un solo caso y una extracción NHTSA pequeña sobre un lote acotado de pruebas.

## Audiencia

Este documento está pensado para alguien que llega por primera vez al repositorio y necesita comprobar que la tarea de extracción de imágenes funciona antes de lanzar corridas más grandes.

## Resultado esperado

Al finalizar este recorrido habrás conseguido lo siguiente:

- Un entorno Conda funcional para el proyecto.
- Una extracción CIREN sobre un caso puntual.
- Una extracción NHTSA sobre un lote pequeño de pruebas.
- Archivos de salida en `utils/Preprocessing/NHTSADatabaseExtraction/Extraction/Images/`.
- Actualizaciones en `utils/Preprocessing/NHTSADatabaseExtraction/Extraction/JSONs/cacheCIREN.json` y `utils/Preprocessing/NHTSADatabaseExtraction/Extraction/JSONs/cacheAPI.json`.

## Antes de empezar

Necesitas lo siguiente:

- Conda instalado en tu equipo.
- Conexión a internet, porque el flujo consulta endpoints públicos de NHTSA y Crash Viewer.
- Estar ubicado en la raíz del repositorio.

Para este tutorial no necesitas cargar un PDF ni configurar `OPENAI_API_KEY`, porque vamos a trabajar únicamente con la extracción pública de imágenes.

## Paso 1. Crear el entorno

Desde la raíz del proyecto, crea el entorno con el archivo `environment.yml`:

```bash
conda env create -f environment.yml
```

Si Conda indica que el entorno ya existe, puedes reutilizarlo.

## Paso 2. Activar el entorno

Activa el entorno del proyecto:

```bash
conda activate VelocityEstimationAI
```

Si el comando falla, confirma que el nombre del entorno sea `VelocityEstimationAI`, que es el definido en `environment.yml`.

## Paso 3. Verificar los recursos del pipeline

Este recorrido usa el modelo de daños y dependencias locales del repositorio. Verifica que exista este archivo:

```text
utils/Preprocessing/ImagesExtractionClassification/models/fine_tuned_yolo_car_damages.pt
```

El entorno también debe incluir la dependencia `curl_cffi`, porque el cliente CIREN la usa para imitar un navegador frente a Crash Viewer. Si recreaste el entorno con `environment.yml`, esa dependencia ya debería quedar instalada.

## Paso 4. Entender qué no conviene ejecutar todavía

No ejecutes `python main.py` como primera prueba.

En el estado actual del proyecto, `main.py` llama a `beginExtraction()` sin argumentos, y ese entrypoint usa el flujo CIREN por defecto sobre el rango configurado en `CIREN_DEFAULT_CASE_ID_RANGE`. Para una primera verificación, conviene trabajar con corridas pequeñas y explícitas.

## Paso 5. Ejecutar una extracción CIREN controlada

Ejecuta un solo caso desde Python:

```bash
python -c "from utils.Preprocessing.NHTSADatabaseExtraction.orchestator import beginCirenExtraction; beginCirenExtraction(ciren_ids=[527])"
```

Qué hace este comando:

- Consulta los metadatos públicos del caso CIREN `527`.
- Obtiene los subtipos válidos de imágenes por vehículo.
- Descarga candidatos de imagen.
- Filtra imágenes que no muestren daño útil.
- Conserva únicamente las válidas y actualiza la caché local del caso.

La ejecución puede tardar un poco dependiendo de la red y de la cantidad de candidatos encontrados.

## Paso 6. Revisar la salida de CIREN

Si el caso produjo imágenes válidas, encontrarás una carpeta como esta:

```text
utils/Preprocessing/NHTSADatabaseExtraction/Extraction/Images/CIREN/527/
```

Dentro deberían aparecer archivos `.jpg` con nombres similares a este patrón:

```text
<TotalDeltaV|UnknownDeltaV>_<MAIS|UnknownSeverity>_<seq>_Vehicle<vehNo>.jpg
```

Ahora abre también este archivo de caché:

```text
utils/Preprocessing/NHTSADatabaseExtraction/Extraction/JSONs/cacheCIREN.json
```

Busca la entrada del caso `527`. Si todo salió bien, verás campos como estos:

- `cirenId`
- `caseNumber`
- `totalDeltaV`
- `mais`
- `revisedImages`
- `validatedImageRecords`
- `candidateImages`
- `errors`

Lo importante en esta primera ejecución es que el caso quede registrado y que `validatedImageRecords` contenga al menos una imagen final válida o, si no la contiene, que `errors` deje trazabilidad de por qué el caso no generó salida final.

Ten en cuenta que `revisedImages` no guarda archivos finales: guarda identificadores de candidatos ya revisados por el pipeline. Si necesitas interpretar los metadatos configurables que acompañan a cada caso, consulta también `Documentation/Diátaxis/Reference/CIREN/CIREN_REQUIRED_METADATA_FIELDS_REFERENCE.md`.

## Paso 7. Ejecutar una extracción NHTSA pequeña

Para NHTSA no conviene comenzar con `beginNHTSAExtraction()`, porque ese entrypoint recorre varias páginas del catálogo y descarga muchas pruebas. Para una primera práctica, ejecuta un lote acotado con los helpers de bajo nivel:

```bash
python - <<'PY'
from utils.Preprocessing.NHTSADatabaseExtraction.nhtsa_extractor import download_valid_images
from utils.Preprocessing.NHTSADatabaseExtraction.nhtsa_extractor import get_valid_test

valid_tests, _ = get_valid_test(
	start_page=1,
	end_page=1,
	count=20,
	output_path="utils/Preprocessing/NHTSADatabaseExtraction/Extraction/JSONs",
)

print(f"Total valid tests with positive closing speed: {len(valid_tests)}")

download_valid_images(
	valid_tests,
	output_dir="utils/Preprocessing/NHTSADatabaseExtraction/Extraction/Images",
)
PY
```

Qué hace este bloque:

- Consulta una parte pequeña del catálogo público de pruebas NHTSA.
- Filtra configuraciones válidas y exige `closingSpeed > 0`.
- Descarga las imágenes multimedia asociadas a las pruebas aprobadas.
- Conserva únicamente las imágenes que pasan el pipeline visual.
- Actualiza la caché `cacheAPI.json`.

Si después quieres ejecutar el flujo NHTSA completo usando el entrypoint del orquestador, puedes hacerlo así:

```bash
python -c "from utils.Preprocessing.NHTSADatabaseExtraction.orchestator import beginExtraction; beginExtraction('nhtsa')"
```

Esa variante ya no es una prueba controlada: usa la configuración amplia definida en `beginNHTSAExtraction()`.

## Paso 8. Revisar la salida de NHTSA

Las imágenes validadas de NHTSA quedan dentro de directorios por número de prueba, por ejemplo:

```text
utils/Preprocessing/NHTSADatabaseExtraction/Extraction/Images/<TestNo>/
```

Los archivos finales suelen quedar con un nombre parecido a este:

```text
<closingSpeed>_<original_name>_damaged_vehicle.jpg
```

Revisa también este archivo de caché:

```text
utils/Preprocessing/NHTSADatabaseExtraction/Extraction/JSONs/cacheAPI.json
```

Busca alguna de las pruebas descargadas. Lo habitual es encontrar:

- Metadatos de la prueba original.
- La lista `Vehicles`.
- La lista `mediaUrls`.
- O un campo `Error` cuando una prueba fue descartada durante el filtrado.

Ten en cuenta que `download_valid_images(...)` elimina los directorios vacíos. Por eso, si una prueba no deja imágenes válidas al final, puede seguir apareciendo en la caché pero no conservar una carpeta con salida final.

## Paso 9. Entender cuándo la práctica fue exitosa

Considera exitosa esta práctica si puedes comprobar estas cuatro condiciones:

1. El entorno se activa sin errores de dependencias.
2. La ejecución CIREN actualiza `cacheCIREN.json` con el caso probado.
3. La ejecución NHTSA actualiza `cacheAPI.json` con las pruebas consultadas o con sus descartes registrados.
4. Se generan imágenes validadas en `Extraction/Images/` o queda una razón explícita registrada en caché para explicar la ausencia de salida final.

## Si algo no sale bien

Estos son los problemas más comunes en este primer recorrido:

### Falta de entorno o dependencias

Si aparecen errores de módulos faltantes, vuelve a crear el entorno con `environment.yml` y confirma que estás dentro de `VelocityEstimationAI`.

### Fallo de `curl_cffi` en CIREN

El cliente CIREN depende de `curl_cffi` para evitar los bloqueos de Crash Viewer a clientes HTTP básicos. Si ves un error de importación relacionado con esa librería, el entorno no quedó completo.

### Sin imágenes validadas

Eso no siempre significa que el pipeline falló. Puede ocurrir que un caso CIREN tenga pocos candidatos útiles o que una prueba NHTSA no conserve ninguna imagen tras el filtrado visual. En ese escenario, revisa la caché correspondiente para confirmar si quedó un error registrado o si simplemente no hubo imágenes finales válidas.

### Bloqueo de red o respuesta externa

El extractor depende de servicios públicos externos. Si Crash Viewer o el catálogo de NHTSA no responden, la ejecución puede registrar errores aunque el código local esté correcto.

## Qué aprendiste

En este tutorial completaste un primer recorrido real de la tarea de extracción de imágenes del proyecto. Ya verificaste los dos orígenes públicos soportados por el pipeline, entendiste dónde quedan las salidas y dejaste listo el entorno para corridas más grandes o para seguir con pasos posteriores del repositorio.