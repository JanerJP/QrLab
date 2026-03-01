import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { laboratorios } from "@/lib/schema";
import { isAuthenticated } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

// GET /api/laboratorios - listar todos (público para el form)
export async function GET() {
  try {
    const labs = await db.select().from(laboratorios).orderBy(laboratorios.nombre);
    return NextResponse.json(labs);
  } catch {
    return NextResponse.json({ error: "Error al obtener laboratorios" }, { status: 500 });
  }
}

// POST /api/laboratorios - crear nuevo (admin)
export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { nombre } = await req.json();
  if (!nombre?.trim()) {
    return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });
  }

  const codigo = nanoid(8).toLowerCase();

  try {
    const [lab] = await db.insert(laboratorios).values({ nombre: nombre.trim(), codigo }).returning();
    return NextResponse.json(lab, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error al crear laboratorio" }, { status: 500 });
  }
}

// DELETE /api/laboratorios?id=X (admin)
export async function DELETE(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

  await db.delete(laboratorios).where(eq(laboratorios.id, Number(id)));
  return NextResponse.json({ ok: true });
}
