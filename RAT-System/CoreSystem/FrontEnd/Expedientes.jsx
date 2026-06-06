import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Eye,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";

const EXPEDIENTES = [
  { id: "RAT-2026-024", fecha: "08/03/2026", hora: "14:30", tipo: "Colisión frontal", vehiculo: "Toyota Corolla 2019", placas: "ABD-123-4", perito: "Méndez C.", estado: "Abierto", velocidad: 87, exceso: true },
  { id: "RAT-2026-023", fecha: "07/03/2026", hora: "09:15", tipo: "Volcadura", vehiculo: "Nissan Frontier 2020", placas: "XYZ-789-0", perito: "García R.", estado: "En revisión", velocidad: 62, exceso: false },
  { id: "RAT-2026-022", fecha: "06/03/2026", hora: "21:45", tipo: "Colisión lateral", vehiculo: "Chevrolet Aveo 2018", placas: "GHJ-456-7", perito: "López M.", estado: "Finalizado", velocidad: 74, exceso: true },
  { id: "RAT-2026-021", fecha: "05/03/2026", hora: "07:20", tipo: "Atropellamiento", vehiculo: "Ford F-150 2021", placas: "MNP-321-5", perito: "Méndez C.", estado: "Finalizado", velocidad: 48, exceso: false },
  { id: "RAT-2026-020", fecha: "04/03/2026", hora: "18:00", tipo: "Colisión trasera", vehiculo: "Honda CR-V 2022", placas: "QRS-654-2", perito: "Torres J.", estado: "En revisión", velocidad: 91, exceso: true },
  { id: "RAT-2026-019", fecha: "03/03/2026", hora: "13:10", tipo: "Colisión frontal", vehiculo: "Volkswagen Jetta 2020", placas: "TUV-987-6", perito: "García R.", estado: "Finalizado", velocidad: 105, exceso: true },
  { id: "RAT-2026-018", fecha: "02/03/2026", hora: "22:30", tipo: "Volcadura", vehiculo: "Kia Sportage 2019", placas: "WXA-147-3", perito: "López M.", estado: "Abierto", velocidad: 55, exceso: false },
  { id: "RAT-2026-017", fecha: "01/03/2026", hora: "06:45", tipo: "Colisión lateral", vehiculo: "Mazda 3 2021", placas: "BCD-258-8", perito: "Torres J.", estado: "Finalizado", velocidad: 68, exceso: true },
  { id: "RAT-2026-016", fecha: "28/02/2026", hora: "16:20", tipo: "Colisión trasera", vehiculo: "Hyundai Tucson 2022", placas: "EFG-369-1", perito: "Méndez C.", estado: "Finalizado", velocidad: 43, exceso: false },
  { id: "RAT-2026-015", fecha: "27/02/2026", hora: "11:00", tipo: "Atropellamiento", vehiculo: "Dodge Ram 2020", placas: "HIJ-741-9", perito: "García R.", estado: "En revisión", velocidad: 72, exceso: true },
];

const ESTADO_BADGE = {
  Abierto: "bg-blue-100 text-blue-700",
  "En revisión": "bg-yellow-100 text-yellow-700",
  Finalizado: "bg-green-100 text-green-700",
};

const PERITOS = ["Todos", "Méndez C.", "García R.", "López M.", "Torres J."];
const ESTADOS = ["Todos", "Abierto", "En revisión", "Finalizado"];
const TIPOS = ["Todos", "Colisión frontal", "Colisión lateral", "Colisión trasera", "Volcadura", "Atropellamiento"];

export default function Expedientes() {
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [filtroTipo, setFiltroTipo] = useState("Todos");
  const [filtroPerito, setFiltroPerito] = useState("Todos");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [pag, setPag] = useState(1);
  const POR_PAG = 8;

  const filtrados = EXPEDIENTES.filter((e) => {
    const matchSearch =
      !busqueda ||
      e.id.toLowerCase().includes(busqueda.toLowerCase()) ||
      e.vehiculo.toLowerCase().includes(busqueda.toLowerCase()) ||
      e.tipo.toLowerCase().includes(busqueda.toLowerCase());

    const matchEstado = filtroEstado === "Todos" || e.estado === filtroEstado;
    const matchTipo = filtroTipo === "Todos" || e.tipo === filtroTipo;
    const matchPerito = filtroPerito === "Todos" || e.perito === filtroPerito;

    return matchSearch && matchEstado && matchTipo && matchPerito;
  });

  const total = filtrados.length;
  const totalPags = Math.ceil(total / POR_PAG);
  const pagData = filtrados.slice((pag - 1) * POR_PAG, pag * POR_PAG);

  const resetFiltros = () => {
    setBusqueda("");
    setFiltroEstado("Todos");
    setFiltroTipo("Todos");
    setFiltroPerito("Todos");
    setFechaDesde("");
    setFechaHasta("");
    setPag(1);
  };

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="bg-white border border-gray-200 rounded shadow-sm p-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar expediente..."
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setPag(1);
              }}
              className="pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:border-[#00ADCF] w-44"
            />
          </div>

          <div className="flex items-center gap-1 text-xs text-gray-500">
            <span>Desde:</span>
            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-[#00ADCF]"
            />
          </div>

          <div className="flex items-center gap-1 text-xs text-gray-500">
            <span>Hasta:</span>
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-[#00ADCF]"
            />
          </div>

          <select
            value={filtroEstado}
            onChange={(e) => {
              setFiltroEstado(e.target.value);
              setPag(1);
            }}
            className="border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-[#00ADCF]"
          >
            {ESTADOS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>

          <select
            value={filtroTipo}
            onChange={(e) => {
              setFiltroTipo(e.target.value);
              setPag(1);
            }}
            className="border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-[#00ADCF]"
          >
            {TIPOS.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>

          <select
            value={filtroPerito}
            onChange={(e) => {
              setFiltroPerito(e.target.value);
              setPag(1);
            }}
            className="border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-[#00ADCF]"
          >
            {PERITOS.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>

          <button
            onClick={resetFiltros}
            className="flex items-center gap-1 px-2 py-1.5 border border-gray-300 rounded text-xs text-gray-600 hover:border-[#00ADCF] hover:text-[#00ADCF]"
          >
            <RotateCcw size={13} /> Limpiar
          </button>

          <div className="ml-auto">
            <button
              onClick={() => navigate("/expedientes/nuevo")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-white text-xs font-medium"
              style={{ backgroundColor: "#00ADCF" }}
            >
              <Plus size={14} /> Nuevo Expediente
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded shadow-sm">
        <div className="flex items-center justify-between px-4 py-2.5 bg-gray-500 rounded-t">
          <div className="flex items-center gap-2">
            <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">{filtrados.length}</span>
            <span className="text-white text-sm">| Expedientes RAT</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                {["#", "No. Siniestro", "Fecha", "Hora", "Tipo de Hecho", "Vehículo", "Perito", "Estado", "Vel. Calculada", "Exceso", "Acciones"].map((h) => (
                  <th key={h} className="text-left text-xs text-gray-500 px-3 py-2 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pagData.map((exp, i) => (
                <tr key={exp.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-2 text-xs text-gray-500">{(pag - 1) * POR_PAG + i + 1}</td>
                  <td className="px-3 py-2 text-xs text-[#00ADCF] font-medium">{exp.id}</td>
                  <td className="px-3 py-2 text-xs text-gray-600">{exp.fecha}</td>
                  <td className="px-3 py-2 text-xs text-gray-600">{exp.hora}</td>
                  <td className="px-3 py-2 text-xs text-gray-600">{exp.tipo}</td>
                  <td className="px-3 py-2 text-xs text-gray-600">{exp.vehiculo}</td>
                  <td className="px-3 py-2 text-xs text-gray-600">{exp.perito}</td>
                  <td className="px-3 py-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${ESTADO_BADGE[exp.estado] || "bg-gray-100 text-gray-700"}`}>
                      {exp.estado}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs text-gray-700">{exp.velocidad} km/h</td>
                  <td className="px-3 py-2">
                    {exp.exceso ? <span className="text-xs text-red-600 font-medium">Sí</span> : <span className="text-xs text-gray-400">No</span>}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <button onClick={() => navigate(`/expedientes/${exp.id}`)} className="text-[#00ADCF] hover:text-[#007A9A]" title="Ver detalle">
                        <Eye size={15} />
                      </button>
                      <button className="text-red-500 hover:text-red-700" title="Editar">
                        <Edit2 size={15} />
                      </button>
                      <button className="text-red-400 hover:text-red-600" title="Eliminar">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {pagData.length === 0 && (
                <tr>
                  <td colSpan={11} className="px-4 py-8 text-center text-xs text-gray-400">
                    No se encontraron expedientes con los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-200">
          <span className="text-xs text-gray-500">
            Mostrando {Math.min((pag - 1) * POR_PAG + 1, total)}–{Math.min(pag * POR_PAG, total)} de {total} registros
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPag(Math.max(1, pag - 1))}
              disabled={pag === 1}
              className="p-1 rounded border border-gray-300 disabled:opacity-40 hover:border-[#00ADCF] hover:text-[#00ADCF]"
            >
              <ChevronLeft size={14} />
            </button>

            {Array.from({ length: totalPags }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPag(p)}
                className={`px-2.5 py-0.5 rounded border text-xs ${
                  pag === p ? "text-white border-[#00ADCF]" : "border-gray-300 text-gray-600 hover:border-[#00ADCF]"
                }`}
                style={pag === p ? { backgroundColor: "#00ADCF" } : {}}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => setPag(Math.min(totalPags, pag + 1))}
              disabled={pag === totalPags || totalPags === 0}
              className="p-1 rounded border border-gray-300 disabled:opacity-40 hover:border-[#00ADCF] hover:text-[#00ADCF]"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
