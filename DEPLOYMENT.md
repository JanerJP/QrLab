# Guía de Despliegue en Vercel

## 1. Base de datos Neon PostgreSQL

1. Ir a https://console.neon.tech y crear cuenta gratuita
2. Crear un nuevo proyecto → copiar la **Connection string** (postgresql://...)
3. Ejecutar la migración una sola vez:
   ```bash
   # Copia .env.example a .env.local y completa DATABASE_URL
   cp .env.example .env.local
   npm run db:migrate
   ```

## 2. Subir a GitHub

```bash
git add .
git commit -m "feat: QRLab - registro de laboratorios FGL 015"
git remote add origin https://github.com/tu-usuario/qrlab.git
git push -u origin main
```

## 3. Desplegar en Vercel

1. Ir a https://vercel.com → Import Project → seleccionar el repo
2. En **Environment Variables** agregar:
   - `DATABASE_URL` → tu connection string de Neon
   - `ADMIN_PASSWORD` → contraseña segura para el panel admin
3. Click **Deploy**

## 4. Usar la aplicación

- **URL del panel admin:** `https://tu-app.vercel.app/admin`
- Crear los laboratorios desde el panel
- Cada laboratorio genera su **QR permanente** → descargar e imprimir
- Las personas escanean el QR y llenan el formulario FGL 015
- Exportar Excel desde `/admin/registros`

## Estructura de la app

```
/registro/[labCode]  → Formulario público (destino del QR)
/admin               → Panel admin (laboratorios + QR)
/admin/registros     → Ver registros + exportar Excel FGL 015
/admin/login         → Login con contraseña
```
