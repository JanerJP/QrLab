import { pgTable, serial, varchar, text, date, time, integer, boolean, timestamp } from "drizzle-orm/pg-core";

export const laboratorios = pgTable("laboratorios", {
  id: serial("id").primaryKey(),
  nombre: varchar("nombre", { length: 200 }).notNull(),
  codigo: varchar("codigo", { length: 50 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const registros = pgTable("registros", {
  id: serial("id").primaryKey(),
  laboratorioId: integer("laboratorio_id").references(() => laboratorios.id).notNull(),
  fecha: date("fecha").notNull(),
  nombreInvestigador: varchar("nombre_investigador", { length: 200 }).notNull(),
  actividad: varchar("actividad", { length: 300 }).notNull(),
  grupoInvestigacion: varchar("grupo_investigacion", { length: 200 }),
  codigoProyecto: varchar("codigo_proyecto", { length: 100 }),
  nombreProyecto: varchar("nombre_proyecto", { length: 300 }),
  institucionesAsociadas: text("instituciones_asociadas"),
  horaIngreso: time("hora_ingreso").notNull(),
  horaSalida: time("hora_salida"),
  recursosUsados: text("recursos_usados"),
  numAsistentes: integer("num_asistentes").default(1),
  confirmacionFirma: boolean("confirmacion_firma").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Laboratorio = typeof laboratorios.$inferSelect;
export type NuevoLaboratorio = typeof laboratorios.$inferInsert;
export type Registro = typeof registros.$inferSelect;
export type NuevoRegistro = typeof registros.$inferInsert;
