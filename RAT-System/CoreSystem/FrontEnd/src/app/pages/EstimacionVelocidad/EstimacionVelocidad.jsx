import { useState } from "react";
import { useNavigate } from "react-router-dom";

import CreateNewFolderIcon from '@iconify-react/mdi/create-new-folder';
import ListDetailsFilledIcon from '@iconify-react/tabler/list-details-filled';
import AttachmentIcon from '@iconify-react/carbon/attachment';
import SpeedometerIcon from '@iconify-react/mdi/speedometer';
import ChevronRightIcon from '@iconify-react/mdi/chevron-right';

import "./Componentes/estilosEstimacion.css";

const CASOS_MOCK = [
  { id: "ESTIMATION-AVEO-ROJO", fecha: "2026-06-07", velocidad: "30.55 km/h" },
  { id: "TOLLOCAN-MINICOOP",    fecha: "2026-06-02", velocidad: "47.9 km/h"  },
  { id: "SINIESTRO 123",        fecha: "2026-05-29", velocidad: "55.1 km/h"  },
  { id: "MAZ-CX5-TORRES",       fecha: "2026-05-18", velocidad: "101.88 km/h"},
  { id: "ESTIMACION-PRUEBA",    fecha: "2026-05-12", velocidad: "80.73 km/h" },
];

const POR_PAG = 8;

const ACCIONES = [
  { label: "Crear Nuevo Caso",            icon: <CreateNewFolderIcon height="3.5em" style={{ color: "#56c2b5" }} />, route: "nuevo"  },
  { label: "Ver Detalles de los Casos",   icon: <ListDetailsFilledIcon height="3.5em" style={{ color: "#69c35d" }} />, route: null  },
  { label: "Asociar un Caso a un Expediente", icon: <AttachmentIcon height="3.5em" style={{ color: "#b68013" }} />, route: null    },
];

export default function EstimacionVelocidad() {
  const navigate   = useNavigate();
  const [pag, setPag] = useState(1);

  const total     = CASOS_MOCK.length;
  const totalPags = Math.max(1, Math.ceil(total / POR_PAG));
  const pagData   = CASOS_MOCK.slice((pag - 1) * POR_PAG, pag * POR_PAG);

  return (
    <div className="ev-wrapper">
      {/* Tabla */}
      <div className="ev-card">
        <div className="ev-card-header">
          <div className="ev-card-header-icon">
            <SpeedometerIcon height="2em" style={{ color: "#fff" }} />
          </div>
          <h2 className="ev-card-title">Modelos para la Estimación de Velocidad</h2>
        </div>
        <table className="ev-table">
          <thead>
            <tr>
              <th>ID Caso</th>
              <th>Fecha</th>
              <th>Velocidad</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {pagData.map((caso) => (
              <tr key={caso.id}>
                <td className="td-id">{caso.id}</td>
                <td className="td-fecha">{caso.fecha}</td>
                <td><span className="ev-badge">{caso.velocidad}</span></td>
                <td className="td-chevron"><ChevronRightIcon height="1.2em" /></td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="ev-pagination">
          {Array.from({ length: totalPags }).map((_, i) => (
            <button key={i} onClick={() => setPag(i + 1)}
              className={`ev-pag-btn ${pag === i + 1 ? "active" : "inactive"}`}>
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Acciones */}
      <div className="ev-actions-grid">
        {ACCIONES.map(({ label, icon, route }) => (
          <button key={label} className="ev-action-btn"
            onClick={() => route && navigate(route)}>
            <div className="ev-action-btn-content">
              {icon}
              <span className="ev-action-btn-label">{label}</span>
            </div>
            <ChevronRightIcon height="1.2em" className="ev-action-btn-chevron" />
          </button>
        ))}
      </div>

    </div>
  );
}