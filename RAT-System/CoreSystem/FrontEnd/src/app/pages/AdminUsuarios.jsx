import { useState, useEffect } from "react";
import { Users, KeyRound, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";
import { getUsuarios, updateUserPassword } from "../../services/adminService";

function ModalPassword({ usuario, onClose, onSaved }) {
  const [pwd, setPwd]           = useState("");
  const [show, setShow]         = useState(false);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");
  const [confirming, setConfirming] = useState(false);

  const handlePedir = () => {
    if (pwd.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    setError("");
    setConfirming(true);
  };

  const handleConfirm = async () => {
    setSaving(true);
    setError("");
    try {
      await updateUserPassword(usuario.id_user, pwd);
      onSaved();
    } catch (e) {
      setError(e?.message || "Error al actualizar contraseña.");
      setConfirming(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded shadow-lg w-full max-w-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <KeyRound size={18} style={{ color: "#00ADCF" }} />
          <span className="text-sm font-medium text-gray-800">Cambiar contraseña</span>
        </div>

        <p className="text-xs text-gray-500 mb-4">
          Usuario: <span className="font-medium text-gray-700">{usuario.name}</span>
          <span className="text-gray-400 ml-1">({usuario.email})</span>
        </p>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded px-3 py-2 text-xs text-red-700 mb-3">
            <AlertCircle size={13} /> {error}
          </div>
        )}

        {confirming ? (
          <div className="mb-4">
            <div className="flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded px-3 py-3 mb-4">
              <AlertCircle size={14} className="text-yellow-600 mt-0.5 shrink-0" />
              <div className="text-xs text-yellow-800">
                ¿Deseas guardar esta nueva contraseña para <span className="font-semibold">{usuario.name}</span>?
                <br />Esta acción no se puede deshacer.
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirming(false)}
                className="px-3 py-1.5 text-xs border border-gray-300 rounded text-gray-600 hover:border-gray-400"
              >
                Volver
              </button>
              <button
                onClick={handleConfirm}
                disabled={saving}
                className="px-3 py-1.5 text-xs text-white rounded disabled:opacity-60"
                style={{ backgroundColor: "#00ADCF" }}
              >
                {saving ? "Guardando..." : "Sí, guardar"}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="relative mb-4">
              <input
                type={show ? "text" : "password"}
                placeholder="Nueva contraseña (mín. 8 caracteres)"
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                className="w-full pr-9 pl-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-[#00ADCF] focus:ring-1 focus:ring-[#00ADCF]"
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {show ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={onClose}
                className="px-3 py-1.5 text-xs border border-gray-300 rounded text-gray-600 hover:border-gray-400"
              >
                Cancelar
              </button>
              <button
                onClick={handlePedir}
                className="px-3 py-1.5 text-xs text-white rounded"
                style={{ backgroundColor: "#00ADCF" }}
              >
                Guardar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function AdminUsuarios() {
  const [usuarios, setUsuarios]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [modalUser, setModalUser]     = useState(null);
  const [successMsg, setSuccessMsg]   = useState("");

  const cargar = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getUsuarios();
      setUsuarios(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.message || "Error al cargar usuarios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const handleSaved = () => {
    setModalUser(null);
    setSuccessMsg("Contraseña actualizada correctamente.");
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  return (
    <div className="p-4 flex flex-col gap-4">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded shadow-sm">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
          <Users size={16} style={{ color: "#00ADCF" }} />
          <span className="text-sm font-medium text-gray-800">Gestión de Usuarios</span>
        </div>
        <p className="px-4 py-2 text-xs text-gray-500">
          Administra las credenciales de acceso de los peritos del sistema.
        </p>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded px-4 py-2 text-xs text-green-700">
          <CheckCircle size={14} /> {successMsg}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded px-4 py-2 text-xs text-red-700">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {/* Tabla */}
      <div className="bg-white border border-gray-200 rounded shadow-sm">
        <div className="flex items-center justify-between px-4 py-2.5 bg-gray-500 rounded-t">
          <div className="flex items-center gap-2">
            <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">
              {usuarios.length}
            </span>
            <span className="text-white text-sm">| Usuarios registrados</span>
          </div>
          {loading && <span className="text-xs text-gray-200">Cargando...</span>}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                {["#", "Nombre", "Correo electrónico", "No. Empleado", "Expedientes", "Acciones"].map((h) => (
                  <th key={h} className="text-left text-xs text-gray-500 px-3 py-2 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-gray-100">
                      {Array.from({ length: 6 }).map((__, j) => (
                        <td key={j} className="px-3 py-2">
                          <div className="animate-pulse bg-gray-200 rounded h-3 w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                : usuarios.map((u, i) => (
                    <tr key={u.id_user} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-3 py-2 text-xs text-gray-500">{i + 1}</td>
                      <td className="px-3 py-2 text-xs font-medium text-gray-800">{u.name ?? "—"}</td>
                      <td className="px-3 py-2 text-xs text-gray-600">{u.email}</td>
                      <td className="px-3 py-2 text-xs text-gray-600">{u.numero_empleado ?? "—"}</td>
                      <td className="px-3 py-2 text-xs text-gray-700 text-center">{u.total_expedientes ?? 0}</td>
                      <td className="px-3 py-2">
                        {u.email !== "admin@cesvi.com" && (
                          <button
                            onClick={() => setModalUser(u)}
                            className="flex items-center gap-1 px-2 py-1 text-xs border border-gray-300 rounded hover:border-[#00ADCF] hover:text-[#00ADCF] text-gray-600"
                            title="Cambiar contraseña"
                          >
                            <KeyRound size={13} /> Contraseña
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}

              {!loading && usuarios.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-xs text-gray-400">
                    No hay usuarios registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalUser && (
        <ModalPassword
          usuario={modalUser}
          onClose={() => setModalUser(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
