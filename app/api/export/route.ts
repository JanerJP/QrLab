import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { registros, laboratorios } from "@/lib/schema";
import { isAuthenticated } from "@/lib/auth";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import * as XLSX from "xlsx";

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
      laboratorioNombre: laboratorios.nombre,
    })
    .from(registros)
    .leftJoin(laboratorios, eq(registros.laboratorioId, laboratorios.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(registros.fecha));

  const labNombre = (rows.length > 0 && rows[0].laboratorioNombre) ? rows[0].laboratorioNombre : "Laboratorio";

  // Construir Excel con formato FGL 015
  const wb = XLSX.utils.book_new();

  // Fila de encabezado del documento
  const headerRows = [
    ["REGISTRO DE ATENCIÓN INVESTIGACIÓN LABORATORIOS", "", "", "", "", "", "", "", "", "", "", "Código", "FGL 015"],
    ["", "", "", "", "", "", "", "", "", "", "", "Versión", "03"],
    ["", "", "", "", "", "", "", "", "", "", "", "Fecha", "09-07-2024"],
    [`Taller o Laboratorio: ${labNombre}`, "", "", "", "", "", "", "", "", "", "", "", ""],
    [
      "Fecha",
      "Nombre investigador",
      "",
      "Actividad",
      "Grupo de investigación",
      "Código del proyecto",
      "Nombre del proyecto",
      "Instituciones asociadas al proyecto",
      "Hora ingreso",
      "Hora salida",
      "Recursos usados",
      "N° asistentes",
      "Firma del investigador",
    ],
  ];

  const dataRows = rows.map((r) => [
    r.fecha,
    r.nombreInvestigador,
    "",
    r.actividad,
    r.grupoInvestigacion ?? "",
    r.codigoProyecto ?? "",
    r.nombreProyecto ?? "",
    r.institucionesAsociadas ?? "",
    r.horaIngreso,
    r.horaSalida ?? "",
    r.recursosUsados ?? "",
    r.numAsistentes ?? 1,
    "✓ Confirmado digitalmente",
  ]);

  const wsData = [...headerRows, ...dataRows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Anchos de columna
  ws["!cols"] = [
    { wch: 12 }, { wch: 25 }, { wch: 5 }, { wch: 25 }, { wch: 20 },
    { wch: 18 }, { wch: 30 }, { wch: 30 }, { wch: 12 }, { wch: 12 },
    { wch: 25 }, { wch: 12 }, { wch: 22 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, "FGL 015");

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  const filename = `FGL015_${labNombre.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.xlsx`;

  return new NextResponse(buf, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
