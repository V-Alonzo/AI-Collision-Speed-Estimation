import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import {
  LayoutDashboard,
  FileText,
  BookOpen,
  User,
  Users,
  Gauge,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";
import {Icon} from "@iconify/react";
const BRAND_COLOR = "#00ADCF";

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(true);
  const [tooltip, setTooltip]     = useState(null);
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user }  = useAuth();
  const isAdmin   = user?.email === "admin@cesvi.com";

  const NAV_ITEMS = [
    { id: "dashboard",   icon: <LayoutDashboard size={20} />, label: "Dashboard",       path: "/" },
    { id: "expedientes", icon: <FileText size={20} />,        label: "Expedientes RAT", path: "/expedientes" },
    { id: "ia-velocidad", icon: <Gauge size={20} />,          label: "Estimación IA",   path: "/ia/estimacion-velocidad" },
    { id: "catalogos",   icon: <BookOpen size={20} />,         label: "Catálogos",       path: "/configuracion/catalogos" },
    ...(isAdmin ? [{ id: "admin", icon: <Users size={20} />, label: "Usuarios", path: "/admin/usuarios" }] : []),
    { id: "perfil",      icon: <User size={20} />,            label: "Perfil",           path: "/perfil" },
    { id: "estimacion-velocidad", icon: <Icon icon="eos-icons:ai-operator" width={20} />, label: "Estimación de Velocidad", path: "/estimacion-velocidad" },
  ];

  const isActive = (item) => {
    if (item.path === "/") return location.pathname === "/";
    return location.pathname.startsWith(item.path);
  };

  const sidebarWidth = collapsed ? "w-[60px]" : "w-[200px]";

  return (
    <aside
      className={`relative flex flex-col bg-white border-r border-gray-200 transition-all duration-200 z-40 ${sidebarWidth} shrink-0`}
      style={{ minHeight: "100vh" }}
    >
      <div
        className="flex items-center justify-center h-[52px] border-b border-gray-100 cursor-pointer"
        onClick={() => navigate("/")}
        title="CESVI México"
      >
        <CesviLogo color={BRAND_COLOR} />
      </div>

      <nav className="flex flex-col gap-1 p-2 flex-1 relative">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item);
          return (
            <div key={item.id} className="relative">
              <button
                onClick={() => navigate(item.path)}
                onMouseEnter={(e) => {
                  if (collapsed) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setTooltip({ id: item.id, y: rect.top });
                  }
                }}
                onMouseLeave={() => setTooltip(null)}
                className={`w-full flex items-center gap-3 px-2 py-2.5 rounded-lg transition-colors duration-150 ${
                  active ? "bg-[#E0F7FA] text-[#00ADCF]" : "text-gray-400 hover:bg-gray-50 hover:text-[#00ADCF]"
                }`}
                style={{ minHeight: 40 }}
              >
                <span className={`shrink-0 ${active ? "text-[#00ADCF]" : ""}`}>{item.icon}</span>
                {!collapsed && <span className="text-xs font-medium truncate">{item.label}</span>}
              </button>

              {collapsed && tooltip?.id === item.id && (
                <div
                  className="fixed left-[64px] z-50 bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg pointer-events-none whitespace-nowrap"
                  style={{ top: tooltip.y + 8 }}
                >
                  {item.label}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center h-10 border-t border-gray-100 text-gray-400 hover:text-[#00ADCF] hover:bg-gray-50 transition-colors"
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </aside>
  );
}

function CesviLogo({ color }) {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <polygon points="14,2 26,9 26,19 14,26 2,19 2,9" stroke={color} strokeWidth="2" fill="none" />
      <polygon points="14,8 20,12 20,16 14,20 8,16 8,12" fill={color} opacity="0.7" />
      <polygon points="14,11 17,13 17,15 14,17 11,15 11,13" fill={color} />
    </svg>
  );
}
