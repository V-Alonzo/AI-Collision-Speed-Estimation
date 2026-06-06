import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, VerticalAlign, PageNumber, PageBreak,
  ImageRun, TabStopType,
  HorizontalPositionRelativeFrom, VerticalPositionRelativeFrom, TextWrappingType
} from 'docx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const rutaSalida = process.argv[2];
const datos = JSON.parse(fs.readFileSync(process.argv[3], 'utf-8'));

// ── Constantes de color ───────────────────────────────────────────────────────
const BLUE    = '1F6AA5';
const CYAN    = '00B0F0';
const GRAY_BG = 'F2F2F2';
const WHITE   = 'FFFFFF';
const BLACK   = '000000';

const val = (v) => (v && v !== 'null' && v !== 'undefined') ? String(v) : '---';

const borde  = (color = 'CCCCCC') => ({ style: BorderStyle.SINGLE, size: 6, color });
const bordes = (color = 'CCCCCC') => ({
  top: borde(color), bottom: borde(color),
  left: borde(color), right: borde(color),
});

const celda = (txt, opts = {}) => new TableCell({
  borders: bordes(opts.borderColor || 'CCCCCC'),
  width: { size: opts.width || 4680, type: WidthType.DXA },
  shading: opts.fill ? { fill: opts.fill, type: ShadingType.CLEAR } : undefined,
  margins: { top: 80, bottom: 80, left: 140, right: 140 },
  verticalAlign: VerticalAlign.CENTER,
  columnSpan: opts.span,
  children: [new Paragraph({
    alignment: opts.align || AlignmentType.LEFT,
    children: [new TextRun({
      text: txt, bold: opts.bold || false,
      size: opts.size || 20, color: opts.color || BLACK, font: 'Arial',
    })],
  })],
});

const heading1 = (num, titulo) => new Paragraph({
  heading: HeadingLevel.HEADING_1,
  spacing: { before: 240, after: 120 },
  children: [new TextRun({ text: `${num}    ${titulo.toUpperCase()}`, bold: true, size: 24, color: BLUE, font: 'Arial' })],
});
const heading2 = (num, titulo) => new Paragraph({
  heading: HeadingLevel.HEADING_2,
  spacing: { before: 160, after: 80 },
  children: [new TextRun({ text: `${num}    ${titulo}`, bold: true, size: 22, color: BLUE, font: 'Arial' })],
});
const parrafo = (texto, opts = {}) => new Paragraph({
  alignment: opts.align || AlignmentType.JUSTIFIED,
  spacing: { before: opts.before || 80, after: opts.after || 80, line: 276 },
  children: [new TextRun({
    text: texto, size: opts.size || 20, bold: opts.bold || false,
    color: opts.color || BLACK, font: 'Arial',
  })],
});
const lineaVacia = () => new Paragraph({ children: [new TextRun({ text: '' })] });

// ── Logo CESVI ────────────────────────────────────────────────────────────────
let logoRun = null;
const logoPath = path.join(__dirname, '..', '..', 'public', 'img', 'cesvi_logo.png');
if (fs.existsSync(logoPath)) {
  logoRun = new ImageRun({
    data: fs.readFileSync(logoPath),
    transformation: { width: 130, height: 55 },
    type: 'png',
  });
}

// ── Imágenes de fondo (opcionales) ───────────────────────────────────────────
// Coloca los PNGs en BackEnd/web/public/templates/
//   cesvi_portada.png  →  fondo para la portada
//   cesvi_pagina.png   →  fondo para las páginas de contenido
// Genera estos PNGs exportando cada página de tu PDF plantilla a 150+ DPI.
let bgPortada = null;
let bgPagina  = null;

try {
  const p = path.join(__dirname, '..', '..', 'public', 'templates', 'cesvi_portada.png');
  if (fs.existsSync(p)) bgPortada = fs.readFileSync(p);
} catch (_) {}
try {
  const p = path.join(__dirname, '..', '..', 'public', 'templates', 'cesvi_pagina.png');
  if (fs.existsSync(p)) bgPagina = fs.readFileSync(p);
} catch (_) {}

const usarBackground = bgPortada !== null || bgPagina !== null;


// Crea un Paragraph con la imagen de fondo flotante para insertar en el Header.
// Al estar en el encabezado con behindDocument=true, la imagen aparece detrás
// del texto en TODAS las páginas de esa sección (técnica de marca de agua Word).
function bgParaFullPage(buffer) {
  return new Paragraph({
    children: [
      new ImageRun({
        data: buffer,
        transformation: { width: 816, height: 1056 }, // 8.5" × 11" a 96 DPI
        type: 'png',
        floating: {
          horizontalPosition: {
            relative: HorizontalPositionRelativeFrom.PAGE,
            offset: 0,
          },
          verticalPosition: {
            relative: VerticalPositionRelativeFrom.PAGE,
            offset: 0,
          },
          behindDocument: true,
          allowOverlap: true,
          wrap: { type: TextWrappingType.NONE },
        },
      }),
    ],
  });
}

// ── Encabezado y pie programáticos (se usan cuando no hay fondo PNG) ──────────
const headerEstandar = new Header({
  children: [
    new Paragraph({
      border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: CYAN, space: 4 } },
      children: [
        ...(logoRun
          ? [logoRun]
          : [new TextRun({ text: 'CESVI MÉXICO', bold: true, size: 28, color: BLUE, font: 'Arial' })]),
        new TextRun({ text: '\t\t', font: 'Arial' }),
        new TextRun({ text: 'FOR-MPT-RAT-04 Rev. 00', size: 16, color: '888888', font: 'Arial' }),
      ],
      tabStops: [{ type: TabStopType.RIGHT, position: 9000 }],
    }),
  ],
});

const footerEstandar = new Footer({
  children: [
    new Paragraph({
      border: { top: { style: BorderStyle.SINGLE, size: 6, color: CYAN, space: 4 } },
      children: [
        new TextRun({ text: 'Calle Uno Sur No. 101 Parque Industrial Toluca 2000  |  C.P. 50233 Toluca, Estado de México.', size: 16, color: '888888', font: 'Arial' }),
        new TextRun({ text: '\t', font: 'Arial' }),
        new TextRun({ text: 'Página ', size: 16, color: '888888', font: 'Arial' }),
        new TextRun({ children: [PageNumber.CURRENT] }),
      ],
      tabStops: [{ type: TabStopType.RIGHT, position: 9000 }],
    }),
  ],
});

// Pie solo con número de página (cuando el fondo PNG ya incluye el diseño del pie)
const footerSoloPagina = new Footer({
  children: [
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [
        new TextRun({ text: 'Página ', size: 18, color: '888888', font: 'Arial' }),
        new TextRun({ children: [PageNumber.CURRENT] }),
      ],
    }),
  ],
});

const headerVacio = new Header({ children: [new Paragraph({ children: [] })] });
const footerVacio = new Footer({ children: [new Paragraph({ children: [] })] });

// ── Selección de header/footer según disponibilidad de fondo ─────────────────
const headerPortadaFinal    = (usarBackground && bgPortada)
  ? new Header({ children: [bgParaFullPage(bgPortada)] })
  : headerVacio;  // portada sin encabezado programático da aspecto más limpio

const headerContenidoFinal  = (usarBackground && bgPagina)
  ? new Header({ children: [bgParaFullPage(bgPagina)] })
  : headerEstandar;

const footerContenidoFinal  = usarBackground
  ? footerSoloPagina
  : footerEstandar;

// ── Márgenes de página ────────────────────────────────────────────────────────
const pageSize = { width: 12240, height: 15840 }; // Carta 8.5" × 11"

// Con fondo PNG: márgenes más generosos para que el texto caiga dentro del
// área de contenido del template (ajusta si tu plantilla tiene otras proporciones)
// Portada: top grande para que el texto quede en la zona blanca central
// (la plantilla CESVI tiene el logo arriba y decoración lateral izquierda)
const marginPortada = usarBackground
  ? { top: 4680, right: 1440, bottom: 2880, left: 1800 }  // 3.25" top, 2" bottom, 1.25" left
  : { top: 1080, right: 1080, bottom: 1080, left: 1080 };

// Contenido: márgenes razonables dentro del área blanca del template
const marginContenido = usarBackground
  ? { top: 1800, right: 1080, bottom: 1440, left: 1800 }  // 1.25" top/left, 1" bottom/right
  : { top: 1080, right: 1080, bottom: 1080, left: 1080 };

// ── Portada ───────────────────────────────────────────────────────────────────
const tipoDoc   = val(datos.tipo_documento).toUpperCase();
const modalidad = val(datos.tipo_hecho).toUpperCase();

// Texto de portada en un solo bloque, igual que los reportes reales:
// "[TIPO], HECHO DE TRÁNSITO, EN SU MODALIDAD [TIPO_HECHO] EN EL QUE SE VIO INVOLUCRADO..."
const textoCubierta =
  `${tipoDoc}, HECHO DE TRÁNSITO, EN SU MODALIDAD ${modalidad} ` +
  `EN EL QUE SE VIO INVOLUCRADO EL VEHÍCULO MARCA ${val(datos.marca).toUpperCase()}, ` +
  `TIPO ${val(datos.submarca).toUpperCase()}, COLOR ${val(datos.color).toUpperCase()} ` +
  `MODELO ${val(datos.anio)}, CON PLACAS DE CIRCULACIÓN ${val(datos.numero_placas).toUpperCase()}, ` +
  `NÚMERO DE SERIE ${val(datos.vin).toUpperCase()} ` +
  `CON DIRECCIÓN EN ${val(datos.calle).toUpperCase()}, ${val(datos.municipio).toUpperCase()}.`;

const portada = [
  lineaVacia(),
  new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { before: 200, after: 200 },
    children: [new TextRun({ text: textoCubierta, bold: true, size: 22, color: BLACK, font: 'Arial' })],
  }),
  lineaVacia(),
  new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { before: 80, after: 80 },
    children: [new TextRun({ text: `SINIESTRO: ${val(datos.numero_siniestro)}.`, bold: true, size: 22, color: BLACK, font: 'Arial' })],
  }),
];

// ── Tabla de contenido ────────────────────────────────────────────────────────
const seccionesIdx = [
  ['1', 'OBJETIVO TÉCNICO', ''],
  ['2', 'FUNDAMENTOS DEL ESTUDIO', ''],
  ['3', 'CARACTERÍSTICAS DEL VEHÍCULO BAJO ESTUDIO', ''],
  ['4', 'OBSERVACIÓN DE DAÑOS EN EL VEHÍCULO', ''],
  ['5', 'LUGAR DE INTERVENCIÓN', ''],
  ['6', 'CONSIDERACIONES', ''],
  ['7', 'CONCLUSIONES', ''],
  ['8', 'ANÁLISIS DE VELOCIDAD (McHenry CRASH3)', ''],
];
const filasIdx = seccionesIdx.map(([n, t, p]) =>
  new TableRow({ children: [
    celda(n, { width: 600 }),
    celda(t, { width: 7560 }),
    celda(p, { width: 1200, align: AlignmentType.RIGHT }),
  ]}),
);
const tablaContenido = [
  heading1('', 'CONTENIDO'),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [600, 7560, 1200],
    rows: filasIdx,
  }),
  new Paragraph({ children: [new PageBreak()] }),
];

// ── Sección 1 – Objetivo técnico ──────────────────────────────────────────────
const seccion1 = [
  heading1('1', 'OBJETIVO TÉCNICO'),
  parrafo(
    `El presente ${tipoDoc.toLowerCase()} tiene como objetivo determinar si los daños que presenta el ` +
    `vehículo: marca ${val(datos.marca)}, tipo ${val(datos.submarca)}, color ${val(datos.color)}, ` +
    `modelo ${val(datos.anio)}, placas de circulación ${val(datos.numero_placas)}, número de serie ` +
    `${val(datos.vin)}, se generan conforme a lo establecido en la narrativa del accidente, además de ` +
    `brindar comentarios objetivos y técnico-científicos que auxilien a quien corresponda para la toma ` +
    `de decisiones que así se consideren.`
  ),
  lineaVacia(),
];

// ── Sección 2 – Fundamentos del estudio ──────────────────────────────────────
const seccion2 = [
  heading1('2', 'FUNDAMENTOS DEL ESTUDIO'),
  parrafo(
    `Se analizará el hecho bajo estudio aplicando los métodos científicos, las técnicas de investigación ` +
    `desarrolladas por las ciencias auxiliares de la criminalística; así como en la observación de los ` +
    `daños que exhiben los vehículos bajo estudio, por medio de fotografías; con información proporcionada ` +
    `por la compañía de seguros e información desarrollada por CESVI México.`
  ),
  lineaVacia(),
];

// ── Sección 3 – Características del vehículo ─────────────────────────────────
const filasVehiculo = [
  ['DATOS', `VEHÍCULO ${val(datos.rol)}`],
  ['MARCA',        val(datos.marca)],
  ['TIPO',         val(datos.submarca)],
  ['MODELO',       val(datos.anio)],
  ['COLOR',        val(datos.color)],
  ['NO. DE SERIE', val(datos.vin)],
  ['PLACAS',       val(datos.numero_placas)],
  ['ROL',          val(datos.rol)],
].map(([k, v], i) => new TableRow({
  children: [
    celda(k, { width: 4680, bold: i === 0, fill: i === 0 ? BLUE : (i % 2 === 0 ? GRAY_BG : WHITE), color: i === 0 ? WHITE : BLACK }),
    celda(v, { width: 4680, bold: i === 0, fill: i === 0 ? BLUE : (i % 2 === 0 ? GRAY_BG : WHITE), color: i === 0 ? WHITE : BLACK, align: AlignmentType.CENTER }),
  ],
}));
const seccion3 = [
  heading1('3', 'CARACTERÍSTICAS DEL VEHÍCULO BAJO ESTUDIO'),
  new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: [4680, 4680], rows: filasVehiculo }),
  lineaVacia(),
];

// ── Sección 4 – Observación de daños (fotos) ─────────────────────────────────
function buildFotoGrid(fotos) {
  const rows = [];
  for (let i = 0; i < fotos.length; i += 2) {
    const cells = [];
    for (let j = i; j < Math.min(i + 2, fotos.length); j++) {
      let imgChild;
      try {
        const imgData = fs.readFileSync(fotos[j].ruta);
        const ext = fotos[j].ruta.split('.').pop().toLowerCase();
        imgChild = new ImageRun({ data: imgData, transformation: { width: 275, height: 206 }, type: ext === 'png' ? 'png' : 'jpg' });
      } catch (_) {
        imgChild = new TextRun({ text: '[imagen no disponible]', size: 18, color: '888888', font: 'Arial' });
      }
      const cellChildren = [
        new Paragraph({ alignment: AlignmentType.CENTER, children: [imgChild] }),
      ];
      if (fotos[j].descripcion) {
        cellChildren.push(new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 40, after: 40 },
          children: [new TextRun({ text: fotos[j].descripcion, size: 16, color: '666666', font: 'Arial', italics: true })],
        }));
      }
      cells.push(new TableCell({
        width: { size: 4680, type: WidthType.DXA },
        borders: bordes('DDDDDD'),
        margins: { top: 60, bottom: 60, left: 60, right: 60 },
        children: cellChildren,
      }));
    }
    if (cells.length === 1) {
      cells.push(new TableCell({
        width: { size: 4680, type: WidthType.DXA },
        borders: bordes('DDDDDD'),
        children: [new Paragraph({ children: [] })],
      }));
    }
    rows.push(new TableRow({ children: cells }));
  }
  return rows;
}

const fotosArr  = Array.isArray(datos.fotos) ? datos.fotos : [];
const ORDEN_FOTOS = ['Frontal','Lateral Derecho','Lateral Izquierdo','Posterior','Partes Bajas','Habitaculo','Lugar de los Hechos','Objeto Involucrado'];
const fotosPorTipo = fotosArr.reduce((acc, f) => {
  const t = f.tipo || 'Fotografías';
  if (!acc[t]) acc[t] = [];
  acc[t].push(f);
  return acc;
}, {});
const tiposOrdenados = [
  ...ORDEN_FOTOS.filter(t => fotosPorTipo[t]),
  ...Object.keys(fotosPorTipo).filter(t => !ORDEN_FOTOS.includes(t)),
];

const seccion4 = [
  heading1('4', 'OBSERVACIÓN DE DAÑOS EN EL VEHÍCULO'),
  parrafo(
    `A continuación se presentan las fotografías del vehículo: MARCA ${val(datos.marca).toUpperCase()}, ` +
    `TIPO ${val(datos.submarca).toUpperCase()}, COLOR ${val(datos.color).toUpperCase()}, ` +
    `MODELO ${val(datos.anio)}, PLACAS ${val(datos.numero_placas)}.`
  ),
  lineaVacia(),
];

if (fotosArr.length === 0) {
  seccion4.push(parrafo('Sin fotografías registradas.'));
} else {
  tiposOrdenados.forEach((tipo, idx) => {
    seccion4.push(heading2(`4.${idx + 1}`, tipo.toUpperCase()));
    seccion4.push(new Table({
      width: { size: 9360, type: WidthType.DXA },
      columnWidths: [4680, 4680],
      rows: buildFotoGrid(fotosPorTipo[tipo]),
    }));
    seccion4.push(lineaVacia());
  });
}
seccion4.push(lineaVacia());

// ── Sección 5 – Lugar de intervención ────────────────────────────────────────
const seccion5 = [
  heading1('5', 'LUGAR DE INTERVENCIÓN'),
  parrafo(
    `El lugar declarado como de intervención se ubica en ${val(datos.calle)}, ` +
    `perteneciente a ${val(datos.municipio)}, en el estado de ${val(datos.estado)}.`
  ),
  parrafo(
    `La vía de intervención es de tipo ${val(datos.tipo_via)}, con trazo ${val(datos.tipo_trazo)}, ` +
    `velocidad máxima permitida de ${val(datos.velocidad_maxima)} km/h, ` +
    `pavimento tipo ${val(datos.pavimento)}, condiciones climáticas: ${val(datos.clima)}, ` +
    `coeficiente de adherencia (μ) = ${val(datos.mu)}.`
  ),
  lineaVacia(),
];

// ── Sección 6 – Consideraciones ──────────────────────────────────────────────
const dinamicaFases = val(datos.dinamica_fases);
const seccion6 = [
  heading1('6', 'CONSIDERACIONES'),
  parrafo(
    'Se realizará el hecho bajo estudio aplicando los métodos científicos, método inductivo, método ' +
    'deductivo y método descriptivo, así como técnicas de investigación desarrolladas por las ciencias ' +
    'Auxiliares de la Criminalística; así como en la información proporcionada por la compañía de seguros ' +
    'e información desarrollada por CESVI MÉXICO.'
  ),
  lineaVacia(),
  heading2('6.1', 'Declaración del conductor'),
  parrafo(val(datos.narracion_hechos)),
  lineaVacia(),
  heading2('6.2', 'Principio de intercambio o transferencia de materiales'),
  parrafo(val(datos.intercambio_materiales)),
  lineaVacia(),
  heading2('6.3', 'Principio de correspondencia de características'),
  parrafo(val(datos.correspondencia)),
  lineaVacia(),
  heading2('6.4', 'Dinámica de colisión'),
  parrafo(dinamicaFases !== '---' ? dinamicaFases : 'Sin dinámica de colisión registrada.'),
  lineaVacia(),
];

// ── Sección 7 – Conclusiones ──────────────────────────────────────────────────
const conclusionesTxt      = val(datos.conclusiones);
const conclusionesParrafos = conclusionesTxt
  .split('\n')
  .map(l => l.trim())
  .filter(Boolean)
  .map((c, i) => parrafo(`${i + 1}.- ${c}`, { before: 100, after: 100 }));

const seccion7 = [
  heading1('7', 'CONCLUSIONES'),
  ...(conclusionesParrafos.length > 0 ? conclusionesParrafos : [parrafo('Sin conclusiones registradas.')]),
  lineaVacia(),
];

// ── Sección 8 – Análisis de velocidad (McHenry CRASH3) ───────────────────────
const cMediciones = [];
for (let i = 1; i <= 6; i++) {
  const v = parseFloat(datos[`c${i}_m`]);
  if (!isNaN(v) && v > 0) cMediciones.push({ label: `C${i}`, m: v });
}
const L_m      = parseFloat(datos.l_ancho_m)   || 0;
const A_cof    = parseFloat(datos.a_rigidez)   || 0;
const B_cof    = parseFloat(datos.b_rigidez)   || 0;
const alphaDeg = parseFloat(datos.angulo_fpi)  || 0;
const Vf_rep   = parseFloat(datos.velocidad_final) || 0;
const Vmax_rep = parseFloat(datos.velocidad_maxima) || 0;
const n_rep    = cMediciones.length;
const hasCalcData = n_rep >= 2 && L_m > 0 && A_cof > 0 && B_cof > 0;

const f2 = (v) => (isNaN(parseFloat(v)) ? '---' : parseFloat(v).toFixed(2));
const f4 = (v) => (isNaN(parseFloat(v)) ? '---' : parseFloat(v).toFixed(4));
const fN = (v, d=2) => (isNaN(parseFloat(v)) ? '---' : parseFloat(v).toLocaleString('en-US', { maximumFractionDigits: d }).replace(/,/g, ' '));

const paso = (num, titulo, lineas) => [
  new Paragraph({
    spacing: { before: 200, after: 60 },
    children: [new TextRun({ text: `Paso ${num}: ${titulo}`, bold: true, size: 20, color: BLUE, font: 'Arial' })],
  }),
  ...lineas.map(l => new Paragraph({
    spacing: { before: 40, after: 40 },
    indent: { left: 480 },
    children: [new TextRun({ text: l, size: 18, font: 'Courier New', color: '111111' })],
  })),
];

const seccion8 = [
  heading1('8', 'ANÁLISIS DE VELOCIDAD'),
  parrafo(
    'Se presenta el análisis de velocidad mediante el Método McHenry CRASH3, técnica forense que ' +
    'determina la velocidad de impacto a partir de la integración numérica de la energía de deformación ' +
    'registrada en el vehículo bajo estudio.'
  ),
  lineaVacia(),
  heading2('8.1', 'Datos de entrada'),
];

const colW8 = [2400, 2800, 4160];
const filasEnt = [
  ['PARÁMETRO', 'VALOR', 'DESCRIPCIÓN'],
  ...cMediciones.map((c, i) => [
    c.label,
    `${(c.m * 1000).toFixed(1)} mm  (${c.m.toFixed(4)} m)`,
    `Deformación medida en punto ${i + 1}`,
  ]),
  ['L — Ancho de contacto',     L_m  > 0 ? `${(L_m * 1000).toFixed(1)} mm  (${L_m.toFixed(4)} m)` : '---',           'Ancho de la zona de contacto'],
  ['n — Mediciones',            `${n_rep} puntos`,                                                                       'Número de puntos de deformación'],
  ['A — Rigidez lineal',        A_cof > 0 ? `${fN(A_cof,0)} N/m`  : '---',                                             'Coeficiente CRASH3 lineal del vehículo'],
  ['B — Rigidez cuadrática',    B_cof > 0 ? `${fN(B_cof,0)} N/m²` : '---',                                             'Coeficiente CRASH3 no lineal del vehículo'],
  ['α — Ángulo FPI',            `${alphaDeg}°`,                                                                          'Ángulo del vector fuerza-impulso'],
  ['Vf — Vel. post-impacto',    `${f2(Vf_rep)} km/h`,                                                                   'Velocidad al detenerse tras el impacto'],
  ['V_lim — Vel. máx. permit.', Vmax_rep > 0 ? `${Vmax_rep} km/h` : '---',                                             'Límite de velocidad en la vía'],
];
seccion8.push(new Table({
  width: { size: 9360, type: WidthType.DXA },
  columnWidths: colW8,
  rows: filasEnt.map((row, ri) => new TableRow({
    children: row.map((cell, ci) => celda(cell, {
      width: colW8[ci],
      fill:  ri === 0 ? BLUE : (ri % 2 === 0 ? GRAY_BG : WHITE),
      color: ri === 0 ? WHITE : BLACK,
      bold:  ri === 0,
      size:  18,
    })),
  })),
}));
seccion8.push(lineaVacia());

// 8.2 Trazabilidad
seccion8.push(heading2('8.2', 'Trazabilidad del cálculo'));

if (!hasCalcData) {
  seccion8.push(parrafo('No hay suficientes datos de deformación para mostrar la trazabilidad completa.'));
} else {
  const C    = cMediciones.map(c => c.m);
  const h    = L_m / (n_rep - 1);

  let sumA = C[0] + C[n_rep - 1];
  for (let i = 1; i < n_rep - 1; i++) sumA += 2 * C[i];

  let sumB = C[0]*C[0] + C[n_rep-1]*C[n_rep-1];
  for (let i = 1; i < n_rep - 1; i++) sumB += 2 * C[i]*C[i];
  for (let i = 0; i < n_rep - 1; i++) sumB += C[i] * C[i+1];

  const termA    = (A_cof / 2) * sumA;
  const termB    = (B_cof / 6) * sumB;
  const residual = L_m * A_cof * A_cof / (2 * B_cof);
  const Ed_calc  = h * (termA + termB) + residual;
  const tanAlpha = Math.tan(alphaDeg * Math.PI / 180);
  const Ecorr_calc = Ed_calc * Math.pow(1 + tanAlpha, 2);
  const Dmed_rep   = C.reduce((a, v) => a + v, 0) / n_rep;

  const sumA_str = cMediciones.map((c, i) =>
    (i === 0 || i === n_rep - 1) ? c.m.toFixed(4) : `2×${c.m.toFixed(4)}`
  ).join(' + ');
  const sq_str = cMediciones.map((c, i) => {
    const sq = (c.m * c.m).toFixed(6);
    return (i === 0 || i === n_rep - 1) ? sq : `2×${sq}`;
  }).join(' + ');
  const cr_str = cMediciones.slice(0,-1).map((c,i) =>
    `${c.m.toFixed(4)}×${cMediciones[i+1].m.toFixed(4)}`
  ).join(' + ');

  seccion8.push(...paso(1, 'Espaciado entre puntos de medición', [
    `h = L / (n − 1) = ${L_m.toFixed(4)} / ${n_rep - 1} = ${h.toFixed(4)} m`,
  ]));
  seccion8.push(...paso(2, 'Suma ponderada (sumA = C1 + 2·C2 + … + 2·C(n-1) + Cn)', [
    `sumA = ${sumA_str}`,
    `sumA = ${sumA.toFixed(4)} m`,
  ]));
  seccion8.push(...paso(3, 'Suma cuadrados + productos cruzados (sumB)', [
    `sumB = [C1² + 2C2² + … + Cn²]  +  [C1·C2 + C2·C3 + … + C(n-1)·Cn]`,
    `  Cuadrados: ${sq_str}`,
    `  Cruzados:  ${cr_str}`,
    `sumB = ${sumB.toFixed(4)} m²`,
  ]));
  seccion8.push(...paso(4, 'Energía de deformación — McHenry CRASH3', [
    `Ed = h × [(A/2)·sumA  +  (B/6)·sumB]  +  L·A²/(2B)`,
    `   = ${h.toFixed(4)} × [(${fN(A_cof,0)}/2)×${sumA.toFixed(4)} + (${fN(B_cof,0)}/6)×${sumB.toFixed(4)}] + ${residual.toFixed(2)}`,
    `   = ${h.toFixed(4)} × [${termA.toFixed(2)} + ${termB.toFixed(2)}] + ${residual.toFixed(2)}`,
    `Ed = ${Ed_calc.toFixed(2)} J`,
  ]));
  seccion8.push(...paso(5, 'Corrección por ángulo FPI', [
    `α = ${alphaDeg}°   →   tan(α) = ${tanAlpha.toFixed(4)}`,
    `E_corr = Ed × (1 + tan α)² = ${Ed_calc.toFixed(2)} × ${(Math.pow(1+tanAlpha,2)).toFixed(4)}`,
    `E_corr = ${Ecorr_calc.toFixed(2)} J`,
  ]));

  const EBS_st = parseFloat(datos.ebs_ms);
  const dV_st  = parseFloat(datos.dv_kmh);
  const Vp_st  = parseFloat(datos.velocidad_pre_impacto);

  if (!isNaN(EBS_st)) {
    seccion8.push(...paso(6, 'Velocidad equivalente de barrera (EBS) y ΔV', [
      `EBS = √(2 × E_corr / m) = ${EBS_st.toFixed(4)} m/s`,
      `ΔV  = EBS × 3.6 = ${(!isNaN(dV_st) ? dV_st.toFixed(2) : (EBS_st*3.6).toFixed(2))} km/h`,
    ]));
  }
  if (!isNaN(Vp_st)) {
    const dV_val = !isNaN(dV_st) ? dV_st : (EBS_st * 3.6);
    seccion8.push(...paso(7, 'Velocidad pre-impacto (Vp)', [
      `Vp = √(ΔV² + Vf²) = √(${f2(dV_val)}² + ${f2(Vf_rep)}²)`,
      `Vp = ${f2(Vp_st)} km/h`,
    ]));
  }

  const limStep = [
    `Dmed = ${Dmed_rep.toFixed(4)} m  (${(Dmed_rep * 100).toFixed(2)} cm)`,
  ];
  if (Dmed_rep > 0.6) {
    limStep.push(`Dmed > 0.60 m  →  Método Limpert NO APLICABLE en impactos severos`);
  } else {
    const VL = 4.4 * (Dmed_rep * 100) + 0.32;
    limStep.push(`VL = 4.4 × ${(Dmed_rep*100).toFixed(2)} cm + 0.32 = ${VL.toFixed(2)} km/h`);
  }
  seccion8.push(...paso(8, 'Verificación Limpert (complementaria, válida solo si Dmed ≤ 60 cm)', limStep));
}

seccion8.push(lineaVacia());
seccion8.push(heading2('8.3', 'Diagnóstico de velocidad'));

const Vp_diag  = parseFloat(datos.velocidad_pre_impacto);
const exc_diag = (!isNaN(Vp_diag) && Vmax_rep > 0) ? +(Vp_diag - Vmax_rep).toFixed(2) : null;
const hayExc   = exc_diag !== null && exc_diag > 0;

const filasDiag = [
  ['CONCEPTO', 'RESULTADO'],
  ['Velocidad pre-impacto  (Vp)',    !isNaN(Vp_diag) ? `${f2(Vp_diag)} km/h` : '---'],
  ['Límite de velocidad permitido',  Vmax_rep > 0 ? `${Vmax_rep} km/h` : '---'],
  ['Δv exceso  =  Vp − V_límite',   exc_diag !== null ? (hayExc ? `+${exc_diag} km/h` : `${exc_diag} km/h`) : '---'],
  ['Diagnóstico final',              exc_diag !== null ? (hayExc ? 'EXCESO DE VELOCIDAD CONFIRMADO' : 'Sin exceso de velocidad') : 'Sin datos suficientes'],
];
seccion8.push(new Table({
  width: { size: 9360, type: WidthType.DXA },
  columnWidths: [5400, 3960],
  rows: filasDiag.map((row, ri) => {
    const isLast = ri === filasDiag.length - 1;
    return new TableRow({ children: row.map((cell, ci) => celda(cell, {
      width: ci === 0 ? 5400 : 3960,
      fill:  ri === 0 ? BLUE : (isLast && hayExc ? 'FFD0D0' : (ri % 2 === 0 ? GRAY_BG : WHITE)),
      color: ri === 0 ? WHITE : (isLast && hayExc && ci === 1 ? 'CC0000' : BLACK),
      bold:  ri === 0 || isLast,
      size:  isLast ? 22 : 18,
    }))});
  }),
}));
seccion8.push(lineaVacia());

// ── Bloque de firmas ──────────────────────────────────────────────────────────
const firma = [
  lineaVacia(),
  new Paragraph({
    alignment: AlignmentType.RIGHT,
    children: [new TextRun({
      text: `Toluca, Estado de México a ${new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}.`,
      size: 20, font: 'Arial',
    })],
  }),
  lineaVacia(),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: 'Atentamente', size: 20, font: 'Arial' })],
  }),
  lineaVacia(), lineaVacia(), lineaVacia(), lineaVacia(), lineaVacia(), lineaVacia(), lineaVacia(), lineaVacia(),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [4680, 4680],
    rows: [new TableRow({
      children: [
        new TableCell({
          borders: { top: borde(CYAN), bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
          width: { size: 4680, type: WidthType.DXA },
          margins: { top: 120, bottom: 80, left: 200, right: 200 },
          children: [
            new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: val(datos.nombre_perito), size: 20, font: 'Arial' })] }),
            new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Analista de Seguridad Vial', bold: true, size: 20, font: 'Arial' })] }),
            new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'y RAT CESVI Méx.', bold: true, size: 20, font: 'Arial' })] }),
          ],
        }),
        new TableCell({
          borders: { top: borde(CYAN), bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
          width: { size: 4680, type: WidthType.DXA },
          margins: { top: 120, bottom: 80, left: 200, right: 200 },
          children: [
            new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Supervisor RAT CESVI Méx.', size: 20, font: 'Arial' })] }),
            new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Analista de Seguridad Vial', bold: true, size: 20, font: 'Arial' })] }),
            new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'y RAT CESVI Méx.', bold: true, size: 20, font: 'Arial' })] }),
          ],
        }),
      ],
    })],
  }),
];

// ── Documento Word con 2 secciones ────────────────────────────────────────────
// Sección 1: Portada (sin encabezado/pie visibles, fondo propio si hay PNG)
// Sección 2: Contenido (encabezado/pie CESVI, fondo propio si hay PNG)
const doc = new Document({
  styles: {
    default: {
      document: { run: { font: 'Arial', size: 20, color: BLACK } },
    },
    paragraphStyles: [
      {
        id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 24, bold: true, color: BLUE, font: 'Arial' },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 0 },
      },
      {
        id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 22, bold: true, color: BLUE, font: 'Arial' },
        paragraph: { spacing: { before: 160, after: 80 }, outlineLevel: 1 },
      },
    ],
  },
  sections: [
    // ── Portada ──────────────────────────────────────────────────────────────
    {
      properties: {
        page: { size: pageSize, margin: marginPortada },
      },
      headers: { default: headerPortadaFinal },
      footers: { default: footerVacio },
      children: portada,
    },
    // ── Contenido ─────────────────────────────────────────────────────────────
    {
      properties: {
        page: { size: pageSize, margin: marginContenido },
      },
      headers: { default: headerContenidoFinal },
      footers: { default: footerContenidoFinal },
      children: [
        ...tablaContenido,
        ...seccion1,
        ...seccion2,
        ...seccion3,
        ...seccion4,
        ...seccion5,
        ...seccion6,
        ...seccion7,
        ...seccion8,
        ...firma,
      ],
    },
  ],
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(rutaSalida, buf);
  console.log('OK: ' + rutaSalida);
}).catch(err => {
  console.error('ERROR: ' + err.message);
  process.exit(1);
});