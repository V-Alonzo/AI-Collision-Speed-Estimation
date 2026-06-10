import { useState } from "react";

import SpeedOneIcon from '@iconify-react/icon-park-solid/speed-one';
import CameraPlusIcon from '@iconify-react/tabler/camera-plus';
import CloudUploadOutlineIcon from '@iconify-react/mdi/cloud-upload-outline';
import ViewFileIcon from '@iconify-react/wpf/view-file';

export default function NuevoCaso() {
  const [form, setForm] = useState({
    id: "",
    descripcion: "",
    tipoCalculo: "",
    archivos: [],
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleFiles = (e) => {
    setForm({
      ...form,
      archivos: [...e.target.files],
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("FORM DATA:", form);

    alert("Caso creado correctamente (mock)");
  };

  return (
    <div className="p-6">
      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">

        {/* FORMULARIO */}
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-md">

          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-500 p-3 rounded-xl">
              <SpeedOneIcon height="1.5em" style={{ color: "#fff" }} />
            </div>
            <h2 className="text-xl font-semibold text-gray-700">
              Nuevo Caso de Estimación de Velocidad
            </h2>
          </div>

          {/* ID */}
          <div className="mb-4">
            <label className="text-sm text-gray-500">ID del Caso</label>
            <input
              type="text"
              name="id"
              value={form.id}
              onChange={handleChange}
              className="w-full mt-1 p-3 rounded-lg border"
              placeholder="Ej. CASO-001"
              required
            />
          </div>

          {/* DESCRIPCIÓN */}
          <div className="mb-4">
            <label className="text-sm text-gray-500">Descripción</label>
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              className="w-full mt-1 p-3 rounded-lg border"
              rows="3"
              placeholder="Describe el caso..."
              required
            />
          </div>

          {/* ARCHIVOS */}
          <div className="mb-4">
            <label className="text-sm text-gray-500">Subir archivos</label>
            <input
              type="file"
              multiple
              onChange={handleFiles}
              className="w-full mt-1"
            />
          </div>

          {/* TIPO */}
          <div className="mb-6">
            <label className="text-sm text-gray-500">Tipo de cálculo</label>
            <select
              name="tipoCalculo"
              value={form.tipoCalculo}
              onChange={handleChange}
              className="w-full mt-1 p-3 rounded-lg border"
              required
            >
              <option value="">Selecciona...</option>
              <option value="imagenes">Por imágenes</option>
              <option value="video">Por video</option>
            </select>
          </div>

          <button
            type="submit"
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            Crear Caso
          </button>
        </div>

        {/* PANEL DERECHO */}
        <div className="flex flex-col gap-4">

          <div className="bg-white/80 p-5 rounded-2xl shadow-md flex items-center gap-4">
            <CameraPlusIcon height="1.5em" />
            <span>Tomar Fotografías</span>
          </div>

          <div className="bg-white/80 p-5 rounded-2xl shadow-md flex items-center gap-4">
            <CloudUploadOutlineIcon height="1.5em" />
            <span>Subir archivos</span>
          </div>

          <div className="bg-white/80 p-5 rounded-2xl shadow-md flex items-center gap-4">
            <ViewFileIcon height="1.5em" />
            <span>Vista previa</span>
          </div>

        </div>
      </form>
    </div>
  );
}