/**
 * Script de migración de base de datos.
 * Crea las tablas necesarias en Neon PostgreSQL.
 *
 * Uso: npx tsx scripts/migrate.ts
 */
import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  console.log("⏳ Creando tablas...");

  await sql`
    CREATE TABLE IF NOT EXISTS laboratorios (
      id SERIAL PRIMARY KEY,
      nombre VARCHAR(200) NOT NULL,
      codigo VARCHAR(50) NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS registros (
      id SERIAL PRIMARY KEY,
      laboratorio_id INTEGER REFERENCES laboratorios(id) NOT NULL,
      fecha DATE NOT NULL,
      nombre_investigador VARCHAR(200) NOT NULL,
      actividad VARCHAR(300) NOT NULL,
      grupo_investigacion VARCHAR(200),
      codigo_proyecto VARCHAR(100),
      nombre_proyecto VARCHAR(300),
      instituciones_asociadas TEXT,
      hora_ingreso TIME NOT NULL,
      hora_salida TIME,
      recursos_usados TEXT,
      num_asistentes INTEGER DEFAULT 1,
      confirmacion_firma BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    )
  `;

  console.log("✅ Tablas creadas exitosamente.");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
