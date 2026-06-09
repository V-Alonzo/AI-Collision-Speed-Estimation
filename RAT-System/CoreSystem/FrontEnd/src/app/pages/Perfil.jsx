import React, { useState } from "react";
import { User, Mail, Shield, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePerfil } from "../../hooks/usePerfil";
import { useAuth } from "../../hooks/useAuth";

const ESTADO_LABEL = { 0: "Abierto", 1: "En revisión", 2: "Finalizado", 3: "Archivado" };
const ESTADO_BADGE = {
  0: "bg-blue-100 text-blue-700",
  1: "bg-yellow-100 text-yellow-700",
  2: "bg-green-100 text-green-700",
  3: "bg-gray-100 text-gray-700",
};

function Skeleton({ className = "" }) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />;
}

function InfoRow({ label, value }) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      <div className="px-2.5 py-1.5 text-xs border border-gray-200 rounded bg-gray-50 text-gray-700">
        {value || "—"}
      </div>
    </div>
  );
}

function TabDatos({ perfil, loading }) {
  return (
    <div className="max-w-sm flex flex-col gap-3">
      <div className="text-xs font-medium text-gray-700 mb-1 border-b border-gray-200 pb-1">Información de la cuenta</div>
      {loading ? (
        <>
          <Skeleton className="h-7 w-full" />
          <Skeleton className="h-7 w-full" />
        </>
      ) : (
        <>
          <InfoRow label="Nombre completo" value={perfil?.name} />
          <InfoRow label="Correo electrónico" value={perfil?.email} />
        </>
      )}
    </div>
  );
}

function TabExpedientes({ expedientes, loading, navigate }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-600">Mis últimos expedientes</span>
        <button onClick={() => navigate("/expedientes")} className="text-xs text-[#00ADCF] hover:underline">
          Ver todos
        </button>
      </div>
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            {["Expediente", "Fecha", "Tipo de Hecho", "Estado", "Acción"].map((h) => (
              <th key={h} className="text-left text-xs text-gray-500 px-3 py-2">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-100">
                  {Array.from({ length: 5 }).map((__, j) => (
                    <td key={j} className="px-3 py-2"><Skeleton className="h-3 w-full" /></td>
                  ))}
                </tr>
              ))
            : expedientes.length === 0
              ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-xs text-gray-400">
                    No hay expedientes registrados.
                  </td>
                </tr>
              )
              : expedientes.map((exp) => (
                <tr key={exp.uuid} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-2 text-xs text-[#00ADCF] font-medium">{exp.numero_siniestro}</td>
                  <td className="px-3 py-2 text-xs text-gray-600">{exp.fecha_hecho}</td>
                  <td className="px-3 py-2 text-xs text-gray-600">{exp.tipo_hecho}</td>
                  <td className="px-3 py-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${ESTADO_BADGE[exp.estado] ?? "bg-gray-100 text-gray-700"}`}>
                      {ESTADO_LABEL[exp.estado] ?? exp.estado}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <button onClick={() => navigate(`/expedientes/${exp.uuid}`)} className="text-[#00ADCF] hover:text-[#007A9A]">
                      <Eye size={15} />
                    </button>
                  </td>
                </tr>
              ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Perfil() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("datos");
  const { perfil, stats, expedientes, loading, error } = usePerfil();
  const { user } = useAuth();
  const isAdmin = user?.email === "admin@cesvi.com";

  return (
    <div className="p-4 flex flex-col gap-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded px-4 py-2 text-xs text-red-700">{error}</div>
      )}

      {/* Header card */}
      <div className="bg-white border border-gray-200 rounded shadow-sm p-4 flex items-center gap-6">
        <div className="w-16 h-16 rounded-full bg-[#E0F7FA] border-2 border-[#00ADCF] flex items-center justify-center shrink-0">
          <User size={32} style={{ color: "#00ADCF" }} />
        </div>
        <div className="flex-1">
          {loading
            ? <Skeleton className="h-5 w-48 mb-2" />
            : <div className="text-base text-gray-800">{perfil?.name ?? "—"}</div>}
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs bg-[#E0F7FA] text-[#00ADCF] px-2 py-0.5 rounded-full flex items-center gap-1">
              <Shield size={11} /> {isAdmin ? "Administrador" : "Perito"}
            </span>
            {loading
              ? <Skeleton className="h-3 w-32" />
              : (
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Mail size={11} /> {perfil?.email ?? "—"}
                </span>
              )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-center">
          {[
            { label: "Expedientes", val: stats?.expedientes, color: "text-gray-800" },
            { label: "Finalizados", val: stats?.finalizados, color: "text-gray-800" },
          ].map((s) => (
            <div key={s.label}>
              {loading
                ? <Skeleton className="h-6 w-10 mx-auto mb-1" />
                : <div className={`text-xl font-semibold ${s.color}`}>{s.val ?? "—"}</div>}
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-gray-200 rounded shadow-sm">
        <div className="flex border-b border-gray-200">
          {[
            { id: "datos",       label: "Datos Personales" },
            { id: "expedientes", label: "Mis Expedientes"  },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2.5 text-xs border-b-2 transition-colors ${
                activeTab === t.id ? "border-[#00ADCF] text-[#00ADCF]" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-4">
          {activeTab === "datos"       && <TabDatos       perfil={perfil}           loading={loading} />}
          {activeTab === "expedientes" && <TabExpedientes expedientes={expedientes} loading={loading} navigate={navigate} />}
        </div>
      </div>
    </div>
  );
}
