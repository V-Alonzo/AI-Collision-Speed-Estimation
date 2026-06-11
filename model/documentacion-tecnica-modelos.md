# Documentación Técnica Avanzada: Modelos Multimodales para la Estimación de Velocidad de Impacto Vehicular

## 1. Glosario Técnico Adaptado

* **Etiquetado:** Proceso de marcar manual o automáticamente los objetos, regiones de interés o asignar variables continuas/categóricas dentro de una muestra para que el modelo aprenda a identificarlos o predecirlos.
* **Batch size:** Cantidad de muestras (imágenes o filas tabulares) que el modelo procesa al mismo tiempo durante una iteración de entrenamiento. Su valor influye en el consumo de memoria (VRAM/RAM) y en la estabilidad del entrenamiento.
* **Clase / Variable Categórica:** Categoría u objeto independiente que el modelo debe aprender a reconocer o utilizar como variable predictora (ej. clase de vehículo, severidad del daño).
* **CPU (Central Processing Unit):** Unidad central de procesamiento. Componente principal que ejecuta tareas generales de cómputo, como las fases iniciales de limpieza, filtrado y preprocesamiento de los pipelines tabulares.
* **Dataset:** Conjunto estructurado de datos utilizado para entrenar, validar y evaluar un modelo. En este proyecto, está integrado por la base de datos de siniestros CIREN de la NHTSA, compuesta por imágenes de daños estructurales y variables técnicas tabulares.
* **Depuración de datos:** Proceso de revisión, imputación y eliminación de datos erróneos, duplicados, dañados o registros sin variable objetivo válida para mejorar la calidad del dataset.
* **Regresión Continua:** Tarea de aprendizaje supervisado en la que el modelo predice un valor numérico continuo (en este caso, la velocidad precolisión en km/h) en lugar de una etiqueta discreta.
* **Edge:** Dispositivos o entornos de cómputo ligeros o cercanos al punto de operación, donde los recursos son limitados. Arquitecturas optimizadas permiten realizar inferencia rápida en estas plataformas.
* **Época (Epoch):** Recorrido completo del modelo sobre todo el conjunto de entrenamiento. Múltiples épocas permiten que el modelo ajuste iterativamente sus pesos para minimizar el error residual.
* **Escalabilidad:** Capacidad de un proceso o sistema para crecer y adaptarse a mayores volúmenes de datos o configuraciones arquitectónicas más complejas sin perder funcionalidad.
* **Fine-tuning:** Proceso de ajuste fino de un modelo previamente entrenado (como ResNet50) para adaptar sus capas profundas a un dominio especializado, como la identificación de deformaciones estructurales vehiculares.
* **GPU (Graphics Processing Unit):** Unidad de procesamiento gráfico. Utilizada para acelerar las operaciones matemáticas intensivas del procesamiento de imágenes y la optimización de las redes neuronales profundas.
* **Generalización:** Capacidad del modelo para realizar estimaciones precisas sobre datos nuevos y no vistos durante el entrenamiento, mitigando el sobreajuste (overfitting).
* **Hiperparámetros:** Configuraciones definidas antes del entrenamiento (tasa de aprendizaje, épocas, arquitectura del regresor, tasa de dropout) que dictan cómo aprende el modelo.
* **Imagen preprocesada:** Matriz visual que ha pasado por transformaciones previas (redimensionamiento, normalización de canales, data augmentation) para ser compatible con el backbone convolucional.
* **Inferencia:** Proceso mediante el cual un modelo ya entrenado analiza una nueva entrada (imagen, datos tabulares o ambos) para generar una estimación de velocidad en tiempo real.
* **Espacio Latente (Embedding):** Vector numérico compacto de alta densidad (ej. 512 dimensiones) generado por las capas internas de una red neuronal que condensa las características semánticas más importantes de una entrada.
* **Target Encoding:** Técnica de codificación categórica que sustituye cada categoría por una estimación basada en la relación estadística observada entre dicha categoría y la variable objetivo, reduciendo la dimensionalidad.
* **Información Mutua (Mutual Information):** Métrica que cuantifica la cantidad de información compartida entre una variable predictora y la variable objetivo, midiendo la reducción de la incertidumbre.
* **Fusión Multimodal:** Técnica arquitectónica que integra múltiples modalidades de información (ej. descriptores visuales y datos numéricos tabulares) dentro de un único espacio de representación para alimentar un módulo de decisión conjunto.

---

## 2. Introducción y Enfoque Metodológico

En los proyectos de inteligencia artificial aplicados al sector automotriz y de seguros, el desarrollo de un modelo predictivo robusto no depende únicamente del algoritmo seleccionado, sino de un proceso metodológico integral. Este flujo abarca la preparación rigurosa de los datos, la depuración de inconsistencias, la definición de estrategias de entrenamiento avanzadas, la validación cruzada de resultados y la estructuración del ciclo para permitir una mejora continua.

El presente proyecto aborda una de las tareas más complejas dentro de la reconstrucción analítica de siniestros viales: la **estimación de la velocidad precolisión (velocidad de impacto)** a la que viajaba un vehículo justo antes de un accidente. Tradicionalmente, este cálculo requiere de simulaciones periciales exhaustivas y costosas basadas en principios físicos de conservación del momentum y deformación de materiales. 

Para automatizar y optimizar este proceso, se diseñó, entrenó y evaluó una familia de modelos de aprendizaje profundo y aprendizaje automático basados en el conjunto de datos de siniestros **CIREN** (Crash Injury Research and Engineering Network) de la **NHTSA** (National Highway Traffic Safety Administration). 

Alineándose con los estándares metodológicos de la visión computacional moderna y la analítica avanzada, el desarrollo se segmentó en tres enfoques de investigación complementarios:
1.  **ImageVelocityEstimator:** Un enfoque basado exclusivamente en visión computacional que extrae características visuales de los daños en la carrocería mediante aprendizaje por transferencia (Transfer Learning).
2.  **TabularVelocityEstimator:** Un enfoque fundamentado en modelos estadísticos y algoritmos de boosting/redes neuronales que explota variables técnicas, demográficas y físicas estructuradas a través de pipelines de preprocesamiento avanzado.
3.  **HybridVelocityEstimator:** Una arquitectura multimodal avanzada que fusiona las representaciones latentes visuales con los vectores tabulares optimizados para consolidar un entendimiento holístico del siniestro.

El propósito de este documento es exponer exhaustivamente la metodología implementada, las especificaciones arquitectónicas de cada modelo, los resultados experimentales obtenidos y definir los estándares de entrega técnicos requeridos para su integración y despliegue seguro en producción.

---

## 3. Marco Tecnológico y Selección de Arquitecturas

La presente metodología establece directrices estrictas para equilibrar la eficiencia operativa y la capacidad de generalización de los modelos. En el diseño de sistemas de producción modernos (como las implementaciones de la familia YOLO de Ultralytics en detección edge o servidores centralizados), se prioriza el uso de componentes ligeros para fases de filtrado y procesamiento preliminar sobre CPU, reservando las arquitecturas masivas para entornos con GPU dedicadas.

Siguiendo este principio de optimización de recursos tecnológicos, el proyecto adoptó el siguiente marco:
* **Procesamiento Tabular y Selección:** Ejecutado eficientemente en arquitecturas de CPU mediante técnicas avanzadas como *Target Encoding*, filtrado por *Información Mutua* y matrices de correlación cruzada, reduciendo la dimensionalidad antes de sobrecargar la red neuronal.
* **Extractor Convolucional (Backbone Visual):** Se seleccionó una arquitectura **ResNet50** preentrenada sobre ImageNet. Su capacidad para generar representaciones latentes compactas y estructuradas permite utilizarla como un extractor de características de alto nivel que consume recursos controlados de VRAM, facilitando procesos de ajuste fino (*Fine-Tuning*) muy específicos en las capas profundas.
* **Regresores Completamente Conectados (MLP):** Diseñados con topologías en "embudo" (reducción progresiva de capas), lo que obliga a las redes a comprimir la información en abstracciones cada vez más densas, previniendo el sobreajuste y garantizando que el modelo final pueda ejecutarse con tiempos de inferencia mínimos, viabilizando su uso tanto en servidores centralizados como en arquitecturas con recursos limitados.

---

## 4. Objetivo del Proceso

Establecer una metodología estandarizada para la preparación, depuración, ingeniería de características, estructuración, entrenamiento y evaluación de modelos predictivos de regresión continua (unimodales y multimodales) utilizando el dataset CIREN. El fin primordial es mitigar el desbalance de los datos, optimizar el uso de hardware (CPU/GPU), y obtener un sistema capaz de estimar la velocidad precolisión de forma precisa, medible y auditable para procesos de análisis automatizado de siniestros.

---

## 5. Flujo de Trabajo y Ciclo de Vida del Desarrollo

El ciclo de desarrollo se rige por un flujo secuencial estructurado en las siguientes fases críticas:

### Fase 1: Definición del Objetivo y Contexto
Se delimitó la tarea como un problema de regresión supervisada continua. El objetivo central es predecir el valor exacto de la variable `totalDeltaVKph` (velocidad de impacto en km/h). Las métricas clave de éxito se definieron en función del Error Absoluto Medio (MAE), evaluando la estabilidad del error a lo largo de diferentes rangos de velocidad (baja, media y alta).

### Fase 2: Recolección y Mapeo del Dataset
El material base corresponde al dataset **CIREN** de la NHTSA. Cada muestra representa un siniestro vehicular documentado y está conformada por un componente visual (imágenes de daños) y un vector de características con las siguientes variables originales:
`image_id`, `cirenId`, `caseId`, `image_relpath`, `image_filename`, `vehicleNumber`, `image_sequence`, `photoId`, `objectID`, `description`, `subtype`, `mais`, `totalDeltaVKph`, `totalDeltaVMph`, `cdc`, `clockDirection`, `forceDirection`, `rolloverStatus`, `primaryVehicleNumber`, `damagePlaneDescription`, `severityDescription`, `vehicleClass`, `curbWeight`, `curbWeightKg`, `cargoWeight`, `cargoWeightKg`.

### Fase 3: Limpieza, Conversión y Depuración de Datos
Esta fase crítica opera de forma diferenciada según la modalidad:
* **Filtro de Calidad:** Se eliminaron inmediatamente todos los registros que carecían de un valor válido en la variable objetivo (`totalDeltaVKph`).
* **Tratamiento de Datos Tabulares:** Se diseñaron tres pipelines específicos (detallados en la sección del *TabularVelocityEstimator*) enfocados en la imputación robusta por mediana, estandarización estadística, codificaciones cíclicas trigonométricas y eliminación de redundancias mediante Información Mutua.
* **Preprocesamiento Visual:** Filtrado de imágenes corruptas u omitidas, redimensionamiento al tamaño estándar de entrada de la red y normalización de canales de color.

### Fase 4: Etiquetado, Revisión y Extracción de Embeddings
Las etiquetas numéricas de velocidad se verificaron contra los reportes técnicos de las simulaciones periciales para asegurar la consistencia. En el dominio visual, en lugar de realizar una anotación manual de cajas o polígonos, se entrenó la red para mapear la imagen completa hacia el objetivo de velocidad. Posteriormente, se implementaron ganchos (*hooks*) de software para extraer los embeddings internos de **512 dimensiones**, que funcionan como una preanotación o representación matemática compacta de la severidad del daño estructural interpretada por la red.

### Fase 5: Estructuración Estricta del Dataset (Split)
Para garantizar una evaluación imparcial y auditable, el dataset depurado se dividió estrictamente siguiendo la proporción metodológica recomendada:
* **70% para el conjunto de Entrenamiento (Train):** Utilizado exclusivamente para el ajuste de pesos y gradientes de los modelos.
* **10% para el conjunto de Validación (Valid):** Utilizado para monitorear el desempeño en tiempo de ejecución, calcular pérdidas intermedias y ejecutar la parada temprana (*early stopping*).
* **20% para el conjunto de Prueba (Test):** Reservado de forma hermética. Este subconjunto actúa como la muestra para análisis de efectividad final; los modelos nunca ven estos datos durante ninguna etapa de ajuste o selección de hiperparámetros.

### Fase 6: Entrenamiento del Modelo
El entrenamiento se ejecuta fijando un horizonte inicial de **100 épocas**. Dependiendo del comportamiento de las curvas de pérdida y de la métrica de control MAE sobre el conjunto de validación, la cantidad de épocas se ajusta dinámicamente mediante algoritmos de parada temprana para evitar el sobreajuste. Se parametrizan optimizadores numéricos, tasas de aprendizaje controladas y regularizadores mecánicos (Dropout) según la naturaleza de la arquitectura.

### Fase 7: Pruebas de Validación, Evaluación de Métricas y Ajuste
Al concluir el entrenamiento, se realiza una evaluación cuantitativa y cualitativa exhaustiva. Se calculan las métricas globales de error (MAE) y se analiza su distribución en subrangos operativos (0-30 km/h, 30-60 km/h, >60 km/h). Si las métricas revelan fallas de generalización o degradación del error, el flujo se cicla, regresando a la fase de refinamiento del dataset, ajuste de hiperparámetros o cambio de pipeline de preprocesamiento. Si el desempeño es óptimo, el modelo se encapsula y se congela para su entrega.

---

## 6. Desarrollo Detallado de los Tres Enfoques

---

### MODELO A: ImageVelocityEstimator

#### Hipótesis de Investigación
Se planteó la hipótesis de que las deformaciones estructurales, hundimientos y patrones de fractura observables en la carrocería de un vehículo colisionado contienen información indirecta y codificada sobre la energía cinética disipada durante el impacto. Por lo tanto, un modelo de aprendizaje profundo es capaz de inferir la velocidad precolisión basándose exclusivamente en la evidencia visual post-siniestro.

#### Especificaciones Arquitectónicas
El modelo fue estructurado como un regresor supervisado de extremo a extremo:
1.  **Backbone Convolucional:** Se utilizó la arquitectura **ResNet50** preentrenada con el dataset ImageNet. Esta red actúa como el extractor primario de descriptores visuales de alto nivel.
2.  **Estrategia de Fine-Tuning:** Para evitar la destrucción de las características generales aprendidas por la red (bordes, texturas), las capas iniciales se mantuvieron congeladas. Se aplicó un proceso controlado de ajuste fino únicamente sobre las capas convolucionales más profundas, especializándolas en la identificación de geometrías de colisión, severidad de arrugamiento de lámina y fallas en zonas de deformación programada.
3.  **Bloque Generador de Embeddings:** Las matrices de características resultantes de ResNet50 se proyectan a través de una capa densa de adaptación que condensa la información en un **espacio latente compacto de 512 dimensiones**. Este vector lineal elimina redundancias espaciales y concentra los factores semánticos críticos de la severidad del daño.
4.  **Regresor Completamente Conectado:** Sobre el espacio latente se acopló un regresor lineal con una única neurona de salida dotada de una función de activación lineal para la estimación continua de la velocidad.

```
[Imagen del Vehículo Colisionado] 
               │
               ▼
       [Backbone ResNet50] (Fine-Tuning en capas profundas)
               │
               ▼
 [Bloque de Generación de Embeddings] ──► (Espacio Latente de 512 Dimensiones)
               │
               ▼
  [Fully Connected Regressor] ──► [Estimación de Velocidad Continua (km/h)]
```

#### Proceso de Entrenamiento y Parámetros
El entrenamiento exploró de forma iterativa múltiples hiperparámetros: variaciones en las funciones de optimización (Adam, SGD), modificaciones en la tasa de aprendizaje inicial (Learning Rate), técnicas agresivas de Data Augmentation (rotaciones controladas, ajustes de contraste y brillo para simular diferentes condiciones de iluminación en el lugar del siniestro), y regularizadores para controlar la varianza del regresor.

#### Análisis de Resultados y Limitaciones Distribucionales
El modelo visual demostró una capacidad sobresaliente para capturar la firma del impacto y arrojó métricas aceptables para un sistema que carece de contexto técnico tabular. No obstante, un desglose granular del Error Absoluto Medio (MAE) reveló un comportamiento crítico ligado a la naturaleza del dataset:
* **Región de Estabilidad (Velocidades Bajas y Medias):** En el rango comprendido entre 0 y 60 km/h, el MAE se mantuvo bajo y con varianza controlada, demostrando un aprendizaje sólido de los patrones de daños moderados.
* **Región de Degradación (Velocidades Altas):** Al superar el umbral aproximado de los **60 km/h**, el MAE sufrió una degradación progresiva y severa, incrementando el error de predicción a medida que aumentaba la velocidad real del siniestro.

**Diagnóstico del Sesgo:** Un análisis de la densidad de la variable objetivo confirmó que este fenómeno se debe al marcado **desbalance en la distribución de velocidades del dataset CIREN**. Las muestras de colisiones catastróficas o a velocidades extremas son estadísticamente escasas en comparación con los choques urbanos de baja y moderada intensidad. Al disponer de una cantidad muy limitada de ejemplos en la cola superior de la distribución, la red no logró generalizar adecuadamente los patrones visuales de deformaciones extremas, tendiendo a subestimar las velocidades altas debido al sesgo hacia la media poblacional.

#### Visualización del Espacio Latente (Análisis Exploratorio)
Para validar si el modelo realmente estaba comprendiendo la física del daño o simplemente memorizando patrones, se extrajeron los embeddings de 512 dimensiones antes de la neurona de regresión. Se aplicaron cuatro métodos independientes de reducción de dimensionalidad para proyectar estos vectores a un espacio bidimensional (2D).

Los resultados confirmaron plenamente la hipótesis inicial. Las proyecciones visuales mostraron una **organización semántica interna altamente coherente**:
* Las muestras correspondientes a impactos de baja velocidad se agruparon de forma compacta en regiones específicas del espacio latente.
* A medida que la velocidad de las muestras aumentaba, los puntos migraban de manera continua y ordenada a través del mapa topológico, dibujando un gradiente físico-espacial claro que transicionaba desde daños leves hacia zonas de severidad extrema.
* Las curvas de aprendizaje exhibieron una convergencia asintótica estable, demostrando que el espacio latente captura información matemática legítima del fenómeno físico, sentando las bases operativas para justificar el desarrollo de soluciones híbridas.

---

### MODELO B: TabularVelocityEstimator

#### Hipótesis de Investigación
Se postuló que los datos técnicos estructurados recopilados de forma pericial en las bases de datos de reconstrucción de accidentes (CIREN) contienen relaciones estadísticas, correlaciones de peso, vectores de fuerza y descripciones de severidad médica/estructural suficientes para entrenar modelos de aprendizaje automático capaces de predecir la velocidad de impacto de forma precisa, prescindiendo por completo de la información visual.

#### Pipelines de Preprocesamiento Desarrollados

##### Pipeline de Preprocesamiento 1 (Configuración Base)
* **Limpieza de la Variable Objetivo:** Eliminación de registros con nulos o valores no válidos en la columna objetivo de velocidad.
* **Imputación de Variables Numéricas:** Los valores faltantes en las columnas numéricas se completaron utilizando la **mediana** calculada del conjunto de entrenamiento. Se seleccionó la mediana sobre la media debido a su robustez intrínseca ante valores atípicos (*outliers*) severos, comunes en registros de accidentes extremos.
* **Estandarización:** Las variables numéricas se transformaron mediante escalamiento estadístico estándar, forzando una media $\mu  pprox 0$ y una desviación estándar $\sigma  pprox 1$, homogeneizando las escalas para optimizar el comportamiento de los optimizadores basados en gradiente.
* **Codificación de Categorías Nominales:** Se aplicó *One-Hot Encoding*, transformando variables de texto sin orden jerárquico en vectores binarios independientes (ej. tipo de vehículo, plano de daño), evitando que el modelo asuma falsas relaciones de orden.
* **Codificación de Categorías Ordinales:** Las variables con una jerarquía lógica inherente (como `severityDescription` o niveles de lesión de "leve", "moderado" a "grave") se mapearon a una escala numérica secuencial estricta, preservando su significado físico.
* **Transformación Cíclica de Variables Físicas Angulares:** Variables como `forceDirection` (representada originalmente como un ángulo de 0° a 360°) presentan un problema crítico: los valores 1° y 359° están geométricamente muy cercanos pero numéricamente muy distantes. Para resolver esto, se aplicó una codificación cíclica mediante funciones trigonométricas, mapeando la variable en dos componentes espaciales:
$$\text{Force}_{\sin} = \sin\left(\frac{2\pi \cdot \text{ángulo}}{360}\right), \quad \text{Force}_{\cos} = \cos\left(\frac{2\pi \cdot \text{ángulo}}{360}\right)$$
* **Transformación Cíclica de Variables de Convención de Reloj:** La variable `clockDirection` (que describe el vector de impacto usando las 12 horas del reloj) se sometió al mismo tratamiento trigonométrico. Esto garantiza que las 12:00 y las 01:00 sean interpretadas por el modelo como orientaciones contiguas y físicamente adyacentes.
* **Binarización:** Mapeo directo de variables de texto binarias a valores $\{0, 1\}$.

##### Pipeline de Preprocesamiento 2 (Reducción y Enriquecimiento)
* **Target Encoding:** Con el fin de mitigar la "maldición de la dimensionalidad" provocada por el One-Hot Encoding (que expandía drásticamente el número de columnas), se implementó *Target Encoding* para las variables nominales masivas. Cada categoría fue sustituida por el valor esperado de la velocidad objetivo asociado a dicha categoría. Esto colapsó la complejidad del espacio de entrada, **reduciendo el vector de características de 23 variables a solo 11 atributos clave**.
* **Enriquecimiento de la Variable Objetivo:** Para expandir el volumen de datos de entrenamiento, se integró una segunda fuente cinemática. Se fusionó la medición directa de velocidad con las estimaciones numéricas calculadas por expertos mediante simulaciones físicas periciales cuando el dato duro no estaba disponible, dando prioridad absoluta a la medición real. Esto aumentó la masa crítica de muestras sin corromper la semántica del objetivo.

##### Pipeline de Preprocesamiento 3 (Selección Avanzada de Características)
Construido encima del Pipeline 2, este módulo añade tres filtros estadísticos severos para limpiar el ruido latente:
1.  **Filtro de Varianza Cero:** Eliminación de variables constantes o casi constantes que presentan el mismo valor en todo el dataset y que carecen de poder discriminatorio.
2.  **Selección por Información Mutua (Mutual Information):** Se calculó la entropía compartida entre cada predictor y la velocidad. Se fijó un umbral estricto de **0.001**. Cualquier variable cuya capacidad de reducción de incertidumbre estuviera por debajo de este límite fue descartada del dataset por considerarse ruido estadístico.
3.  **Filtro de Multicolinealidad (Correlación Cruzada):** Se calculó una matriz de correlación de Pearson entre todas las variables predictoras. Cuando dos características presentaron una correlación superior a **0.9**, se determinó la existencia de redundancia estricta. Para decidir cuál eliminar, se contrastaron sus valores de Información Mutua contra la variable objetivo, conservando únicamente la característica con mayor peso predictivo y descartando la colineal.

El vector resultante de este pipeline representa la versión más limpia, compacta y densa de la información técnica del siniestro.

#### Arquitecturas Evaluadas

##### Arquitectura Multi-Layer Perceptron (MLP) - Experimentos 1, 2 y 3
Para los tres primeros experimentos tabulares, se diseñó una red neuronal completamente conectada configurada con una topología decreciente en "embudo":
* **Capa Oculta 1:** 64 neuronas con funciones de activación no lineales. Aprenden interacciones complejas de primer orden entre el peso del vehículo, dirección y severidad.
* **Capa Oculta 2:** 32 neuronas. Compresion y abstracción de las relaciones.
* **Capa Oculta 3:** 16 neuronas. Síntesis densa de características de alto nivel.
* **Regularización:** Capa de **Dropout al 5%** intercalada para desactivar aleatoriamente neuronas durante el entrenamiento, obligando a la red a co-adaptarse y distribuir el conocimiento de forma homogénea, mitigando el sobreajuste.
* **Parámetros de Control:** Tamaño de lote (*batch size*) de 16, tasa de aprendizaje fija en 0.0003 y optimización supervisada por un mecanismo de parada temprana (*early stopping*) con una paciencia de 10 épocas sobre el conjunto de validación.

```
 [Vector Tabular Preprocesado] ──► [Capa Densa: 64 Neuronas] ──► [Dropout 5%]
                                                │
                                                ▼
                                   [Capa Densa: 32 Neuronas]
                                                │
                                                ▼
                                   [Capa Densa: 16 Neuronas]
                                                │
                                                ▼
                                  [Neurona de Salida Lineal (1)]
                                                │
                                                ▼
                                    [Velocidad Estimada (km/h)]
```

##### Arquitectura XGBoost Regressor - Experimento 4
El cuarto experimento sustituyó la aproximación de red neuronal por un modelo de ensamble de árboles de decisión basado en gradiente (*Gradient Boosted Decision Trees*):
* **Estrategia:** Construcción secuencial de hasta 1000 árboles de decisión, donde cada árbol sucesivo se entrena específicamente para modelar y corregir los residuos (errores) cometidos por el conjunto de árboles precedentes.
* **Hiperparámetros de Regularización:** Profundidad máxima limitada a 5 niveles por árbol para evitar la memorización de ruido, tasa de aprendizaje (*learning rate / shrinkage*) ajustada en 0.05 para forzar correcciones suaves y graduales, y mecanismos de parada temprana configurados con una paciencia de 50 iteraciones sobre el set de validación.
* **Muestreo Estocástico:** Configuración de un factor de *subsample* de 0.8 para filas y 0.8 para columnas, entrenando cada árbol con subconjuntos aleatorios del 80% de los datos y características, incrementando drásticamente la diversidad del ensamble y la robustez del modelo final. El objetivo de optimización minimizó el error cuadrático.

#### Resultados de la Fase Experimental Tabular

A continuación se detallan las métricas oficiales obtenidas en los cuatro experimentos tabulares (evaluadas mediante el Error Absoluto Medio - MAE):

| ID Experimento | Pipeline de Datos | Arquitectura del Modelo | MAE Entrenamiento | MAE Validación (Best) | MAE de Prueba (Test) | Diagnóstico Técnico y Comportamiento |
| :--- | :--- | :--- | :---: | :---: | :---: | :--- |
| **Experimento 1** | Pipeline 1 (Base) | MLP (64-32-16) | 8.60 | 7.11 | 8.44 | Desempeño base estable. El error de prueba es consistente con el entrenamiento. |
| **Experimento 2** | Pipeline 2 (Target Enc) | MLP (64-32-16) | 7.89 | N/D | 8.57 | El error de entrenamiento baja, pero el error de prueba sube. Evidencia clara de sobreajuste por dimensionalidad o ruido. |
| **Experimento 3** | **Pipeline 3 (MI + Corr)** | **MLP (64-32-16)** | **8.04** | **N/D** | **7.39** | **MEJOR DESEMPEÑO GLOBAL TABULAR.** La selección de características eliminó el sobreajuste y maximizó la generalización en datos no vistos. |
| **Experimento 4** | Pipeline 3 (MI + Corr) | XGBoost Regressor | N/D | N/D | 7.86 | Desempeño altamente competitivo y robusto, pero superado ligeramente por la plasticidad y continuidad de la red neuronal MLP del Exp 3. |

**Conclusión del Análisis Tabular:** Los datos confirman que la aplicación estricta de la selección avanzada de características por Información Mutua y el filtrado de multicolinealidad (Pipeline 3) fue el factor determinante para elevar el desempeño, permitiendo que la red neuronal MLP capturara de forma óptima la física no lineal latente en las variables técnicas del dataset CIREN.

---

### MODELO C: HybridVelocityEstimator

#### Hipótesis de Investigación e Inferencia Multimodal
Cada uno de los enfoques anteriores demostró ventajas exclusivas y limitaciones severas condicionadas por su naturaleza: el enfoque visual (`ImageVelocityEstimator`) es excelente capturando la deformación física macroscópica de la carrocería pero falla en altas velocidades debido al desbalance; el enfoque tabular (`TabularVelocityEstimator`) es altamente preciso interpretando el contexto técnico del vehículo (pesos, direcciones de fuerza) pero es ciego ante la magnitud visual del daño real. 

A partir de este diagnóstico, se formuló la hipótesis multimodal central: dado que ambas modalidades describen manifestaciones complementarias del mismo evento físico (la colisión), una arquitectura híbrida capaz de fusionar de forma temprana las representaciones visuales y tabulares puede explotar las interacciones cruzadas de los datos, compensar las debilidades individuales y alcanzar una precisión sustancialmente mayor.

#### Flujo de Procesamiento y Mecanismo de Fusión
El modelo `HybridVelocityEstimator` procesa en paralelo ambas fuentes de información por cada muestra:
1.  **Rama de Extracción Visual (Encoder):** La imagen de entrada es inyectada en el bloque entrenado del `ImageVelocityEstimator`. Los pesos congelados y ajustados de ResNet50 procesan la matriz y el bloque de adaptación genera el vector latente de **512 dimensiones (Embedding Visual)**. Este vector sintetiza matemáticamente la severidad del daño y la geometría de la deformación estructural.
2.  **Rama de Extracción Tabular:** En paralelo, las variables estructuradas de la muestra son procesadas mediante el **Pipeline 3**, entregando el vector técnico compacto y optimizado de variables estandarizadas y codificadas.
3.  **Mecanismo de Fusión (Concatenación Temprana):** El embedding visual de 512 dimensiones y el vector tabular optimizado se unifican mediante una operación de concatenación directa en un único vector multimodal denso:
$$\mathbf{X}_{	ext{multimodal}} = [\mathbf{V}_{	ext{embedding\_512}} \,\, \parallel \,\, \mathbf{T}_{	ext{tabular\_optimizado}}]$$
Este vector integrado representa una descripción matemática exhaustiva y unificada del siniestro vial.

#### Arquitectura de la Red de Regresión Conjunta
La representación fusionada alimenta un bloque regresor neuronal profundo diseñado con una estrategia de reducción dimensional progresiva y estabilización intermedia:
* **Capa Temprana de Fusión:** Recibe el vector concatenado completo.
* **Bloques Densos en Cascada:** Estructurados en capas densas sucesivas de **512, 256, 128 y 64 neuronas** respectivamente. Esta topología fuerza al modelo a aprender interacciones cruzadas no lineales complejas entre el embedding visual y los atributos tabulares (por ejemplo, cómo se interpreta visualmente una deformación específica cuando el vehículo tiene un peso `curbWeight` elevado versus uno ligero).
* **Estabilización y Activación:** Cada capa densa incorpora normalización por lotes (**Batch Normalization**) en su entrada para estabilizar el flujo de gradientes y acelerar la convergencia. Se utilizó la función de activación **GELU (Gaussian Error Linear Unit)** debido a su comportamiento suave y su capacidad para mitigar el problema de la muerte de neuronas en tareas de regresión complejas.
* **Regularización:** Mecanismos de **Dropout** distribuidos en las capas ocultas para asegurar una alta capacidad de generalización sobre muestras completamente nuevas.
* **Salida:** Una neurona lineal final que emite la estimación continua de velocidad.

```
 [Imagen del Siniestro]              [Variables Tabulares]
           │                                   │
           ▼                                   ▼
 [Encoder ResNet50]                     [Pipeline 3]
           │                                   │
           ▼                                   ▼
 [Embedding Visual 512D]            [Vector Tabular Compacto]
           │                                   │
           └─────────────────┬─────────────────┘
                             │
                             ▼
                [Operación de Concatenación]
                             │
                             ▼
                [Vector Multimodal Fusionado]
                             │
                             ▼
         [Capa Densa: 512 Neuronas + Batch Normalization + GELU + Dropout]
                             │
                             ▼
         [Capa Densa: 256 Neuronas + Batch Normalization + GELU + Dropout]
                             │
                             ▼
         [Capa Densa: 128 Neuronas + Batch Normalization + GELU + Dropout]
                             │
                             ▼
         [Capa Densa: 64 Neuronas  + Batch Normalization + GELU + Dropout]
                             │
                             ▼
                [Neurona de Salida Lineal (1)] ──► [Velocidad Final (km/h)]
```

#### Rendimiento Cuantitativo y Ventajas de la Multimodalidad
La evaluación del enfoque multimodal arrojó resultados categóricos que validaron de forma contundente la hipótesis de investigación:
* **Estabilidad Excepcional:** Las curvas de pérdida durante el entrenamiento y la validación mostraron un comportamiento notablemente suave, asintótico y libre de las oscilaciones o divergencias que caracterizaban a los modelos unimodales aislados. Esto demuestra que la combinación de datos actúa como un regularizador natural que facilita el mapeo de la función física.
* **Reducción del Error vs. Modelo Visual:** El Error Absoluto Medio (MAE) global sobre el conjunto de prueba se **redujo drásticamente en aproximadamente un 50%** en comparación con el MAE obtenido por el modelo basado exclusivamente en imágenes (`ImageVelocityEstimator`). La incorporación de las variables estructuradas compensó el sesgo provocado por el desbalance de imágenes de alta velocidad.
* **Reducción del Error vs. Modelo Tabular:** El modelo híbrido logró una **reducción adicional del 35% al 40% en el MAE de prueba** frente al mejor resultado tabular obtenido en el Experimento 3. Esto demuestra que la riqueza visual del embedding aporta descriptores físicos de deformación real que las variables periciales de las bases de datos no alcanzan a capturar completamente.
* **Corrección Operativa de la Distribución:** El análisis de residuos demostró que las predicciones del `HybridVelocityEstimator` se concentran de forma consistente e hiper-precisa alrededor de la diagonal de valores reales, demostrando una robustez excepcional sobre todo en el rango crítico de **0 a 50 km/h**, el segmento que presenta la mayor densidad de siniestralidad y el mayor impacto financiero y operativo para los sistemas de análisis institucional.

---

## 7. Estándares de Entrega y Requisitos Técnicos para Implementación

Para asegurar una transición exitosa de los modelos desarrollados hacia el entorno de producción y garantizar la replicabilidad absoluta de los resultados, el equipo de desarrollo debe cumplir estrictamente con la entrega estandarizada de los siguientes artefactos y especificaciones técnicas.

### Especificaciones de la Arquitectura y Reporte de Entrenamiento
Cada modelo entregado debe acompañarse de un reporte granular que detalle:
* **Variante y Configuración Exacta:** Detalle específico de los hiperparámetros congelados en el backbone (ResNet50) y la topología exacta de las capas densas de regresión.
* **Definición de Clases e Identificadores Tabulares:** Listado unívoco de las variables utilizadas en el Pipeline 3, detallando el orden exacto de los índices vectoriales y los mapeos numéricos guardados en el archivo de configuración `.yaml` correspondiente.
* **Historial de Épocas e Hiperparámetros:** Bitácora del comportamiento de la métrica MAE durante el entrenamiento. Se debe documentar la época exacta en la que se activó el *early stopping* con base en la convergencia del set de validación, justificando las variaciones del límite base de 100 épocas.

### Preservación y Entrega del Dataset Original
Es obligatorio entregar el dataset completo y original utilizado para este desarrollo (ficheros de imágenes estructurados por identificador y la base tabular limpia). Los entornos operativos reales sufren de desvíos de datos latentes (*data drift*); contar con los conjuntos crudos etiquetados con precisión es un requisito crítico para ejecutar futuros procesos de **Fine-Tuning e Ingeniería de Características Continua**. Esto permitirá reentrenar la red, mitigar falsos positivos emergentes, corregir sesgos geográficos o incorporar nuevas clases de vehículos sin experimentar olvido catastrófico en la red neuronal.

### Artefactos de Implementación y Encapsulamiento
Para la fase de despliegue automatizado e inferencia en los sistemas backend institucionales, los modelos deben entregarse completamente congelados:
* **Pesos en Formato PyTorch:** Los archivos de pesos optimizados resultantes del entrenamiento deben entregarse estrictamente serializados en archivos con extensión **`.pt`** (ej. `best_hybrid_estimator.pt`, `best_tabular_estimator.pt`).
* **Integración en Código:** El archivo `.pt` debe contener encapsulada la topología completa y los tensores de pesos optimizados. Este archivo constituye el insumo primario indispensable que el equipo de ingeniería de datos cargará mediante scripts de Python utilizando las librerías nativas de PyTorch y el ecosistema de automatización institucional, permitiendo conectar el flujo de predicción directa con las bases de datos de siniestros en producción.

---

## 8. Fichas Técnicas de Registro y Control (Layout de Integración)

A continuación, se presentan las tres fichas técnicas de carácter obligatorio debidamente requisitadas para el registro, auditoría e implementación institucional de los desarrollos por parte del área de TI.

---

### FICHA TÉCNICA 1: ImageVelocityEstimator

* **NOMBRE DEL MODELO:** `ImageVelocityEstimator_ResNet50_V1.0`
* **DESCRIPCIÓN:** Modelo de visión computacional basado en redes neuronales convolucionales profundas que realiza una regresión supervisada continua para estimar la velocidad de impacto de un vehículo utilizando exclusivamente imágenes de los daños estructurales post-siniestro.
* **USOS:** Filtrado inicial automatizado en portales de autoservicio de asegurados, validación rápida de evidencia fotográfica en campo y preanotación de severidad visual previa a la inspección física.
* **LIGA DEL PROTOTIPO:** `institucional_storage/ai_models/ciren_velocity/v1_0/image_estimator/` (Contiene pesos `best_image_model.pt` y scripts de inferencia visual).
* **TAMAÑO MUESTRA DATASET:** Volumen completo de imágenes filtradas del conjunto de datos CIREN (NHTSA) con registros válidos de velocidad.
* **DIVISIÓN DEL DATASET:** Estructuración metodológica estricta: 70% Entrenamiento, 10% Validación, 20% Prueba.
* **ESTATUS MUESTRA:** Limpia y Validada. Mapeo visual normalizado.
* **MUESTRA PARA ANÁLISIS DE EFECTIVIDAD:** 20% del total de imágenes reservadas herméticamente en el conjunto de Test para la evaluación final de generalización.
* **MÉTRICAS DE DESEMPEÑO Y VALIDACIÓN DEL MODELO:**
    * *Métricas Globales:* MAE de Entrenamiento Inicial: N/D, MAE de Prueba: Variable según rango (Estable en velocidades bajas/medias; degradación progresiva con MAE incrementado por encima de los 60 km/h debido a la baja densidad de muestras en la cola superior de la distribución).
    * *Métricas Cualitativas:* Análisis exploratorio mediante 4 métodos de reducción de dimensionalidad 2D que demostraron un alto nivel de organización semántica y gradientes coherentes por severidad física en el espacio latente de 512 dimensiones. Procesos de convergencia estables reflejados en curvas de entrenamiento asintóticas.
    * *Tamaño del Modelo:* ~98 MB (Pesos congelados en formato de punto flotante).
* **EVIDENCIAS TÉCNICAS:** Archivos adjuntos en repositorio: `results_image.csv`, `loss_curves_image.png`, `embedding_projections_2d.png` (Visualización de los 4 métodos de reducción), e imágenes testigo de predicciones sobre el set de Test.
* **ESTATUS DEL ENTRENAMIENTO:** Concluido. Fase de experimentación unimodal cerrada; sirve como encoder congelado para el modelo híbrido.
* **FECHA DE CREACIÓN:** 15 de Enero de 2026.
* **FECHA DE LIBERACIÓN:** 6 de Junio de 2026.

---

### FICHA TÉCNICA 2: TabularVelocityEstimator

* **NOMBRE DEL MODELO:** `TabularVelocityEstimator_MLP_XGBoost_V1.0`
* **DESCRIPCIÓN:** Modelo predictivo basado en datos estructurados que evalúa variables técnicas vehiculares y descriptores físicos del siniestro. Evalúa un enfoque de Red Neuronal Multicapa (MLP) en embudo y un enfoque de ensamble por Boosting (XGBoost) alimentados por pipelines avanzados de ingeniería de características.
* **USOS:** Auditoría técnica de dictámenes periciales tabulares, estimación de velocidad en siniestros donde no se dispone de evidencia fotográfica clara o el vehículo se encuentra inaccesible, y validación de consistencia estadística en bases de datos de accidentes.
* **LIGA DEL PROTOTIPO:** `institucional_storage/ai_models/ciren_velocity/v1_0/tabular_estimator/` (Contiene pesos `best_tabular_mlp.pt`, binario `xgboost_regressor.json`, scripts del Pipeline 3 y archivo de configuración `tabular_features.yaml`).
* **TAMAÑO MUESTRA DATASET:** Total de registros tabulares de la base CIREN de la NHTSA con datos cinemáticos válidos.
* **DIVISIÓN DEL DATASET:** Estructuración metodológica estricta: 70% Entrenamiento, 10% Validación, 20% Prueba.
* **ESTATUS MUESTRA:** Altamente depurada y optimizada mediante el Pipeline 3 (Imputación robusta, estandarización, codificaciones cíclicas $\sin/\cos$, Target Encoding, filtrado por Información Mutua y remoción de multicolinealidad >0.9). El espacio se redujo de 23 a 11 características densas.
* **MUESTRA PARA ANÁLISIS DE EFECTIVIDAD:** 20% de los registros tabulares totales reservados estrictamente en el set de Test para la auditoría de efectividad final.
* **MÉTRICAS DE DESEMPEÑO Y VALIDACIÓN DEL MODELO:**
    * *Experimento 1 (Pipeline 1 + MLP):* MAE Entrenamiento = 8.60; MAE Validación Mejor = 7.11; MAE Prueba = 8.44.
    * *Experimento 2 (Pipeline 2 + MLP):* MAE Entrenamiento = 7.89; MAE Prueba = 8.57 (Indicios de sobreajuste).
    * *Experimento 3 (Pipeline 3 + MLP):* MAE Entrenamiento = 8.04; MAE Prueba = **7.39** (**Ganador Tabular Global** - Alta capacidad de generalización).
    * *Experimento 4 (Pipeline 3 + XGBoost):* MAE Prueba = 7.86 (Competitivo pero superado por la MLP del Exp 3).
    * *Tiempos de Inferencia:* <1.5 ms sobre CPU estándar.
* **EVIDENCIAS TÉCNICAS:** Archivos adjuntos en repositorio: `results_tabular_mlp.csv`, `xgboost_metrics.log`, `mutual_information_scores.png` (Gráfica de umbrales), `correlation_matrix_filtered.png` y curvas de pérdida de los experimentos 1 al 3.
* **ESTATUS DEL ENTRENAMIENTO:** Concluido y listo para integración pericial independiente o coprocesamiento.
* **FECHA DE CREACIÓN:** 02 de Febrero de 2026.
* **FECHA DE LIBERACIÓN:** 06 de Junio de 2026.

---

### FICHA TÉCNICA 3: HybridVelocityEstimator

* **NOMBRE DEL MODELO:** `HybridVelocityEstimator_Multimodal_Fusion_V1.0`
* **DESCRIPCIÓN:** Arquitectura neuronal profunda multimodal de última generación que realiza una fusión temprana mediante la concatenación del embedding visual de 512 dimensiones (derivado del Encoder ResNet50) y el vector de características técnicas purgado por el Pipeline 3, procesando la representación unificada a través de una red densa profunda en cascada para la estimación óptima de velocidad.
* **USOS:** Core predictivo institucional para la liquidación rápida de siniestros de alto impacto, sistema centralizado de auditoría antifraude en valuación de daños vehiculares y herramienta de soporte pericial automatizada de alta precisión.
* **LIGA DEL PROTOTIPO:** `institucional_storage/ai_models/ciren_velocity/v1_0/hybrid_multimodal/` (Contiene el modelo unificado completo `best_hybrid_estimator.pt`, entorno virtual configurado, scripts de preprocesamiento dual e integración con bases de datos corporativas).
* **TAMAÑO MUESTRA DATASET:** Muestras emparejadas (Imagen + Registro Tabular coincidente) con trazabilidad completa de la base CIREN.
* **DIVISIÓN DEL DATASET:** Estructuración metodológica estricta: 70% Entrenamiento, 10% Validación, 20% Prueba.
* **ESTATUS MUESTRA:** Máxima madurez técnica. Datos tabulares procesados con Pipeline 3 y componentes visuales codificados en espacio latente continuo por el encoder convolucional especializado.
* **MUESTRA PARA ANÁLISIS DE EFECTIVIDAD:** 20% de la muestra multimodal emparejada total, aislada por completo desde el inicio del proyecto y utilizada exclusivamente para el testeo ciego de efectividad final.
* **MÉTRICAS DE DESEMPEÑO Y VALIDACIÓN DEL MODELO:**
    * *MAE Global en Set de Prueba:* Muestra una **reducción drástica de aproximadamente el 50% en el error absoluto** frente al modelo puramente visual (`ImageVelocityEstimator`) y una **reducción del 35% al 40%** frente al mejor experimento del modelo tabular independiente (Experimento 3).
    * *Comportamiento Distribucional:* Curvas de aprendizaje robustas, estables y suavizadas sin indicios de sobreajuste o divergencia. Las predicciones muestran una consistencia matemática excepcional, agrupándose fuertemente sobre la diagonal real, con un desempeño sobresaliente y un error mínimo controlado en el rango crítico de **0 a 50 km/h**.
    * *Tamaño del Modelo:* ~142 MB (Incluye pesos del regresor profundo multimodal y capas adaptativas).
* **EVIDENCIAS TÉCNICAS:** Archivos adjuntos en repositorio: `results_hybrid_multimodal.csv`, `multimodal_loss_curves.png`, `residuals_analysis_plot.png` (Gráfica de dispersión de predicciones vs. valores reales con desglose por densidad en el rango de 0-50 km/h) y reportes de validación cruzada.
* **ESTATUS DEL ENTRENAMIENTO:** Concluido y validado con éxito.
* **FECHA DE CREACIÓN:** 20 de Mayo de 2026.
* **FECHA DE LIBERACIÓN:** 06 de Junio de 2026.