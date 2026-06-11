import { useRef, useState } from "react";
import CloseIcon from "@iconify-react/mdi/close";
import CloudUploadOutlineIcon from "@iconify-react/mdi/cloud-upload-outline";
import ImageIcon from "@iconify-react/mdi/image-outline";
import CheckIcon from "@iconify-react/mdi/check";
import "./estilosEstimacion.css";

export default function UploadImageModal({ isOpen, onClose, onImageSelected }) {
  const inputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

  const validateAndSetFile = (file) => {
    setUploadError(null);

    if (!file) return;

    if (!allowedTypes.includes(file.type)) {
      setUploadError("Formato no válido. Usa una imagen JPG, PNG o WEBP.");
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const newPreviewUrl = URL.createObjectURL(file);

    setSelectedFile(file);
    setPreviewUrl(newPreviewUrl);
  };

  const handleInputChange = (event) => {
    const file = event.target.files?.[0];
    validateAndSetFile(file);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();

    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];
    validateAndSetFile(file);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();

    setIsDragging(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();

    setIsDragging(false);
  };

  const openFileSelector = () => {
    inputRef.current?.click();
  };

  const confirmImage = () => {
    if (!selectedFile || !previewUrl) return;

    onImageSelected({
      file: selectedFile,
      previewUrl,
    });

    onClose();
  };

  const resetModal = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(null);
    setPreviewUrl(null);
    setIsDragging(false);
    setUploadError(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="photo-modal-overlay">
      <div className="photo-modal">
        <div className="photo-modal-header">
          <div>
            <h2 className="photo-modal-title">Subir imagen</h2>
            <p className="photo-modal-subtitle">
              Arrastra una imagen del impacto o selecciónala desde tu dispositivo.
            </p>
          </div>

          <button className="photo-modal-close" onClick={handleClose}>
            <CloseIcon height="1.4em" />
          </button>
        </div>

        <div className="photo-modal-body">
          {!previewUrl ? (
            <div
              className={`upload-dropzone ${isDragging ? "upload-dropzone-active" : ""}`}
              onClick={openFileSelector}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleInputChange}
                className="upload-hidden-input"
              />

              <div className="upload-dropzone-icon">
                <CloudUploadOutlineIcon height="3.2em" />
              </div>

              <h3 className="upload-dropzone-title">
                Arrastra y suelta tu imagen aquí
              </h3>

              <p className="upload-dropzone-text">
                O haz clic para seleccionar un archivo desde tu computadora.
              </p>

              <span className="upload-dropzone-hint">
                Formatos permitidos: JPG, PNG, WEBP
              </span>
            </div>
          ) : (
            <div className="upload-preview-wrapper">
              <img
                src={previewUrl}
                alt="Imagen seleccionada"
                className="photo-modal-preview"
              />

              <div className="upload-file-info">
                <ImageIcon height="1.2em" />
                <span>{selectedFile?.name}</span>
              </div>
            </div>
          )}

          {uploadError && (
            <p className="photo-modal-error">{uploadError}</p>
          )}
        </div>

        <div className="photo-modal-actions">
          {!previewUrl ? (
            <button
              type="button"
              className="photo-modal-secondary-btn"
              onClick={handleClose}
            >
              Cancelar
            </button>
          ) : (
            <>
              <button
                type="button"
                className="photo-modal-secondary-btn"
                onClick={resetModal}
              >
                Elegir otra imagen
              </button>

              <button
                type="button"
                className="photo-modal-primary-btn"
                onClick={confirmImage}
              >
                <CheckIcon height="1.2em" />
                Usar imagen
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}