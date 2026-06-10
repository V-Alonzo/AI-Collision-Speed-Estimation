import SpeedOneIcon from '@iconify-react/icon-park-solid/speed-one';
import CameraPlusIcon from '@iconify-react/tabler/camera-plus';
import CloudUploadOutlineIcon from '@iconify-react/mdi/cloud-upload-outline';
import ViewFileIcon from '@iconify-react/wpf/view-file';
import AiBrain04Icon from '@iconify-react/hugeicons/ai-brain-04';
import NeuralNetworkIcon from '@iconify-react/hugeicons/neural-network';
import ChipIcon from '@iconify-react/carbon/chip';
import ChevronRightIcon from '@iconify-react/mdi/chevron-right';
import FileDocumentIcon from '@iconify-react/mdi/file-document-outline';
import ImageIcon from '@iconify-react/mdi/image-outline';
import TableIcon from '@iconify-react/mdi/table';

import "./Componentes/estilosEstimacion.css";

const MODELOS = [
  { label: "Modelo Alonsito", desc: "Descripción breve del funcionamiento del modelo", icon: <NeuralNetworkIcon height="2em" style={{ color: "#33369e" }} /> },
  { label: "Modelo Alonzo",   desc: "Descripción breve del funcionamiento del modelo", icon: <ChipIcon         height="2em" style={{ color: "#33369e" }} /> },
];

const ACCIONES_ARCHIVO = [
  { label: "Tomar Fotografías", desc: "Captura nuevas imágenes para el análisis del caso.", icon: <CameraPlusIcon height="2.2em" style={{ color: "#1983b4" }} /> },
  { label: "Subir archivos",    desc: "Carga imágenes o documentos desde tu dispositivo.",  icon: <CloudUploadOutlineIcon height="2.2em" style={{ color: "#1983b4" }} /> },
];

export default function NuevoCasoEstimacion() {
  return (
    <div className="ev-wrapper">
      <div className="nc-grid">
        {/* Panel izquierdo — formulario */}
        <div className="ev-card nc-form-card">
          {/* Encabezado */}
          <div className="ev-card-header">
            <div className="ev-card-header-icon">
              <SpeedOneIcon height="1.8em" style={{ color: "#fff" }} />
            </div>
            <div>
              <h2 className="ev-card-title">Nuevo Caso de Estimación de Velocidad</h2>
              <p className="nc-subtitle">Completa la información para crear un nuevo caso de estimación.</p>
            </div>
          </div>
          {/* ID del Caso */}
          <div className="nc-field">
            <label className="nc-label">ID del Caso</label>
            <div className="nc-input-wrapper">
              <span className="nc-input-icon"><FileDocumentIcon height="1.2em" style={{ color: "#1983b4" }} /></span>
              <input type="text" placeholder="Ej. CASO-0001" className="nc-input" />
            </div>
          </div>
          {/* Descripción */}
          <div className="nc-field">
            <label className="nc-label">Descripción del caso</label>
            <div className="nc-textarea-wrapper">
              <span className="nc-textarea-icon"><FileDocumentIcon height="1.2em" style={{ color: "#1983b4" }} /></span>
              <textarea placeholder="Describe brevemente el caso de estimación..." className="nc-textarea" rows={4} />
            </div>
          </div>
        </div>
          {/* Panel derecho — modelos */}
          <div className="ev-card nc-modelos-card">
            <div className="ev-card-header">
              <div className="nc-modelos-icon-wrap">
                <AiBrain04Icon height="2em" style={{ color: "#1983b4" }} />
              </div>
              <h2 className="ev-card-title">Modelos Disponibles</h2>
            </div>

            <div className="nc-modelos-list">
              {MODELOS.map(({ label, desc, icon }) => (
                <div key={label} className="nc-modelo-item">
                  <div className="nc-modelo-icon-wrap">{icon}</div>
                  <div className="nc-modelo-info">
                    <span className="nc-modelo-label">{label}</span>
                    <span className="nc-modelo-desc">{desc}</span>
                  </div>
                  <ChevronRightIcon height="1.2em" style={{ color: "#9ca3af" }} />
                </div>
              ))}
            </div>
            {/* Vista previa de archivos */}
            <div className="nc-preview-section">
              <div className="nc-preview-header">
                <ViewFileIcon height="1.3em" style={{ color: "#1983b4" }} />
                <span className="nc-preview-title">Vista previa de archivos</span>
              </div>
              <div className="nc-preview-area">
                <p className="nc-preview-empty">Los archivos subidos o fotografías tomadas aparecerán aquí.</p>
              </div>
            </div>
          </div>
        {/* Fila inferior — acciones de archivo */}
        <div className="nc-acciones-row">
          {ACCIONES_ARCHIVO.map(({ label, desc, icon }) => (
            <div key={label} className="nc-accion-card">
              <div className="nc-accion-icon-wrap">{icon}</div>
              <div className="nc-accion-info">
                <span className="nc-accion-label">{label}</span>
                <span className="nc-accion-desc">{desc}</span>
              </div>
              <button className="nc-accion-chevron">
                <ChevronRightIcon height="1.1em" />
              </button>
            </div>
          ))}
        </div>
        {/* Tipo de Cálculo */}
        <div className="ev-card nc-calculo-card">
          <label className="nc-label">Tipo de Cálculo por Archivos</label>
          <div className="nc-select-wrapper">
            <TableIcon height="1.2em" style={{ color: "#1983b4" }} />
            <select className="nc-select">
              <option value="">Selecciona el tipo de cálculo a realizar</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}