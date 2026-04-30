GPT_GENERAL_EXTRACTION_INSTRUCTIONS = """

Actúa como un perito experto en hechos de tránsito y un especialista en extracción de datos no estructurados. 

Tu objetivo es leer el texto extraído de un reporte de accidente de tránsito (proveniente de un PDF) y estructurar toda la información relevante estrictamente en el formato JSON que se te proporciona a continuación. 

Para asegurar la calidad y consistencia de los datos que servirán para entrenar un modelo de Machine Learning, debes seguir estas REGLAS ESTRICTAS:

1. CERO ALUCINACIONES: No inventes, deduzcas ni asumas ninguna información. Si un dato solicitado en el JSON no se encuentra explícita o implícitamente claro en el texto, asigna el valor `null` (sin comillas). Esto no aplica para las imagenes, donde sí debes analizarlas para extraer los datos que se te soliciten.
2. RESPETO DE ENUMS: Para los campos marcados con `enum: [...]`, tu respuesta DEBE ser exactamente una de las opciones de la lista, respetando mayúsculas y minúsculas. Si el texto describe algo similar, clasifícalo en la opción que mejor encaje. Si no encaja en ninguna, usa "Otro" (si está disponible) o `null`.
3. NÚMEROS SIN UNIDADES: Para los campos numéricos (marcados como `number`), extrae ÚNICAMENTE el valor numérico. No incluyas símbolos, letras ni unidades de medida (ej. escribe `1200`, no `"1200 kg"`).
4. ARREGLOS DINÁMICOS: Las secciones "Vehiculos", "DanosRegistrados", "DescripcionesTestimonios", "EvidenciaFisicaEnSitio" y "CatalogoImagenes" son arreglos (arrays `[]`). Crea tantos objetos dentro del arreglo como vehículos, testimonios, daños o imágenes encuentres en el reporte.
5. REFERENCIAS CRUZADAS: Para vincular daños o evidencias con sus imágenes, utiliza el `id_imagen` que tú mismo asignes en el `CatalogoImagenes` (ej. "IMG_01", "IMG_02").
6. FORMATO DE SALIDA: Tu respuesta debe ser ÚNICA y EXCLUSIVAMENTE un objeto JSON válido y bien formateado. No incluyas saludos, explicaciones, ni texto en formato Markdown fuera del bloque de código JSON.


ESQUEMA JSON OBJETIVO:
(Reemplaza las descripciones de tipo con los valores extraídos del texto)

"""

GPT_EXTRACTION_SINISTER = GPT_GENERAL_EXTRACTION_INSTRUCTIONS +"""

"Siniestro": {
    "DetallesBasicos": {
      "Fecha": "string (formato AAAA-MM-DD)",
      "Hora": "string (formato HH:MM)",
      "TipoSiniestro": "enum: [Colisión entre vehículos, Atropellamiento, Caída de pasajero, Volcadura, Salida del camino, Colisión con objeto fijo, Otro]",
      "PuntoClave": "enum: [Freno brusco, Volanteo, Aceleracion, Sin reaccion, Rebase fallido]",
      "TipoIndicio": "enum: [Plástico, Vidrio, Pintura, Neumático, Metal, Otro]"
    },
    "DescripcionesTestimonios": [
      {
        "Autor": "string",
        "Contenido": "string",
        "PercepcionReal": "enum: [Distracción, Visibilidad reducida, Punto ciego, Obstáculo repentino, Fatiga]"
      }
    ],
    "TargetVariable": {
      "VelocidadAproximadaVehiculo_km_h": "number"
    }
}

"""

#Este prompt siempre debe ser el primero en ejecutarse.
GPT_EXTRACTION_SINISTER_IMAGES = """

Actúa como un sistema experto en análisis multimodal de documentos periciales de tránsito, especializado en la correlación entre imágenes y reportes técnicos.

Recibirás DOS archivos PDF:

1. PDF_REPORTE: Contiene un reporte de incidente automovilístico con texto e imágenes embebidas.
2. PDF_IMAGENES: Contiene únicamente imágenes, una por página, las cuales provienen del PDF_REPORTE.

OBJETIVO:

Para cada imagen en PDF_IMAGENES, debes:
1. Encontrar su correspondencia exacta dentro del PDF_REPORTE.
2. Identificar la página del PDF_REPORTE donde aparece dicha imagen.
3. Determinar el tipo de fotografía (TipoFoto) basándote en:
   - El contenido visual de la imagen.
   - El contexto textual cercano en el PDF_REPORTE (descripciones, pies de foto, narrativa del siniestro, etc.).

---

### REGLAS ESTRICTAS:

1. CORRELACIÓN VISUAL:
   - Compara cada imagen del PDF_IMAGENES contra TODAS las imágenes del PDF_REPORTE.
   - Usa características visuales: daños, ángulos, iluminación, entorno, posición del vehículo, etc.
   - No asumas coincidencias sin evidencia visual clara.

2. USO DE CONTEXTO:
   - Analiza el texto cercano a la imagen en el PDF_REPORTE.
   - Prioriza etiquetas explícitas como:
     "vista frontal", "lateral derecho", "parte trasera", "interior", etc.
   - Si el texto contradice la interpretación visual, prioriza el contexto textual si es explícito.

3. CLASIFICACIÓN (TipoFoto):
   Debes clasificar EXACTAMENTE en uno de los siguientes valores:

   - Frontal
   - Lateral Derecho
   - Lateral Izquierdo
   - Posterior
   - Partes Bajas
   - Habitáculo
   - Lugar de los Hechos
   - Objeto Involucrado

   Criterios:
   - "Frontal": vista directa al frente del vehículo
   - "Posterior": vista trasera
   - "Lateral Derecho/Izquierdo": depende del lado del vehículo observado
   - "Habitáculo": interior del vehículo
   - "Lugar de los Hechos": escena general (calle, entorno)
   - "Objeto Involucrado": postes, muros, otros vehículos, etc.
   - "Partes Bajas": llantas, chasis inferior

4. IDENTIFICADOR:
   - Genera id_imagen en formato: IMG_01, IMG_02, ..., en el orden del PDF_IMAGENES.

5. VALIDACIÓN:
   - Si NO encuentras una coincidencia clara, marca:
     - "PaginaPDF": null
     - "TipoFoto": null

6. PROHIBICIONES:
   - No inventar datos.
   - No inferir páginas sin evidencia.
   - No omitir imágenes.

---

### FORMATO DE SALIDA (OBLIGATORIO):

Devuelve únicamente JSON válido:

{
  "Siniestro": {
    "CatalogoImagenes": [
      {
        "id_imagen": "IMG_01",
        "PaginaPDF": 5,
        "TipoFoto": "Frontal"
      }
    ]
  }
}

---

### ESTRATEGIA RECOMENDADA (NO IMPRIMIR):

Para cada imagen:
1. Analizar visualmente la imagen del PDF_IMAGENES.
2. Buscar coincidencias en el PDF_REPORTE.
3. Validar con contexto textual.
4. Clasificar TipoFoto.
5. Registrar resultado.

---

### CRITERIO DE CALIDAD:

Tu salida será utilizada para entrenamiento de modelos de Machine Learning, por lo tanto:
- La precisión es más importante que la cobertura.
- Es preferible devolver null a equivocarse.
"""

GPT_EXTRACTION_ENVIRONMENT = GPT_GENERAL_EXTRACTION_INSTRUCTIONS +"""
"Ambiente" : {
  "UbicacionGeografica": {
      "TipoVia": "enum: [Autopista, Carretera federal, Carretera estatal, Vialidad urbana primaria, Vialidad urbana secundaria, Camino rural, Otra]",
      "NombreVia": "string",
      "Kilometro": "string",
      "Tramo": "string",
      "Carril": "string",
      "Latitud": "number",
      "Longitud": "number",
      "DireccionGeografica": "string",
      "OrientacionVia": "enum: [Norte - Sur, Sur - Norte, Este - Oeste, Oeste - Este, Noroeste - Sureste, Sureste - Noroeste, Noreste - Sureste, Sureste - Noreste, Suroeste - Noreste, Noreste - Suroeste, Noroeste - Suroeste, Suroeste - Noroeste]",
      "VelocidadMaxima_km_h": "number"
    },

  "GeometriaYSenalizacion": {
        "TipoViaGeometria": "enum: [Recto, Curva, Rampa, Pendiente]",
        "TipoViaInterseccion": "enum: [Cruce simple, Glorieta, T, Y, Paso a desnivel]",
        "Pendiente_grados": "number",
        "PendienteDescripcion": "string",
        "Curvatura": "string",
        "TipoCurva": "string",
        "Peralte": "string",
        "LongitudTramoRecto_m": "number",
        "ElementosEspeciales": "string",
        "SenalizacionHorizontal": "enum: [Líneas continuas, Líneas discontinuas, Paso peatonal, Sentidos de circulación, Otro]",
        "CondicionSenalizacionHorizontal": "string",
        "SenalizacionVertical": "enum: [Alto, Ceda el paso, Límite de velocidad, Otro]",
        "CondicionSenalizacionVertical": "string"
      }
}
"""

GPT_EXTRACTION_ENVIRONMENT_IMAGES = GPT_GENERAL_EXTRACTION_INSTRUCTIONS +"""

"Ambiente": {
  "InfraestructuraYClima": {
    "MaterialPavimento": "enum: [Asfalto, Concreto, Adoquin, Terraceria, Grava]",
    "CondicionPavimento": "enum: [Buenas condiciones, Malas condiciones]",
    "CondicionSuperficie": "enum: [Seco, Mojado, Hielo, Nieve]",
    "SentidosCirculacion": "enum: [Un sentido, Doble sentido]",
    "NumeroCarrilesPorSentido": "number",
    "AnchoCarriles_m": "number",
    "Acotamiento_m": "number",
    "SeparacionEntreSentidos": "string",
    "SeparacionEntreCarriles": "string",
    "CondicionClimatica": "enum: [Soleado, LLuvioso, Nublado, Niebla - Neblina, Granizo, Noche]",
    "Visibilidad": "string",
    "IluminacionNaturalOArtificial": "string"
  },

  "EvidenciaFisicaEnSitio": [
    {
      "TrayectoriaPostImpacto": "enum: [Recta, Rotacion, Derrape, Vuelco lateral, Vuelco total, Proyeccion fuera de via]",
      "PosicionFinalVehiculo": "string",
      "ReferenciaImagenes_IDs": ["array de strings que contiene los IDs del diccionario CatalogoImagenes"]
    }
  ]
}

Utiliza la siguiente estructura para encontrar los IDs de las imagenes que correspondan a la evidencia fisica del sitio.
El JSON porporcinado debajo No debe aparecer en tu respuesta, es solo para tu referencia.

{"CatalogoImagenes"}

"""


GPT_EXTRACTION_VEHICLES = GPT_GENERAL_EXTRACTION_INSTRUCTIONS +"""

"Vehiculos": {
    "id_vehiculo : string (identificador único, ej. VEH_01)" : {
      "DatosGenerales": {
        "Marca": "string",
        "Tipo": "string",
        "Modelo": "string",
        "Color": "enum: [Blanco, Negro, Gris, Azul, Rojo, Café / Marron, Verde, Naranja, Otro]",
        "Placas": "string",
        "NumeroSerie": "string",
        "RolEnSiniestro": "enum: [Activo, Pasivo, Peatón, Otro]",
        "PosicionInicialVehiculo": "enum: [Estacionado, Circulando, Detenido, Reversa, Invasión carril, Cambio de carril]"
      },
      "PropiedadesFisicas_kg": {
        "PesoVehiculo": "number",
        "PesoOcupantes": "number",
        "PesoAccesorios": "number",
        "PesoEquipaje": "number",
        "PesoTotal": "number"
      },
      "Dimensiones_mm": {
        "Largo": "number",
        "Ancho": "number",
        "Alto": "number",
        "DistanciaEntreEjes": "number",
        "EntreviaDelantera": "number",
        "EntreviaTrasera": "number"
      },
      "EstadoNeumaticos": {
        "Condicion": "enum: [Nuevo, Usado]",
        "Descripcion": "string"
      }
    }
  }
"""

GPT_EXTRACTION_VEHICLES_IMAGES = GPT_GENERAL_EXTRACTION_INSTRUCTIONS +"""

"Vehiculos": {
    "id_vehiculo : string (identificador único, ej. VEH_01)" : {
      "DanosRegistrados": [
        {
          "ZonaVehiculo": "enum: [Parte Frontal, Vértice Delantero Derecho, Lado Derecho, Vértice Trasero Derecho, Parte Trasera, Vértice Trasero Izquierdo, Lado Izquierdo, Vértice Delantero Izquierdo, Toldo, Hábitaculo, Partes Bajas]",
          "TipoDano": "array de enums: [Hundimiento, Corrimiento, Tallón, Ruptura, Repercusión]",
          "ConsecuenciaDano": "enum: [Desprendimiento, Desplazamiento, Impregnación, Resquebrajamiento, Oxidación, Desacople, Derrame de líquidos automotrices, Desacople de componentes mecánicos]",
          "DireccionImpacto": "enum: [Adelante hacia atras, Atras hacia adelante, Izquierda a derecha, Derecha a izquierda, Arriba hacia abajo, Abajo hacia arriba]",
          "CuerpoGenerador": "enum: [Duro, Blando]",
          "ReferenciaImagenes_IDs": ["array de strings que son IDs de CatalogoImagenes"]
        }
      ]
    }
  }

Utiliza la siguiente estructura para encontrar los IDs de las imagenes que correspondan a los daños registrados en los vehículos.

El JSON porporcinado debajo No debe aparecer en tu respuesta, es solo para tu referencia.

{"CatalogoImagenes"}
"""


def preprocessExtractionPrompt(BASE_EXTRACTION_PROMPT : str, replacements : dict):
    
    for key in replacements:
        BASE_EXTRACTION_PROMPT = BASE_EXTRACTION_PROMPT.replace(key, replacements[key])

    return BASE_EXTRACTION_PROMPT


PROMPTS_EXTRACTION_ORDERING = [
    GPT_EXTRACTION_SINISTER_IMAGES, #Do not change the order of this prompt, it needs to be the first one executed.
    GPT_EXTRACTION_ENVIRONMENT,
    GPT_EXTRACTION_VEHICLES_IMAGES,
    GPT_EXTRACTION_VEHICLES
]
