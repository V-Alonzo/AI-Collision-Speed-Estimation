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
import "./Componentes/estilosEstimacion.css";

const AI_VELOCITY_API_URL =
  import.meta.env.VITE_AI_VELOCITY_API_URL ||
  "https://leil6c6oz3.execute-api.us-east-2.amazonaws.com/default/ai-vel-repo";

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

async function requestVelocityPrediction(API_PARAMETERS) {
  const endpoint = `${AI_VELOCITY_API_URL}?ImageURL=${encodeURIComponent(
    API_PARAMETERS.imageUrl
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

  const FieldsData = [
    { icon: <FileDocumentIcon height="1.2em" style={{ color: "#1983b4" }}/> , 
            label: "Grado de severidad médica del impacto", name: "mais", options: ["9 - Unknown", "6 - Maximal", "5 - Critical", "4 - Severe", "3 - Serious", "2 - Moderate", "1 - Minor"], help: "Selecciona el grado de severidad médica del impacto según la escala MAIS.", placeholder: "" },
    { icon: <FileDocumentIcon height="1.2em" style={{ color: "#1983b4" }}/>,  
            label: "Dirección de la fuerza", name: "forceDirection", options: [], help: "Ingrese la dirección del impacto en grados, el frontal del vehículo son 0 grados.", placeholder: "Ingresa un valor de 0 a 360 grados." },
    { icon: <FileDocumentIcon height="1.2em" style={{ color: "#1983b4" }}/> ,  
            label: "Estado de vuelco", name: "rolloverStatus", options: ["No rollover (no overturning)", "Rollover -- Longitudinal axis"], help: "Indica si el vehículo sufrió un vuelco durante el accidente.", placeholder: "" },
    { icon: <FileDocumentIcon height="1.2em" style={{ color: "#1983b4" }}/> ,  
            label: "Descripción del plano de daño", name: "damagePlaneDescription", options: ["Front", "Back", "Left side", "Right side"], help: "Describe el plano de daño del vehículo.", placeholder: "" },
    { icon: <FileDocumentIcon height="1.2em" style={{ color: "#1983b4" }}/> ,  
            label: "Descripción de la severidad", name: "severityDescription", options: ["Severe", "Light", "Moderate"], help: "Describe la severidad del daño en el vehículo.", placeholder: "" },
    { icon: <FileDocumentIcon height="1.2em" style={{ color: "#1983b4" }}/> ,  
            label: "Clase del vehículo", name: "vehicleClass", options: ["Subcompact/mini (wheelbase < 254 cm)", "Compact (wheelbase >= 254 but < 265 cm)", "Intermediate (wheelbase >=265 but < 278 cm)", "Full size (wheelbase >=278 but < 291 cm)", "Largest (wheelbase >=291 cm)", "Compact utility vehicle", "Compact pickup truck (<=4,536 kgs GVWR)", "Minivan (<=4,536 kgs GVWR)", "Large utility vehicle (<=4,536 kgs GVWR)", "Large pickup truck (<=4,536 kgs GVWR)"], help: "Wheelbase es la distancia que existe entre ejes del vehículo. GVWR es el peso bruto vehicular.", placeholder: "" },
    { icon: <FileDocumentIcon height="1.2em" style={{ color: "#1983b4" }}/> ,  
            label: "Peso base del vehículo", name: "curbWeightKg", options: [], help: "Ingrese el peso del vehículo sin carga en kilogramos.", placeholder: "Ingresa el peso del vehículo." },
    { icon: <FileDocumentIcon height="1.2em" style={{ color: "#1983b4" }}/> ,  
            label: "Peso de la carga", name: "cargoWeightKg", options: [], help: "Ingrese el peso de la carga en kilogramos.", placeholder: "Ingresa el peso de la carga." },
  ]

  const MODELOS = [
    {
      label: "Modelo de Visión Computacional",
      desc: "Predice la velocidad a partir de una imagen del impacto recibido.",
      icon: <NeuralNetworkIcon height="2em" style={{ color: "#33369e" }} />,
    },
    {
      label: "Modelo Híbrido",
      desc: "Predice la velocidad combinando la imagen del impacto con características adicionales.",
      icon: <ChipIcon height="2em" style={{ color: "#33369e" }} />,
    },
  ];

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

      const velocity = await requestVelocityPrediction(API_PARAMETERS);
      const formattedVelocity = parseFloat(velocity).toFixed(2);

      setPredictedVelocity(formattedVelocity);
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

      <div className="ev-grid">
        <div className="ev-card ev-form-card">

          {/* Generación dinámica de campos de formulario  */}

          {FieldsData.map(({ icon, label, name, options, help, placeholder }) => (
            <div className="ev-field" key={name}>
              <label className="ev-label" htmlFor={name}>
                {label}
              </label>

              {help && <p className="ev-help-text">{help}</p>}

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
))}

          
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

                <div className="ev-prediction-actions -mt-">
            <button
              type="button"
              onClick={handlePredict}
              disabled={submitting || !selectedFile}
              className="ev-predict-btn"
            >
              {submitting ? "Procesando..." : "Predecir"}
            </button>
          </div>
          

        </div>
      

        <div className="ev-card ev-modelos-card">

          <div className="ev-card-header">
            <div className="ev-modelos-icon-wrap">
              <AiBrain04Icon height="2em" style={{ color: "#1983b4" }} />
            </div>
            <h2 className="ev-card-title">Modelo Utilizado</h2>
          </div>

          <div className="ev-modelos-list">
            {MODELOS.map(({ label, desc, icon }) => (
              <div key={label} className="ev-modelo-item">
                <div className="ev-modelo-icon-wrap">{icon}</div>

                <div className="ev-modelo-info">
                  <span className="ev-modelo-label">{label}</span>
                  <span className="ev-modelo-desc">{desc}</span>
                </div>

                <ChevronRightIcon height="1.2em" style={{ color: "#9ca3af" }} />
              </div>
            ))}
          </div>

          <div className="ev-result-section">
            <h3 className="ev-result-title">Resultado</h3>

            <div className="ev-result-box">
              <span className="ev-result-label">Velocidad estimada</span>

              <span className="ev-result-value">
                {predictedVelocity == null
                  ? "--"
                  : `${predictedVelocity} km/h`}
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
      </div>

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