import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Download, Send, CheckCircle, AlertTriangle,
  FileText, User, Camera, Ruler, Calculator, BookOpen, Pencil, Maximize2, X,
} from "lucide-react";
import { useIncidente } from "../../hooks/useIncidente";
import { generarReporte, descargarReporte } from "../../services/reporteService";
import { API_URL } from "../../config/env";

const TABS = [
  { id: "resumen",    label: "Resumen",     icon: <FileText size={14} /> },
  { id: "vehiculo",   label: "Vehículo",    icon: <User size={14} /> },
  { id: "evidencia",  label: "Evidencia",   icon: <Camera size={14} /> },
  { id: "deformacion",label: "Deformación", icon: <Ruler size={14} /> },
  { id: "calculos",   label: "Cálculos",    icon: <Calculator size={14} /> },
  { id: "narrativa",  label: "Narrativa",   icon: <BookOpen size={14} /> },
  { id: "reporte",    label: "Reporte",     icon: <FileText size={14} /> },
];

const ESTADO_LABEL = { 0: "Abierto", 1: "En revisión", 2: "Finalizado", 3: "Archivado" };
const ESTADO_BADGE = {
  0: "bg-blue-100 text-blue-700",
  1: "bg-yellow-100 text-yellow-700",
  2: "bg-green-100 text-green-700",
  3: "bg-gray-100 text-gray-700",
};

function Row({ label, val, highlight }) {
  const display = val == null || (typeof val === "number" && isNaN(val)) ? "—" : val;
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
      <span className="text-xs text-gray-500">{label}</span>
      <span className={`text-xs font-medium ${highlight ? "text-red-600" : "text-gray-700"}`}>{display}</span>
    </div>
  );
}

function TabResumen({ inc }) {
  const iv  = inc.vehiculos?.[0];
  const ub  = inc.ubicacion_via;
  const cal = iv?.calculo_velocidad;

  return (
    <div className="grid grid-cols-3 gap-4">
      <div>
        <div className="text-xs text-gray-600 font-medium mb-2 border-b border-gray-200 pb-1">Datos del Incidente</div>
        <Row label="No. Siniestro" val={inc.numero_siniestro} />
        <Row label="Fecha"         val={inc.fecha_hecho} />
        <Row label="Hora"          val={inc.hora_hecho} />
        <Row label="Tipo"          val={inc.tipo_hecho?.nombre} />
        <Row label="Estado"        val={ESTADO_LABEL[inc.estado] ?? inc.estado} />
        <Row label="Perito"        val={inc.perito?.name} />
        <Row label="Lugar"         val={ub ? `${ub.calle}, ${ub.municipio}, ${ub.estado_republica}` : null} />
      </div>
      <div>
        <div className="text-xs text-gray-600 font-medium mb-2 border-b border-gray-200 pb-1">Datos del Vehículo</div>
        <Row label="Marca"  val={iv?.vehiculo?.marca} />
        <Row label="Modelo" val={iv?.vehiculo?.submarca ?? iv?.vehiculo?.nombre_modelo} />
        <Row label="Año"    val={iv?.vehiculo?.anio_modelo} />
        <Row label="VIN"            val={iv?.vehiculo?.vin} />
        <Row label="Placas"         val={iv?.numero_placas} />
        <Row label="Color"          val={iv?.color?.nombre} />
        <Row label="Rol"            val={iv?.rol} />
      </div>
      <div>
        <div className="text-xs text-gray-600 font-medium mb-2 border-b border-gray-200 pb-1">Resultados de Velocidad</div>
        <Row label="Vel. pre-impacto" val={cal?.velocidad_pre_impacto_kmh ? `${cal.velocidad_pre_impacto_kmh} km/h` : null} />
        <Row label="Vel. final"       val={cal?.velocidad_final_kmh       ? `${cal.velocidad_final_kmh} km/h`       : null} />
        {(() => {
          const vp   = parseFloat(cal?.velocidad_pre_impacto_kmh);
          const vlim = parseFloat(ub?.velocidad_maxima_permitida_kmh);
          const exc  = (!isNaN(vp) && !isNaN(vlim)) ? +(vp - vlim).toFixed(2) : null;
          return (
            <Row
              label="Δv exceso"
              val={exc !== null ? (exc > 0 ? `+${exc} km/h` : "Sin exceso") : null}
              highlight={exc !== null && exc > 0}
            />
          );
        })()}
        <Row label="Límite permitido" val={ub?.velocidad_maxima_permitida_kmh ? `${ub.velocidad_maxima_permitida_kmh} km/h` : null} />
        <Row label="μ adherencia"     val={ub?.mu_coeficiente_adherencia} />
        {cal?.exceso_velocidad === 1 && (
          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded flex items-center gap-2">
            <AlertTriangle size={14} className="text-red-500" />
            <span className="text-xs text-red-700">Exceso de velocidad confirmado</span>
          </div>
        )}
      </div>
    </div>
  );
}

function TabVehiculo({ inc }) {
  const iv = inc.vehiculos?.[0];
  const v  = iv?.vehiculo ?? {};
  const fields = [
    ["Marca",    v.marca],
    ["Modelo",   v.submarca],
    ["Año",      v.anio_modelo],
    ...(v.nombre_modelo ? [["Versión", v.nombre_modelo]] : []),
    ["VIN",         v.vin],         ["Placas",    iv?.numero_placas],
    ["Color",       iv?.color?.nombre],
    ["Peso Tara",   v.peso_tara_kg              ? `${v.peso_tara_kg} kg`              : null],
    ["MMA",         v.masa_maxima_autorizada_kg ? `${v.masa_maxima_autorizada_kg} kg` : null],
    ["Ancho",       v.ancho_mm      ? `${v.ancho_mm} mm`       : null],
    ["Largo",       v.largo_mm      ? `${v.largo_mm} mm`       : null],
    ["Alto",        v.alto_mm       ? `${v.alto_mm} mm`        : null],
    ["Batalla",     v.batalla_mm    ? `${v.batalla_mm} mm`     : null],
  ];
  return (
    <div className="grid grid-cols-4 gap-x-6 gap-y-2">
      {fields.map(([l, val]) => <Row key={l} label={l} val={val} />)}
    </div>
  );
}

function TabEvidencia({ inc }) {
  const iv    = inc.vehiculos?.[0];
  const fotos = iv?.fotos ?? [];
  const [imgErrors, setImgErrors] = React.useState({});
  const [lightbox, setLightbox]   = React.useState(null); // { src, tipo }

  const fotosPorTipo = fotos.reduce((acc, f) => {
    const tipo = f.tipo_foto?.nombre ?? "Otro";
    if (!acc[tipo]) acc[tipo] = [];
    acc[tipo].push(f);
    return acc;
  }, {});
  const tipos = Object.keys(fotosPorTipo);

  if (fotos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
        <Camera size={32} className="mb-2" />
        <span className="text-sm">Sin evidencia fotográfica</span>
      </div>
    );
  }

  return (
    <>
      {lightbox && (
        <div
          className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center"
          onClick={() => setLightbox(null)}
        >
          <img
            src={lightbox.src}
            alt={lightbox.tipo}
            className="max-h-[90vh] max-w-[90vw] object-contain rounded shadow-xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/80"
            onClick={() => setLightbox(null)}
          >
            <X size={20} />
          </button>
          <div className="absolute bottom-4 text-white text-xs opacity-70">{lightbox.tipo}</div>
        </div>
      )}
      <div className="flex flex-col gap-6">
        {tipos.map((tipo) => (
          <div key={tipo}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#1F6AA5" }}>{tipo}</span>
              <span className="text-xs bg-gray-100 text-gray-500 rounded px-1.5 py-0.5">{fotosPorTipo[tipo].length}</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
            <div className="grid grid-cols-5 gap-2">
              {fotosPorTipo[tipo].map((f) => {
                const src = `${API_URL}/v1/rat/fotos/${f.id}`;
                return (
                  <div key={f.id} className="relative group rounded border border-gray-200 overflow-hidden bg-gray-50 cursor-pointer"
                    onClick={() => !imgErrors[f.id] && setLightbox({ src, tipo })}>
                    {imgErrors[f.id] ? (
                      <div className="w-full h-28 flex flex-col items-center justify-center text-gray-300 gap-1">
                        <Camera size={18} />
                        <span className="text-xs">Sin vista previa</span>
                      </div>
                    ) : (
                      <>
                        <img
                          src={src}
                          alt={tipo}
                          className="w-full h-28 object-cover transition-opacity group-hover:opacity-80"
                          onError={() => setImgErrors((prev) => ({ ...prev, [f.id]: true }))}
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-black/50 rounded-full p-1.5 text-white">
                            <Maximize2 size={14} />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function TabDeformacion({ inc }) {
  const iv  = inc.vehiculos?.[0];
  const def = iv?.deformacion_medicion;

  const rawCVals = def
    ? [
        { label: "C1", raw: def.c1_m },
        { label: "C2", raw: def.c2_m },
        { label: "C3", raw: def.c3_m },
        { label: "C4", raw: def.c4_m },
        { label: "C5", raw: def.c5_m },
        { label: "C6", raw: def.c6_m },
      ]
      .filter((m) => m.raw != null && !isNaN(m.raw) && m.raw > 0)
      .map((m) => ({ label: m.label, raw: Number(m.raw) }))
    : [];

  const mediciones = rawCVals.map((m) => ({ label: m.label, val: `${(m.raw * 1000).toFixed(1)} mm` }));
  const cValues    = rawCVals.map((m) => m.raw * 1000);

  return (
    <div className="grid grid-cols-2 gap-6">
      <div>
        <div className="text-xs font-medium text-gray-700 mb-2">
          Mediciones C1–C6 ({def?.tipo_golpe?.nombre ?? "—"}, {def?.numero_mediciones ?? 6} puntos)
        </div>
        {mediciones.length > 0
          ? (
            <div className="grid grid-cols-2 gap-3">
              {mediciones.map((m) => (
                <div key={m.label} className="bg-gray-50 border border-gray-200 rounded px-3 py-2">
                  <div className="text-xs text-gray-500">{m.label}</div>
                  <div className="text-sm font-semibold text-gray-700">{m.val}</div>
                </div>
              ))}
            </div>
          )
          : <div className="text-xs text-gray-400">Sin mediciones registradas.</div>}

        {def && (
          <div className="mt-4 grid grid-cols-3 gap-3">
            {(() => {
              const dmed = rawCVals.length
                ? rawCVals.reduce((a, m) => a + m.raw, 0) / rawCVals.length
                : null;
              return [
                ["Ancho contacto L", def.l_ancho_contacto_m && !isNaN(def.l_ancho_contacto_m) ? `${(def.l_ancho_contacto_m * 1000).toFixed(1)} mm` : "—"],
                ["Ángulo FPI",       def.angulo_fpi_grados  && !isNaN(def.angulo_fpi_grados)   ? `${def.angulo_fpi_grados}°` : "—"],
                ["Dmed",             dmed != null                                               ? `${(dmed * 1000).toFixed(1)} mm` : "—"],
              ];
            })().map(([l, v]) => (
              <div key={l} className="bg-[#E0F7FA] border border-[#00ADCF]/30 rounded px-3 py-2">
                <div className="text-xs text-gray-500">{l}</div>
                <div className="text-sm font-semibold" style={{ color: "#00ADCF" }}>{v}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col items-center">
        <div className="text-xs text-gray-500 mb-2">Diagrama de deformación</div>
        {cValues.length > 0
          ? (
            <svg width="200" height="140" viewBox="0 0 200 140">
              <rect x="10" y="20" width="180" height="110" rx="8" stroke="#9CA3AF" strokeWidth="2" fill="#F9FAFB" />
              {rawCVals.map((m, i) => {
                const v = m.raw * 1000;
                const x = 20 + i * 32;
                const h = (v / 400) * 80;
                return (
                  <g key={m.label}>
                    <rect x={x - 8} y={30} width={16} height={h} fill="#FCA5A5" opacity="0.6" />
                    <circle cx={x} cy={30 + h} r={4} fill="#EF4444" />
                    <text x={x} y={135} textAnchor="middle" fontSize="9" fill="#374151">{m.label}</text>
                  </g>
                );
              })}
            </svg>
          )
          : <div className="text-xs text-gray-400 mt-8">Sin datos de deformación.</div>}
      </div>
    </div>
  );
}

function TabCalculos({ inc }) {
  const iv  = inc.vehiculos?.[0];
  const cal = iv?.calculo_velocidad;
  const def = iv?.deformacion_medicion;
  const ub  = inc.ubicacion_via;

  if (!cal) return <div className="text-xs text-gray-400 py-4">Sin cálculos registrados.</div>;

  // helper: parseFloat seguro que retorna null si no es número válido
  const pf = (v) => { const n = parseFloat(v); return isNaN(n) ? null : n; };
  const fmt = (v, unit) => v != null ? `${v} ${unit}` : null;

  // Dmed: guardado en DB o calculado on-the-fly desde mediciones C
  const dmedVal = (() => {
    const stored = pf(cal.dmed_m);
    if (stored != null && stored > 0) return stored;
    if (!def) return null;
    const vals = ["c1_m","c2_m","c3_m","c4_m","c5_m","c6_m"]
      .map((k) => Number(def[k]))
      .filter((v) => !isNaN(v) && v > 0);
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  })();
  const dmedDisplay = dmedVal != null
    ? `${dmedVal.toFixed(4)} m  (${(dmedVal * 1000).toFixed(1)} mm)`
    : null;

  // Limpert: guardado, calculado on-the-fly, o "No aplica" si Dmed > 60 cm
  const limpertDisplay = (() => {
    const stored = pf(cal.velocidad_limpert_kmh);
    if (stored != null && stored > 0) return `${stored} km/h`;
    if (dmedVal == null) return null;
    if (dmedVal > 0.6) return "No aplica (Dmed > 60 cm)";
    return `${(4.4 * (dmedVal * 100) + 0.32).toFixed(2)} km/h`;
  })();

  // Δv: calculado on-the-fly desde Vp y límite permitido
  const vpNum    = pf(cal.velocidad_pre_impacto_kmh);
  const vlimNum  = pf(ub?.velocidad_maxima_permitida_kmh);
  const exceso   = (vpNum != null && vlimNum != null) ? +(vpNum - vlimNum).toFixed(2) : null;
  const excesoDisplay = exceso !== null
    ? (exceso > 0 ? `+${exceso} km/h` : "Sin exceso")
    : null;

  const resultados = [
    ["EBS",                   fmt(pf(cal.ebs_m_s),                      "m/s")  ],
    ["ΔV (cambio velocidad)", fmt(pf(cal.velocidad_impacto_kmh),         "km/h") ],
    ["Velocidad pre-impacto", fmt(pf(cal.velocidad_pre_impacto_kmh),     "km/h") ],
    ["Velocidad Limpert",     limpertDisplay                                      ],
    ["Velocidad final",       fmt(pf(cal.velocidad_final_kmh),           "km/h") ],
    ["Δv exceso",             excesoDisplay                                       ],
  ];

  return (
    <div className="grid grid-cols-2 gap-6">
      <div>
        <div className="text-xs font-medium text-gray-700 mb-2 border-b border-gray-200 pb-1">Parámetros</div>
        {[
          ["Rigidez A (N/m)",         fmt(pf(cal.a_rigidez_n_m),              "N/m")  ],
          ["Rigidez B (N/m²)",        fmt(pf(cal.b_rigidez_n_m2),             "N/m²") ],
          ["Dmed",                    dmedDisplay                                      ],
          ["Ed deformación (J)",      fmt(pf(cal.e_deformacion_julios),        "J")    ],
          ["Ed corregida (J)",        fmt(pf(cal.e_def_corregida_julios),      "J")    ],
          ["T. respuesta frenos",     fmt(pf(cal.tiempo_respuesta_frenos_s),   "s")    ],
        ].map(([l, v]) => <Row key={l} label={l} val={v} />)}
      </div>
      <div>
        <div className="text-xs font-medium text-gray-700 mb-2 border-b border-gray-200 pb-1 flex items-center gap-2">
          Resultados <span className="text-xs bg-green-100 text-green-700 px-1.5 rounded">Calculados</span>
        </div>
        {resultados.map(([l, v]) => (
          <Row key={l} label={l} val={v} highlight={l === "Exceso de velocidad"} />
        ))}
      </div>
    </div>
  );
}

function TabNarrativa({ inc }) {
  const iv        = inc.vehiculos?.[0];
  const narrativa = iv?.narrativa_dinamica;
  const principios= iv?.principios_forenses;

  return (
    <div className="flex flex-col gap-4">
      {narrativa && (
        <div>
          <div className="text-xs font-medium text-gray-700 mb-2">Narración del Hecho</div>
          <div className="bg-gray-50 border border-gray-200 rounded p-4 text-xs text-gray-700 leading-6">
            {narrativa.narracion_hechos ?? "Sin narración."}
          </div>
        </div>
      )}
      {principios && (
        <>
          <div>
            <div className="text-xs font-medium text-gray-700 mb-2">Intercambio de materiales</div>
            <div className="bg-gray-50 border border-gray-200 rounded p-3 text-xs text-gray-700">
              {principios.principio_intercambio_materiales ?? "—"}
            </div>
          </div>
          <div>
            <div className="text-xs font-medium text-gray-700 mb-2">Correspondencia de características</div>
            <div className="bg-gray-50 border border-gray-200 rounded p-3 text-xs text-gray-700">
              {principios.principio_correspondencia ?? "—"}
            </div>
          </div>
        </>
      )}
      {!narrativa && !principios && (
        <div className="text-xs text-gray-400 py-4">Sin narrativa registrada.</div>
      )}
    </div>
  );
}

function TabReporte({ wordGenerando, wordError, onGenerar }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2 text-xs">
          <CheckCircle size={14} /> Conclusiones validadas por perito responsable
        </div>
        {wordError && <span className="text-xs text-red-600">{wordError}</span>}
        <div className="ml-auto flex gap-2">
          <button
            onClick={onGenerar}
            disabled={wordGenerando}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-white text-xs disabled:opacity-60"
            style={{ backgroundColor: "#00ADCF" }}
          >
            <Send size={13} /> {wordGenerando ? "Generando y descargando..." : "Generar Reporte Word"}
          </button>
        </div>
      </div>
      <div className="border border-gray-300 rounded bg-gray-50 h-48 flex items-center justify-center text-xs text-gray-400">
        Presiona &quot;Generar Reporte Word&quot; para crear y descargar el documento .docx.
      </div>
    </div>
  );
}

export default function DetalleExpediente() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const [tab, setTab] = useState("resumen");
  const { incidente, loading, error } = useIncidente(id);

  // Estado para generación del Word
  const [wordGenerando, setWordGenerando] = useState(false);
  const [wordError,     setWordError]     = useState("");

  const handleGenerarWord = async () => {
    setWordGenerando(true);
    setWordError("");
    try {
      await generarReporte(id);
      await descargarReporte(id, `reporte-${inc.numero_siniestro ?? id}.docx`);
    } catch (e) {
      const detail = e?.response?.data?.error ?? e?.response?.data?.message ?? e.message ?? "Error al generar reporte";
      setWordError(detail);
    } finally {
      setWordGenerando(false);
    }
  };

  const inc = incidente ?? {};
  const iv  = inc.vehiculos?.[0];
  const cal = iv?.calculo_velocidad;
  const estadoLabel = ESTADO_LABEL[inc.estado] ?? (inc.estado ?? "—");

  return (
    <div className="p-4 flex flex-col gap-4">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded shadow-sm p-3 flex items-center gap-3">
        <button onClick={() => navigate("/expedientes")}
          className="p-1.5 rounded border border-gray-300 text-gray-600 hover:border-[#00ADCF] hover:text-[#00ADCF]">
          <ArrowLeft size={15} />
        </button>

        {loading
          ? <div className="flex-1"><div className="animate-pulse bg-gray-200 h-4 w-48 rounded mb-1" /><div className="animate-pulse bg-gray-100 h-3 w-64 rounded" /></div>
          : (
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-800">{inc.numero_siniestro ?? id}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${ESTADO_BADGE[inc.estado] ?? "bg-gray-100 text-gray-700"}`}>
                  {estadoLabel}
                </span>
                {cal?.exceso_velocidad === 1 && (
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <AlertTriangle size={11} /> Exceso de velocidad
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                {inc.tipo_hecho?.nombre} · {inc.fecha_hecho} {inc.hora_hecho} · {inc.perito?.name}
              </div>
            </div>
          )}

        <div className="flex items-center gap-2">
          {/* Botón Editar */}
          <button
            onClick={() => navigate(`/expedientes/${id}/editar`)}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded text-xs text-gray-600 hover:border-[#00ADCF] hover:text-[#00ADCF]"
            title="Editar expediente"
          >
            <Pencil size={13} /> Editar
          </button>

          {/* Botón Word */}
          <button
            onClick={handleGenerarWord}
            disabled={wordGenerando}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded text-xs text-gray-600 hover:border-[#00ADCF] disabled:opacity-50"
          >
            <Download size={13} /> {wordGenerando ? "Generando..." : "Generar Word"}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded px-4 py-2 text-xs text-red-700">{error}</div>
      )}

      {/* Tabs */}
      <div className="bg-white border border-gray-200 rounded shadow-sm">
        <div className="flex border-b border-gray-200">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs border-b-2 transition-colors ${
                tab === t.id ? "border-[#00ADCF] text-[#00ADCF]" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
        <div className="p-4">
          {loading
            ? <div className="flex flex-col gap-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="animate-pulse bg-gray-100 h-5 rounded" />)}</div>
            : (
              <>
                {tab === "resumen"     && <TabResumen     inc={inc} />}
                {tab === "vehiculo"    && <TabVehiculo    inc={inc} />}
                {tab === "evidencia"   && <TabEvidencia   inc={inc} />}
                {tab === "deformacion" && <TabDeformacion inc={inc} />}
                {tab === "calculos"    && <TabCalculos    inc={inc} />}
                {tab === "narrativa"   && <TabNarrativa   inc={inc} />}
                {tab === "reporte"     && (
                  <TabReporte
                    wordGenerando={wordGenerando}
                    wordError={wordError}
                    onGenerar={handleGenerarWord}
                  />
                )}
              </>
            )}
        </div>
      </div>
    </div>
  );
}
