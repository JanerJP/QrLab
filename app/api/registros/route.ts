import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { registros, laboratorios } from "@/lib/schema";
import { isAuthenticated } from "@/lib/auth";
import { eq, and, gte, lte, desc } from "drizzle-orm";

// GET /api/registros?labId=X&desde=YYYY-MM-DD&hasta=YYYY-MM-DD (admin)
export async function GET(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const labId = req.nextUrl.searchParams.get("labId");
  const desde = req.nextUrl.searchParams.get("desde");
  const hasta = req.nextUrl.searchParams.get("hasta");

  const conditions = [];
  if (labId) conditions.push(eq(registros.laboratorioId, Number(labId)));
  if (desde) conditions.push(gte(registros.fecha, desde));
  if (hasta) conditions.push(lte(registros.fecha, hasta));

  const rows = await db
    .select({
      id: registros.id,
      fecha: registros.fecha,
      nombreInvestigador: registros.nombreInvestigador,
      actividad: registros.actividad,
      grupoInvestigacion: registros.grupoInvestigacion,
      codigoProyecto: registros.codigoProyecto,
      nombreProyecto: registros.nombreProyecto,
      institucionesAsociadas: registros.institucionesAsociadas,
      horaIngreso: registros.horaIngreso,
      horaSalida: registros.horaSalida,
      recursosUsados: registros.recursosUsados,
      numAsistentes: registros.numAsistentes,
      confirmacionFirma: registros.confirmacionFirma,
      createdAt: registros.createdAt,
      laboratorioId: registros.laboratorioId,
      laboratorioNombre: laboratorios.nombre,
    })
    .from(registros)
    .leftJoin(laboratorios, eq(registros.laboratorioId, laboratorios.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(registros.fecha), desc(registros.createdAt));

  return NextResponse.json(rows);
}

// POST /api/registros (público - desde el formulario QR)
export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    laboratorioId,
    fecha,
    nombreInvestigador,
    actividad,
    grupoInvestigacion,
    codigoProyecto,
    nombreProyecto,
    institucionesAsociadas,
    horaIngreso,
    horaSalida,
    recursosUsados,
    numAsistentes,
    confirmacionFirma,
  } = body;

  if (!laboratorioId || !fecha || !nombreInvestigador?.trim() || !actividad?.trim() || !horaIngreso) {
    return NextResponse.json({ error: "Campos obligatorios faltantes" }, { status: 400 });
  }

  const [registro] = await db
    .insert(registros)
    .values({
      laboratorioId: Number(laboratorioId),
      fecha,
      nombreInvestigador: nombreInvestigador.trim(),
      actividad: actividad.trim(),
      grupoInvestigacion: grupoInvestigacion?.trim() || null,
      codigoProyecto: codigoProyecto?.trim() || null,
      nombreProyecto: nombreProyecto?.trim() || null,
      institucionesAsociadas: institucionesAsociadas?.trim() || null,
      horaIngreso,
      horaSalida: horaSalida || null,
      recursosUsados: recursosUsados?.trim() || null,
      numAsistentes: numAsistentes ? Number(numAsistentes) : 1,
      confirmacionFirma: Boolean(confirmacionFirma),
    })
    .returning();

  return NextResponse.json(registro, { status: 201 });
}
