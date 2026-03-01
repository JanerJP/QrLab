"use client";

import { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";

interface Laboratorio {
  id: number;
  nombre: string;
  codigo: string;
}

function QRModal({ lab, onClose }: { lab: Laboratorio; onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !origin) return;
    const url = `${origin}/registro/${lab.codigo}`;
    QRCode.toCanvas(canvasRef.current, url, {
      width: 280,
      margin: 2,
      color: { dark: "#1e3a5f", light: "#ffffff" },
    });
  }, [lab, origin]);

  const registroUrl = origin ? `${origin}/registro/${lab.codigo}` : "";

  const handleDescargar = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `QR_${lab.nombre.replace(/\s+/g, "_")}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  const handleImprimir = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const imgData = canvas.toDataURL();
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html><head><title>QR - ${lab.nombre}</title>
      <style>
        body { font-family: Arial, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
        h2 { color: #1e3a5f; margin-bottom: 4px; }
        p { color: #64748b; font-size: 13px; margin-bottom: 16px; }
        img { border: 2px solid #e2e8f0; border-radius: 8px; padding: 8px; }
        .url { font-size: 11px; color: #94a3b8; margin-top: 12px; word-break: break-all; max-width: 300px; text-align: center; }
      </style>
      </head><body>
        <h2>${lab.nombre}</h2>
        <p>Registro de Atención Investigación Laboratorios · FGL 015</p>
        <img src="${imgData}" width="280" />
        <div class="url">${registroUrl}</div>
      </body></html>
    `);
    win.document.close();
    win.print();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold text-slate-800">{lab.nombre}</h2>
            <p className="text-slate-400 text-xs">QR permanente de registro</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl font-bold">×</button>
        </div>

        <div className="flex justify-center mb-4">
          <canvas ref={canvasRef} className="rounded-lg border border-slate-200" />
        </div>

        <p className="text-xs text-slate-400 text-center mb-4 break-all">{registroUrl}</p>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleDescargar}
            className="bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
          >
            Descargar PNG
          </button>
          <button
            onClick={handleImprimir}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium py-2.5 rounded-lg transition-colors"
          >
            Imprimir
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LaboratoriosClient({ initialLabs }: { initialLabs: Laboratorio[] }) {
  const [labs, setLabs] = useState<Laboratorio[]>(initialLabs);
  const [nombre, setNombre] = useState("");
  const [creando, setCreando] = useState(false);
  const [qrLab, setQrLab] = useState<Laboratorio | null>(null);
  const [error, setError] = useState("");

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    setCreando(true);
    setError("");

    const res = await fetch("/api/laboratorios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre }),
    });

    if (res.ok) {
      const lab = await res.json();
      setLabs((prev) => [...prev, lab].sort((a, b) => a.nombre.localeCompare(b.nombre)));
      setNombre("");
    } else {
      setError("Error al crear el laboratorio.");
    }
    setCreando(false);
  };

  const handleEliminar = async (id: number) => {
    if (!confirm("¿Eliminar este laboratorio? Se perderán todos sus registros.")) return;
    await fetch(`/api/laboratorios?id=${id}`, { method: "DELETE" });
    setLabs((prev) => prev.filter((l) => l.id !== id));
  };

  return (
    <>
      {/* Crear laboratorio */}
      <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
        <h2 className="font-semibold text-slate-700 mb-3">Nuevo laboratorio</h2>
        <form onSubmit={handleCrear} className="flex gap-3">
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre del laboratorio o taller"
            className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={creando}
            className="bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors whitespace-nowrap"
          >
            {creando ? "Creando..." : "+ Crear"}
          </button>
        </form>
        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
      </div>

      {/* Lista de laboratorios */}
      {labs.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-10 text-center">
          <div className="text-4xl mb-3">🔬</div>
          <p className="text-slate-500">Aún no hay laboratorios creados.</p>
          <p className="text-slate-400 text-sm">Crea el primero para obtener su QR.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {labs.map((lab) => (
            <div key={lab.id} className="bg-white rounded-xl shadow-sm p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-slate-800">{lab.nombre}</h3>
                  <p className="text-slate-400 text-xs mt-0.5">Código: {lab.codigo}</p>
                </div>
                <button
                  onClick={() => handleEliminar(lab.id)}
                  className="text-slate-300 hover:text-red-500 transition-colors text-xl font-bold"
                  title="Eliminar laboratorio"
                >
                  ×
                </button>
              </div>
              <div className="flex gap-2 mt-auto">
                <button
                  onClick={() => setQrLab(lab)}
                  className="flex-1 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold py-2 rounded-lg transition-colors"
                >
                  Ver QR
                </button>
                <a
                  href={`/registro/${lab.codigo}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold py-2 rounded-lg transition-colors text-center"
                >
                  Abrir form
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {qrLab && <QRModal lab={qrLab} onClose={() => setQrLab(null)} />}
    </>
  );
}
