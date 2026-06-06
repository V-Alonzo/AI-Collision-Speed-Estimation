# Documentación Técnica de Modelos de Estimación de Velocidad de Impacto Mediante Inteligencia Artificial

## Introducción

Como parte de las iniciativas de automatización y análisis de daños vehiculares, se desarrolló una familia de modelos de inteligencia artificial orientados a la estimación de la velocidad de impacto a partir de evidencia visual y variables técnicas asociadas a un siniestro.

A diferencia de los modelos tradicionales de visión computacional enfocados en tareas de clasificación o detección de objetos, los modelos desarrollados tienen como objetivo resolver un problema de regresión continua, donde la salida corresponde a una estimación numérica de velocidad expresada en kilómetros por hora.

La arquitectura general contempla tres enfoques complementarios:

* Modelo basado exclusivamente en imágenes (ImageVelocityEstimator).
* Modelo basado exclusivamente en variables tabulares (TabularVelocityEstimator).
* Modelo híbrido multimodal (HybridVelocityEstimator) que integra ambas fuentes de información.

El propósito de esta estrategia es evaluar la capacidad predictiva de distintas fuentes de datos y determinar el nivel de contribución de cada modalidad al proceso de estimación de velocidad.

---

# Objetivo del Proyecto

Desarrollar modelos de inteligencia artificial capaces de estimar la velocidad asociada a un evento de impacto vehicular utilizando información visual, información estructurada y la combinación de ambas, con el fin de apoyar procesos de análisis técnico, investigación de siniestros y generación de indicadores cuantitativos para la toma de decisiones.

Los modelos buscan:

* Identificar patrones visuales asociados a diferentes niveles de severidad de daño.
* Aprender relaciones entre variables técnicas y velocidad de impacto.
* Integrar evidencia multimodal para mejorar la precisión de las estimaciones.
* Mantener capacidad de generalización sobre casos no observados durante el entrenamiento.

---

# Metodología General de Desarrollo

La metodología utilizada sigue una estructura iterativa compuesta por las siguientes etapas:

## Definición del problema

Se estableció como variable objetivo la velocidad real asociada a cada registro del conjunto de datos.

La naturaleza del problema corresponde a una tarea de Machine Learning Supervisado de Regresión donde cada muestra contiene:

* Variables de entrada.
* Velocidad real medida o validada.
* Evidencia fotográfica asociada.

---

## Recolección de datos

Los datos utilizados provienen de expedientes técnicos de siniestros vehiculares.

Cada registro puede incluir:

### Información visual

* Fotografías de daños frontales.
* Fotografías laterales.
* Fotografías posteriores.
* Fotografías generales del vehículo.

### Información tabular

Dependiendo del registro disponible:

* Tipo de impacto.
* Zona de daño.
* Masa vehicular.
* Categoría del vehículo.
* Variables periciales.
* Características estructurales.
* Variables derivadas de inspección.

### Variable objetivo

* Velocidad de impacto validada.

---

## Limpieza y depuración de datos

Previo al entrenamiento se realiza un proceso de control de calidad que contempla:

### Imágenes

* Eliminación de imágenes corruptas.
* Eliminación de fotografías duplicadas.
* Conversión a formato estándar RGB.
* Verificación de resolución mínima.
* Corrección de inconsistencias.

### Datos tabulares

* Identificación de valores faltantes.
* Corrección de inconsistencias de captura.
* Normalización de unidades.
* Eliminación de registros incompletos.
* Validación de rangos físicos posibles.

---

## División del dataset

Con el objetivo de garantizar una evaluación objetiva del desempeño, el conjunto de datos se divide en:

| Subconjunto | Propósito                 |
| ----------- | ------------------------- |
| Train       | Aprendizaje del modelo    |
| Validation  | Ajuste de hiperparámetros |
| Test        | Evaluación final          |

La división se realiza manteniendo independencia entre conjuntos para evitar fuga de información.

# Modelo 1: ImageVelocityEstimator

## Descripción General

ImageVelocityEstimator es un modelo de Deep Learning diseñado para estimar la velocidad de impacto de un vehículo a partir de evidencia fotográfica obtenida después de una colisión. A diferencia de los enfoques tradicionales basados en reglas físicas o variables periciales estructuradas, este modelo busca aprender directamente patrones visuales asociados a la severidad del daño y su relación con la energía involucrada en el evento de impacto.

El modelo aborda el problema como una tarea de **regresión supervisada**, donde la entrada consiste en una imagen RGB del vehículo siniestrado y la salida corresponde a una estimación continua de velocidad expresada en kilómetros por hora.

La arquitectura se fundamenta en técnicas modernas de **Transfer Learning**, aprovechando el conocimiento previamente adquirido por una red neuronal profunda entrenada sobre millones de imágenes generales y posteriormente especializada para el dominio de análisis de daños vehiculares mediante un proceso de Fine-Tuning controlado.

El objetivo principal del modelo es extraer automáticamente representaciones visuales de alto nivel que permitan identificar patrones complejos relacionados con:

* Magnitud de deformaciones estructurales.
* Distribución espacial del daño.
* Concentración de energía en zonas específicas del vehículo.
* Severidad general de la colisión.
* Relación visual entre daño observable y velocidad de impacto.

Esta aproximación elimina la necesidad de definir manualmente reglas de ingeniería específicas para cada tipo de accidente, permitiendo que el sistema aprenda directamente de los datos históricos disponibles.

---

# Objetivo del Modelo

Desarrollar una arquitectura de visión computacional capaz de estimar la velocidad de impacto vehicular a partir de imágenes post-colisión, generando una predicción numérica continua con capacidad de generalización sobre casos previamente no observados durante el entrenamiento.

De manera específica, el modelo busca:

* Extraer características visuales relevantes de fotografías vehiculares.
* Construir representaciones latentes robustas del daño observado.
* Reducir la dependencia de variables periciales manuales.
* Proporcionar estimaciones consistentes sobre diferentes tipos de vehículos y escenarios de impacto.
* Servir como componente visual dentro de arquitecturas multimodales más complejas.

---

# Arquitectura General

La arquitectura completa está compuesta por tres bloques principales:

1. Extracción de características visuales mediante ResNet50.
2. Generación de embeddings latentes especializados.
3. Regresión de velocidad a partir de la representación aprendida.

El flujo general de procesamiento es el siguiente:

**Imagen de entrada → Backbone ResNet50 → Vector de características → Embedding Head → Embedding Normalizado → Regression Head → Velocidad Estimada**

Cada uno de estos componentes cumple una función específica dentro del proceso de aprendizaje.

---

# Backbone de Extracción de Características

## Selección de la Arquitectura

Como extractor principal de características se utiliza una red neuronal convolucional ResNet50.

ResNet50 pertenece a la familia de arquitecturas Residual Networks propuestas por Microsoft Research y constituye una de las arquitecturas más ampliamente utilizadas en tareas de visión computacional debido a su equilibrio entre:

* Capacidad de representación.
* Estabilidad de entrenamiento.
* Profundidad efectiva.
* Eficiencia computacional.

La arquitectura cuenta con aproximadamente 25 millones de parámetros y ha sido previamente entrenada sobre el dataset ImageNet, el cual contiene más de un millón de imágenes distribuidas en mil categorías visuales.

---

## Transfer Learning

En lugar de entrenar una red desde cero, se emplea un enfoque de aprendizaje por transferencia utilizando los pesos preentrenados:

IMAGENET1K_V2

Esta estrategia permite aprovechar conocimiento visual previamente adquirido sobre:

* Bordes.
* Texturas.
* Formas geométricas.
* Patrones espaciales.
* Relaciones entre objetos.

Dicho conocimiento constituye una base visual sólida que posteriormente puede adaptarse al dominio específico de daños vehiculares.

La utilización de Transfer Learning aporta beneficios importantes:

* Menor tiempo de entrenamiento.
* Reducción de requerimientos computacionales.
* Mejor convergencia.
* Menor riesgo de sobreajuste.
* Mayor capacidad de generalización.

---

# Estrategia de Fine-Tuning

Con el objetivo de preservar el conocimiento general adquirido durante el preentrenamiento y simultáneamente especializar el modelo para el problema de estimación de velocidad, se implementa una estrategia de Fine-Tuning parcial.

Durante la construcción del modelo:

* Todas las capas convolucionales son inicialmente congeladas.
* Posteriormente únicamente la capa Layer4 es descongelada.

En consecuencia:

### Capas congeladas

* Conv1
* Layer1
* Layer2
* Layer3

### Capas entrenables

* Layer4

Esta estrategia permite que las primeras capas continúen actuando como extractores universales de características visuales mientras que las capas más profundas se especializan en la identificación de patrones específicos relacionados con daños estructurales.

La decisión de entrenar únicamente Layer4 reduce significativamente el número de parámetros ajustables, mejorando la estabilidad del entrenamiento y disminuyendo el riesgo de sobreajuste sobre datasets relativamente pequeños.

---

# Extracción de Características Visuales

Después del procesamiento de la imagen por parte de ResNet50, la capa Fully Connected original es eliminada.

Se conserva únicamente el bloque convolucional encargado de generar la representación visual de alto nivel.

La salida producida por el backbone corresponde a un tensor de características que posteriormente es aplanado (Flatten) para obtener un vector unidimensional de 2048 características.

Este vector constituye una representación compacta de la información visual aprendida por la red.

En términos conceptuales, dicho vector codifica información relacionada con:

* Distribución del daño.
* Patrones geométricos observados.
* Deformaciones estructurales.
* Relaciones espaciales complejas.
* Características relevantes para la predicción de velocidad.

---

# Embedding Head

## Propósito

Aunque el vector de 2048 características contiene información valiosa, su dimensionalidad elevada puede incluir redundancias o información poco relevante para la tarea de regresión.

Por esta razón se incorpora un bloque especializado denominado Embedding Head.

Su función consiste en transformar las características visuales generales extraídas por ResNet50 en una representación latente optimizada específicamente para la estimación de velocidad.

---

## Arquitectura del Embedding Head

La estructura implementada es:

2048 → 1024 → 512

Cada capa incorpora mecanismos de regularización y estabilización:

### Primera proyección

* Linear (2048 → 1024)
* Batch Normalization
* GELU
* Dropout (0.20)

### Segunda proyección

* Linear (1024 → 512)
* Batch Normalization
* GELU
* Dropout (0.30)

---

## Batch Normalization

Batch Normalization permite:

* Reducir covariate shift interno.
* Estabilizar gradientes.
* Acelerar convergencia.
* Mejorar generalización.

---

## GELU

Como función de activación se utiliza GELU (Gaussian Error Linear Unit).

Esta activación ha demostrado ventajas frente a ReLU en arquitecturas profundas debido a que introduce transiciones más suaves y una mejor propagación de información.

---

## Dropout

Se emplean mecanismos de Dropout para reducir el sobreajuste.

Los porcentajes utilizados son:

* 20% en la primera capa.
* 30% en la segunda capa.

Esto obliga a la red a desarrollar representaciones más robustas y menos dependientes de neuronas individuales.

---

# Espacio Latente y Embedding Normalizado

La salida final del Embedding Head corresponde a un vector de:

**512 dimensiones**

Posteriormente se aplica una normalización L2 sobre dicho vector.

La normalización transforma el embedding para que su magnitud sea unitaria mientras conserva su dirección en el espacio latente.

Matemáticamente:

* Se preserva la información representacional.
* Se mejora la estabilidad numérica.
* Se facilita la comparación entre muestras.
* Se reduce la sensibilidad a escalas arbitrarias.

Este embedding constituye la representación visual definitiva aprendida por el modelo.

Además de alimentar el bloque de regresión, puede utilizarse para futuras tareas de:

* Búsqueda de casos similares.
* Clustering de daños.
* Visualización mediante reducción de dimensionalidad.
* Construcción de modelos híbridos multimodales.

---

# Regression Head

Una vez obtenido el embedding visual, se aplica una red neuronal especializada para la predicción de velocidad.

La arquitectura implementada es:

512 → 128 → 1

La estructura interna incluye:

### Capa oculta

* Linear (512 → 128)
* Batch Normalization
* GELU
* Dropout (0.20)

### Capa de salida

* Linear (128 → 1)

El nodo final genera una única variable continua correspondiente a la velocidad estimada.

Al tratarse de un problema de regresión, no se emplean funciones Softmax ni mecanismos de clasificación probabilística.

La salida puede tomar cualquier valor dentro del rango aprendido durante el entrenamiento.

---

# Capacidad Representacional del Modelo

Desde una perspectiva funcional, el modelo aprende una función matemática compleja capaz de mapear:

**Fotografía vehicular → Velocidad estimada**

sin necesidad de reglas explícitas programadas manualmente.

Durante el entrenamiento, la red ajusta millones de parámetros internos para identificar correlaciones entre patrones visuales de daño y velocidades históricas observadas.

De esta forma, el sistema desarrolla una representación jerárquica donde niveles inferiores detectan características básicas como bordes y texturas, mientras que niveles superiores capturan conceptos abstractos relacionados con deformación estructural y severidad de impacto.

La combinación de Transfer Learning, Fine-Tuning selectivo, generación de embeddings especializados y regresión profunda permite construir una arquitectura robusta, escalable y preparada para futuras extensiones dentro del ecosistema de análisis automatizado de siniestros vehiculares.

---

# Modelo 2: TabularVelocityEstimator

## Descripción General

TabularVelocityEstimator es un modelo de aprendizaje profundo diseñado para estimar la velocidad de impacto vehicular utilizando exclusivamente información estructurada proveniente de registros técnicos, periciales y características asociadas al evento de colisión.

A diferencia de los modelos de visión computacional, este enfoque no utiliza imágenes como fuente de información. En su lugar, el proceso de inferencia se fundamenta completamente en variables cuantitativas y categóricas previamente recopiladas dentro de cada expediente de análisis.

El modelo aborda el problema como una tarea de **regresión supervisada**, donde cada registro está compuesto por un conjunto de variables tabulares y una velocidad objetivo asociada.

El propósito principal de esta arquitectura es identificar relaciones estadísticas complejas entre los atributos técnicos disponibles y la velocidad real observada durante el evento de impacto.

Desde una perspectiva experimental, este modelo cumple además una función estratégica dentro del proyecto, ya que permite establecer una línea base de desempeño utilizando únicamente información estructurada. Esto facilita cuantificar posteriormente la contribución individual de la modalidad visual y evaluar el beneficio obtenido mediante arquitecturas híbridas multimodales.

---

# Objetivo del Modelo

Desarrollar un sistema de regresión basado en variables estructuradas capaz de estimar la velocidad de impacto vehicular mediante el aprendizaje automático de relaciones no lineales entre atributos técnicos y la variable objetivo.

De forma específica, el modelo busca:

* Analizar relaciones entre características del siniestro y velocidad de impacto.
* Identificar patrones complejos difíciles de modelar mediante reglas manuales.
* Servir como referencia comparativa frente a modelos visuales y multimodales.
* Generar predicciones continuas con capacidad de generalización sobre nuevos registros.
* Aprovechar información técnica disponible incluso cuando no existen imágenes asociadas al caso.

---

# Fundamentación del Enfoque Tabular

En numerosos procesos de análisis de accidentes vehiculares existe una gran cantidad de información estructurada recopilada durante inspecciones técnicas, peritajes o sistemas de gestión de siniestros.

Estas variables suelen contener información relevante sobre:

* Características del vehículo.
* Configuración del impacto.
* Zona afectada.
* Magnitud del daño.
* Condiciones operativas.
* Información contextual del evento.

Históricamente este tipo de variables han sido utilizadas por especialistas para realizar estimaciones manuales o análisis periciales.

Sin embargo, las relaciones existentes entre dichas variables y la velocidad de impacto suelen presentar un comportamiento altamente no lineal, lo que dificulta la construcción de modelos determinísticos tradicionales.

Las redes neuronales profundas permiten abordar este problema mediante el aprendizaje automático de representaciones internas capaces de capturar interacciones complejas entre múltiples variables simultáneamente.

---

# Arquitectura General

La arquitectura implementada corresponde a una red neuronal totalmente conectada (Multilayer Perceptron o MLP) diseñada específicamente para tareas de regresión.

El flujo general de procesamiento es el siguiente:

**Variables Tabulares → Procesamiento Denso → Representación Latente → Regresión → Velocidad Estimada**

A diferencia de los modelos convolucionales utilizados en visión computacional, todas las operaciones se realizan sobre vectores numéricos estructurados.

---

# Preparación de Variables de Entrada

## Construcción del Vector de Características

Previo al entrenamiento, todas las variables disponibles son integradas dentro de una representación unificada.

Dependiendo de la naturaleza de cada atributo, pueden aplicarse procesos de:

### Variables numéricas

* Escalamiento.
* Normalización.
* Estandarización.

### Variables categóricas

* Codificación numérica.
* One-Hot Encoding.
* Representaciones equivalentes.

Una vez procesadas, todas las variables son concatenadas para formar un único vector de entrada.

Este vector constituye la representación inicial del caso que será utilizada por la red neuronal.

---

# Capa de Entrada

La capa de entrada recibe directamente el conjunto completo de características tabulares disponibles.

Cada dimensión del vector representa una variable específica relacionada con el siniestro.

A diferencia de los modelos visuales, donde la extracción de características ocurre automáticamente a partir de píxeles, en este caso la información ya se encuentra estructurada y organizada antes de ingresar a la red.

Por esta razón, el objetivo principal del modelo consiste en descubrir patrones y dependencias ocultas entre dichas variables.

---

# Capas Ocultas (Hidden Layers)

## Propósito

Las capas ocultas constituyen el núcleo del proceso de aprendizaje.

Su función principal es transformar progresivamente el espacio de características original hacia representaciones internas más informativas para la predicción de velocidad.

Durante esta transformación, la red aprende relaciones complejas que pueden involucrar múltiples variables simultáneamente.

Estas relaciones suelen ser difíciles de detectar mediante análisis estadísticos convencionales o modelos lineales tradicionales.

---

## Procesamiento No Lineal

Cada capa densa realiza una combinación ponderada de las variables recibidas y posteriormente aplica funciones de activación no lineales.

Este mecanismo permite modelar fenómenos complejos como:

* Interacciones entre variables.
* Dependencias condicionales.
* Efectos acumulativos.
* Relaciones no lineales.
* Comportamientos difíciles de representar mediante ecuaciones tradicionales.

La profundidad de la red permite construir representaciones jerárquicas cada vez más especializadas para la tarea de estimación de velocidad.

---

# Funciones de Activación

Las funciones de activación permiten introducir no linealidad dentro de la red neuronal.

Gracias a estas transformaciones, el modelo puede aprender relaciones complejas entre variables de entrada y velocidad de impacto.

Sin estas funciones, la red se comportaría de manera equivalente a un modelo lineal independientemente de su profundidad.

La inclusión de activaciones no lineales incrementa significativamente la capacidad representacional de la arquitectura. Para este caso se utilizó la función ReLU (Unidad Lineal Rectificada) que actua como f(x) = max(0, x) que filtra los valores negativos y deja pasar directamente los positivos.

---

# Regularización mediante Dropout

Con el objetivo de reducir el riesgo de sobreajuste, la arquitectura incorpora mecanismos de Dropout durante el entrenamiento.

Dropout desactiva aleatoriamente una fracción de neuronas en cada iteración, obligando al modelo a distribuir el aprendizaje entre múltiples rutas internas.

Los principales beneficios de esta técnica son:

* Reducción de dependencia entre neuronas.
* Mayor robustez frente a ruido.
* Mejor capacidad de generalización.
* Disminución del sobreajuste sobre el conjunto de entrenamiento.

---

# Representación Latente Interna

A medida que los datos atraviesan las distintas capas ocultas, la red construye representaciones internas cada vez más abstractas.

Estas representaciones pueden interpretarse como espacios latentes donde las variables originales son reorganizadas en función de su relevancia para la predicción de velocidad.

Aunque estas representaciones no son observables directamente por el usuario final, constituyen el conocimiento aprendido por el modelo durante el entrenamiento.

Es precisamente en este espacio latente donde la red descubre patrones estadísticos complejos presentes en los datos históricos.

---

# Capa de Salida

La arquitectura finaliza con una única neurona de salida.

Esta neurona produce una variable continua correspondiente a la velocidad estimada del impacto.

A diferencia de problemas de clasificación, donde se generan probabilidades asociadas a diferentes categorías, el modelo produce directamente un valor numérico.

La salida representa la mejor estimación aprendida por la red neuronal a partir de la información disponible en las variables de entrada.

---

# Naturaleza de la Predicción

El modelo aprende una función matemática compleja capaz de aproximar la relación existente entre:

**Variables Técnicas del Siniestro → Velocidad de Impacto**

Durante el entrenamiento, millones de actualizaciones sucesivas permiten ajustar los pesos internos de la red para minimizar el error entre velocidades reales y velocidades predichas.

Como resultado, el sistema desarrolla la capacidad de realizar inferencias sobre registros completamente nuevos que no fueron observados durante el proceso de aprendizaje.

---

# Rol dentro del Ecosistema de Modelos

TabularVelocityEstimator representa la referencia estructurada dentro del ecosistema de modelos desarrollados para el proyecto.

Su importancia radica en tres aspectos principales:

### Línea Base Experimental

Permite cuantificar el desempeño alcanzable utilizando únicamente información tabular.

### Comparación Modal

Facilita evaluar el aporte individual de la información visual incorporada por ImageVelocityEstimator.

### Componente Multimodal

Sirve como una de las ramas fundamentales del modelo HybridVelocityEstimator, donde sus representaciones se combinan con embeddings visuales para generar predicciones basadas en múltiples fuentes de información.

De esta forma, el modelo no solamente constituye una solución independiente para la estimación de velocidad, sino también un elemento clave dentro de la estrategia general de aprendizaje multimodal desarrollada para el proyecto.


---

# Modelo 3: HybridVelocityEstimator

## Descripción General

HybridVelocityEstimator constituye la arquitectura principal desarrollada dentro del proyecto de estimación de velocidad de impacto vehicular. Este modelo implementa un enfoque de aprendizaje multimodal diseñado para integrar simultáneamente información visual proveniente de imágenes de daños vehiculares e información estructurada contenida en variables técnicas asociadas al siniestro.

A diferencia de los modelos unimodales desarrollados previamente, que procesan exclusivamente imágenes o exclusivamente variables tabulares, esta arquitectura busca aprovechar las fortalezas de ambas fuentes de información para construir una representación más completa del evento de colisión.

El problema es abordado como una tarea de **regresión supervisada**, donde cada muestra está compuesta por:

* Una imagen asociada al vehículo siniestrado.
* Un conjunto de variables estructuradas relacionadas con el caso.
* Una velocidad real de impacto utilizada como variable objetivo.

La hipótesis principal detrás de esta arquitectura es que ciertas características relevantes para la estimación de velocidad son visibles únicamente en la evidencia fotográfica, mientras que otras están contenidas en variables técnicas que no pueden inferirse directamente a partir de una imagen.

Por lo tanto, la integración de ambas modalidades permite construir una representación más rica del fenómeno físico que se desea modelar.

---

# Objetivo del Modelo

Desarrollar una arquitectura multimodal capaz de estimar la velocidad de impacto vehicular mediante la combinación de información visual y variables estructuradas, maximizando la capacidad predictiva del sistema y mejorando el desempeño obtenido por modelos unimodales.

De manera específica, el modelo busca:

* Extraer patrones visuales asociados a la severidad del daño.
* Incorporar variables técnicas y contextuales relevantes para el análisis.
* Aprender relaciones cruzadas entre información visual y estructurada.
* Reducir incertidumbre en escenarios donde una modalidad por sí sola resulta insuficiente.
* Construir una representación conjunta más informativa del siniestro.
* Incrementar la precisión de las estimaciones de velocidad.

---

# Fundamentación del Enfoque Multimodal

La estimación de velocidad de impacto constituye un problema inherentemente complejo debido a la gran cantidad de factores que intervienen durante una colisión vehicular.

En escenarios reales, la velocidad no depende únicamente del daño visible observado en una fotografía, sino también de múltiples variables relacionadas con:

* Configuración del impacto.
* Características estructurales del vehículo.
* Condiciones del evento.
* Variables periciales.
* Factores geométricos.
* Propiedades físicas involucradas en la transferencia de energía.

De forma similar, las variables estructuradas tampoco contienen toda la información disponible, ya que existen características visuales complejas que resultan difíciles de representar mediante atributos numéricos o categóricos.

Por esta razón, el proyecto adopta un enfoque multimodal donde cada modalidad aporta información complementaria.

---

# Contribución de Cada Modalidad

## Modalidad Visual

La rama visual permite analizar automáticamente información contenida en las imágenes del vehículo.

Entre los patrones potencialmente aprendidos se encuentran:

* Magnitud de deformaciones.
* Distribución espacial del daño.
* Concentración de energía en zonas específicas.
* Severidad estructural observable.
* Patrones de fractura.
* Relación geométrica entre áreas afectadas.

Estas características suelen ser difíciles de describir manualmente mediante variables tabulares.

---

## Modalidad Tabular

La modalidad tabular incorpora información estructurada obtenida de registros técnicos y periciales.

Dependiendo del dataset disponible, puede incluir:

* Características del vehículo.
* Información de inspección.
* Variables periciales.
* Indicadores técnicos.
* Información contextual del siniestro.

Estas variables aportan conocimiento que generalmente no es observable directamente en las imágenes.

---

## Complementariedad de la Información

La principal ventaja de la arquitectura multimodal radica en que ambas modalidades describen diferentes perspectivas del mismo evento.

Mientras la rama visual captura evidencia observable, la rama tabular incorpora información contextual y técnica.

La combinación de ambas fuentes permite construir una representación más cercana a la complejidad real del fenómeno que se desea modelar.

---

# Arquitectura General

La arquitectura completa está compuesta por cuatro bloques principales:

1. Rama visual.
2. Rama tabular.
3. Módulo de fusión multimodal.
4. Red de regresión final.

El flujo general puede describirse como:

**Imagen + Variables Tabulares → Extracción de Características → Fusión Multimodal → Regresión → Velocidad Estimada**

Cada componente cumple una función específica dentro del proceso de aprendizaje.

---

# Rama Visual

## Objetivo

La rama visual tiene como propósito transformar una imagen vehicular en una representación matemática compacta capaz de describir el daño observado.

Esta rama reutiliza la arquitectura desarrollada para ImageVelocityEstimator.

---

## Backbone ResNet50

Como extractor de características se utiliza una red ResNet50 preentrenada sobre ImageNet.

La red procesa la imagen y genera una representación visual de alto nivel relacionada con:

* Texturas.
* Bordes.
* Formas.
* Geometrías complejas.
* Patrones de deformación.

Durante el entrenamiento se aplica Fine-Tuning únicamente sobre las capas más profundas de la arquitectura para especializar la red en el dominio de daños vehiculares.

---

## Generación del Embedding Visual

Las características extraídas por ResNet50 son proyectadas mediante un Embedding Head especializado. El resultado es un embedding visual de:

**512 dimensiones**

Posteriormente normalizado mediante L2 Normalization.

Este embedding constituye la representación visual final utilizada por el modelo híbrido.

---

# Rama Tabular

## Objetivo

La rama tabular transforma las variables estructuradas disponibles en una representación matemática compatible con la rama visual.

Su función consiste en capturar relaciones estadísticas complejas presentes en los atributos técnicos asociados al caso.

---

## Procesamiento de Variables

Las variables son integradas dentro de un vector unificado de características.

Posteriormente atraviesan una serie de capas densas encargadas de:

* Reducir dimensionalidad.
* Aprender relaciones no lineales.
* Generar una representación latente compacta.

La salida de esta rama corresponde a un embedding tabular especializado para la tarea de estimación de velocidad.

---

# Espacios Latentes Especializados

Una característica fundamental de la arquitectura es que ambas modalidades son procesadas de manera independiente antes de ser fusionadas.

Esto permite que cada rama aprenda representaciones optimizadas para el tipo de información que recibe.

De forma conceptual:

### Embedding Visual

Representa conocimiento relacionado con:

* Daño observable.
* Patrones geométricos.
* Severidad estructural.

### Embedding Tabular

Representa conocimiento relacionado con:

* Variables técnicas.
* Características contextuales.
* Relaciones estadísticas.

Ambos espacios latentes son aprendidos simultáneamente durante el entrenamiento.

---

# Módulo de Fusión Multimodal

## Objetivo

Una vez obtenidas las representaciones latentes de ambas modalidades, el siguiente paso consiste en integrarlas dentro de una representación conjunta.

Este proceso se realiza mediante un módulo de Feature Fusion.

---

## Estrategia de Fusión

La estrategia implementada consiste en la concatenación directa de los embeddings generados por ambas ramas.

Matemáticamente:

**Embedding Visual ⊕ Embedding Tabular**

donde ⊕ representa la operación de concatenación.

Esta operación preserva toda la información aprendida por cada modalidad.

---

## Representación Conjunta

El vector resultante constituye una representación multimodal unificada del siniestro.

En este espacio convergen simultáneamente:

* Información visual.
* Información técnica.
* Información contextual.

Esta representación conjunta es considerablemente más rica que cualquiera de las modalidades individuales por separado.

---

# Red de Regresión Final

## Objetivo

La red de regresión tiene la responsabilidad de transformar la representación multimodal fusionada en una estimación numérica de velocidad.

---

## Procesamiento

El vector fusionado es procesado mediante una red neuronal totalmente conectada compuesta por capas densas, mecanismos de normalización y regularización.

Durante esta etapa el modelo aprende relaciones cruzadas entre:

* Características visuales.
* Variables tabulares.
* Interacciones multimodales.

Estas relaciones constituyen uno de los principales beneficios del enfoque híbrido.

---

## Salida

La arquitectura finaliza con una única neurona de salida.

Esta neurona genera un valor continuo correspondiente a la velocidad estimada del impacto.

Al tratarse de una tarea de regresión, la salida no representa probabilidades ni categorías discretas.

El resultado corresponde directamente a una estimación numérica de velocidad.

---

# Ventajas del Enfoque Híbrido

La arquitectura multimodal ofrece múltiples ventajas frente a los enfoques unimodales.

## Mayor capacidad representacional

Permite modelar simultáneamente información visual y estructurada.

## Reducción de ambigüedad

La información faltante en una modalidad puede ser compensada por la otra.

## Mejor capacidad de generalización

La diversidad de información disponible favorece el aprendizaje de patrones más robustos.

## Mayor precisión potencial

La combinación de múltiples fuentes de evidencia suele generar estimaciones más confiables que aquellas obtenidas utilizando una sola modalidad.

---

# Rol dentro del Ecosistema de Modelos

HybridVelocityEstimator representa la culminación del proceso de investigación y desarrollo realizado en el proyecto.

Mientras que:

* ImageVelocityEstimator permite analizar el aporte exclusivo de la información visual.
* TabularVelocityEstimator permite analizar el aporte exclusivo de la información estructurada.

HybridVelocityEstimator integra ambos enfoques dentro de una única arquitectura multimodal.

Por esta razón, constituye el modelo principal del sistema y la alternativa con mayor potencial para su implementación futura dentro de procesos automatizados de análisis de siniestros vehiculares.

Su diseño permite además evolucionar hacia arquitecturas más avanzadas de fusión multimodal, incorporación de nuevas fuentes de información y futuras estrategias de aprendizaje multimodal orientadas a maximizar la precisión y robustez de las estimaciones de velocidad.


---

# Entrenamiento

## Función de pérdida

Los modelos utilizan:

Mean Absolute Error (MAE)

implementado mediante:

L1 Loss

Esta función permite optimizar directamente el error absoluto de estimación.

---

## Optimizador

Se utiliza:

AdamW

debido a:

* Estabilidad numérica.
* Buen desempeño en transferencia de aprendizaje.
* Regularización implícita mediante Weight Decay.

---

## Fine-Tuning Diferencial

Se utilizan tasas de aprendizaje diferenciadas:

### Backbone ResNet50

Learning Rate reducido.

### Embedding Head

Learning Rate intermedio.

### Regression Head

Learning Rate completo.

Esta estrategia evita destruir el conocimiento previamente aprendido por la red preentrenada.

---

# Evaluación

## Métricas Principales

### Mean Absolute Error (MAE)

Mide el error promedio absoluto entre:

Velocidad real vs velocidad predicha.

Menores valores indican mejor desempeño.

---

### Distribución de errores

Se analiza:

* Error medio.
* Error máximo.
* Desviación estándar.
* Percentiles.

---

### Generalización

La evaluación se realiza exclusivamente sobre el conjunto Test para garantizar imparcialidad.

---

# Artefactos de Entrega

Para asegurar replicabilidad y mantenimiento futuro deberán entregarse:

## Código fuente

* Arquitecturas.
* Scripts de entrenamiento.
* Scripts de inferencia.

## Modelos entrenados

Formato:

.pt

para cada variante desarrollada.

## Dataset

Incluyendo:

* Imágenes originales.
* Variables tabulares.
* Archivos de partición Train/Validation/Test.

## Evidencias técnicas

* Curvas de entrenamiento.
* Curvas de validación.
* Métricas MAE.
* Predicciones sobre conjunto Test.
* Gráficas de error.
* Resultados experimentales.

---

# Conclusión

La familia de modelos desarrollada permite abordar el problema de estimación de velocidad desde diferentes perspectivas de información. El enfoque visual captura patrones de daño observables, el enfoque tabular modela relaciones técnicas estructuradas y el enfoque híbrido integra ambas fuentes para generar una representación multimodal más completa del siniestro.

La arquitectura propuesta se diseñó bajo criterios de escalabilidad, reproducibilidad y capacidad de mejora continua, permitiendo futuras iteraciones mediante fine-tuning, incorporación de nuevos datos y expansión de variables de entrada conforme evolucionen las necesidades operativas del proyecto.
