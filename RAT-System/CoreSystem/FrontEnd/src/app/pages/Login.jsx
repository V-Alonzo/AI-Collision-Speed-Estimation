import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, AlertCircle } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

function CesviLogo() {
  const color = "#00ADCF";
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
      <polygon
        points="28,4 52,18 52,38 28,52 4,38 4,18"
        stroke={color}
        strokeWidth="3"
        fill="none"
      />
      <polygon
        points="28,16 40,24 40,32 28,40 16,32 16,24"
        fill={color}
        opacity="0.6"
      />
      <polygon
        points="28,22 34,26 34,30 28,34 22,30 22,26"
        fill={color}
      />
    </svg>
  );
}

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Ingresa tu correo y contraseña.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Credenciales incorrectas.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      {/* Header bar */}
      <div className="fixed top-0 left-0 right-0 h-[52px] flex items-center px-6" style={{ backgroundColor: "#00ADCF" }}>
        <div className="flex items-center gap-3">
          <CesviLogo />
          <span className="text-white text-base font-medium tracking-wide">Sistema RAT – CESVI México</span>
        </div>
      </div>

      <div className="mt-[52px] w-full max-w-sm">
        <div className="bg-white border border-gray-200 rounded shadow-md">
          {/* Card header */}
          <div className="border-b border-gray-200 px-6 py-4 flex flex-col items-center gap-2">
            <CesviLogo />
            <p className="text-sm text-gray-500 text-center">Sistema RAT – CESVI México</p>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-6 flex flex-col gap-4">
            <div>
              <h2 className="text-base text-gray-800">Iniciar Sesión</h2>
              <p className="text-xs text-gray-500 mt-0.5">Ingresa tus credenciales institucionales</p>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded px-3 py-2 text-xs text-red-700">
                <AlertCircle size={14} />
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Correo electrónico <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <Mail size={15} />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@cesvi.com.mx"
                  className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-[#00ADCF] focus:ring-1 focus:ring-[#00ADCF]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Contraseña <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock size={15} />
                </span>
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-8 pr-8 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-[#00ADCF] focus:ring-1 focus:ring-[#00ADCF]"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 rounded text-white text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: "#00ADCF" }}
            >
              {loading ? "Verificando..." : "Iniciar Sesión"}
            </button>

          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          ©2026 CESVI México – Uso interno institucional
        </p>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 h-[38px] flex items-center justify-center text-white text-xs" style={{ backgroundColor: "#00ADCF" }}>
        ©2026 Creado por CESVI MÉXICO
      </div>
    </div>
  );
}
