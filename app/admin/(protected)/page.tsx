import LaboratoriosClient from "../LaboratoriosClient";
import { db } from "@/lib/db";
import { laboratorios } from "@/lib/schema";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const labs = await db.select().from(laboratorios).orderBy(laboratorios.nombre);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Laboratorios</h1>
        <p className="text-slate-500 text-sm mt-1">Gestiona los laboratorios y sus códigos QR permanentes.</p>
      </div>
      <LaboratoriosClient initialLabs={labs} />
    </div>
  );
}
