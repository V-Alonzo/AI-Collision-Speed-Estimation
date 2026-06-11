Quiero que generes un sistema completo de interfaces web desktop para “Sistema RAT – CESVI México”, tomando como base obligatoria la plantilla visual real que te proporcioné en capturas.

NO rediseñes la arquitectura general.
NO cambies la lógica de navegación existente.
Debes extender profesionalmente el sistema actual, respetando su estilo y comportamiento real.

## ESTRUCTURA BASE OBLIGATORIA

Mantén exactamente este lenguaje visual:

- Sidebar izquierda vertical, compacta, angosta, colapsada por defecto.
- Iconos centrados en columna dentro del sidebar.
- Ítem activo con fondo claro redondeado.
- Tooltips oscuros pequeños en hover para opciones simples.
- Submenús flotantes blancos para opciones con subniveles.
- Topbar superior azul turquesa.
- Título de pantalla alineado a la izquierda dentro de la topbar.
- En la parte derecha de la topbar: icono tipo grid y avatar circular.
- Área principal grande con fondo gris claro.
- Contenedor principal blanco o muy claro para montar el contenido.
- Footer azul institucional con texto centrado.
- Estilo general institucional, técnico, administrativo y sobrio.

## ESTILO VISUAL

Quiero que el sistema se vea como software real administrativo/pericial ya implementable, no como concepto futurista.

Características:
- institucional
- técnico
- profesional
- sobrio
- limpio
- funcional
- desktop web
- español
- moderno pero compatible con apariencia legacy-modernizada
- sin glassmorphism
- sin efectos futuristas
- sin estilo startup SaaS genérico
- sin e-commerce

## PALETA

- azul turquesa institucional como color principal
- grises claros de fondo
- blanco para paneles, cards, tablas y modales
- gris medio para encabezados de módulos
- azul para botones primarios
- rojo para acciones críticas o iconos administrativos secundarios
- sombras suaves

## COMPONENTES DEL SISTEMA

Genera componentes coherentes y reutilizables:
- sidebar
- topbar
- footer
- cards KPI
- tablas administrativas
- buscadores
- filtros
- selectores
- formularios
- datepickers
- badges de estado
- stepper o wizard
- paneles laterales
- tooltips
- submenús flotantes
- modal centrado
- backdrop oscuro/desenfocado
- botones de acción
- vistas de detalle
- secciones de cálculo
- uploads con miniaturas

## COMPORTAMIENTO REAL DE CATÁLOGOS QUE DEBES RESPETAR

El módulo “Catálogos” NO debe verse como un dashboard visual moderno.
Debe verse como módulo administrativo/tabular del sistema actual.

Diseña Catálogos así:
- Se abre dentro del área principal del layout.
- En la parte superior tiene una fila de filtros compacta.
- Debe incluir al menos:
  - label “Catálogo”
  - icono de ayuda pequeño
  - select desplegable de catálogo
  - botón azul de recargar o actualizar
- Debajo debe existir una franja horizontal gris como encabezado del módulo.
- Dentro de esa franja debe aparecer el nombre del catálogo activo, por ejemplo “Catálogo General”.
- A la derecha de esa franja debe haber iconos de acción como agregar y refrescar.
- Debajo debe mostrarse una tabla administrativa grande, limpia y muy legible.
- La tabla debe incluir columnas como:
  #, Catálogo, Alias, Tipo, Acciones
- Las acciones deben usar iconos pequeños alineados a la derecha.
- El sistema debe verse como gestor interno de catálogos operativos.

## MODAL DE ALTA EN CATÁLOGOS

El alta de un nuevo registro en Catálogos debe comportarse así:
- Modal centrado sobre el contenido.
- Fondo atenuado o desenfocado.
- Modal blanco con sombra suave.
- Título superior, por ejemplo “Nuevo Registro”.
- Formularios organizados en varias filas y columnas.
- Labels alineados arriba de cada campo.
- Campos obligatorios con asterisco rojo.
- Uso de selects y campos de texto compactos.
- Botones al pie alineados a la derecha:
  - CANCELAR
  - GUARDAR
- Botones rectangulares azules estilo institucional.
- El modal debe sentirse consistente con el sistema actual, no con Material Design puro ni con UI futurista.

## CONTEXTO DEL SISTEMA

Este software es un Sistema RAT de CESVI México para reconstrucción y análisis técnico de siniestros viales.
Debe permitir:
- captura de datos del incidente
- captura de datos del vehículo
- captura de ocupantes y carga
- características de la vía
- evidencia fotográfica
- mediciones de deformación
- cálculos automáticos de velocidad
- narrativa técnica
- conclusiones periciales
- reporte final
- administración de catálogos

Debe reflejar entradas manuales, datos autocompletados, variables calculadas y resultados validados por un perito.

## PANTALLAS A GENERAR

### 1. Login
Pantalla institucional de acceso con:
- logo o placeholder CESVI
- correo
- contraseña
- botón iniciar sesión
- recuperar acceso
Debe sentirse parte del mismo sistema.

### 2. Dashboard
Usa la plantilla base.
Debe incluir:
- tarjetas KPI
- casos abiertos
- casos en revisión
- finalizados
- casos con exceso de velocidad detectado
- tabla de expedientes recientes
- gráfico simple de distribución
- accesos rápidos

### 3. Listado de Expedientes RAT
Debe incluir:
- buscador
- filtros por fecha, estado, tipo de hecho y perito
- tabla con:
  número de siniestro, fecha, hora, tipo de hecho, vehículo, estado del análisis, velocidad calculada, exceso de velocidad, acciones
- botón crear expediente
- paginación

### 4. Alta de Caso – Datos del Incidente
Dentro de un wizard o stepper con pasos:
- Incidente
- Vehículo
- Ocupantes
- Vía
- Evidencia
- Deformación
- Cálculo
- Narrativa
- Reporte

Campos:
- número de siniestro
- fecha del hecho
- hora del hecho
- tipo de hecho
- descripción breve
- perito responsable
- observaciones iniciales

### 5. Datos del Vehículo
Campos:
- VIN / número de serie con botón “Autocompletar specs”
- marca
- modelo
- año
- color
- placas
- peso tara
- MMA
- ancho
- largo
- alto
- batalla
- voladizo anterior
- voladizo posterior
- entrevía delantera
- entrevía trasera
- redondez de vértices

Mostrar algunos campos como autocompletados/read-only.

### 6. Ocupantes y Carga
Campos:
- número de ocupantes
- peso del conductor
- peso total de pasajeros
- peso de equipaje/carga

Agregar card de resultado automático:
- masa total del vehículo al momento del accidente

### 7. Ubicación y Características de la Vía
Campos:
- descripción del lugar
- km o punto de referencia
- municipio/estado
- coordenadas GPS
- velocidad máxima permitida
- tipo de vía
- tipo de trazo
- condición de superficie
- tipo de pavimento
- estado de neumático
- coeficiente de adherencia mu
- mu corregido
- inclinación
- radio de curva
- peraltaje

Agregar mapa o placeholder y ayuda contextual.

### 8. Evidencia Fotográfica
Zonas de carga por categorías:
- frontal
- lateral derecho
- lateral izquierdo
- posterior
- partes bajas
- habitáculo
- lugar de hechos
- objeto involucrado

Con:
- drag and drop
- miniaturas
- checklist de evidencia mínima
- indicador de completitud

### 9. Mediciones de Deformación
Debe incluir:
- selector tipo de golpe: frontal, trasero, lateral
- selector número de mediciones: 2, 4 o 6
- campos C1 a C6
- ancho de contacto L
- ángulo FPI
- arqueamiento
- línea de referencia
- diagrama visual del vehículo con puntos de medición
- resumen lateral de variables

### 10. Cálculo de Velocidad
Pantalla analítica con:
- categoría McHenry
- coeficientes A y B
- Dmed
- energía de deformación
- energía corregida por ángulo
- EBS
- velocidad de impacto
- velocidad pre impacto
- tiempo de respuesta de frenos
- velocidad final
- límite permitido
- exceso de velocidad
- delta km/h
- verificación método Limpert

Agregar sección de trazabilidad del cálculo paso a paso.

### 11. Narrativa y Dinámica del Hecho
Campos:
- objeto involucrado
- descripción del objeto fijo
- posición final del vehículo
- dirección de circulación
- distancia PPR al PC
- tiempo de reacción del conductor
- huellas de derrape

Agregar bloque:
- Narrativa sugerida por IA
- botones Aceptar sugerencia, Editar, Regenerar

### 12. Conclusiones y Reporte Final
Secciones:
- principio de intercambio de materiales
- principio de correspondencia
- dinámica de la colisión por fases
- conclusiones periciales validadas

Agregar:
- panel resumen del caso
- vista previa del reporte
- botones Validar conclusiones, Generar PDF, Exportar, Enviar a revisión

### 13. Detalle de Expediente
Vista consolidada del caso con tabs o navegación secundaria:
- Resumen
- Vehículo
- Evidencia
- Deformación
- Cálculos
- Narrativa
- Reporte

### 14. Módulo Catálogos
Muy importante:
diseña este módulo con el comportamiento real observado.

Debe incluir:
- barra superior de filtro de catálogo
- select de catálogo
- botón azul de actualizar
- encabezado gris del módulo
- nombre del catálogo activo
- acciones de agregar y refrescar
- tabla administrativa grande
- iconos de edición/gestión
- scroll interno si es necesario
- modal de nuevo registro
- modal de edición
- vista coherente con sistema legacy administrativo institucional

No lo hagas visualmente “bonito tipo dashboard”; hazlo funcional, realista y profesional.

### 15. Perfil / Usuario
Mostrar:
- datos del usuario
- rol
- expedientes recientes
- configuración básica

## REGLAS IMPORTANTES

- Todas las pantallas deben parecer parte del mismo sistema.
- Respeta estrictamente la navegación base.
- Diseña todo dentro del área central de contenido.
- No conviertas Catálogos en una pantalla moderna de cards; debe seguir siendo un módulo tabular administrativo.
- Usa contenido de ejemplo realista.
- Muestra qué campos son manuales, cuáles automáticos y cuáles calculados.
- Mantén consistencia en tooltips, modales, botones y tablas.
- El resultado debe parecer una mejora profesional del sistema actual de CESVI México.

## ENTREGABLE

Quiero un set completo de pantallas de Figma, listo para demo, consistente, realista y basado en la plantilla actual, incluyendo el comportamiento correcto del módulo Catálogos y sus modales.