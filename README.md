# FST Asistencia (Web + API)

Monorepo con:

- `apps/web`: frontend (Vite + React) — **sitio estático** (se sube `dist/`)
- `apps/api`: backend (Express + MySQL) — **Node.js** (se corre con `node dist/server.js`)
- `functions`: funciones Firebase (opcional; actualmente mínimo)

## Requisitos

- Node.js 18+ recomendado
- MySQL (si vas a usar el API)

## Desarrollo local

Instalar dependencias en la raíz:

```bash
npm install
```

### Web

1. Crear `apps/web/.env` (copiar de `apps/web/.env.example`) y completar `VITE_FIREBASE_*`.
2. Ejecutar:

```bash
npm run dev -w fst-asistencia-web
```

### API

1. Crear `apps/api/.env` (copiar de `apps/api/.env.example`) y completar variables MySQL/CORS.
2. Ejecutar:

```bash
npm run dev -w fst-asistencia-api
```

Healthcheck:

- `GET /health`

## Build (producción)

```bash
npm run build -w fst-asistencia-web
npm run build -w fst-asistencia-api
```

## Despliegue en hosting (sin Firebase Hosting)

### 1) Subir el Frontend (estático)

1. Compilar web:

```bash
npm run build -w fst-asistencia-web
```

2. Subir **todo el contenido** de `apps/web/dist/` al directorio público del hosting (ej. `public_html/`).

#### Importante (React Router / SPA)

Tu hosting debe reescribir rutas hacia `index.html`.

- **Apache (.htaccess)**: crea un archivo `.htaccess` en la raíz del sitio (al lado de `index.html`) con:

```apache
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

- **Nginx**:

```nginx
try_files $uri $uri/ /index.html;
```

### 2) Desplegar el API (Node.js)

Requisito: tu hosting debe permitir correr Node (PM2 / “Setup Node.js App” / systemd en VPS).

1. Subir `apps/api/` al servidor (sin `src/` si no quieres; lo mínimo es `dist/`, `package.json` y `package-lock.json`).
2. En el servidor, dentro de la carpeta del API:

```bash
npm ci --omit=dev
```

3. Crear `.env` basado en `apps/api/.env.example` y configurar:

- `PORT` (el puerto que tu hosting use internamente)
- `ALLOWED_ORIGINS` (tu dominio del frontend, ej. `https://tudominio.com`)
- `MYSQL_*`

4. Arrancar:

```bash
npm run start
```

> En producción el comando `start` ejecuta `node dist/server.js`.

## Firebase (si se mantiene como backend)

El frontend usa Firebase Auth + Firestore directamente (configuración vía `VITE_FIREBASE_*`).
Puedes hostear el frontend en tu hosting y **mantener Firestore/Auth en Firebase** sin problema.

