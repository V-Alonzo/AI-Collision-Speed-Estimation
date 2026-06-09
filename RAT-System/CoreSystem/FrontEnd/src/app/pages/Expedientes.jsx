import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Eye, Pencil, Trash2, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { useIncidentes } from "../../hooks/useIncidentes";
import { cambiarEstado } from "../../services/incidenteService";

const ESTADO_LABEL = { 0: "Abierto", 1: "En revisión", 2: "Finalizado", 3: "Archivado" };
const ESTADO_BADGE = {
  0: "bg-blue-100 text-blue-700",
  1: "bg-yellow-100 text-yellow-700",
  2: "bg-green-100 text-green-700",
  3: "bg-gray-100 text-gray-700",
};

const ESTADOS   = [{ label: "Todos", val: null }, { label: "Abierto", val: 0 }, { label: "En revisión", val: 1 }, { label: "Finalizado", val: 2 }];
const POR_PAG   = 10;

function Skeleton({ className = "" }) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />;
}

export default function Expedientes() {
  const navigate = useNavigate();
  const { loading, error, rows, load, remove } = useIncidentes();

  const [busqueda,     setBusqueda]     = useState("");
  const [filtroEstado, setFiltroEstado] = useState(null);
  const [fechaDesde,   setFechaDesde]   = useState("");
  const [fechaHasta,   setFechaHasta]   = useState("");
  const [pag,          setPag]          = useState(1);

  const filtrados = rows.filter((e) => {
    const term = busqueda.trim().toLowerCase();
    const matchSearch = !term ||
      e.numero_siniestro?.toLowerCase().includes(term) ||
      e.vehiculo?.toLowerCase().includes(term) ||
      e.tipo_hecho?.toLowerCase().includes(term) ||
      e.perito?.toLowerCase().includes(term);
    const matchEstado = filtroEstado === null || e.estado === filtroEstado;
    const matchDesde  = !fechaDesde || e.fecha_hecho >= fechaDesde;
    const matchHasta  = !fechaHasta || e.fecha_hecho <= fechaHasta;
    return matchSearch && matchEstado && matchDesde && matchHasta;
  });

  const total      = filtrados.length;
  const totalPags  = Math.max(1, Math.ceil(total / POR_PAG));
  const pagData    = filtrados.slice((pag - 1) * POR_PAG, pag * POR_PAG);

  const resetFiltros = () => {
    setBusqueda(""); setFiltroEstado(null);
    setFechaDesde(""); setFechaHasta(""); setPag(1);
  };

  const handleEliminar = async (uuid, numeroSiniestro) => {
    const { ok, error: err } = await remove(uuid, numeroSiniestro);
    if (!ok && err) alert(err);
  };

  return (
    <div className="p-4 flex flex-col gap-4">
      {/* Filtros */}
      <div className="bg-white border border-gray-200 rounded shadow-sm p-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar expediente..."
              value={busqueda}
              onChange={(e) => { setBusqueda(e.target.value); setPag(1); }}
              className="pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:border-[#00ADCF] w-44"
            />
          </div>

          <div className="flex items-center gap-1 text-xs text-gray-500">
            <span>Desde:</span>
            <input type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-[#00ADCF]" />
          </div>

          <div className="flex items-center gap-1 text-xs text-gray-500">
            <span>Hasta:</span>
            <input type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-[#00ADCF]" />
          </div>

          <select
            value={filtroEstado ?? ""}
            onChange={(e) => { setFiltroEstado(e.target.value === "" ? null : parseInt(e.target.value)); setPag(1); }}
            className="border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-[#00ADCF]"
          >
            {ESTADOS.map((s) => (
              <option key={s.label} value={s.val ?? ""}>{s.label}</option>
            ))}
          </select>

          <button onClick={resetFiltros}
            className="flex items-center gap-1 px-2 py-1.5 border border-gray-300 rounded text-xs text-gray-600 hover:border-[#00ADCF] hover:text-[#00ADCF]">
            <RotateCcw size={13} /> Limpiar
          </button>

          <div className="ml-auto">
            <button onClick={() => navigate("/expedientes/nuevo")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-white text-xs font-medium"
              style={{ backgroundColor: "#00ADCF" }}>
              <Plus size={14} /> Nuevo Expediente
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded px-4 py-2 text-xs text-red-700">{error}</div>
      )}

      {/* Tabla */}
      <div className="bg-white border border-gray-200 rounded shadow-sm">
        <div className="flex items-center justify-between px-4 py-2.5 bg-gray-500 rounded-t">
          <div className="flex items-center gap-2">
            <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">{total}</span>
            <span className="text-white text-sm">| Expedientes RAT</span>
          </div>
          {loading && <span className="text-xs text-gray-200">Cargando...</span>}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                {["#","No. Siniestro","Fecha","Hora","Tipo de Hecho","Vehículo","Perito","Estado","Vel. Pre-impacto","Exceso","Acciones"].map((h) => (
                  <th key={h} className="text-left text-xs text-gray-500 px-3 py-2 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="border-b border-gray-100">
                      {Array.from({ length: 11 }).map((__, j) => (
                        <td key={j} className="px-3 py-2"><Skeleton className="h-3 w-full" /></td>
                      ))}
                    </tr>
                  ))
                : pagData.map((exp, i) => (
                    <tr key={exp.uuid} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-3 py-2 text-xs text-gray-500">{(pag - 1) * POR_PAG + i + 1}</td>
                      <td className="px-3 py-2 text-xs text-[#00ADCF] font-medium">{exp.numero_siniestro}</td>
                      <td className="px-3 py-2 text-xs text-gray-600">{exp.fecha_hecho}</td>
                      <td className="px-3 py-2 text-xs text-gray-600">{exp.hora_hecho ?? "—"}</td>
                      <td className="px-3 py-2 text-xs text-gray-600">{exp.tipo_hecho}</td>
                      <td className="px-3 py-2 text-xs text-gray-600">{exp.vehiculo ?? "—"}</td>
                      <td className="px-3 py-2 text-xs text-gray-600">{exp.perito ?? "—"}</td>
                      <td className="px-3 py-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${ESTADO_BADGE[exp.estado] ?? "bg-gray-100 text-gray-700"}`}>
                          {ESTADO_LABEL[exp.estado] ?? exp.estado}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-700">
                        {exp.velocidad_pre_impacto_kmh
                          ? `${exp.velocidad_pre_impacto_kmh} km/h`
                          : exp.velocidad_final_kmh
                            ? `${exp.velocidad_final_kmh} km/h`
                            : "—"}
                      </td>
                      <td className="px-3 py-2">
                        {exp.exceso_velocidad
                          ? <span className="text-xs text-red-600 font-medium">Sí</span>
                          : <span className="text-xs text-gray-400">No</span>}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <button onClick={() => navigate(`/expedientes/${exp.uuid}`)} className="text-[#00ADCF] hover:text-[#007A9A]" title="Ver detalle">
                            <Eye size={15} />
                          </button>
                          <button onClick={() => navigate(`/expedientes/${exp.uuid}/editar`)} className="text-amber-500 hover:text-amber-700" title="Editar expediente">
                            <Pencil size={15} />
                          </button>
                          <button onClick={() => handleEliminar(exp.uuid, exp.numero_siniestro)} className="text-red-400 hover:text-red-600" title="Eliminar">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

              {!loading && pagData.length === 0 && (
                <tr>
                  <td colSpan={11} className="px-4 py-8 text-center text-xs text-gray-400">
                    No se encontraron expedientes con los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-200">
          <span className="text-xs text-gray-500">
            Mostrando {total === 0 ? 0 : (pag - 1) * POR_PAG + 1}–{Math.min(pag * POR_PAG, total)} de {total} registros
          </span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPag(Math.max(1, pag - 1))} disabled={pag === 1}
              className="p-1 rounded border border-gray-300 disabled:opacity-40 hover:border-[#00ADCF] hover:text-[#00ADCF]">
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPags }, (_, i) => i + 1).slice(Math.max(0, pag - 3), pag + 2).map((p) => (
              <button key={p} onClick={() => setPag(p)}
                className={`px-2.5 py-0.5 rounded border text-xs ${pag === p ? "text-white border-[#00ADCF]" : "border-gray-300 text-gray-600 hover:border-[#00ADCF]"}`}
                style={pag === p ? { backgroundColor: "#00ADCF" } : {}}>
                {p}
              </button>
            ))}
            <button onClick={() => setPag(Math.min(totalPags, pag + 1))} disabled={pag >= totalPags}
              className="p-1 rounded border border-gray-300 disabled:opacity-40 hover:border-[#00ADCF] hover:text-[#00ADCF]">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
