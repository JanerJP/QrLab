"use client";

import { useState, useCallback } from "react";

interface Laboratorio {
  id: number;
  nombre: string;
  codigo: string;
}

interface Registro {
  id: number;
  fecha: string;
  nombreInvestigador: string;
  actividad: string;
  grupoInvestigacion: string | null;
  codigoProyecto: string | null;
  nombreProyecto: string | null;
  institucionesAsociadas: string | null;
  horaIngreso: string;
  horaSalida: string | null;
  recursosUsados: string | null;
  numAsistentes: number | null;
  confirmacionFirma: boolean | null;
  laboratorioNombre: string | null;
}

export default function RegistrosClient({ labs }: { labs: Laboratorio[] }) {
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [cargado, setCargado] = useState(false);
  const [cargando, setCargando] = useState(false);

  const [filtros, setFiltros] = useState({ labId: "", desde: "", hasta: "" });

  const cargarRegistros = useCallback(async () => {
    setCargando(true);
    const params = new URLSearchParams();
    if (filtros.labId) params.set("labId", filtros.labId);
    if (filtros.desde) params.set("desde", filtros.desde);
    if (filtros.hasta) params.set("hasta", filtros.hasta);

    const res = await fetch(`/api/registros?${params}`);
    if (res.ok) {
      setRegistros(await res.json());
      setCargado(true);
    }
    setCargando(false);
  }, [filtros]);

  const handleExportar = () => {
    const params = new URLSearchParams();
    if (filtros.labId) params.set("labId", filtros.labId);
    if (filtros.desde) params.set("desde", filtros.desde);
    if (filtros.hasta) params.set("hasta", filtros.hasta);
    window.open(`/api/export?${params}`, "_blank");
  };

  return (
    <>
      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
        <h2 className="font-semibold text-slate-700 mb-3">Filtros</h2>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs font-semibold text-slate-600 mb-1">Laboratorio</label>
            <select
              value={filtros.labId}
              onChange={(e) => setFiltros((f) => ({ ...f, labId: e.target.value }))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los laboratorios</option>
              {labs.map((l) => (
                <option key={l.id} value={l.id}>{l.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Desde</label>
            <input
              type="date"
              value={filtros.desde}
              onChange={(e) => setFiltros((f) => ({ ...f, desde: e.target.value }))}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Hasta</label>
            <input
              type="date"
              value={filtros.hasta}
              onChange={(e) => setFiltros((f) => ({ ...f, hasta: e.target.value }))}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={cargarRegistros}
            disabled={cargando}
            className="bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
          >
            {cargando ? "Buscando..." : "Buscar"}
          </button>
          {cargado && (
            <button
              onClick={handleExportar}
              className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Exportar Excel
            </button>
          )}
        </div>
      </div>

      {/* Tabla */}
      {!cargado ? (
        <div className="bg-white rounded-xl shadow-sm p-10 text-center">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-slate-500">Aplica los filtros y presiona <strong>Buscar</strong> para ver los registros.</p>
        </div>
      ) : registros.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-10 text-center">
          <p className="text-slate-500">No se encontraron registros con esos filtros.</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-slate-500">
              <span className="font-semibold text-slate-700">{registros.length}</span> registro{registros.length !== 1 ? "s" : ""} encontrado{registros.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs whitespace-nowrap">Fecha</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs whitespace-nowrap">Laboratorio</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs whitespace-nowrap">Investigador</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs whitespace-nowrap">Actividad</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs whitespace-nowrap">Grupo</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs whitespace-nowrap">Cód. Proyecto</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs whitespace-nowrap">Ingreso</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs whitespace-nowrap">Salida</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs whitespace-nowrap">Asistentes</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs whitespace-nowrap">Firma</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {registros.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{r.fecha}</td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                          {r.laboratorioNombre ?? "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800 whitespace-nowrap">{r.nombreInvestigador}</td>
                      <td className="px-4 py-3 text-slate-600 max-w-[200px] truncate" title={r.actividad}>{r.actividad}</td>
                      <td className="px-4 py-3 text-slate-500">{r.grupoInvestigacion ?? "—"}</td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{r.codigoProyecto ?? "—"}</td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{r.horaIngreso}</td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{r.horaSalida ?? "—"}</td>
                      <td className="px-4 py-3 text-center text-slate-600">{r.numAsistentes ?? 1}</td>
                      <td className="px-4 py-3 text-center">
                        {r.confirmacionFirma ? (
                          <span className="text-green-600 font-bold text-base">✓</span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </>
  );
}
