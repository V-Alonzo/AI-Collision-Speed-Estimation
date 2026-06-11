import { useEffect, useRef, useState } from "react";
import CameraPlusIcon from "@iconify-react/tabler/camera-plus";
import CloseIcon from "@iconify-react/mdi/close";
import CheckIcon from "@iconify-react/mdi/check";
import "./estilosEstimacion.css";

export default function PhotoModal({ isOpen, onClose, onPhotoTaken }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [stream, setStream] = useState(null);
  const [localPreview, setLocalPreview] = useState(null);
  const [localFile, setLocalFile] = useState(null);
  const [cameraError, setCameraError] = useState(null);


  const repeatPhoto = async () => {
    if (localPreview) {
        URL.revokeObjectURL(localPreview);
    }

    setLocalPreview(null);
    setLocalFile(null);
    setCameraError(null);

    setTimeout(async () => {
        if (videoRef.current && stream) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        } else {
        await openCamera();
        }
    }, 0);
};

  const openCamera = async () => {
    try {
      setCameraError(null);

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
        },
        audio: false,
      });

      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error("Error al abrir la cámara:", error);
      setCameraError("No se pudo acceder a la cámara. Verifica permisos del navegador.");
    }
  };

  const closeCamera = () => {
    setStream((currentStream) => {
      if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop());
      }

      return null;
    });

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const takePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    const width = video.videoWidth;
    const height = video.videoHeight;

    if (!width || !height) {
      setCameraError("La cámara aún no está lista. Intenta de nuevo.");
      return;
    }

    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, width, height);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;

        const file = new File([blob], `foto-camara-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });

        const previewUrl = URL.createObjectURL(blob);

        if (localPreview) {
          URL.revokeObjectURL(localPreview);
        }

        setLocalFile(file);
        setLocalPreview(previewUrl);
      },
      "image/jpeg",
      0.95
    );
  };

  const confirmPhoto = () => {
    if (!localFile || !localPreview) return;

    onPhotoTaken({
      file: localFile,
      previewUrl: localPreview,
    });

    closeCamera();
    onClose();
  };

  const handleClose = () => {
    closeCamera();

    if (localPreview) {
      URL.revokeObjectURL(localPreview);
    }

    setLocalFile(null);
    setLocalPreview(null);
    setCameraError(null);

    onClose();
  };

  useEffect(() => {
    if (!isOpen) return;
    if (localPreview) return;
    if (!stream) return;
    if (!videoRef.current) return;

    videoRef.current.srcObject = stream;
    videoRef.current.play().catch((error) => {
        console.error("Error al reproducir el video:", error);
    });
    }, [isOpen, localPreview, stream]);

  useEffect(() => {
    if (isOpen) {
      openCamera();
    }

    return () => {
      closeCamera();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="photo-modal-overlay">
      <div className="photo-modal">
        <div className="photo-modal-header">
          <div>
            <h2 className="photo-modal-title">Tomar Fotografía</h2>
            <p className="photo-modal-subtitle">
              Captura una imagen del impacto para agregarla al caso.
            </p>
          </div>

          <button className="photo-modal-close" onClick={handleClose}>
            <CloseIcon height="1.4em" />
          </button>
        </div>

        <div className="photo-modal-body">
          {!localPreview ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="photo-modal-video"
            />
          ) : (
            <img
              src={localPreview}
              alt="Fotografía capturada"
              className="photo-modal-preview"
            />
          )}

          <canvas ref={canvasRef} style={{ display: "none" }} />

          {cameraError && (
            <p className="photo-modal-error">{cameraError}</p>
          )}
        </div>

        <div className="photo-modal-actions">
          {!localPreview ? (
            <button
              type="button"
              className="photo-modal-primary-btn"
              onClick={takePhoto}
              disabled={!stream}
            >
              <CameraPlusIcon height="1.2em" />
              Tomar foto
            </button>
          ) : (
            <>
              <button
                type="button"
                className="photo-modal-secondary-btn"
                onClick={repeatPhoto}
                >
                Repetir foto
            </button>

              <button
                type="button"
                className="photo-modal-primary-btn"
                onClick={confirmPhoto}
              >
                <CheckIcon height="1.2em" />
                Usar foto
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}