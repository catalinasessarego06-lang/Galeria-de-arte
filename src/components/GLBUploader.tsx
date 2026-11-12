/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { UploadCloud, X, CheckCircle, AlertCircle } from 'lucide-react';

interface GLBUploaderProps {
  isOpen: boolean;
  onClose: () => void;
  onFileLoaded: (file: File) => void;
  isLoading: boolean;
  statusMessage?: string;
}

export const GLBUploader: React.FC<GLBUploaderProps> = ({
  isOpen,
  onClose,
  onFileLoaded,
  isLoading,
  statusMessage,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.glb') || file.name.endsWith('.gltf')) {
        onFileLoaded(file);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      onFileLoaded(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 text-slate-100 animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-white mb-1">Cargar Modelo 3D de Galería (.GLB)</h3>
        <p className="text-xs text-slate-400 mb-4">
          Carga tu propio archivo GLB de galería. El sistema montará automáticamente a la Mona Lisa y el perro en el cuadro rosa.
        </p>

        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-600 hover:border-rose-500 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer bg-slate-800/40 hover:bg-slate-800/70 transition group"
        >
          <UploadCloud className="w-10 h-10 text-slate-400 group-hover:text-rose-400 mb-3 transition" />
          <span className="text-sm font-medium text-slate-200">
            Haz clic o arrastra tu archivo <strong className="text-rose-400">.glb</strong> aquí
          </span>
          <span className="text-xs text-slate-500 mt-1">Formato GLB / GLTF soportado</span>

          <input
            ref={fileInputRef}
            type="file"
            accept=".glb,.gltf"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {statusMessage && (
          <div className="mt-4 p-3 rounded-lg bg-slate-800 border border-slate-700 text-xs flex items-center gap-2 text-slate-300">
            {isLoading ? (
              <div className="w-3.5 h-3.5 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span>{statusMessage}</span>
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="py-2 px-4 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
