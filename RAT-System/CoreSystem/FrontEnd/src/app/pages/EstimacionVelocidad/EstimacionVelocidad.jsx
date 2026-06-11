import SpeedOneIcon from "@iconify-react/icon-park-solid/speed-one";
import CameraPlusIcon from "@iconify-react/tabler/camera-plus";
import CloudUploadOutlineIcon from "@iconify-react/mdi/cloud-upload-outline";
import ViewFileIcon from "@iconify-react/wpf/view-file";
import AiBrain04Icon from "@iconify-react/hugeicons/ai-brain-04";
import NeuralNetworkIcon from "@iconify-react/hugeicons/neural-network";
import ChipIcon from "@iconify-react/carbon/chip";
import ChevronRightIcon from "@iconify-react/mdi/chevron-right";
import FileDocumentIcon from "@iconify-react/mdi/file-document-outline";
import { useState } from "react";
import { apiClient } from "../../../api/apiClient";
import PhotoModal from "./Componentes/photo-modal";
import UploadImageModal from "./Componentes/upload-image-modal";
import MedicalIcon from '@iconify-react/ion/medical';
import Rotate90DegreesCcwIcon from '@iconify-react/mdi/rotate-90-degrees-ccw';
import CarCrashBoldIcon from '@iconify-react/glyphs/car-crash-bold';
import CarCrashIcon from '@iconify-react/la/car-crash';
import SortSizeUp1BoldIcon from '@iconify-react/glyphs/sort-size-up-1-bold';
import VehicleIcon from '@iconify-react/tdesign/vehicle';
import CarRepairOutlineSharpIcon from '@iconify-react/material-symbols/car-repair-outline-sharp';
import WeightIcon from '@iconify-react/game-icons/weight';
import ScanImageIcon from '@iconify-react/hugeicons/scan-image';
import HelpCircleIcon from '@iconify-react/ion/help-circle';
import InfoTriangleFilledIcon from '@iconify-react/tabler/info-triangle-filled';
import "./Componentes/estilosEstimacion.css";

const AI_VELOCITY_API_URL =
  import.meta.env.VITE_AI_VELOCITY_API_URL ||
  "https://leil6c6oz3.execute-api.us-east-2.amazonaws.com/default/ai-vel-repo";

// Función para manejar diferentes formatos de respuesta de la API
function parsePredictionBody(payload) {
  if (!payload || payload.body == null) {
    return null;
  }
  if (typeof payload.body === "string") {
    try {
      return JSON.parse(payload.body);
    } catch {
      return null;
    }
  }
  return payload.body;
}
// Función para subir la imagen a S3 y obtener la URL pública
async function uploadImageToS3(file) {
  const formData = new FormData();
  formData.append("image", file);
  const { data } = await apiClient.post(
    "/ia/estimacion-velocidad/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  if (!data?.image_url) {
    throw new Error("El backend no regresó la URL pública de la imagen.");
  }
  return data.image_url;
}
// Función para solicitar la predicción de velocidad a la API de IA
async function requestVelocityPrediction(imageUrl) {
  const endpoint = `${AI_VELOCITY_API_URL}?ImageURL=${encodeURIComponent(
    imageUrl
  )}`;
  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error("La API de estimación respondió con error.");
  }
  const payload = await response.json();
  const body = parsePredictionBody(payload);

  console.log("Respuesta de la API de IA:", payload);
  console.log("Body parseado:", body);

  const velocity = payload?.velocity_kph ?? body?.velocity_kph;

  if (velocity == null || velocity === "") {
    throw new Error("La respuesta no contiene el campo velocity_kph.");
  }
  return velocity;
}

export default function NuevoCasoEstimacion() {
  //Estado para ocultar la card de Modelos y Resultados hasta que se haga una predicción
  const [showModelCard, setShowModelCard] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [predictedVelocity, setPredictedVelocity] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isUploadImageModalOpen, setIsUploadImageModalOpen] = useState(false);

  const [API_PARAMETERS, setAPI_PARAMETERS] = useState({
    imageUrl: "",
    mais : "",
    forceDirection: "",
    rolloverStatus: "",
    damagePlaneDescription: "",
    severityDescription: "",
    vehicleClass: "",
    curbWeightKg: "",
    cargoWeightKg: ""
  });

  const [fieldErrors, setFieldErrors] = useState({});

  const handleAPIParameterChange = (event) => {
    const { name, value } = event.target;

    setAPI_PARAMETERS((prev) => ({
      ...prev,
      [name]: value,
    }));

    validateField(name, value);
};

const validateField = (name, value) => {
  let error = "";

  if (name === "forceDirection") {
    const numericValue = Number(value);

    if (value === "") {
      error = "";
    } else if (Number.isNaN(numericValue)) {
      error = "La dirección de la fuerza debe ser un número.";
    } else if (numericValue < 0 || numericValue > 360) {
      error = "La dirección de la fuerza debe estar entre 0 y 360 grados.";
    }
  }
  if (name === "curbWeightKg" || name === "cargoWeightKg") {
    const numericValue = Number(value);

    if (value === "") {
      error = "";
    } else if (Number.isNaN(numericValue)) {
      error = "El peso debe ser un número.";
    } else if (numericValue < 0) {
      error = "El peso no puede ser negativo.";
    }
  }
  setFieldErrors((prev) => ({
    ...prev,
    [name]: error,
  }));
  return error === "";
};
  // Definición de campos del formulario con opciones y ayudas
  const FieldsData = [
    { icon: <MedicalIcon height="1.2em" style={{ color: "#1983b4" }}/> , 
            label: "Grado de severidad médica del impacto", name: "mais", options: ["9 - Unknown", "6 - Maximal", "5 - Critical", "4 - Severe", "3 - Serious", "2 - Moderate", "1 - Minor"], placeholder: "",
            description: "Selecciona el grado de severidad médica del impacto según la escala MAIS.",
            help: "MAIS (Maximum Abbreviated Injury Scale) clasifica la gravedad de las lesiones sufridas por los ocupantes del vehículo en un accidente. El grado 1 indica lesiones menores, mientras que el grado 6 representa lesiones críticas o fatales. El grado 9 se utiliza cuando la severidad es desconocida."
    },
    { icon: <Rotate90DegreesCcwIcon height="1.2em" style={{ color: "#1983b4" }}/>,  
            label: "Dirección de la fuerza", name: "forceDirection", options: [], placeholder: "0 a 360 grados.",
            description: "Ingrese la dirección del impacto en grados.",
            help: "La dirección de la fuerza se mide en grados, donde 0° representa un impacto frontal, 90° un impacto lateral derecho, 180° un impacto trasero y 270° un impacto lateral izquierdo. Esta información es crucial para que el modelo de IA pueda estimar la velocidad del impacto con mayor precisión, ya que diferentes direcciones de fuerza pueden resultar en distintos patrones de daño y lesiones."
    },
    { icon: <CarCrashBoldIcon height="1.2em" style={{ color: "#1983b4" }}/> ,  
            label: "Estado de vuelco", name: "rolloverStatus", options: ["No rollover (no overturning)", "Rollover -- Longitudinal axis"], placeholder: "",
            description: "Indica si el vehículo sufrió un vuelco durante el accidente.",
            help: "Los estados son 'No rollover' si el vehículo no sufrió un vuelco, y 'Rollover' si el vehículo volcó alrededor de su eje longitudinal."
    },
    { icon: <CarCrashIcon height="1.2em" style={{ color: "#1983b4" }}/> ,  
            label: "Plano del daño", name: "damagePlaneDescription", options: ["Front", "Back", "Left side", "Right side"], placeholder: "",
            description: "Describe el plano de daño del vehículo.",
            help: "Se refiere a la ubicación del impacto en el vehículo. Puede ser frontal, trasero, lateral izquierdo o lateral derecho."
    },
    { icon: <SortSizeUp1BoldIcon height="1.2em" style={{ color: "#1983b4" }}/> ,  
            label: "  Severidad del daño", name: "severityDescription", options: ["Severe", "Light", "Moderate"], placeholder: "",
            description: "Describe la severidad del daño en el vehículo.",
            help: "Se refiere a qué tan grave es el daño sufrido por el vehículo en el accidente. Puede clasificarse como leve, moderada o severa."
    }, 
    { icon: <VehicleIcon height="1.2em" style={{ color: "#1983b4" }}/> ,  
            label: "Clase del vehículo", name: "vehicleClass", options: ["Subcompact/mini (wheelbase < 254 cm)", "Compact (wheelbase >= 254 but < 265 cm)", "Intermediate (wheelbase >=265 but < 278 cm)", "Full size (wheelbase >=278 but < 291 cm)", "Largest (wheelbase >=291 cm)", "Compact utility vehicle", "Compact pickup truck (<=4,536 kgs GVWR)", "Minivan (<=4,536 kgs GVWR)", "Large utility vehicle (<=4,536 kgs GVWR)", "Large pickup truck (<=4,536 kgs GVWR)"], placeholder: "",
            description: "Seleccione la clase del vehículo.",
            help: "Se refiere a la categoría en la que se clasifica el vehículo según su tamaño, peso y tipo."
    },
    { icon: <CarRepairOutlineSharpIcon height="1.2em" style={{ color: "#1983b4" }}/> ,  
            label: "Peso base del vehículo", name: "curbWeightKg", options: [], placeholder: "Peso del vehículo en Kg.",
            description: "Ingrese el peso del vehículo sin carga en kilogramos.",
            help: "También conocido como peso en vacío, es el peso del vehículo sin carga ni pasajeros."
    }, 
    { icon: <WeightIcon height="1.2em" style={{ color: "#1983b4" }}/> ,  
            label: "Peso de la carga", name: "cargoWeightKg", options: [], placeholder: "Peso de la carga en Kg.",
            description: "Ingrese el peso de la carga en kilogramos.",
            help: "Se refiere al peso adicional que el vehículo estaba transportando en el momento del accidente."
    },
  ]
  // Definición de modelos disponibles para la predicción
  const MODELOS = [
    {
      label: "Modelo de Visión Computacional",
      desc: "Predice la velocidad a partir de una imagen del impacto recibido.",
      icon: <NeuralNetworkIcon height="2em" style={{ color: "#33369e" }} />,
      predictionError: "± 12.5 km/h",
    },
    {
      label: "Modelo Híbrido",
      desc: "Predice la velocidad combinando la imagen del impacto con características adicionales.",
      icon: <ChipIcon height="2em" style={{ color: "#33369e" }} />,
      predictionError: "± 4.5 km/h",
    },
  ];
  // Función para validar todos los campos del formulario antes de enviar la predicción
  const validateAllAPIParameters = () => {
    let isValid = true;
    
    Object.entries(API_PARAMETERS).forEach(([name, value]) => {
      const fieldIsValid = validateField(name, value);
      if (!fieldIsValid) {
        isValid = false;
      }
    });
    return isValid;
  };

  const resetPredictionState = () => {
    setUploadedUrl("");
    setPredictedVelocity(null);
    setError("");
  };

  const setImageForPrediction = ({ file, previewUrl }) => {
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }
    setPhotoFile(file);
    setPhotoPreview(previewUrl);
    setSelectedFile(file);
    resetPredictionState();
  };

  const removeSelectedImage = () => {
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }
    setPhotoFile(null);
    setPhotoPreview(null);
    setSelectedFile(null);
    resetPredictionState();
  };
  // Función principal para manejar la predicción de velocidad
  async function handlePredict() {
    if (!selectedFile) {
      setError("Selecciona una imagen antes de predecir.");
      return;
    }
    if (!validateAllAPIParameters()) {
      setError("Por favor, completa todos los campos requeridos correctamente.");
      return;
    }
    setSubmitting(true);
    setError("");
    setPredictedVelocity(null);
    try {
      const publicImageUrl = await uploadImageToS3(selectedFile);
      setUploadedUrl(publicImageUrl);

      const velocity = await requestVelocityPrediction(publicImageUrl);
      const formattedVelocity = parseFloat(velocity).toFixed(2);

      setPredictedVelocity(formattedVelocity);

      const hasAllParams = Object.entries(API_PARAMETERS)
        .filter(([key]) => key !== "imageUrl")
        .every(([, value]) => value !== "");

      setSelectedModel(hasAllParams ? MODELOS[1] : MODELOS[0]);
      setShowModelCard(true);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Ocurrió un error al procesar la imagen."
      );
    } finally {
      setSubmitting(false);
    }
  }
  // Definición de acciones para manejo de imágenes
  const ACCIONES_ARCHIVO = [
    {
      label: "Tomar Fotografías",
      desc: "Captura nuevas imágenes para el análisis del caso.",
      icon: <CameraPlusIcon height="2.2em" style={{ color: "#1983b4" }} />,
      onClick: () => setIsPhotoModalOpen(true),
    },
    {
      label: "Subir Imagen",
      desc: "Carga una imagen desde tu dispositivo.",
      icon: (
        <CloudUploadOutlineIcon height="2.2em" style={{ color: "#1983b4" }} />
      ),
      onClick: () => setIsUploadImageModalOpen(true),
    },
  ];

  return (
    <div className="ev-wrapper">
      {/* Encabezado de la tarjeta con título e ícono */}
      <div className="ev-card-header">
        <div className="ev-card-header-icon">
          <SpeedOneIcon height="4em" style={{ color: "#fff" }} />
        </div>
        <div>
          <h2 className="ev-card-title">
            Sistema de Estimación de Velocidades
          </h2>
          <p className="ev-subtitle">
            Completa la información para crear un nuevo caso de estimación.
          </p>
        </div>
      </div>
      {/* Contenedor principal dividido en dos columnas */}
      <div className="ev-grid">
        {/* Generación dinámica de campos de formulario  */}
        <div className="ev-card ev-form-card">
          {FieldsData.map(({ icon, label, name, options, description, placeholder, help }) => (
            <div className="ev-field" key={name}>
              {/* Columna izquierda: label + texto de help */}
              <div className="ev-field-left">
                <div className="ev-label-row">
                  <label className="ev-label" htmlFor={name}>
                    {label}
                  </label>
                  {help && (
                    <span className="ev-help-icon-wrap">
                      <HelpCircleIcon height="1.1em" />
                      <span className="ev-tooltip">{help}</span>
                    </span>
                  )}
                </div>
                {description && <p className="ev-help-text">{description}</p>}
              </div>
              {/* Columna derecha: input o select */}
              <div>
              {options.length > 0 ? (
                <div className="ev-select-wrapper">
                  <span className="ev-input-icon">{icon}</span>
                  <select
                    id={name}
                    name={name}
                    className="ev-select"
                    value={API_PARAMETERS[name]}
                    onChange={handleAPIParameterChange}
                  >
                    <option value="">Selecciona una opción</option>
                    {options.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="ev-input-wrapper">
                  <span className="ev-input-icon">{icon}</span>
                  <input
                    id={name}
                    name={name}
                    type={
                      name === "forceDirection" ||
                      name === "curbWeightKg" ||
                      name === "cargoWeightKg"
                        ? "number"
                        : "text"
                    }
                    min={
                      name === "forceDirection" ||
                      name === "curbWeightKg" ||
                      name === "cargoWeightKg"
                        ? 0
                        : undefined
                    }
                    max={name === "forceDirection" ? 360 : undefined}
                    step={
                      name === "forceDirection" ||
                      name === "curbWeightKg" ||
                      name === "cargoWeightKg"
                        ? "any"
                        : undefined
                    }
                    placeholder={placeholder}
                    className={`ev-input ${fieldErrors[name] ? "ev-input-error" : ""}`}
                    value={API_PARAMETERS[name]}
                    onChange={handleAPIParameterChange}
                  />
                </div>
              )}
              {fieldErrors[name] && (
                <p className="ev-error-text">{fieldErrors[name]}</p>
              )}
            </div>
          </div>
))}
          {/* Disclaimer de campos requeridos */}
          <div className="ev-disclaimer">
            <InfoTriangleFilledIcon height="3em" style={{ color: "#f59e0b" }} />
            <p className="ev-disclaimer-text">
              Si deseas utilizar el <strong>Modelo Híbrido</strong>, todos los campos deben estar completos. 
              De lo contrario, solo sube la imagen para usar el <strong>Modelo de Visión Computacional</strong>. 
              El botón <strong>'Estimar Velocidad'</strong> se bloqueará si hay incompletos.
            </p>
          </div>
        </div>

      {/* Columna derecha */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <div className="ev-card">
          {/* Sección de acciones para manejo de imágenes */}
          <div className="ev-card-header">
            <div className="ev-modelos-icon-wrap">
              <ScanImageIcon height="2em" style={{ color: "#1983b4" }} />
            </div>
            <h2 className="ev-card-title">Estimación A partir de una imagen</h2>
          </div>    
          <div className="ev-acciones-row">
            {ACCIONES_ARCHIVO.map(({ label, desc, icon, onClick }) => (
              <div
                key={label}
                className="ev-accion-btn"
                onClick={onClick}
                style={{ display: photoFile == null ? "flex" : "none" }}
              >
              <div className="ev-accion-btn-icon">{icon}</div>
                <div className="ev-accion-info">
                  <span className="ev-accion-label">{label}</span>
                  <span className="ev-accion-desc">{desc}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="ev-preview-section">
            <div className="ev-preview-header">
              <ViewFileIcon height="1.3em" style={{ color: "#1983b4" }} />
              <span className="ev-preview-title">Vista previa de archivos</span>
            </div>
            <div className="ev-preview-area">
              {photoPreview ? (
                <div className="ev-photo-preview-card">
                  <img
                    src={photoPreview}
                    alt="Imagen seleccionada"
                    className="ev-photo-preview-img"
                  />
                  <p className="ev-photo-preview-name">{photoFile?.name}</p>
                  <button
                    type="button"
                    className="ev-remove-image-btn"
                    onClick={removeSelectedImage}
                    disabled={submitting}
                  >
                    Cambiar imagen
                  </button>
                </div>
              ) : (
                <p className="ev-preview-empty">
                  La fotografía tomada o subida aparecerá aquí
                </p>
              )}
            </div>            
          </div>
          {/* Botón para iniciar la predicción de velocidad */}
          <div className="ev-prediction-actions -mt-">
            <button
              type="button"
              onClick={handlePredict}
              disabled={submitting || !selectedFile}
              className="ev-predict-btn"
            >
              {submitting ? "Procesando..." : "Estimar Velocidad"}
            </button>
          </div>
        </div>
        {/* Tarjeta de modelo — solo visible tras predecir */}
        {showModelCard && (
          <div className="ev-card">
            {/* Sección de modelos utilizados para la predicción */}
            <div className="ev-card-header">
              <div className="ev-modelos-icon-wrap">
                <AiBrain04Icon height="2em" style={{ color: "#1983b4" }} />
              </div>
              <h2 className="ev-card-title">Modelo Utilizado en la Estimación de Velocidad</h2>
            </div>
            <div className="ev-modelos-list">
              {MODELOS.map(({ label, desc, icon }) => (
                <div key={label} className={`ev-modelo-item ${selectedModel.label === label ? "ev-modelo-selected" : ""}`}>
                  <div className="ev-modelo-icon-wrap">{icon}</div>
                  <div className="ev-modelo-info">
                    <span className="ev-modelo-label">{label}</span>
                    <span className="ev-modelo-desc">{desc}</span>
                  </div>
                </div>
              ))}
            </div>
            {/* Sección de resultado de la predicción con manejo de errores y estado de carga */}
            <div className="ev-result-section">
              <h3 className="ev-result-title">Resultado</h3>
              <div className="ev-result-box">
                <span className="ev-result-label">Velocidad estimada</span>
                <span className="ev-result-value">
                  {predictedVelocity == null
                    ? "--"
                    : `${predictedVelocity} km/h ${selectedModel.predictionError}` }
                </span>
              </div>
              {uploadedUrl && (
                <p className="ev-uploaded-url">
                  Imagen subida correctamente a S3.
                </p>
              )}
              {error && <div className="ev-error-box">{error}</div>}
          </div>
        </div>
      )}
    </div>
  </div>
      {/* Modales para captura de foto y subida de imagen */}
      <PhotoModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        onPhotoTaken={({ file, previewUrl }) => {
          setImageForPrediction({ file, previewUrl });
        }}
      />
      <UploadImageModal
        isOpen={isUploadImageModalOpen}
        onClose={() => setIsUploadImageModalOpen(false)}
        onImageSelected={({ file, previewUrl }) => {
          setImageForPrediction({ file, previewUrl });
        }}
      />
    </div>
  );
}