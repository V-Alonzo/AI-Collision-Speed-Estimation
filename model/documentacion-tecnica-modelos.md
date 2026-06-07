# Documentación Técnica: Modelos de Estimación de Velocidad de Impacto Mediante Inteligencia Artificial

## Introducción y Contexto

Como parte de las iniciativas de automatización y análisis de daños vehiculares, se desarrolló una familia de modelos de inteligencia artificial orientados a la estimación de la velocidad de impacto (precolisión) a partir de evidencia visual y variables técnicas asociadas a un siniestro. 

A diferencia de los modelos tradicionales de visión computacional enfocados en clasificación o detección, estos modelos resuelven un problema de regresión continua, donde la salida corresponde a una estimación numérica expresada en kilómetros por hora.

Para lograr este objetivo, se plantearon tres enfoques arquitectónicos distintos:
* Un modelo basado exclusivamente en imágenes.
* Un modelo basado exclusivamente en variables tabulares.
* Un modelo híbrido multimodal que integra ambas fuentes de información.

---

## Conjunto de Datos (Dataset)

Los datos utilizados para el entrenamiento y validación provienen del conjunto de datos **CIREN** (Crash Injury Research and Engineering Network) proporcionado por la NHTSA. Este conjunto contiene muestras detalladas de siniestros vehiculares.

Cada registro del conjunto de datos incluye las siguientes variables técnicas y descriptivas:
* `image_id`
* `cirenId`
* `caseId`
* `image_relpath`
* `image_filename`
* `vehicleNumber`
* `image_sequence`
* `photoId`
* `objectID`
* `description`
* `subtype`
* `mais`
* `totalDeltaVKph` (Variable objetivo principal)
* `totalDeltaVMph`
* `cdc`
* `clockDirection`
* `forceDirection`
* `rolloverStatus`
* `primaryVehicleNumber`
* `damagePlaneDescription`
* `severityDescription`
* `vehicleClass`
* `curbWeight` y `curbWeightKg`
* `cargoWeight` y `cargoWeightKg`

---

## Modelo 1: ImageVelocityEstimator

El primer enfoque tuvo como objetivo validar la hipótesis de que es posible estimar la velocidad precolisión utilizando únicamente evidencia visual proveniente de fotografías post-siniestro. La premisa fundamental es que las deformaciones estructurales observables contienen información indirecta sobre la energía involucrada en el impacto.

### Arquitectura y Transfer Learning

Se diseñó una arquitectura de visión computacional como una tarea de regresión supervisada. Para su construcción se adoptó una estrategia de Transfer Learning:

* **Backbone:** Se utilizó **ResNet50** preentrenada sobre ImageNet. Esta red actúa como un extractor robusto de características de alto nivel.
* **Fine-Tuning:** Mediante un proceso controlado, se especializaron las capas más profundas de la red para identificar patrones específicos de daños vehiculares, deformaciones y severidad de impacto.
* **Espacio Latente (Embeddings):** Las características extraídas se transforman a través de un bloque de generación de embeddings, produciendo una representación latente compacta de **512 dimensiones**. Esto elimina redundancias de los vectores originales.
* **Regression Head:** Sobre este espacio latente de 512 dimensiones se implementó una red neuronal completamente conectada que finaliza en una única neurona de salida para generar la estimación continua de velocidad.

### Experimentación y Resultados

Durante la fase experimental, se evaluaron múltiples configuraciones (optimizadores, tasas de aprendizaje, data augmentation y regularización). Los resultados demostraron que el modelo es capaz de aprender patrones visuales relevantes, logrando un desempeño aceptable como primera aproximación.

Sin embargo, se identificaron limitaciones importantes:
* **Degradación en altas velocidades:** El Error Absoluto Medio (MAE) fue estable en velocidades bajas y medias, pero mostró una degradación progresiva en velocidades superiores a los **60 km/h**.
* **Desbalance de datos:** Este comportamiento se atribuyó al desbalance en la distribución del dataset; las muestras de colisiones a alta velocidad estaban considerablemente menos representadas, limitando la capacidad de generalización del modelo en ese rango.

A pesar de esta limitación, el análisis exploratorio del espacio latente (reducción de dimensionalidad a 2D) reveló hallazgos sumamente positivos. Las visualizaciones evidenciaron agrupamientos espaciales coherentes: los siniestros de baja velocidad se concentraban en zonas específicas y migraban progresivamente formando gradientes semánticos a medida que la velocidad aumentaba. Esto confirmó que la red logró una excelente organización semántica de la severidad del daño.

---

## Modelo 2: TabularVelocityEstimator

Este segundo enfoque planteó la hipótesis de que es posible estimar la velocidad de impacto utilizando exclusivamente información tabular y técnica, sin evidencia visual. Para validar esto, se desarrollaron tres pipelines de preprocesamiento distintos y se evaluaron diversas arquitecturas.

### Pipelines de Preprocesamiento

#### Pipeline 1: Limpieza y Transformación Base
* **Limpieza:** Eliminación de registros sin la variable objetivo válida.
* **Imputación:** Llenado de valores faltantes en variables numéricas utilizando la mediana (para mayor robustez frente a valores atípicos).
* **Escalamiento:** Normalización mediante estandarización para centrar la media en cero y la desviación estándar en uno.
* **Codificación Categórica:** *One-Hot Encoding* para variables nominales y codificación ordinal estricta para variables con jerarquía natural (ej. leve, moderado, grave).
* **Codificación Cíclica:** Para variables angulares (dirección de fuerza) y de convención de reloj, se aplicó una transformación matemática usando funciones seno y coseno, preservando correctamente la naturaleza circular de los datos y evitando discrepancias numéricas entre ángulos como 0° y 360°.
* **Binarización:** Variables binarias en texto se convirtieron a formato numérico.

#### Pipeline 2: Reducción de Dimensionalidad y Enriquecimiento
* **Target Encoding:** Se reemplazó el *One-Hot Encoding* por *Target Encoding* para variables nominales, reduciendo drásticamente la complejidad del espacio de entrada de **23 a 11 características**.
* **Variable Objetivo Enriquecida:** Se integró la medición directa de velocidad con estimaciones derivadas de simulaciones periciales (dando prioridad a la medición directa). Esto maximizó el volumen de datos de entrenamiento sin comprometer la consistencia.

#### Pipeline 3: Selección Avanzada de Características
* Se tomó como base el Pipeline 2 y se aplicó selección de características.
* **Eliminación de Constantes:** Se descartaron variables con varianza cero.
* **Información Mutua (Mutual Information):** Se estableció un umbral estricto de **0.001**. Las características que no superaron este umbral de contribución predictiva fueron eliminadas.
* **Análisis de Correlación:** Para pares de variables con una correlación superior a **0.9**, se eliminó la redundancia conservando únicamente la variable con mayor Información Mutua respecto al objetivo.

### Modelos Evaluados

Se diseñaron cuatro experimentos principales. Los tres primeros emplearon redes neuronales (MLP) sobre los distintos pipelines, y el cuarto empleó un modelo basado en árboles.

* **Arquitectura MLP (Experimentos 1, 2 y 3):** Red neuronal multicapa en forma de embudo. Tres capas ocultas completamente conectadas con **64, 32 y 16 neuronas** respectivamente. Se utilizó regularización mediante *Dropout* al **5%**. El entrenamiento usó lotes de 16 muestras, tasa de aprendizaje de 0.0003, y un mecanismo de *early stopping* con paciencia de 10 épocas. Los datos se dividieron en 80% entrenamiento (del cual 20% fue para validación) y 20% para pruebas.
* **Modelo XGBoost (Experimento 4):** Utilizó el Pipeline 3. Se configuró con un máximo de 1000 árboles, parada temprana de 50 iteraciones, profundidad máxima de 5 niveles, tasa de aprendizaje de 0.05, y un muestreo aleatorio del 80% tanto para observaciones como para características.

### Resultados Experimentales (Tabular)

| Experimento | Pipeline Utilizado | Modelo | MAE Entrenamiento | MAE Prueba | Observaciones |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Exp 1 | Pipeline 1 | MLP | 8.60 | 8.44 | Desempeño base competitivo. |
| Exp 2 | Pipeline 2 | MLP | 7.89 | 8.57 | Mejor aprendizaje, pero indicios de ligero sobreajuste. |
| **Exp 3** | **Pipeline 3** | **MLP** | **8.04** | **7.39** | **Mejor desempeño global. Reducción significativa de sobreajuste.** |
| Exp 4 | Pipeline 3 | XGBoost| N/D | 7.86 | Competitivo, pero superado por la red neuronal multicapa. |

El **Experimento 3** demostró que la combinación de una representación compacta (Pipeline 3) y una arquitectura MLP captura de manera más efectiva las complejas relaciones estadísticas subyacentes.

---

## Modelo 3: HybridVelocityEstimator

Con base en los hallazgos anteriores, se planteó que la información visual y la tabular son intrínsecamente complementarias. El modelo `HybridVelocityEstimator` es una arquitectura multimodal diseñada para integrar ambas fuentes de evidencia en un mismo proceso de inferencia.

### Flujo de Fusión Multimodal

La arquitectura recibe dos componentes independientes por cada registro: la fotografía post-siniestro y el vector de características tabulares (optimizado).

1. **Rama Visual:** Reutiliza el modelo `ImageVelocityEstimator` como un encoder. ResNet50 procesa la imagen y genera el embedding visual latente de **512 dimensiones**, el cual codifica patrones de deformación y severidad estructural.
2. **Fusión:** El embedding visual de 512 dimensiones se concatena directamente con el conjunto de variables tabulares correspondientes a la misma muestra.
3. **Regresión Conjunta:** El vector fusionado alimenta una red neuronal profunda diseñada para aprender relaciones cruzadas.

### Arquitectura de la Red de Regresión

La red neuronal que procesa la representación unificada se construyó con una topología de reducción progresiva para extraer gradualmente abstracciones combinadas:

* Capa de entrada (Vector concatenado visual + tabular)
* Capa Densa de **512 neuronas**
* Capa Densa de **256 neuronas**
* Capa Densa de **128 neuronas**
* Capa Densa de **64 neuronas**
* Neurona única de salida (Predicción continua)

Entre las capas densas se implementaron mecanismos de **Batch Normalization** para estabilizar la convergencia, funciones de activación **GELU**, y capas de **Dropout** para prevenir el sobreajuste.

### Resultados y Desempeño Multimodal

La etapa de experimentación del enfoque híbrido arrojó resultados concluyentes sobre la superioridad de la estrategia multimodal:

* **Estabilidad:** Las curvas de pérdida mostraron convergencias sumamente estables sin signos de sobreajuste o divergencia entre entrenamiento y validación.
* **Reducción de Error:** El MAE se redujo en aproximadamente un **50%** en comparación con el modelo estrictamente visual (`ImageVelocityEstimator`).
* **Mejora sobre modelo tabular:** Se observó una reducción adicional del **35% al 40%** en el error frente al mejor modelo tabular (Experimento 3 del `TabularVelocityEstimator`).
* **Precisión Distribucional:** Las predicciones del modelo híbrido se concentraron de forma notablemente consistente alrededor de los valores reales, resolviendo gran parte de la incertidumbre en el segmento crítico de **0 a 50 km/h** (donde se concentra la mayor densidad poblacional del dataset).

---

## Conclusiones

El ciclo de desarrollo iterativo comprobó exitosamente las hipótesis de investigación. El análisis aislado comprobó que las imágenes por sí solas pueden generar espacios latentes ordenados por severidad cinemática, y que los atributos técnicos tabulares pueden predecir velocidades con alta precisión tras un preprocesamiento avanzado. 

Sin embargo, el hito técnico más destacado es el modelo **HybridVelocityEstimator**, el cual demostró categóricamente que la fusión temprana de características extraídas por convoluciones profundas con atributos estructurados reduce el error de estimación de manera sustancial. Esta arquitectura multimodal se posiciona como la solución técnica más robusta y confiable para su implementación en ecosistemas reales de análisis automatizado de siniestros vehiculares.