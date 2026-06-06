import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Check, ChevronLeft, ChevronRight,
  Upload, X, AlertCircle, FileText, Trash2, ImageIcon, MapPin, Maximize2,
} from "lucide-react";
import {
  createIncidentePaso1,
  updateIncidentePaso1,
  updatePaso2Vehiculo,
  updatePaso3Ocupantes,
  updatePaso4Via,
  updatePaso6Deformacion,
  storePaso7Calculo,
  updatePaso8Narrativa,
  updatePaso9Reporte,
  getIncidenteById,
} from "../../services/incidenteService";
import { getCatalogos, getPeritos } from "../../services/catalogosService";
import { useAuth } from "../../hooks/useAuth";
import { http } from "../../api/http";
import { API_URL } from "../../config/env";

// ── Contexto: form + catálogos disponibles en todos los pasos ─────────────────
const FormCtx = createContext(null);
function useForm() { return useContext(FormCtx); }

const STEPS = [
  { id: 0, label: "Incidente" },
  { id: 1, label: "Vehículo" },
  { id: 2, label: "Ocupantes" },
  { id: 3, label: "Vía" },
  { id: 4, label: "Evidencia" },
  { id: 5, label: "Deformación" },
  { id: 6, label: "Cálculo" },
  { id: 7, label: "Narrativa" },
  { id: 8, label: "Reporte" },
];

const inp = "w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:border-[#00ADCF] bg-white text-gray-800 placeholder:text-sky-300 placeholder:italic";
const sel = "w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:border-[#00ADCF] bg-white text-gray-800";

function Field({ label, req, children }) {
  return (
    <div>
      <label className="block text-xs text-gray-600 mb-1">
        {label} {req && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function CatSel({ field, label, req, items, placeholder = "Seleccionar..." }) {
  const { form, setField } = useForm();
  return (
    <Field label={label} req={req}>
      <select className={sel} value={form[field] ?? ""}
        onChange={(e) => setField(field, e.target.value)}>
        <option value="">{placeholder}</option>
        {(items ?? []).map((c) => (
          <option key={c.id} value={c.id}>{c.nombre}</option>
        ))}
      </select>
    </Field>
  );
}

// ── PASO 0: Incidente ─────────────────────────────────────────────────────────
function StepIncidente() {
  const { form, setField, cats, user } = useForm();
  const selectedTipo = (cats?.tipos_hecho ?? []).find((t) => String(t.id) === String(form.tipo_hecho_id));
  const esOtro = selectedTipo?.nombre?.toLowerCase().includes("otro");
  return (
    <div className="grid grid-cols-2 gap-4">
      <Field label="Número de Siniestro" req>
        <input className={inp} placeholder="RAT-2026-025" maxLength={100}
          value={form.numero_siniestro ?? ""}
          onChange={(e) => setField("numero_siniestro", e.target.value)} />
      </Field>
      <Field label="Perito Responsable" req>
        <input
          className={`${inp} bg-gray-100 text-gray-600`}
          value={user?.name ?? "Cargando..."}
          readOnly
          style={{ cursor: "not-allowed" }}
          title="El perito responsable es el usuario que inició sesión"
        />
      </Field>
      <Field label="Fecha del Hecho" req>
        <input type="date" className={inp}
          max={new Date().toISOString().split("T")[0]}
          value={form.fecha_hecho ?? ""}
          onChange={(e) => setField("fecha_hecho", e.target.value)} />
        <span className="text-[10px] text-gray-400 mt-0.5 block">No puede ser una fecha futura</span>
      </Field>
      <Field label="Hora del Hecho">
        <input type="time" className={inp} value={form.hora_hecho ?? ""}
          onChange={(e) => setField("hora_hecho", e.target.value)} />
      </Field>
      <Field label="Tipo de Hecho" req>
        <select className={sel} value={form.tipo_hecho_id ?? ""}
          onChange={(e) => setField("tipo_hecho_id", Number(e.target.value))}>
          <option value="">Seleccionar...</option>
          {(cats?.tipos_hecho ?? []).map((t) => (
            <option key={t.id} value={t.id}>{t.nombre}</option>
          ))}
        </select>
      </Field>
      <Field label="Estado del Análisis">
        <select className={sel} value={form.estado ?? 0}
          onChange={(e) => setField("estado", Number(e.target.value))}>
          <option value={0}>Abierto</option>
          <option value={1}>En revisión</option>
          <option value={2}>Finalizado</option>
        </select>
      </Field>
      {esOtro && (
        <div className="col-span-2">
          <Field label="Descripción del tipo de hecho" req>
            <input
              className={inp}
              placeholder="Describe el tipo de hecho (máx. 300 caracteres)"
              maxLength={300}
              value={form.tipo_hecho_descripcion ?? ""}
              onChange={(e) => setField("tipo_hecho_descripcion", e.target.value)}
            />
          </Field>
        </div>
      )}
    </div>
  );
}

// ── PASO 1: Vehículo ──────────────────────────────────────────────────────────
function StepVehiculo() {
  const { form, setField, cats } = useForm();
  const f = (k) => form[k] ?? "";
  const [vinLoading, setVinLoading]   = useState(false);
  const [vinModal,   setVinModal]     = useState(null); // { marca, modelo, anio, tipo }
  const [vinError,   setVinError]     = useState("");

  const buscarPorVin = async () => {
    const vin = form.vin?.trim();
    if (!vin || vin.length < 11) { setVinError("Ingresa al menos 11 caracteres del VIN."); return; }
    setVinLoading(true);
    setVinError("");
    try {
      const res  = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValuesExtended/${encodeURIComponent(vin)}?format=json`);
      const json = await res.json();
      const r    = json.Results?.[0] ?? {};
      const get  = (k) => (r[k] && r[k] !== "0" && r[k] !== "Not Applicable") ? r[k] : "";
      const marca  = get("Make");
      const modelo = get("Model");
      const serie  = get("Series") || get("Trim");
      const anio   = get("ModelYear");
      const pais   = get("PlantCountry");
      const gvwr   = get("GVWR") || "";
      // GVWR > 10,001 lbs (~4,536 kg) = heavy / pesado
      const gvwrNum = parseFloat(gvwr.replace(/[^0-9.]/g, ""));
      const tipo   = (!isNaN(gvwrNum) && gvwrNum > 10000)
        ? "pesado"
        : (get("VehicleType")?.toLowerCase().includes("truck") ? "pesado" : "ligero");
      if (!marca && !modelo) { setVinError("No se encontraron datos para este VIN en la base global."); return; }
      setVinModal({ marca, modelo, serie, anio, tipo, pais });
    } catch {
      setVinError("No se pudo consultar la API. Verifica tu conexión.");
    } finally {
      setVinLoading(false);
    }
  };

  const aplicarVin = () => {
    if (!vinModal) return;
    if (vinModal.marca)  setField("marca",       vinModal.marca);
    if (vinModal.modelo) setField("submarca",     vinModal.modelo);
    if (vinModal.serie)  setField("nombre_modelo", vinModal.serie);
    if (vinModal.anio)   setField("anio_modelo",  vinModal.anio);
    if (vinModal.tipo)   setField("tipo_vehiculo", vinModal.tipo);
    setVinModal(null);
  };

  return (
    <>
      {vinModal && (
        <>
          <div className="fixed inset-0 bg-black/40 z-[9999]" onClick={() => setVinModal(null)} />
          <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4">
            <div className="bg-white rounded shadow-xl w-full max-w-sm border border-gray-200">
              <div className="px-4 py-3 border-b border-gray-200 bg-amber-50">
                <div className="flex items-center gap-2 text-amber-700 text-sm font-medium">
                  <AlertCircle size={16} /> Corrobore los datos antes de guardar
                </div>
                <p className="text-xs text-amber-600 mt-1">Los datos de la API pueden ser imprecisos. Verifique que correspondan al vehículo real.</p>
              </div>
              <div className="px-4 py-3 flex flex-col gap-2">
                {[
                  ["Marca",           vinModal.marca],
                  ["Modelo",          vinModal.modelo],
                  ["Serie / Versión", vinModal.serie],
                  ["Año",             vinModal.anio],
                  ["Tipo",            vinModal.tipo],
                  ["País de fabricación", vinModal.pais],
                ].map(([l, v]) => v && (
                  <div key={l} className="flex justify-between text-xs">
                    <span className="text-gray-500">{l}</span>
                    <span className="font-medium text-gray-700">{v}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 px-4 py-3 border-t border-gray-200 bg-gray-50">
                <button onClick={() => setVinModal(null)} className="flex-1 py-1.5 text-xs border border-gray-300 rounded text-gray-600">Cancelar</button>
                <button onClick={aplicarVin} className="flex-1 py-1.5 text-xs text-white rounded" style={{ backgroundColor: "#00ADCF" }}>Aplicar datos</button>
              </div>
            </div>
          </div>
        </>
      )}
    <div className="grid grid-cols-3 gap-4">
      <div className="col-span-3">
        <Field label="VIN / Número de Serie" req>
          <div className="flex gap-2">
            <input className={`${inp} flex-1`} placeholder="3VWFE21C04M000001" maxLength={17}
              value={f("vin")} onChange={(e) => { setField("vin", e.target.value); setVinError(""); }} />
            <button
              type="button"
              onClick={buscarPorVin}
              disabled={vinLoading}
              className="px-3 py-1.5 text-xs text-white rounded shrink-0 disabled:opacity-50"
              style={{ backgroundColor: "#1F6AA5" }}
              title="Buscar datos del vehículo mediante VIN (API NHTSA)"
            >
              {vinLoading ? "…" : "Buscar datos"}
            </button>
          </div>
          {vinError && <span className="text-xs text-red-500 mt-0.5 block">{vinError}</span>}
        </Field>
      </div>
      <Field label="Marca" req>
        <input className={inp} placeholder="Por llenar" maxLength={100}
          value={f("marca")} onChange={(e) => setField("marca", e.target.value)} />
      </Field>
      <Field label="Submarca">
        <input className={inp} placeholder="Por llenar" maxLength={100}
          value={f("submarca")} onChange={(e) => setField("submarca", e.target.value)} />
      </Field>
      <Field label="Año del modelo" req>
        <input type="number" min="1886" max="2030" className={inp} placeholder="Ej: 2022"
          value={f("anio_modelo")} onChange={(e) => setField("anio_modelo", e.target.value)} />
      </Field>
      <Field label="Tipo de Vehículo" req>
        <select className={sel} value={f("tipo_vehiculo")}
          onChange={(e) => setField("tipo_vehiculo", e.target.value)}>
          <option value="">Seleccionar...</option>
          <option value="ligero">Ligero</option>
          <option value="pesado">Pesado</option>
        </select>
      </Field>
      <CatSel field="color_id" label="Color" items={cats?.colores} />
      <Field label="Placas">
        <input className={inp} placeholder="Por llenar" maxLength={10}
          value={f("numero_placas")} onChange={(e) => setField("numero_placas", e.target.value)} />
      </Field>
      <Field label="Rol" req>
        <select className={sel} value={f("rol")} onChange={(e) => setField("rol", e.target.value)}>
          <option value="">Seleccionar...</option>
          <option value="A">A (Principal)</option>
          <option value="B">B (Involucrado)</option>
          <option value="C">C (Tercero)</option>
        </select>
      </Field>
      <CatSel field="estado_neumatico_id" label="Estado Neumático" items={cats?.estados_neumatico} />
      <Field label="Peso Tara (kg)">
        <input type="number" min="0" max="99999" step="0.01" className={inp} placeholder="Por llenar"
          value={f("peso_tara_kg")} onChange={(e) => setField("peso_tara_kg", e.target.value)} />
      </Field>
      <Field label="MMA (kg)">
        <input type="number" min="0" max="99999" step="0.01" className={inp} placeholder="Por llenar"
          value={f("masa_maxima_autorizada_kg")} onChange={(e) => setField("masa_maxima_autorizada_kg", e.target.value)} />
      </Field>
      <Field label="Ancho (mm)">
        <input type="number" min="0" max="65535" className={inp}
          value={f("ancho_mm")} onChange={(e) => setField("ancho_mm", e.target.value)} />
      </Field>
      <Field label="Largo (mm)">
        <input type="number" min="0" max="65535" className={inp}
          value={f("largo_mm")} onChange={(e) => setField("largo_mm", e.target.value)} />
      </Field>
      <Field label="Alto (mm)">
        <input type="number" min="0" max="65535" className={inp}
          value={f("alto_mm")} onChange={(e) => setField("alto_mm", e.target.value)} />
      </Field>
      <Field label="Batalla (mm)">
        <input type="number" min="0" max="65535" className={inp}
          value={f("batalla_mm")} onChange={(e) => setField("batalla_mm", e.target.value)} />
      </Field>
      <Field label="Entrevía Delantera (mm)">
        <input type="number" min="0" max="65535" className={inp}
          value={f("entrevia_delantera_mm")} onChange={(e) => setField("entrevia_delantera_mm", e.target.value)} />
      </Field>
      <Field label="Entrevía Trasera (mm)">
        <input type="number" min="0" max="65535" className={inp}
          value={f("entrevia_trasera_mm")} onChange={(e) => setField("entrevia_trasera_mm", e.target.value)} />
      </Field>
    </div>
    </>
  );
}

// ── PASO 2: Ocupantes ─────────────────────────────────────────────────────────
function StepOcupantes() {
  const { form, setField } = useForm();
  const tara  = Number(form.peso_tara_kg || 0);
  const total = tara
    + Number(form.peso_conductor_kg || 75)
    + Number(form.peso_pasajeros_kg || 0)
    + Number(form.peso_equipaje_kg  || 0);
  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="flex flex-col gap-4">
        <Field label="Número de Ocupantes" req>
          <input type="number" min="1" max="9" className={inp}
            value={form.numero_ocupantes ?? "1"}
            onChange={(e) => setField("numero_ocupantes", e.target.value)} />
        </Field>
        <Field label="Peso del Conductor (kg)" req>
          <input type="number" min="0" max="999" step="0.01" className={inp}
            value={form.peso_conductor_kg ?? "75"}
            onChange={(e) => setField("peso_conductor_kg", e.target.value)} />
        </Field>
        <Field label="Peso Total de Pasajeros (kg)">
          <input type="number" min="0" max="999" step="0.01" className={inp}
            value={form.peso_pasajeros_kg ?? "0"}
            onChange={(e) => setField("peso_pasajeros_kg", e.target.value)} />
        </Field>
        <Field label="Peso de Equipaje / Carga (kg)">
          <input type="number" min="0" max="999" step="0.01" className={inp}
            value={form.peso_equipaje_kg ?? "0"}
            onChange={(e) => setField("peso_equipaje_kg", e.target.value)} />
        </Field>
      </div>
      <div className="bg-gray-50 border border-gray-200 rounded p-4">
        <div className="text-xs text-gray-600 mb-3 border-b border-gray-200 pb-2">Resumen de masas</div>
        {[
          ["Peso tara vehículo (kg)", tara || "—"],
          ["Conductor (kg)", form.peso_conductor_kg ?? "75"],
          ["Pasajeros (kg)", form.peso_pasajeros_kg ?? "0"],
          ["Carga/Equipaje (kg)", form.peso_equipaje_kg ?? "0"],
        ].map(([l, v]) => (
          <div key={l} className="flex justify-between text-xs mb-1">
            <span className="text-gray-500">{l}</span>
            <span className="text-gray-700 font-medium">{v}</span>
          </div>
        ))}
        <div className="mt-3 pt-3 border-t border-gray-300 flex justify-between items-center">
          <span className="text-xs text-gray-700">Masa total</span>
          <span className="text-base font-semibold" style={{ color: "#00ADCF" }}>
            {total.toLocaleString()} kg
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-2">* Calculado automáticamente.</p>
      </div>
    </div>
  );
}

// ── Mapa Leaflet ──────────────────────────────────────────────────────────────
function MapaPicker({ lat, lng, onLocationChange }) {
  const containerRef        = useRef(null);
  const mapRef              = useRef(null);
  const markerRef           = useRef(null);
  const mountedRef          = useRef(true);
  const onLocationChangeRef = useRef(onLocationChange);

  useEffect(() => { onLocationChangeRef.current = onLocationChange; }, [onLocationChange]);

  useEffect(() => {
    mountedRef.current = true;
    let timer = null;
    const initMap = () => {
      if (!mountedRef.current || !containerRef.current || mapRef.current) return;
      const L = window.L;
      if (!L) { timer = setTimeout(initMap, 300); return; }
      const initLat = parseFloat(lat) || 19.4326;
      const initLng = parseFloat(lng) || -99.1332;
      const zoom    = (lat && lng) ? 15 : 5;
      const map = L.map(containerRef.current).setView([initLat, initLng], zoom);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);
      if (lat && lng && !isNaN(initLat) && !isNaN(initLng)) {
        markerRef.current = L.marker([initLat, initLng]).addTo(map);
      }
      map.on("click", async (e) => {
        if (!mountedRef.current) return;
        const { lat: clat, lng: clng } = e.latlng;
        if (markerRef.current) {
          markerRef.current.setLatLng([clat, clng]);
        } else {
          markerRef.current = L.marker([clat, clng]).addTo(map);
        }
        let geo = null;
        try {
          const resp = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${clat}&lon=${clng}&accept-language=es`
          );
          geo = await resp.json();
        } catch {}
        if (mountedRef.current) onLocationChangeRef.current(clat, clng, geo);
      });
      mapRef.current = map;
    };
    initMap();
    return () => {
      mountedRef.current = false;
      clearTimeout(timer);
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const map = mapRef.current;
    const L   = window.L;
    if (!map || !L) return;
    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);
    if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
      if (markerRef.current) {
        markerRef.current.setLatLng([parsedLat, parsedLng]);
      } else {
        markerRef.current = L.marker([parsedLat, parsedLng]).addTo(map);
      }
      if (!map.getBounds().contains([parsedLat, parsedLng])) {
        map.setView([parsedLat, parsedLng], 15);
      }
    }
  }, [lat, lng]);

  return (
    <div
      ref={containerRef}
      style={{ height: 260, width: "100%", borderRadius: 6, border: "1px solid #e5e7eb" }}
    />
  );
}

// ── PASO 3: Vía ───────────────────────────────────────────────────────────────
function StepVia() {
  const { form, setField, cats } = useForm();
  const f = (k) => form[k] ?? "";

  const handleMapLocation = useCallback((clat, clng, geo) => {
    setField("lat", String(parseFloat(clat.toFixed(6))));
    setField("lng", String(parseFloat(clng.toFixed(6))));
    if (geo?.address) {
      const addr  = geo.address;
      const city  = addr.city || addr.town || addr.village || addr.municipality || addr.county;
      const state = addr.state;
      const road  = addr.road || addr.suburb || addr.neighbourhood;
      if (city) setField("municipio", state ? `${city}, ${state}` : city);
      if (road) setField("calle", road);
    }
  }, [setField]);

  return (
    <div className="flex flex-col gap-4">
      {/* Sección: Datos de la vía */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Municipio / Estado" req>
          <input className={inp} placeholder="Por llenar" maxLength={200}
            value={f("municipio")} onChange={(e) => setField("municipio", e.target.value)} />
        </Field>
        <Field label="Calle / Referencia">
          <input className={inp} placeholder="Por llenar" maxLength={200}
            value={f("calle")} onChange={(e) => setField("calle", e.target.value)} />
        </Field>
        <Field label="Km / Punto de Referencia">
          <input className={inp} placeholder="Por llenar" maxLength={100}
            value={f("km_punto")} onChange={(e) => setField("km_punto", e.target.value)} />
        </Field>
        <Field label="Velocidad Máxima Permitida (km/h)" req>
          <input type="number" min="0" max="300" className={inp} placeholder="Por llenar"
            value={f("velocidad_maxima_permitida_kmh")}
            onChange={(e) => setField("velocidad_maxima_permitida_kmh", e.target.value)} />
        </Field>
        <CatSel field="tipo_via_id"             label="Tipo de Vía"             items={cats?.tipos_via} />
        <CatSel field="tipo_trazo_id"           label="Tipo de Trazo"           items={cats?.tipos_trazo} />
        <CatSel field="condicion_superficie_id" label="Condición de Superficie" items={cats?.condiciones_superficie} />
        <CatSel field="condicion_pavimento_id"  label="Condición de Pavimento"  items={cats?.condiciones_pavimento} />
        <CatSel field="tipo_pavimento_id"       label="Tipo de Pavimento"       items={cats?.tipos_pavimento} />
        <CatSel field="clima_id"                label="Clima"                   items={cats?.climas} />
        <CatSel field="orientacion_id"          label="Orientación de Vía"      items={cats?.orientaciones_via} />
        <CatSel field="sentido_vialidad_id"     label="Sentido de Vialidad"     items={cats?.sentidos_vialidad} />
      </div>

      {/* Sección: Ubicación en el mapa */}
      <div className="border border-gray-200 rounded p-3 flex flex-col gap-3 bg-gray-50/50">
        <div className="text-xs font-medium text-gray-700 border-b border-gray-100 pb-1.5">
          Ubicación del hecho
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Latitud">
            <input type="number" step="0.000001" className={inp} placeholder="Ej: 19.432600"
              value={f("lat")} onChange={(e) => setField("lat", e.target.value)} />
          </Field>
          <Field label="Longitud">
            <input type="number" step="0.000001" className={inp} placeholder="Ej: -99.133200"
              value={f("lng")} onChange={(e) => setField("lng", e.target.value)} />
          </Field>
        </div>
        <MapaPicker lat={f("lat")} lng={f("lng")} onLocationChange={handleMapLocation} />
      </div>
    </div>
  );
}

// ── PASO 4: Evidencia ─────────────────────────────────────────────────────────
const GRUPO_SIZE = 10;

function FotoCard({ foto, tipoNombre, onDelete }) {
  const [err, setErr]           = useState(false);
  const [lightbox, setLightbox] = useState(false);
  return (
    <>
      {lightbox && (
        <div
          className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center"
          onClick={() => setLightbox(false)}
        >
          <img
            src={foto.previewUrl}
            alt={tipoNombre}
            className="max-h-[90vh] max-w-[90vw] object-contain rounded shadow-xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/80"
            onClick={() => setLightbox(false)}
          >
            <X size={20} />
          </button>
        </div>
      )}
      <div className="relative group rounded border border-gray-200 overflow-hidden bg-gray-50">
        {err ? (
          <div className="w-full h-28 flex flex-col items-center justify-center text-gray-300 gap-1">
            <ImageIcon size={22} />
            <span className="text-xs">Sin vista previa</span>
            <button onClick={() => onDelete(foto)}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 z-10">
              <Trash2 size={11} />
            </button>
          </div>
        ) : (
          <>
            <img
              src={foto.previewUrl}
              alt=""
              className="w-full h-28 object-cover cursor-pointer"
              onClick={() => setLightbox(true)}
              onError={() => setErr(true)}
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setLightbox(true)}
                className="bg-white/20 text-white rounded-full p-1.5 hover:bg-white/40"
                title="Ver imagen"
              >
                <Maximize2 size={13} />
              </button>
              <button
                onClick={() => onDelete(foto)}
                className="bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600"
                title="Eliminar"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

function GrupoFotos({ tipo, fotos, onDelete }) {
  const [visibles, setVisibles] = useState(GRUPO_SIZE);
  const mostrar = fotos.slice(0, visibles);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide"
          style={{ color: "#1F6AA5" }}>{tipo.nombre}</span>
        <span className="text-xs bg-gray-100 text-gray-500 rounded px-1.5 py-0.5">{fotos.length}</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>
      <div className="grid grid-cols-5 gap-2">
        {mostrar.map((foto) => (
          <FotoCard key={foto.id} foto={foto} tipoNombre={tipo.nombre} onDelete={onDelete} />
        ))}
      </div>
      {visibles < fotos.length && (
        <button onClick={() => setVisibles((v) => v + GRUPO_SIZE)}
          className="self-start text-xs px-3 py-1 border border-gray-300 rounded text-gray-500 hover:border-[#00ADCF] hover:text-[#00ADCF] transition-colors">
          Cargar más ({fotos.length - visibles} restantes)
        </button>
      )}
    </div>
  );
}

function StepEvidencia() {
  const { cats, incidenteUuid, fotos, setFotos } = useForm();
  const [tipoSeleccionado, setTipoSeleccionado] = useState("");
  const [uploading, setUploading]               = useState(false);
  const [uploadError, setUploadError]           = useState("");
  const [dragOver, setDragOver]                 = useState(false);
  const fileInputRef                            = useRef(null);
  const tiposFoto = cats?.tipos_foto ?? [];

  const fotosPorTipo = {};
  for (const foto of fotos) {
    const k = String(foto.tipo_foto_id);
    if (!fotosPorTipo[k]) fotosPorTipo[k] = [];
    fotosPorTipo[k].push(foto);
  }
  const tiposConFotos = tiposFoto.filter((t) => fotosPorTipo[String(t.id)]?.length > 0);

  const subirArchivos = async (files) => {
    if (!files.length) return;
    if (!incidenteUuid) { setUploadError("Guarda primero el Paso 1 (Incidente)."); return; }
    if (!tipoSeleccionado) { setUploadError("Selecciona el tipo de foto antes de subir."); return; }

    setUploading(true);
    setUploadError("");
    for (const file of files) {
      const fd = new FormData();
      fd.append("tipo_foto_id", tipoSeleccionado);
      fd.append("foto", file);
      try {
        const { data } = await http.post(
          `/v1/rat/wizard/${incidenteUuid}/paso5-evidencia`,
          fd,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        const previewUrl = URL.createObjectURL(file);
        setFotos((prev) => [
          ...prev,
          { id: data.foto_id, tipo_foto_id: tipoSeleccionado, previewUrl, url: data.url },
        ]);
      } catch (err) {
        setUploadError(err?.response?.data?.message ?? "Error al subir foto.");
        break;
      }
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUpload  = (e) => subirArchivos(Array.from(e.target.files));
  const handleDrop    = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
    subirArchivos(files);
  };
  const handleDragOver  = (e) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = () => setDragOver(false);

  const handleDelete = async (foto) => {
    if (!incidenteUuid) return;
    try {
      await http.delete(`/v1/rat/wizard/${incidenteUuid}/paso5-evidencia/${foto.id}`);
      setFotos((prev) => prev.filter((f) => f.id !== foto.id));
    } catch (err) {
      setUploadError("Error al eliminar foto.");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Barra de carga */}
      <div className="flex flex-col gap-2 bg-gray-50 border border-gray-200 rounded p-3">
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-xs text-gray-600 mb-1">
              Tipo de Foto <span className="text-red-500">*</span>
            </label>
            <select className={sel} value={tipoSeleccionado}
              onChange={(e) => { setTipoSeleccionado(e.target.value); setUploadError(""); }}>
              <option value="">Seleccionar tipo...</option>
              {tiposFoto.map((t) => (
                <option key={t.id} value={t.id}>{t.nombre}</option>
              ))}
            </select>
          </div>
          <label className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded text-xs text-white transition-opacity
            ${(!tipoSeleccionado || uploading) ? "opacity-40 pointer-events-none" : ""}`}
            style={{ backgroundColor: "#00ADCF" }}>
            <Upload size={13} />
            {uploading ? "Subiendo…" : "Seleccionar fotos"}
            <input ref={fileInputRef} type="file" className="hidden" multiple
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleUpload} disabled={!tipoSeleccionado || uploading} />
          </label>
        </div>
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded flex items-center justify-center gap-2 py-3 text-xs transition-colors cursor-pointer
            ${dragOver
              ? "border-[#00ADCF] bg-[#E0F7FA] text-[#00ADCF]"
              : "border-gray-300 text-gray-400 hover:border-[#00ADCF] hover:text-[#00ADCF]"
            }
            ${(!tipoSeleccionado || uploading) ? "opacity-40 pointer-events-none" : ""}`}
          onClick={() => tipoSeleccionado && !uploading && fileInputRef.current?.click()}
        >
          <Upload size={14} />
          {uploading ? "Subiendo…" : "Arrastra imágenes aquí o haz clic para seleccionar"}
        </div>
      </div>

      {uploadError && (
        <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
          <AlertCircle size={13} /> {uploadError}
        </div>
      )}

      <div className="text-xs text-gray-500">
        {fotos.length} foto{fotos.length !== 1 ? "s" : ""} — {tiposConFotos.length} tipo{tiposConFotos.length !== 1 ? "s" : ""}
      </div>

      {/* Galería agrupada por tipo */}
      {fotos.length === 0 ? (
        <div className="border-2 border-dashed border-gray-200 rounded-lg py-12 flex flex-col items-center gap-2 text-gray-400">
          <ImageIcon size={32} />
          <span className="text-sm">Sin fotos todavía</span>
          <span className="text-xs">Selecciona el tipo y sube imágenes arriba</span>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {tiposConFotos.map((tipo) => (
            <GrupoFotos
              key={tipo.id}
              tipo={tipo}
              fotos={fotosPorTipo[String(tipo.id)]}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── PASO 5: Deformación ───────────────────────────────────────────────────────
function StepDeformacion() {
  const { form, setField, cats } = useForm();
  const numMed  = parseInt(form.numero_mediciones ?? "6", 10);
  const campos  = isNaN(numMed) || numMed < 1 ? 6 : Math.min(numMed, 20);
  const cLabels = Array.from({ length: campos }, (_, i) => `C${i + 1}`);
  const dmed = (() => {
    const vals = cLabels.map((c) => Number(form[`medicion_${c}`] || 0)).filter((v) => v > 0);
    if (!vals.length) return null;
    return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(4);
  })();

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="col-span-3 grid grid-cols-3 gap-4 bg-gray-50 border border-gray-200 rounded p-3">
        <CatSel field="tipo_golpe_id" label="Tipo de Golpe" req items={cats?.tipos_golpe} />
        <Field label="Número de Mediciones" req>
          <select className={sel} value={form.numero_mediciones ?? ""}
            onChange={(e) => setField("numero_mediciones", e.target.value)}>
            <option value="">Seleccionar...</option>
            <option value="2">2</option>
            <option value="4">4</option>
            <option value="6">6</option>
          </select>
        </Field>
        <Field label="Línea de Referencia (mm)">
          <input type="number" min="0" max="65535" className={inp} placeholder="Por llenar"
            value={form.linea_referencia_mm ?? ""}
            onChange={(e) => setField("linea_referencia_mm", e.target.value)} />
        </Field>
      </div>

      <div className="col-span-1 bg-gray-50 border border-gray-200 rounded p-3 flex flex-col items-center gap-2">
        <div className="text-xs text-gray-500 mb-1">Diagrama</div>
        <svg width="120" height="160" viewBox="0 0 120 160">
          <rect x="20" y="40" width="80" height="100" rx="8" stroke="#9CA3AF" strokeWidth="2" fill="#F9FAFB" />
        </svg>
        <div className="text-xs text-gray-400 text-center">Puntos activos: {campos}</div>
      </div>

      <div className="col-span-1 flex flex-col gap-3">
        <div className="text-xs text-gray-600 border-b border-gray-200 pb-1">Mediciones (mm)</div>
        <div className="grid grid-cols-2 gap-3">
          {cLabels.map((c) => (
            <Field key={c} label={`${c} (mm)`} req>
              <input type="number" min="0" max="99999" step="0.1" className={inp}
                value={form[`medicion_${c}`] ?? ""}
                onChange={(e) => setField(`medicion_${c}`, e.target.value)}
                placeholder="Por llenar" />
            </Field>
          ))}
        </div>
      </div>

      <div className="col-span-1 flex flex-col gap-3">
        <div className="text-xs text-gray-600 border-b border-gray-200 pb-1">Variables adicionales</div>
        <Field label="Ancho de contacto L (mm)" req>
          <input type="number" min="0" max="99999" step="0.1" className={inp} placeholder="0.0"
            value={form.l_ancho_contacto_m ?? ""}
            onChange={(e) => setField("l_ancho_contacto_m", e.target.value)} />
        </Field>
        <Field label="Ángulo FPI (°)">
          <input type="number" min="-90" max="90" step="0.01" className={inp} placeholder="0.0"
            value={form.angulo_fpi_grados ?? ""}
            onChange={(e) => setField("angulo_fpi_grados", e.target.value)} />
        </Field>
        <div className="bg-[#E0F7FA] border border-[#00ADCF]/30 rounded p-2 mt-2">
          <div className="text-xs text-gray-600 mb-1">Dmed calculado:</div>
          <div className="text-sm font-semibold text-[#00ADCF]">{dmed ? `${dmed} mm` : "—"}</div>
          <div className="text-xs text-gray-400">Promedio C1–C{campos}</div>
        </div>
      </div>
    </div>
  );
}

// ── PASO 6: Cálculo ───────────────────────────────────────────────────────────
function StepCalculo() {
  const { form, setField } = useForm();
  const [calcError, setCalcError] = React.useState("");

  const params = [
    { label: "Coeficiente A (N/m)",                key: "a_rigidez_n_m",             hint: "Rigidez longitudinal del vehículo",                             min: 0 },
    { label: "Coeficiente B (N/m²)",               key: "b_rigidez_n_m2",            hint: "Rigidez no lineal del vehículo",                                min: 0 },
    { label: "Dmed — promedio deformación (m)",     key: "dmed_m",                    hint: "Auto-calculado de C1…Cn al presionar Calcular",                 min: 0, max: 99.9999, step: 0.0001, readOnly: true },
    { label: "Tiempo de respuesta frenos (s)",      key: "tiempo_respuesta_frenos_s", hint: "Tiempo entre reacción y bloqueo de frenos",                     min: 0, max: 99.99, step: 0.01 },
    { label: "Velocidad final post-impacto (km/h)", key: "velocidad_final_kmh",       hint: "Velocidad del vehículo al detenerse tras el impacto (0 si para)", min: 0, max: 300,   step: 0.01 },
  ];
  const resultados = [
    { label: "Energía de deformación Ed (J)",                key: "e_deformacion_julios",      formula: "McHenry CRASH3: E = h·(A/2·ΣwᵢCᵢ + B/6·ΣwᵢCᵢCⱼ) + A²L/(2B)" },
    { label: "Energía corregida por ángulo (J)",             key: "e_def_corregida_julios",    formula: "E_corr = Ed × (1 + tan α)²" },
    { label: "EBS — Equiv. Barrier Speed (m/s)",             key: "ebs_m_s",                   formula: "EBS = √(2 × E_corr / m)  ← ΔV absorbido por deformación" },
    { label: "ΔV (cambio de velocidad en choque, km/h)",     key: "velocidad_impacto_kmh",     formula: "ΔV = EBS × 3.6" },
    { label: "Velocidad pre-impacto Vp (km/h)",              key: "velocidad_pre_impacto_kmh", formula: "Vp = √(ΔV² + Vf²)  ← velocidad antes del choque" },
    { label: "Verificación Limpert (km/h)",                  key: "velocidad_limpert_kmh",     formula: "VL = 4.4 × Dmed(cm) + 0.32  [solo válido si Dmed ≤ 60 cm]" },
    { label: "Exceso sobre velocidad máxima (km/h)",         key: "delta_exceso_kmh",          formula: "Δexc = Vp − V_máx_permitida" },
  ];

  const handleCalcular = () => {
    const A     = parseFloat(form.a_rigidez_n_m)     || 0;
    const B     = parseFloat(form.b_rigidez_n_m2)    || 0;
    // l_ancho_contacto_m is stored in mm in the form → convert to meters
    const L     = (parseFloat(form.l_ancho_contacto_m) || 0) / 1000;
    const alpha = parseFloat(form.angulo_fpi_grados)  || 0;
    const Vf    = parseFloat(form.velocidad_final_kmh) || 0;
    const Vmax  = parseFloat(form.velocidad_maxima_permitida_kmh) || 0;
    const m     = (parseFloat(form.peso_tara_kg)      || 0)
                + (parseFloat(form.peso_conductor_kg)  || 0)
                + (parseFloat(form.peso_pasajeros_kg)  || 0)
                + (parseFloat(form.peso_equipaje_kg)   || 0);

    // Leer mediciones C1..Cn (mm en el form → convertir a m)
    const nMed = Math.max(2, Math.min(parseInt(form.numero_mediciones || "6", 10), 20));
    const C    = Array.from({ length: nMed }, (_, i) =>
      (parseFloat(form[`medicion_C${i + 1}`]) || 0) / 1000
    );

    if (!A || !B) {
      setCalcError("Se necesitan los coeficientes A y B para calcular.");
      return;
    }
    if (!L) {
      setCalcError("Ingresa el Ancho de contacto L (mm) en el paso de Deformación.");
      return;
    }
    if (C.every((v) => v === 0)) {
      setCalcError("Ingresa las mediciones de deformación C1–Cn en el paso anterior.");
      return;
    }
    if (!m) {
      setCalcError("Ingresa el Peso Tara del vehículo en el paso Vehículo para calcular EBS.");
      return;
    }
    setCalcError("");

    const r2 = (v) => Math.round(v * 100) / 100;
    const r4 = (v) => Math.round(v * 10000) / 10000;

    // Dmed automático a partir de C measurements
    const Dmed = C.reduce((a, b) => a + b, 0) / C.length;

    // ── McHenry CRASH3 (integración trapezoidal con término residual) ──
    // E = h·(A/2·ΣwᵢCᵢ  +  B/6·ΣwᵢCᵢCⱼ)  +  A²L/(2B)
    // donde h = L/(n-1) y los pesos son: endpoints=1, interior=2 para los
    // términos lineales/cuadráticos, más productos cruzados adyacentes.
    const n = C.length;
    const h = L / (n - 1);

    let sumA = C[0] + C[n - 1];
    for (let i = 1; i < n - 1; i++) sumA += 2 * C[i];

    let sumB = C[0] * C[0] + C[n - 1] * C[n - 1];
    for (let i = 1; i < n - 1; i++) sumB += 2 * C[i] * C[i];
    for (let i = 0; i < n - 1; i++) sumB += C[i] * C[i + 1];

    const Ed    = h * ((A / 2) * sumA + (B / 6) * sumB) + L * (A * A) / (2 * B);
    const tanA  = Math.tan((alpha * Math.PI) / 180);
    const Ecorr = Ed * (1 + tanA) ** 2;
    const EBS   = Ecorr > 0 ? Math.sqrt((2 * Ecorr) / m) : 0; // m/s
    const dV    = EBS * 3.6;                       // ΔV en km/h
    const Vp    = Math.sqrt(dV ** 2 + Vf ** 2);   // velocidad pre-impacto
    // Limpert válido solo hasta Dmed ≤ 0.6 m (60 cm); en impactos severos da valores irreales
    const VL    = Dmed <= 0.6 ? r2(4.4 * (Dmed * 100) + 0.32) : null;
    const delta = r2(Vp - Vmax);                   // exceso vs límite

    setField("dmed_m",                    r4(Dmed));
    setField("e_deformacion_julios",      r2(Ed));
    setField("e_def_corregida_julios",    r2(Ecorr));
    setField("ebs_m_s",                   r4(EBS));
    setField("velocidad_impacto_kmh",     r2(dV));
    setField("velocidad_pre_impacto_kmh", r2(Vp));
    setField("velocidad_limpert_kmh",     VL ?? "");
    setField("delta_exceso_kmh",          delta);
  };

  const datosIncompletos = !form.a_rigidez_n_m && !form.b_rigidez_n_m2;
  const hayExceso = Number(form.delta_exceso_kmh) > 0;
  const velRelevante = form.velocidad_pre_impacto_kmh || form.velocidad_impacto_kmh || form.velocidad_final_kmh;

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <div className="text-xs text-gray-600 border-b border-gray-200 pb-1 mb-3">Parámetros de entrada</div>
        <div className="flex flex-col gap-2">
          {params.map((v) => (
            <div key={v.key}>
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-500 w-56 shrink-0">{v.label}</label>
                <input type="number"
                  className={v.readOnly ? `${inp} bg-gray-100 text-gray-500 cursor-default` : inp}
                  value={form[v.key] ?? ""}
                  readOnly={v.readOnly}
                  onChange={v.readOnly ? undefined : (e) => setField(v.key, e.target.value)}
                  {...(v.min  !== undefined && { min:  v.min  })}
                  {...(v.max  !== undefined && { max:  v.max  })}
                  {...(v.step !== undefined && { step: v.step })} />
              </div>
              <div className="text-[10px] text-gray-400 ml-0 mt-0.5 pl-0">{v.hint}</div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="text-xs text-gray-600 border-b border-gray-200 pb-1 mb-3 flex items-center gap-2">
          Resultados calculados
          <button
            type="button"
            onClick={handleCalcular}
            className="ml-auto flex items-center gap-1.5 px-3 py-1 text-xs text-white rounded"
            style={{ backgroundColor: "#00ADCF" }}
          >
            <FileText size={12} /> Calcular
          </button>
        </div>

        {calcError && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded px-3 py-2 text-xs text-red-700 mb-3">
            <AlertCircle size={13} className="mt-0.5 shrink-0" /> {calcError}
          </div>
        )}

        {datosIncompletos ? (
          <div className="flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded px-3 py-3 mb-3">
            <AlertCircle size={14} className="text-yellow-600 mt-0.5 shrink-0" />
            <div>
              <div className="text-xs font-medium text-yellow-800">Datos incompletos para realizar el cálculo</div>
              <div className="text-[11px] text-yellow-700 mt-0.5">Ingresa los coeficientes A, B y el Dmed, luego presiona "Calcular".</div>
            </div>
          </div>
        ) : null}

        <div className="flex flex-col gap-2">
          {resultados.map((v) => {
            const limpertNoAplica = v.key === "velocidad_limpert_kmh"
              && parseFloat(form.dmed_m) > 0.6
              && form.dmed_m !== "";
            return (
              <div key={v.key} className={`border rounded px-3 py-1.5 ${limpertNoAplica ? "bg-orange-50 border-orange-200" : "bg-gray-50 border-gray-200"}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-700 font-medium">{v.label}</span>
                  {limpertNoAplica
                    ? <span className="text-xs font-semibold text-orange-500">No aplica</span>
                    : <input
                        className="text-xs font-semibold text-[#00ADCF] bg-transparent border-none outline-none w-20 text-right"
                        value={form[v.key] ?? ""}
                        onChange={(e) => setField(v.key, e.target.value)}
                      />
                  }
                </div>
                <div className="text-[10px] text-gray-400 font-mono mt-0.5">{v.formula}</div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 p-3 border rounded" style={{ borderColor: "#00ADCF", backgroundColor: "#E0F7FA" }}>
          <div className="text-xs text-gray-600 mb-1">Diagnóstico de velocidad</div>
          {hayExceso ? (
            <div>
              <div className="flex items-center gap-2">
                <span className="text-red-600 font-semibold text-sm">EXCESO DETECTADO</span>
                <span className="text-xs text-red-500 font-medium">+{form.delta_exceso_kmh} km/h sobre el límite</span>
              </div>
              {velRelevante && (
                <div className="text-xs text-gray-600 mt-1">Velocidad calculada: <span className="font-semibold text-gray-800">{velRelevante} km/h</span></div>
              )}
            </div>
          ) : (
            <div>
              <span className="text-green-600 font-semibold text-sm">Sin exceso de velocidad</span>
              {velRelevante && (
                <div className="text-xs text-gray-600 mt-1">Velocidad calculada: <span className="font-semibold text-gray-800">{velRelevante} km/h</span></div>
              )}
            </div>
          )}
        </div>

        <div className="mt-3 border border-dashed border-[#00ADCF]/40 rounded p-3 bg-[#E0F7FA]">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="font-medium text-xs" style={{ color: "#00ADCF" }}>✦ Análisis con Inteligencia Artificial</span>
            <span className="text-[10px] bg-white text-[#00ADCF] px-1.5 rounded-full border border-[#00ADCF]/30">Próximamente</span>
          </div>
          <p className="text-[11px] text-gray-600 leading-relaxed mb-2">
            Análisis automático con IA para cálculo de velocidades y diagnóstico de colisiones a partir de los datos ingresados.
          </p>
          <button disabled
            className="w-full py-1.5 text-xs rounded border border-[#00ADCF]/40 bg-white cursor-not-allowed opacity-60"
            style={{ color: "#00ADCF" }}>
            Iniciar análisis con IA
          </button>
        </div>
      </div>
    </div>
  );
}

// ── PASO 7: Narrativa ─────────────────────────────────────────────────────────
const OBJETOS_CONOCIDOS = ["Vehículo automotor","Barra de contención (Jersey)","Poste de alumbrado","Árbol","Peatón","Motocicleta"];

function StepNarrativa() {
  const { form, setField } = useForm();
  const [otroActivo, setOtroActivo] = React.useState(
    !!form.objeto_involucrado && !OBJETOS_CONOCIDOS.includes(form.objeto_involucrado)
  );
  const selVal = otroActivo ? "__otro__" : (form.objeto_involucrado ?? "");

  const handleObjeto = (val) => {
    if (val === "__otro__") {
      setOtroActivo(true);
      setField("objeto_involucrado", "");
    } else {
      setOtroActivo(false);
      setField("objeto_involucrado", val);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="flex flex-col gap-4">
        <Field label="Objeto involucrado" req>
          <select className={sel} value={selVal} onChange={(e) => handleObjeto(e.target.value)}>
            <option value="">Seleccionar...</option>
            {OBJETOS_CONOCIDOS.map((d) => <option key={d} value={d}>{d}</option>)}
            <option value="__otro__">Otro (especificar)</option>
          </select>
          {otroActivo && (
            <input className={`${inp} mt-2`} placeholder="Describa el objeto involucrado..." maxLength={200}
              value={form.objeto_involucrado ?? ""}
              onChange={(e) => setField("objeto_involucrado", e.target.value)} />
          )}
        </Field>
        <Field label="Descripción del objeto fijo">
          <input className={inp} placeholder="Ej: Barra de contención metálica tipo Jersey" maxLength={200}
            value={form.descripcion_objeto_fijo ?? ""}
            onChange={(e) => setField("descripcion_objeto_fijo", e.target.value)} />
        </Field>
        <Field label="Posición final del vehículo">
          <input className={inp} placeholder="Ej: Carril derecho, orientación norte-sur" maxLength={300}
            value={form.posicion_final_vehiculo ?? ""}
            onChange={(e) => setField("posicion_final_vehiculo", e.target.value)} />
        </Field>
        <Field label="Dirección de circulación">
          <select className={sel} value={form.direccion_circulacion ?? ""}
            onChange={(e) => setField("direccion_circulacion", e.target.value)}>
            {["Norte","Sur","Este","Oeste","Noreste","Noroeste","Sureste","Suroeste"].map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </Field>
        <Field label="Distancia PPR al PC (m)">
          <input type="number" min="0" max="9999.9" step="0.1" className={inp}
            value={form.distancia_ppr_al_pc_m ?? ""}
            onChange={(e) => setField("distancia_ppr_al_pc_m", e.target.value)} />
        </Field>
        <Field label="Tiempo de reacción conductor (s)">
          <input type="number" min="0" max="99.99" step="0.01" className={inp}
            value={form.tiempo_reaccion_conductor_s ?? ""}
            onChange={(e) => setField("tiempo_reaccion_conductor_s", e.target.value)} />
        </Field>
        <Field label="Huellas de derrape (m)">
          <input type="number" min="0" max="9999.9" step="0.1" className={inp}
            value={form.huellas_derrape_m ?? ""}
            onChange={(e) => setField("huellas_derrape_m", e.target.value)} />
        </Field>
      </div>
      <div className="flex flex-col gap-3">
        <div className="text-xs text-gray-600 border-b border-gray-200 pb-1">Narrativa del Hecho</div>
        <textarea className={`${inp} h-40 resize-none`}
          placeholder="Redacte la narrativa técnica del hecho..."
          value={form.narracion_hechos ?? ""}
          onChange={(e) => setField("narracion_hechos", e.target.value)} />
      </div>
    </div>
  );
}

// ── PASO 8: Reporte ───────────────────────────────────────────────────────────
function StepReporte() {
  const { form, setField } = useForm();
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="col-span-2 flex flex-col gap-4">
        <div className="border border-gray-200 rounded p-3">
          <div className="text-xs font-medium text-gray-700 mb-2 border-b border-gray-100 pb-1">Principio de Intercambio de Materiales</div>
          <textarea className={`${inp} h-20 resize-none`}
            value={form.principio_intercambio_materiales ?? ""}
            onChange={(e) => setField("principio_intercambio_materiales", e.target.value)}
            placeholder="Se identificaron transferencias de pintura..." />
        </div>
        <div className="border border-gray-200 rounded p-3">
          <div className="text-xs font-medium text-gray-700 mb-2 border-b border-gray-100 pb-1">Principio de Correspondencia</div>
          <textarea className={`${inp} h-20 resize-none`}
            value={form.principio_correspondencia ?? ""}
            onChange={(e) => setField("principio_correspondencia", e.target.value)}
            placeholder="Las deformaciones son compatibles con..." />
        </div>
        <div className="border border-gray-200 rounded p-3">
          <div className="text-xs font-medium text-gray-700 mb-2 border-b border-gray-100 pb-1">Dinámica de Colisión</div>
          <textarea className={`${inp} h-20 resize-none`}
            value={form.dinamica_colision_fases ?? ""}
            onChange={(e) => setField("dinamica_colision_fases", e.target.value)}
            placeholder="Describe las fases del accidente: percepción, reacción, colisión y post-colisión..." />
        </div>
        <div className="border border-gray-200 rounded p-3">
          <div className="text-xs font-medium text-gray-700 mb-2 border-b border-gray-100 pb-1">Conclusiones Periciales</div>
          <textarea className={`${inp} h-24 resize-none`}
            value={form.conclusiones_texto ?? ""}
            onChange={(e) => setField("conclusiones_texto", e.target.value)}
            placeholder="Con base en la investigación pericial realizada..." />
        </div>
        <div className="border border-gray-200 rounded p-3">
          <div className="text-xs font-medium text-gray-700 mb-2">Tipo de documento</div>
          <select className={sel} value={form.tipo_documento ?? "informe"}
            onChange={(e) => setField("tipo_documento", e.target.value)}>
            <option value="informe">Informe</option>
            <option value="dictamen">Dictamen</option>
          </select>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <div className="bg-gray-50 border border-gray-200 rounded p-3">
          <div className="text-xs font-medium text-gray-700 mb-2 border-b border-gray-200 pb-1">Resumen del Caso</div>
          {[
            ["Expediente", form.numero_siniestro || "—"],
            ["Estado", form.estado === 0 ? "Abierto" : form.estado === 1 ? "En revisión" : "Finalizado"],
          ].map(([l, v]) => (
            <div key={l} className="flex justify-between text-xs py-0.5 border-b border-gray-100">
              <span className="text-gray-500">{l}</span>
              <span className="text-gray-700 font-medium">{v}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

// ── Componente principal ───────────────────────────────────────────────────────
export default function NuevoCaso() {
  const { id } = useParams();
  const editMode = Boolean(id);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep]                   = useState(0);
  const [saving, setSaving]               = useState(false);
  const [saveError, setSaveError]         = useState("");
  const [incidenteUuid, setIncidenteUuid] = useState(null);
  const [cats, setCats]                   = useState(null);
  const [peritos, setPeritos]             = useState([]);
  const [loadingEdit, setLoadingEdit]     = useState(editMode);
  const [fotos, setFotos]                 = useState([]);
  const [pendingStep, setPendingStep]     = useState(null);

  const [form, setFormState] = useState({
    numero_siniestro: "", tipo_hecho_id: "", fecha_hecho: "",
    hora_hecho: "", id_usuario_perito: "", estado: 0,
    tipo_documento: "informe",
  });

  const setField = useCallback((key, val) => {
    setFormState((prev) => ({ ...prev, [key]: val }));
  }, []);

  // Auto-asignar perito desde usuario autenticado
  useEffect(() => {
    if (user?.id_user) {
      setFormState((prev) => ({ ...prev, id_usuario_perito: user.id_user }));
    }
  }, [user]);

  // Cargar catálogos
  useEffect(() => {
    Promise.all([getCatalogos(), getPeritos()])
      .then(([c, p]) => { setCats(c); setPeritos(Array.isArray(p) ? p : []); })
      .catch(() => {});
  }, []);

  // Resolver numero_mediciones (texto libre) a partir del ID del catálogo al cargar en modo edición
  useEffect(() => {
    if (!cats || !form.numero_mediciones_id || form.numero_mediciones) return;
    const entry = (cats.numeros_mediciones ?? []).find(
      (c) => String(c.id) === String(form.numero_mediciones_id)
    );
    if (entry) setField("numero_mediciones", entry.nombre);
  }, [cats, form.numero_mediciones_id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll al inicio del contenido al cambiar de paso
  useEffect(() => {
    const main = document.querySelector("main");
    if (main) main.scrollTop = 0;
  }, [step]);

  // Auto-fill dmed al entrar al paso de cálculo (siempre actualiza desde mediciones)
  useEffect(() => {
    if (step !== 6) return;
    const nMed = Math.max(2, Math.min(parseInt(form.numero_mediciones || "6", 10), 20));
    const cVals = Array.from({ length: nMed }, (_, i) => parseFloat(form[`medicion_C${i + 1}`]))
      .filter((v) => !isNaN(v) && v > 0);
    if (cVals.length > 0) {
      const dmed_mm = cVals.reduce((a, b) => a + b, 0) / cVals.length;
      setField("dmed_m", (dmed_mm / 1000).toFixed(4));
    }
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cargar datos existentes en modo edición
  useEffect(() => {
    if (!editMode) return;
    setIncidenteUuid(id); // UUID ya conocido desde la URL; no depende de la respuesta
    setLoadingEdit(true);
    getIncidenteById(id)
      .then((raw) => {
        const inc = raw?.data || raw;
        // El modelo devuelve "uuid", no "incidente_uuid"
        if (inc.uuid) setIncidenteUuid(inc.uuid);
        const iv  = inc.vehiculos?.[0] ?? {};
        const veh = iv.vehiculo ?? {};
        const oc  = iv.ocupacion_carga ?? {};
        const ub  = inc.ubicacion_via ?? {};
        const def = iv.deformacion_medicion ?? {};
        const cal = iv.calculo_velocidad ?? {};
        const nar = iv.narrativa_dinamica ?? {};
        const pri = iv.principios_forenses ?? {};
        setFormState((prev) => ({
          ...prev,
          // Paso 0: Incidente
          numero_siniestro:         inc.numero_siniestro ?? "",
          tipo_hecho_id:            inc.tipo_hecho_id ?? "",
          tipo_hecho_descripcion:   inc.tipo_hecho_descripcion ?? "",
          // La API devuelve ISO timestamp; el input type=date necesita yyyy-MM-dd
          fecha_hecho:       inc.fecha_hecho ? String(inc.fecha_hecho).split('T')[0] : "",
          hora_hecho:        inc.hora_hecho ? String(inc.hora_hecho).substring(0, 5) : "",
          estado:            inc.estado ?? 0,
          id_usuario_perito: user?.id_user ?? inc.id_usuario_perito ?? "",
          // Paso 1: Vehículo
          vin:                       veh.vin ?? "",
          marca:                     veh.marca ?? "",
          submarca:                  veh.submarca ?? "",
          anio_modelo:               veh.anio_modelo ?? "",
          tipo_vehiculo:             veh.tipo_vehiculo ?? "",
          peso_tara_kg:              veh.peso_tara_kg ?? "",
          masa_maxima_autorizada_kg: veh.masa_maxima_autorizada_kg ?? "",
          ancho_mm:                  veh.ancho_mm ?? "",
          largo_mm:                  veh.largo_mm ?? "",
          alto_mm:                   veh.alto_mm ?? "",
          batalla_mm:                veh.batalla_mm ?? "",
          entrevia_delantera_mm:     veh.entrevia_delantera_mm ?? "",
          entrevia_trasera_mm:       veh.entrevia_trasera_mm ?? "",
          numero_placas:             iv.numero_placas ?? "",
          color_id:                  iv.color_id ?? "",
          estado_neumatico_id:       iv.estado_neumatico_id ?? "",
          rol:                       iv.rol ?? "",
          // Paso 2: Ocupantes
          numero_ocupantes:  oc.numero_ocupantes ?? "",
          peso_conductor_kg: oc.peso_conductor_kg ?? "",
          peso_pasajeros_kg: oc.peso_pasajeros_kg ?? "",
          peso_equipaje_kg:  oc.peso_equipaje_kg ?? "",
          // Paso 3: Vía
          calle:                         ub.calle ?? "",
          municipio:                     ub.municipio ?? "",
          km_punto:                      ub.km_punto ?? "",
          lat:                           ub.lat ?? "",
          lng:                           ub.lng ?? "",
          velocidad_maxima_permitida_kmh:ub.velocidad_maxima_permitida_kmh ?? "",
          tipo_via_id:                   ub.tipo_via_id ?? "",
          tipo_trazo_id:                 ub.tipo_trazo_id ?? "",
          condicion_superficie_id:       ub.condicion_superficie_id ?? "",
          condicion_pavimento_id:        ub.condicion_pavimento_id ?? "",
          tipo_pavimento_id:             ub.tipo_pavimento_id ?? "",
          clima_id:                      ub.clima_id ?? "",
          orientacion_id:                ub.orientacion_id ?? "",
          sentido_vialidad_id:           ub.sentido_vialidad_id ?? "",
          // Paso 5: Deformación (almacenado en metros → mostrar en mm)
          tipo_golpe_id:        def.tipo_golpe_id ?? "",
          numero_mediciones_id: def.numero_mediciones_id ?? "",
          numero_mediciones:    "",  // resuelto por useEffect cuando cargue cats
          medicion_C1:          def.c1_m != null ? def.c1_m * 1000 : "",
          medicion_C2:          def.c2_m != null ? def.c2_m * 1000 : "",
          medicion_C3:          def.c3_m != null ? def.c3_m * 1000 : "",
          medicion_C4:          def.c4_m != null ? def.c4_m * 1000 : "",
          medicion_C5:          def.c5_m != null ? def.c5_m * 1000 : "",
          medicion_C6:          def.c6_m != null ? def.c6_m * 1000 : "",
          l_ancho_contacto_m:   def.l_ancho_contacto_m != null ? def.l_ancho_contacto_m * 1000 : "",
          angulo_fpi_grados:    def.angulo_fpi_grados ?? "",
          linea_referencia_mm:  def.linea_referencia_mm ?? "",
          // Paso 6: Cálculo
          a_rigidez_n_m:             cal.a_rigidez_n_m ?? "",
          b_rigidez_n_m2:            cal.b_rigidez_n_m2 ?? "",
          dmed_m:                    cal.dmed_m ?? "",
          tiempo_respuesta_frenos_s: cal.tiempo_respuesta_frenos_s ?? "",
          velocidad_final_kmh:       cal.velocidad_final_kmh ?? "",
          e_deformacion_julios:      cal.e_deformacion_julios ?? "",
          e_def_corregida_julios:    cal.e_def_corregida_julios ?? "",
          ebs_m_s:                   cal.ebs_m_s ?? "",
          velocidad_impacto_kmh:     cal.velocidad_impacto_kmh ?? "",
          velocidad_pre_impacto_kmh: cal.velocidad_pre_impacto_kmh ?? "",
          velocidad_limpert_kmh:     cal.velocidad_limpert_kmh ?? "",
          delta_exceso_kmh:          cal.delta_exceso_kmh ?? "",
          // Paso 7: Narrativa
          narracion_hechos:            nar.narracion_hechos ?? "",
          objeto_involucrado:          nar.objeto_involucrado ?? "",
          descripcion_objeto_fijo:     nar.descripcion_objeto_fijo ?? "",
          posicion_final_vehiculo:     nar.posicion_final_vehiculo ?? "",
          direccion_circulacion:       nar.direccion_circulacion ?? "",
          distancia_ppr_al_pc_m:       nar.distancia_ppr_al_pc_m ?? "",
          tiempo_reaccion_conductor_s: nar.tiempo_reaccion_conductor_s ?? "",
          huellas_derrape_m:           nar.huellas_derrape_m ?? "",
          // Paso 8: Reporte
          principio_intercambio_materiales: pri.principio_intercambio_materiales ?? "",
          principio_correspondencia:        pri.principio_correspondencia ?? "",
          dinamica_colision_fases:          pri.dinamica_colision_fases ?? "",
          conclusiones_texto: (pri.conclusiones ?? []).map((c) => c.texto_conclusion).join("\n"),
          tipo_documento: inc.reportes?.[0]?.tipo_documento ?? "informe",
        }));
        // Cargar fotos existentes para previsualizarlas
        const fotosBd = iv.fotos ?? [];
        if (fotosBd.length > 0) {
          setFotos(fotosBd.map((f) => ({
            id:          f.id,
            tipo_foto_id:f.tipo_foto_id,
            url:         f.url,
            previewUrl:  `${API_URL}/v1/rat/fotos/${f.id}`,
          })));
        }
      })
      .catch(() => {})
      .finally(() => setLoadingEdit(false));
  }, [editMode, id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Lógica de guardado por paso ────────────────────────────────────────────
  const handleGuardar = useCallback(async () => {
    setSaveError("");
    setSaving(true);
    try {

      // ── PASO 0: Incidente ──
      if (step === 0) {
        if (!form.numero_siniestro?.trim()) throw new Error("El Número de Siniestro es obligatorio.");
        if (!form.tipo_hecho_id)            throw new Error("Selecciona el Tipo de Hecho.");
        if (!form.fecha_hecho)              throw new Error("La Fecha del Hecho es obligatoria.");
        if (form.fecha_hecho > new Date().toISOString().split("T")[0]) throw new Error("La Fecha del Hecho no puede ser una fecha futura.");
        if (!form.id_usuario_perito)        throw new Error("No se pudo identificar al perito. Inicia sesión nuevamente.");

        const payload = {
          numero_siniestro       : form.numero_siniestro.trim(),
          tipo_hecho_id          : Number(form.tipo_hecho_id),
          tipo_hecho_descripcion : form.tipo_hecho_descripcion?.trim() || null,
          fecha_hecho            : form.fecha_hecho,
          hora_hecho             : form.hora_hecho || null,
          id_usuario_perito      : Number(form.id_usuario_perito),
          estado                 : form.estado ?? 0,
        };

        if (editMode) {
          await updateIncidentePaso1(incidenteUuid, payload);
        } else {
          const res = await createIncidentePaso1(payload);
          setIncidenteUuid(res.incidente_uuid);
        }

      } else if (!incidenteUuid) {
        throw new Error("Primero completa y guarda el Paso 1 (Incidente).");

      // ── PASO 1: Vehículo ──
      } else if (step === 1) {
        if (!form.vin?.trim())    throw new Error("El VIN / Número de Serie es obligatorio.");
        if (!form.marca?.trim())  throw new Error("La Marca del vehículo es obligatoria.");
        if (!form.anio_modelo)    throw new Error("El Año del modelo es obligatorio.");
        const anio = Number(form.anio_modelo);
        if (isNaN(anio) || anio < 1886 || anio > 2030) throw new Error("El Año del modelo debe estar entre 1886 y 2030.");
        if (!form.tipo_vehiculo)  throw new Error("Selecciona el Tipo de Vehículo (Ligero / Pesado).");
        if (!form.rol)            throw new Error("Selecciona el Rol del vehículo (A, B o C).");

        await updatePaso2Vehiculo(incidenteUuid, {
          vin                      : form.vin.trim(),
          marca                    : form.marca.trim(),
          submarca                 : form.submarca || null,
          nombre_modelo            : form.nombre_modelo || null,
          anio_modelo              : Number(form.anio_modelo),
          tipo_vehiculo            : form.tipo_vehiculo,
          peso_tara_kg             : form.peso_tara_kg             ? Number(form.peso_tara_kg) : null,
          masa_maxima_autorizada_kg: form.masa_maxima_autorizada_kg ? Number(form.masa_maxima_autorizada_kg) : null,
          ancho_mm                 : form.ancho_mm                 ? Number(form.ancho_mm) : null,
          largo_mm                 : form.largo_mm                 ? Number(form.largo_mm) : null,
          alto_mm                  : form.alto_mm                  ? Number(form.alto_mm) : null,
          batalla_mm               : form.batalla_mm               ? Number(form.batalla_mm) : null,
          entrevia_delantera_mm    : form.entrevia_delantera_mm    ? Number(form.entrevia_delantera_mm) : null,
          entrevia_trasera_mm      : form.entrevia_trasera_mm      ? Number(form.entrevia_trasera_mm) : null,
          numero_placas            : form.numero_placas || null,
          color_id                 : form.color_id     ? Number(form.color_id) : null,
          estado_neumatico_id      : form.estado_neumatico_id ? Number(form.estado_neumatico_id) : null,
          rol                      : form.rol,
        });

      // ── PASO 2: Ocupantes ──
      } else if (step === 2) {
        await updatePaso3Ocupantes(incidenteUuid, {
          numero_ocupantes  : form.numero_ocupantes  ? Number(form.numero_ocupantes) : null,
          peso_conductor_kg : form.peso_conductor_kg ? Number(form.peso_conductor_kg) : null,
          peso_pasajeros_kg : form.peso_pasajeros_kg ? Number(form.peso_pasajeros_kg) : null,
          peso_equipaje_kg  : form.peso_equipaje_kg  ? Number(form.peso_equipaje_kg) : null,
        });

      // ── PASO 3: Vía ──
      } else if (step === 3) {
        if (!form.municipio?.trim())              throw new Error("El Municipio / Estado es obligatorio.");
        if (!form.velocidad_maxima_permitida_kmh) throw new Error("La Velocidad Máxima Permitida (km/h) es obligatoria.");

        await updatePaso4Via(incidenteUuid, {
          calle                          : form.calle || null,
          municipio                      : form.municipio || null,
          km_punto                       : form.km_punto || null,
          lat                            : form.lat ? Number(form.lat) : null,
          lng                            : form.lng ? Number(form.lng) : null,
          velocidad_maxima_permitida_kmh : form.velocidad_maxima_permitida_kmh ? Number(form.velocidad_maxima_permitida_kmh) : null,
          tipo_via_id                    : form.tipo_via_id             ? Number(form.tipo_via_id) : null,
          tipo_trazo_id                  : form.tipo_trazo_id           ? Number(form.tipo_trazo_id) : null,
          condicion_superficie_id        : form.condicion_superficie_id ? Number(form.condicion_superficie_id) : null,
          condicion_pavimento_id         : form.condicion_pavimento_id  ? Number(form.condicion_pavimento_id) : null,
          tipo_pavimento_id              : form.tipo_pavimento_id       ? Number(form.tipo_pavimento_id) : null,
          clima_id                       : form.clima_id                ? Number(form.clima_id) : null,
          orientacion_id                 : form.orientacion_id          ? Number(form.orientacion_id) : null,
          sentido_vialidad_id            : form.sentido_vialidad_id     ? Number(form.sentido_vialidad_id) : null,
        });

      // ── PASO 4: Evidencia ──
      } else if (step === 4) {
        // Las fotos se suben inline al seleccionarlas; aquí solo avanzamos

      // ── PASO 5: Deformación ──
      } else if (step === 5) {
        if (!form.tipo_golpe_id) throw new Error("Selecciona el Tipo de Golpe.");
        const _numMed = parseInt(form.numero_mediciones, 10);
        if (!form.numero_mediciones || isNaN(_numMed))
          throw new Error("Selecciona el Número de Mediciones (2, 4 o 6).");
        const MED_ID_FALLBACK = { 2: 1, 4: 2, 6: 3 };
        const _medCatEntry = (cats?.numeros_mediciones ?? []).find(
          (c) => parseInt(c.nombre, 10) === _numMed
        );
        const _medId = _medCatEntry?.id ?? MED_ID_FALLBACK[_numMed];
        if (!_medId) throw new Error("Número de mediciones inválido. Valores aceptados: 2, 4, 6.");
        if (!form.medicion_C1) throw new Error("La medición C1 es obligatoria.");
        if (!form.medicion_C2) throw new Error("La medición C2 es obligatoria.");
        if (_numMed >= 3 && !form.medicion_C3) throw new Error("La medición C3 es obligatoria para el número de mediciones indicado.");
        if (_numMed >= 4 && !form.medicion_C4) throw new Error("La medición C4 es obligatoria para el número de mediciones indicado.");
        if (_numMed >= 5 && !form.medicion_C5) throw new Error("La medición C5 es obligatoria para el número de mediciones indicado.");
        if (_numMed >= 6 && !form.medicion_C6) throw new Error("La medición C6 es obligatoria para el número de mediciones indicado.");

        await updatePaso6Deformacion(incidenteUuid, {
          tipo_golpe_id        : Number(form.tipo_golpe_id),
          numero_mediciones_id : _medId,
          c1_m                 : Number(form.medicion_C1) / 1000,
          c2_m                 : Number(form.medicion_C2) / 1000,
          c3_m                 : form.medicion_C3 ? Number(form.medicion_C3) / 1000 : 0,
          c4_m                 : form.medicion_C4 ? Number(form.medicion_C4) / 1000 : null,
          c5_m                 : form.medicion_C5 ? Number(form.medicion_C5) / 1000 : null,
          c6_m                 : form.medicion_C6 ? Number(form.medicion_C6) / 1000 : null,
          l_ancho_contacto_m   : form.l_ancho_contacto_m   ? Number(form.l_ancho_contacto_m) / 1000 : null,
          angulo_fpi_grados    : form.angulo_fpi_grados    ? Number(form.angulo_fpi_grados) : null,
          linea_referencia_mm  : form.linea_referencia_mm  ? Number(form.linea_referencia_mm) : null,
        });

      // ── PASO 6: Cálculo ──
      } else if (step === 6) {
        await storePaso7Calculo(incidenteUuid, {
          a_rigidez_n_m              : form.a_rigidez_n_m              ? Number(form.a_rigidez_n_m) : null,
          b_rigidez_n_m2             : form.b_rigidez_n_m2             ? Number(form.b_rigidez_n_m2) : null,
          dmed_m                     : form.dmed_m                     ? Number(form.dmed_m) : null,
          tiempo_respuesta_frenos_s  : form.tiempo_respuesta_frenos_s  ? Number(form.tiempo_respuesta_frenos_s) : null,
          velocidad_final_kmh        : form.velocidad_final_kmh        ? Number(form.velocidad_final_kmh) : null,
          e_deformacion_julios       : form.e_deformacion_julios       ? Number(form.e_deformacion_julios) : null,
          e_def_corregida_julios     : form.e_def_corregida_julios     ? Number(form.e_def_corregida_julios) : null,
          ebs_m_s                    : form.ebs_m_s                    ? Number(form.ebs_m_s) : null,
          velocidad_impacto_kmh      : form.velocidad_impacto_kmh      ? Number(form.velocidad_impacto_kmh) : null,
          velocidad_pre_impacto_kmh  : form.velocidad_pre_impacto_kmh  ? Number(form.velocidad_pre_impacto_kmh) : null,
          velocidad_limpert_kmh      : form.velocidad_limpert_kmh      ? Number(form.velocidad_limpert_kmh) : null,
          delta_exceso_kmh           : form.delta_exceso_kmh           ? Number(form.delta_exceso_kmh) : null,
        });

      // ── PASO 7: Narrativa ──
      } else if (step === 7) {
        if (!form.objeto_involucrado) throw new Error("Selecciona el Objeto Involucrado.");

        await updatePaso8Narrativa(incidenteUuid, {
          narracion_hechos            : form.narracion_hechos || null,
          objeto_involucrado          : form.objeto_involucrado || null,
          descripcion_objeto_fijo     : form.descripcion_objeto_fijo || null,
          posicion_final_vehiculo     : form.posicion_final_vehiculo || null,
          direccion_circulacion       : form.direccion_circulacion || null,
          distancia_ppr_al_pc_m       : form.distancia_ppr_al_pc_m ? Number(form.distancia_ppr_al_pc_m) : null,
          tiempo_reaccion_conductor_s : form.tiempo_reaccion_conductor_s ? Number(form.tiempo_reaccion_conductor_s) : null,
          huellas_derrape_m           : form.huellas_derrape_m ? Number(form.huellas_derrape_m) : null,
        });

      // ── PASO 8: Reporte (último paso) ──
      } else if (step === 8) {
        await updatePaso9Reporte(incidenteUuid, {
          principio_intercambio_materiales : form.principio_intercambio_materiales || null,
          principio_correspondencia        : form.principio_correspondencia || null,
          dinamica_colision_fases          : form.dinamica_colision_fases || null,
          conclusiones_texto               : form.conclusiones_texto || null,
          tipo_documento                   : form.tipo_documento || "informe",
          accion                           : form.accion || "guardar",
        });
        navigate(editMode ? `/expedientes/${id}` : "/expedientes");
        return;
      }

      setStep((s) => Math.min(s + 1, STEPS.length - 1));

    } catch (err) {
      const apiErrors = err?.response?.data?.errors;
      if (apiErrors) {
        const first = Object.values(apiErrors)[0];
        setSaveError(Array.isArray(first) ? first[0] : String(first));
      } else {
        setSaveError(err?.response?.data?.message || err?.message || "No se pudo guardar. Intenta de nuevo.");
      }
    } finally {
      setSaving(false);
    }
  }, [step, form, incidenteUuid, navigate, editMode, id]);

  const STEP_COMPONENTS = [
    <StepIncidente   key="incidente" />,
    <StepVehiculo    key="vehiculo" />,
    <StepOcupantes   key="ocupantes" />,
    <StepVia         key="via" />,
    <StepEvidencia   key="evidencia" />,
    <StepDeformacion key="deformacion" />,
    <StepCalculo     key="calculo" />,
    <StepNarrativa   key="narrativa" />,
    <StepReporte     key="reporte" />,
  ];

  const isLast = step === STEPS.length - 1;

  if (loadingEdit) {
    return (
      <div className="p-4 flex items-center justify-center min-h-64">
        <div className="text-sm text-gray-500">Cargando expediente...</div>
      </div>
    );
  }

  // ── Indicadores de completitud por paso ─────────────────────────────────────
  const stepComplete = [
    !!(form.numero_siniestro && form.tipo_hecho_id && form.fecha_hecho),
    !!(form.vin && form.marca && form.anio_modelo && form.tipo_vehiculo && form.rol),
    true,
    !!(form.municipio && form.velocidad_maxima_permitida_kmh),
    true,
    !!(form.tipo_golpe_id && form.numero_mediciones && form.medicion_C1 && form.medicion_C2),
    true,
    !!(form.objeto_involucrado),
    true,
  ];

  return (
    <FormCtx.Provider value={{ form, setField, cats, peritos, user, incidenteUuid, fotos, setFotos }}>
      <div className="p-4 flex flex-col gap-4">

        {/* Stepper */}
        <div className="bg-white border border-gray-200 rounded shadow-sm p-3">
          <div className="flex items-center">
            {STEPS.map((s, i) => {
              const isCurrent  = i === step;
              const isDone     = stepComplete[i] && i !== step;
              const isVisited  = i <= step;
              return (
                <div key={s.id} className="flex items-center flex-1">
                  <button
                    onClick={() => { setSaveError(""); if (i === step) return; setPendingStep(i); }}
                    className="flex flex-col items-center gap-1 group"
                    title={s.label}
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all
                      ${isCurrent
                        ? "text-white ring-2 ring-offset-1 ring-[#00ADCF]"
                        : isDone
                          ? "text-white"
                          : isVisited
                            ? "text-white"
                            : "bg-gray-100 text-gray-400 group-hover:bg-gray-200"}`}
                      style={{
                        backgroundColor: isCurrent ? "#00ADCF" : isDone ? "#22c55e" : isVisited ? "#00ADCF" : undefined,
                      }}
                    >
                      {isDone ? <Check size={13} /> : i + 1}
                    </div>
                    <span className={`text-xs whitespace-nowrap transition-colors
                      ${isCurrent ? "text-[#00ADCF] font-medium" : isDone ? "text-green-600" : "text-gray-400 group-hover:text-gray-600"}`}>
                      {s.label}
                    </span>
                  </button>
                  {i < STEPS.length - 1 && (
                    <div className="flex-1 h-px mx-2 mt-[-12px] transition-colors"
                      style={{ backgroundColor: stepComplete[i] && i < step ? "#22c55e" : i < step ? "#00ADCF" : "#E5E7EB" }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Contenido del paso */}
        <div className="bg-white border border-gray-200 rounded shadow-sm">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-500 rounded-t flex items-center justify-between">
            <span className="text-white text-sm">
              {editMode ? "Editar — " : "| "}{STEPS[step].label}
            </span>
            {incidenteUuid && (
              <span className="text-[11px] bg-white/20 text-white rounded px-2 py-0.5">
                ✓ {incidenteUuid}
              </span>
            )}
          </div>
          <div className="p-4">{STEP_COMPONENTS[step]}</div>
        </div>

        {/* Alerta de campos obligatorios */}
        {saveError && (
          <div className="flex items-start gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            <span className="font-medium">Campo obligatorio: </span>
            <span>{saveError}</span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(editMode ? `/expedientes/${id}` : "/expedientes")}
            className="px-4 py-2 text-xs border border-gray-300 rounded text-gray-600 hover:border-red-400 hover:text-red-600"
          >
            Cancelar
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => { setSaveError(""); setPendingStep(Math.max(0, step - 1)); }}
              disabled={step === 0}
              className="flex items-center gap-1 px-3 py-2 text-xs border border-gray-300 rounded text-gray-600 disabled:opacity-40 hover:border-[#00ADCF]"
            >
              <ChevronLeft size={14} /> Anterior
            </button>
            <button
              onClick={handleGuardar}
              disabled={saving}
              className="flex items-center gap-1 px-3 py-2 text-xs rounded text-white disabled:opacity-50"
              style={{ backgroundColor: isLast ? "#10B981" : "#00ADCF" }}
            >
              {saving
                ? "Guardando..."
                : isLast
                  ? (editMode ? "Actualizar expediente" : "Finalizar expediente")
                  : "Guardar y continuar"}
              {!isLast && <ChevronRight size={14} />}
            </button>
          </div>
        </div>

      </div>

      {/* Modal: navegar sin guardar */}
      {pendingStep !== null && pendingStep !== step && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
          <div className="bg-white rounded shadow-lg w-full max-w-sm p-6">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle size={18} className="text-yellow-500" />
              <span className="text-sm font-medium text-gray-800">Cambios sin guardar</span>
            </div>
            <p className="text-xs text-gray-500 mb-5">
              ¿Deseas continuar sin guardar los cambios del paso actual, o guardarlos antes de continuar?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setPendingStep(null)}
                className="px-3 py-1.5 text-xs border border-gray-300 rounded text-gray-600 hover:border-gray-400"
              >
                Cancelar
              </button>
              <button
                onClick={() => { setStep(pendingStep); setPendingStep(null); setSaveError(""); }}
                className="px-3 py-1.5 text-xs border border-gray-300 rounded text-gray-600 hover:border-red-400 hover:text-red-600"
              >
                Continuar sin guardar
              </button>
              <button
                onClick={async () => {
                  const target = pendingStep;
                  setPendingStep(null);
                  await handleGuardar();
                  setStep(target);
                }}
                disabled={saving}
                className="px-3 py-1.5 text-xs text-white rounded disabled:opacity-50"
                style={{ backgroundColor: "#00ADCF" }}
              >
                {saving ? "Guardando..." : "Guardar y continuar"}
              </button>
            </div>
          </div>
        </div>
      )}

    </FormCtx.Provider>
  );
}
 