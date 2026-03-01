import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QRLab - Registro de Laboratorios",
  description: "Sistema de registro de ingreso a laboratorios de investigación",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
