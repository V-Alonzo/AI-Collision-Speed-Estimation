import React, { useEffect, useState } from "react";
import { Plus, RotateCcw, X, Trash2, Edit2, Check, LayoutGrid } from "lucide-react";
import { getCatalogos, getPeritos, createCatalogoItem, updateCatalogoItem, deleteCatalogoItem } from "../../services/catalogosService";
import { useAuth } from "../../hooks/useAuth";

const CATALOGO_MAP = [
  { label: "Tipos de Hecho",               key: "tipos_hecho" },
  { label: "Tipos de Vía",                  key: "tipos_via" },
  { label: "Tipos de Trazo",               key: "tipos_trazo" },
  { label: "Tipos de Intersección",         key: "tipos_interseccion" },
  { label: "Señalamientos Vertical",        key: "senalamientos_vertical" },
  { label: "Señalamientos Horizontal",      key: "senalamientos_horizontal" },
  { label: "Condiciones de Superficie",     key: "condiciones_superficie" },
  { label: "Condiciones de Pavimento",      key: "condiciones_pavimento" },
  { label: "Tipos de Pavimento",            key: "tipos_pavimento" },
  { label: "Climas",                        key: "climas" },
  { label: "Orientaciones de Vía",          key: "orientaciones_via" },
  { label: "Sentidos de Vialidad",          key: "sentidos_vialidad" },
  { label: "Estados de Neumático",          key: "estados_neumatico" },
  { label: "Colores",                       key: "colores" },
  { label: "Tipos de Foto",                 key: "tipos_foto" },
  { label: "Tipos de Golpe",               key: "tipos_golpe" },
  { label: "Número de Mediciones",          key: "numeros_mediciones" },
  { label: "Tipos de Indicio",              key: "tipos_indicio" },
  { label: "Posiciones Iniciales",          key: "posiciones_iniciales" },
  { label: "Percepciones Real",             key: "percepciones_real" },
  { label: "Puntos Clave",                  key: "puntos_clave" },
  { label: "Trayectorias Post",             key: "trayectorias_post" },
  { label: "Zonas de Vehículo",             key: "zonas_vehiculo" },
  { label: "Tipos de Daño",                key: "tipos_dano" },
  { label: "Cuerpos Generador",             key: "cuerpos_generador" },
  { label: "Direcciones de Daño",          key: "direcciones_dano" },
  { label: "Consecuencias de Daño",        key: "consecuencias_dano" },
  { label: "Peritos Registrados",           key: "__peritos__" },
];

function Skeleton({ className = "" }) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />;
}

function CrudModal({ onClose, catKey, catName, editRow, onSaved }) {
  const isEdit = !!editRow;
  const [nombre, setNombre] = useState(editRow?.nombre ?? "");
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState("");

  const handleSave = async () => {
    if (!nombre.trim()) { setErr("El nombre es obligatorio."); return; }
    setSaving(true);
    setErr("");
    try {
      const result = isEdit
        ? await updateCatalogoItem(catKey, editRow.id, nombre)
        : await createCatalogoItem(catKey, nombre);
      onSaved(result, isEdit);
    } catch (e) {
      setErr(e?.response?.data?.message || "Error al guardar.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded shadow-xl w-full max-w-md border border-gray-200">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
            <span className="text-sm font-medium text-gray-700">
              {isEdit ? "Editar" : "Nuevo"} – {catName}
            </span>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
          </div>
          <div className="px-4 py-4 flex flex-col gap-3">
            {isEdit && (
              <div>
                <label className="block text-xs text-gray-500 mb-1">ID</label>
                <div className="px-2.5 py-1.5 text-xs border border-gray-200 rounded bg-gray-50 text-gray-500">{editRow.id}</div>
              </div>
            )}
            <div>
              <label className="block text-xs text-gray-600 mb-1">Nombre <span className="text-red-500">*</span></label>
              <input
                className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:border-[#00ADCF]"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
                autoFocus
              />
            </div>
            {err && <div className="text-xs text-red-600">{err}</div>}
          </div>
          <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-gray-200 bg-gray-50">
            <button onClick={onClose} className="px-4 py-1.5 text-xs border border-gray-300 rounded text-gray-600 hover:border-gray-400">
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-1.5 text-xs text-white rounded disabled:opacity-50 flex items-center gap-1.5"
              style={{ backgroundColor: "#00ADCF" }}
            >
              <Check size={13} /> {saving ? "Guardando…" : "Guardar"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function renderCellValue(val) {
  if (val === null || val === undefined) return "—";
  if (typeof val === "boolean") return val ? "Sí" : "No";
  return String(val);
}

export default function Catalogos() {
  const { user }                            = useAuth();
  const isAdmin                             = user?.email === "admin@cesvi.mx";
  const [catSelected, setCatSelected]       = useState(CATALOGO_MAP[0].key);
  const [allData,     setAllData]           = useState({});
  const [loading,     setLoading]           = useState(true);
  const [error,       setError]             = useState("");
  const [showModal,   setShowModal]         = useState(false);
  const [editRow,     setEditRow]           = useState(null);
  const [deleting,    setDeleting]          = useState(null);

  const isCrudable = isAdmin && catSelected !== "__peritos__";

  const loadAll = async () => {
    setLoading(true);
    setError("");
    try {
      const [cats, peritos] = await Promise.all([getCatalogos(), getPeritos()]);
      setAllData({ ...cats, __peritos__: peritos });
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Error al cargar catálogos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const rows     = allData[catSelected] ?? [];
  const cols     = rows.length > 0 ? Object.keys(rows[0]) : [];
  const catLabel = CATALOGO_MAP.find((c) => c.key === catSelected)?.label ?? catSelected;

  const openEdit = (row) => { setEditRow(row); setShowModal(true); };
  const openNew  = ()    => { setEditRow(null); setShowModal(true); };
  const closeModal = ()  => { setShowModal(false); setEditRow(null); };

  const handleSaved = (result, isEdit) => {
    setAllData((prev) => {
      const list = prev[catSelected] ?? [];
      const updated = isEdit
        ? list.map((r) => r.id === result.id ? result : r)
        : [...list, result];
      return { ...prev, [catSelected]: updated };
    });
    closeModal();
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`¿Eliminar "${row.nombre}"? Esta acción no se puede deshacer.`)) return;
    setDeleting(row.id);
    try {
      await deleteCatalogoItem(catSelected, row.id);
      setAllData((prev) => ({
        ...prev,
        [catSelected]: (prev[catSelected] ?? []).filter((r) => r.id !== row.id),
      }));
    } catch (e) {
      setError(e?.response?.data?.message || "Error al eliminar.");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="p-4 flex flex-col gap-3">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded px-4 py-2 text-xs text-red-700 flex items-center justify-between">
          {error}
          <button onClick={() => setError("")}><X size={13} /></button>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded shadow-sm p-3">
        <div className="flex items-center gap-3 flex-wrap">
          <label className="text-xs text-gray-700">Catálogo:</label>
          <select
            className="pl-2.5 pr-8 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:border-[#00ADCF] bg-white min-w-[220px]"
            value={catSelected}
            onChange={(e) => setCatSelected(e.target.value)}
            disabled={loading}
          >
            {CATALOGO_MAP.map((c) => (
              <option key={c.key} value={c.key}>{c.label}</option>
            ))}
          </select>
          <button onClick={loadAll} className="p-1.5 rounded text-white" style={{ backgroundColor: "#00ADCF" }} disabled={loading} title="Recargar">
            <RotateCcw size={14} className={loading ? "animate-spin" : ""} />
          </button>
          {isCrudable && (
            <button
              onClick={openNew}
              className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-xs text-white rounded"
              style={{ backgroundColor: "#00ADCF" }}
            >
              <Plus size={13} /> Nuevo registro
            </button>
          )}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded shadow-sm">
        <div className="flex items-center justify-between px-4 py-2.5 rounded-t" style={{ backgroundColor: "#9E9E9E" }}>
          <div className="flex items-center gap-2">
            <LayoutGrid size={18} className="text-white" />
            <span className="text-white text-sm">| {catLabel} ({loading ? "…" : rows.length})</span>
          </div>
        </div>

        <div className="overflow-x-auto" style={{ maxHeight: "calc(100vh - 260px)", overflowY: "auto" }}>
          <table className="w-full">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gray-50 border-b border-gray-200">
                {loading
                  ? ["#", "Campo 1", "Campo 2", "Acciones"].map((h) => (
                      <th key={h} className="text-left text-xs text-gray-500 px-3 py-2 whitespace-nowrap">{h}</th>
                    ))
                  : cols.map((c) => (
                      <th key={c} className="text-left text-xs text-gray-500 px-3 py-2 whitespace-nowrap capitalize">
                        {c.replace(/_/g, " ")}
                      </th>
                    )).concat(
                      <th key="__actions" className="text-right text-xs text-gray-500 px-3 py-2 w-20">Acciones</th>
                    )}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="border-b border-gray-100">
                      {Array.from({ length: 4 }).map((__, j) => (
                        <td key={j} className="px-3 py-2"><Skeleton className="h-3 w-full" /></td>
                      ))}
                    </tr>
                  ))
                : rows.length === 0
                  ? (
                    <tr>
                      <td colSpan={cols.length + 1} className="px-4 py-8 text-center text-xs text-gray-400">
                        No hay registros en este catálogo.
                      </td>
                    </tr>
                  )
                  : rows.map((row, i) => (
                    <tr key={row.id ?? i} className="border-b border-gray-100 hover:bg-gray-50">
                      {cols.map((c) => (
                        <td key={c} className="px-3 py-2 text-xs text-gray-700 max-w-[200px] truncate">
                          {renderCellValue(row[c])}
                        </td>
                      ))}
                      <td className="px-3 py-2">
                        <div className="flex items-center justify-end gap-2">
                          {isCrudable && (
                            <>
                              <button onClick={() => openEdit(row)} className="text-[#00ADCF] hover:text-[#007A9A]" title="Editar">
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => handleDelete(row)}
                                disabled={deleting === row.id}
                                className="text-red-400 hover:text-red-600 disabled:opacity-40"
                                title="Eliminar"
                              >
                                <Trash2 size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && isCrudable && (
        <CrudModal
          onClose={closeModal}
          catKey={catSelected}
          catName={catLabel}
          editRow={editRow}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
