import React, { useEffect, useMemo, useState } from "react";
import { Gauge, UploadCloud } from "lucide-react";
import { apiClient } from "../../api/apiClient";

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

  const { data } = await apiClient.post("/ia/estimacion-velocidad/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data.image_url;
}

async function requestVelocityPrediction(imageUrl) {
  const endpoint = `${AI_VELOCITY_API_URL}?ImageURL=${encodeURIComponent(imageUrl)}`;
  const response = await fetch(endpoint);

  if (!response.ok) {
    throw new Error("La API de estimación respondió con error.");
  }

  const payload = await response.json();
  const body = parsePredictionBody(payload);
  const velocity = payload?.velocity_kph;

  console.log("Respuesta de la API de IA:", payload);

  if (velocity == null || velocity === "") {
    throw new Error("La respuesta no contiene el campo body.velocity_kph.");
  }

  return velocity;
}

export default function EstimacionVelocidadIA() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [predictedVelocity, setPredictedVelocity] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const selectedFileLabel = useMemo(() => {
    if (!selectedFile) {
      return "No hay imagen seleccionada";
    }

    return `${selectedFile.name} (${Math.round(selectedFile.size / 1024)} KB)`;
  }, [selectedFile]);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl("");
      return undefined;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  async function handlePredict() {
    if (!selectedFile) {
      setError("Selecciona una imagen antes de predecir.");
      return;
    }

    setSubmitting(true);
    setError("");
    setPredictedVelocity(null);

    try {
      const publicImageUrl = await uploadImageToS3(selectedFile);
      setUploadedUrl(publicImageUrl);

      const velocity = await requestVelocityPrediction(publicImageUrl);
      velocity = parseFloat(velocity).toFixed(2);
      setPredictedVelocity(velocity);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Ocurrió un error al procesar la imagen.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="bg-white border border-gray-200 rounded shadow-sm p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-[#E0F7FA] text-[#00ADCF] flex items-center justify-center">
            <Gauge size={20} />
          </div>
          <div>
            <h1 className="text-base font-semibold text-gray-800">Estimación de Velocidad con IA</h1>
            <p className="text-xs text-gray-500">Sube una imagen, envíala a S3 y consulta la API de estimación.</p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="border border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 flex flex-col gap-3">
            <label className="text-xs font-medium text-gray-700" htmlFor="ai-velocity-image">
              Imagen a procesar
            </label>

            <input
              id="ai-velocity-image"
              type="file"
              accept="image/*"
              onChange={(event) => {
                const file = event.target.files?.[0] || null;
                setSelectedFile(file);
                setUploadedUrl("");
                setPredictedVelocity(null);
                setError("");
              }}
              className="block w-full text-sm text-gray-600 file:mr-3 file:px-3 file:py-2 file:rounded-md file:border-0 file:bg-[#00ADCF] file:text-white file:cursor-pointer"
            />

            <div className="text-xs text-gray-500">{selectedFileLabel}</div>

            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Vista previa"
                className="max-h-[360px] w-full object-contain rounded border border-gray-200 bg-white"
              />
            ) : (
              <div className="h-[240px] border border-gray-200 rounded bg-white flex flex-col items-center justify-center text-gray-400 gap-2">
                <UploadCloud size={30} />
                <span className="text-xs">La vista previa aparecerá aquí</span>
              </div>
            )}

            <button
              type="button"
              onClick={handlePredict}
              disabled={submitting || !selectedFile}
              className="w-fit px-4 py-2 rounded bg-[#00ADCF] text-white text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? "Procesando..." : "Predecir"}
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col gap-3">
            <h2 className="text-sm font-medium text-gray-800">Resultado</h2>

            <div className="text-xs text-gray-500 leading-5">
              Configuración requerida:
              <br />
              El frontend ya no necesita credenciales AWS.
              <br />
              El backend genera URLs firmadas con la sesión actual.
              <br />
              Solo necesitas configurar AWS en el backend.
            </div>

            <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-3 leading-5">
              {/*
                La imagen ahora se sube al backend y el backend la envía a S3 con sus credenciales.
                Para la inferencia se usa una URL GET firmada, así que no necesitas objetos públicos ni CORS del bucket para el navegador.
              */}
              La subida ya no depende de CORS del bucket porque el navegador no le pega directo a S3.
              La API de IA consumirá la URL GET firmada que genera el backend, así que no necesitas dejar el bucket público.
            </div>

            <div className="rounded border border-gray-200 bg-gray-50 p-3">
              <div className="text-xs text-gray-500 mb-1">Velocidad estimada</div>
              <div className="text-2xl font-semibold text-gray-800">
                {predictedVelocity == null ? "--" : `${predictedVelocity} km/h`}
              </div>
            </div>

            <div className="text-xs text-gray-500 break-all">
              <span className="font-medium text-gray-700">URL subida:</span>
              <br />
              {uploadedUrl || "Aún no se ha subido ninguna imagen."}
            </div>

            {error && <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded p-3">{error}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}