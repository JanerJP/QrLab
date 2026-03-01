import RegistrosClient from "./RegistrosClient";
import { db } from "@/lib/db";
import { laboratorios } from "@/lib/schema";

export const dynamic = "force-dynamic";

export default async function RegistrosPage() {
  const labs = await db.select().from(laboratorios).orderBy(laboratorios.nombre);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Registros</h1>
        <p className="text-slate-500 text-sm mt-1">Consulta y exporta los registros del formulario FGL 015.</p>
      </div>
      <RegistrosClient labs={labs} />
    </div>
  );
}
