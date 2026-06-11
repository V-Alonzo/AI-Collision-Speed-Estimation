import React from "react";
import {
  AppWindow,
  Bell,
  Bot,
  BrainCircuit,
  Camera,
  ChevronRight,
  CircleHelp,
  FileImage,
  FilePlus2,
  FileSearch,
  FileSpreadsheet,
  FileText,
  FolderPlus,
  Gauge,
  IdCard,
  Image as ImageIcon,
  LogOut,
  Microchip,
  Network,
  Pencil,
  Plus,
  Save,
  Search,
  Settings,
  Table2,
  UploadCloud,
  UserCog,
  Paperclip,
  List,
} from "lucide-react";

const ICON_MAP = {
  "clarity:add-line": Plus,
  "eos-icons:ai-operator": BrainCircuit,
  "iwwa:file-pdf": FileText,
  "line-md:search": Search,
  "material-symbols:save-as-outline": Save,
  "material-symbols:settings-account-box-outline-rounded": UserCog,
  "mdi:account-edit": Pencil,
  "mdi:bell-outline": Bell,
  "mdi:card-account-details-star-outline": IdCard,
  "mdi:create-new-folder": FolderPlus,
  "mdi:file-document-outline": FileText,
  "mdi:image-outline": ImageIcon,
  "mdi:microsoft-excel": FileSpreadsheet,
  "mdi:speedometer": Gauge,
  "mdi:table": Table2,
  "mdi:chevron-right": ChevronRight,
  "mdi:cloud-upload-outline": UploadCloud,
  "tabler:camera-plus": Camera,
  "tabler:list-details-filled": List,
  "uil:exit": LogOut,
  "wpf:view-file": FileSearch,
};

function guessIcon(name) {
  const normalized = String(name).toLowerCase();

  if (normalized.includes("search")) return Search;
  if (normalized.includes("excel") || normalized.includes("sheet")) return FileSpreadsheet;
  if (normalized.includes("save")) return Save;
  if (normalized.includes("exit") || normalized.includes("logout")) return LogOut;
  if (normalized.includes("bell")) return Bell;
  if (normalized.includes("setting")) return Settings;
  if (normalized.includes("account") || normalized.includes("user")) return UserCog;
  if (normalized.includes("camera")) return Camera;
  if (normalized.includes("upload")) return UploadCloud;
  if (normalized.includes("image")) return ImageIcon;
  if (normalized.includes("pdf") || normalized.includes("file")) return FileText;
  if (normalized.includes("table")) return Table2;
  if (normalized.includes("add") || normalized.includes("plus")) return FilePlus2;
  if (normalized.includes("folder")) return FolderPlus;
  if (normalized.includes("attach")) return Paperclip;
  if (normalized.includes("speed") || normalized.includes("gauge")) return Gauge;
  if (normalized.includes("brain") || normalized.includes("ai")) return BrainCircuit;
  if (normalized.includes("network")) return Network;
  if (normalized.includes("chip")) return Microchip;
  if (normalized.includes("app")) return AppWindow;

  return CircleHelp;
}

function resolveIconComponent(icon) {
  if (!icon) return CircleHelp;
  if (typeof icon === "string") return ICON_MAP[icon] || guessIcon(icon);
  if (typeof icon === "function") return icon;
  if (icon?.iconName) return ICON_MAP[`mdi:${icon.iconName}`] || guessIcon(icon.iconName);
  return CircleHelp;
}

export function LucideIcon({ icon, style, className, color, width, height, ...props }) {
  if (React.isValidElement(icon)) {
    return React.cloneElement(icon, {
      className,
      style: { ...icon.props.style, ...style },
      color: color ?? icon.props.color,
      width: width ?? icon.props.width,
      height: height ?? icon.props.height,
      ...props,
    });
  }

  const IconComponent = resolveIconComponent(icon);
  const size = width || height || style?.fontSize || 16;
  const mergedStyle = { ...style };
  delete mergedStyle.fontSize;
  delete mergedStyle.color;

  return (
    <IconComponent
      className={className}
      color={color ?? style?.color}
      width={width || size}
      height={height || size}
      style={mergedStyle}
      {...props}
    />
  );
}

export default LucideIcon;