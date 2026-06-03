# 1/2Chamba

Plataforma web académica para conectar estudiantes de Ingeniería en Sistemas Computacionales del ITZ con empresas y clientes que requieren servicios de tecnología.

## Funcionalidades

- Registro e inicio de sesión con Auth0
- Perfiles diferenciados (estudiante, cliente, administrador)
- Publicación y búsqueda de trabajos
- Postulaciones y gestión de solicitudes
- Calificación mutua entre estudiante y cliente
- Panel de administración (usuarios, trabajos, cuentas pendientes)
- Bloqueo de cuentas pendientes, suspendidas o rechazadas
- Calificación promedio calculada desde la base de datos

## Estructura

```
backend/   API REST (Express + MongoDB)
frontend/  Interfaz (React + Vite + Auth0)
```

## Requisitos locales

- Node.js 20+
- MongoDB Atlas (o instancia local)
- Cuenta Auth0
- Cuenta Cloudinary (fotos y documentos)

## Configuración local

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run seed   # empleos de prueba (opcional, idempotente)
npm run dev
```

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

## Variables de entorno

### Backend (`backend/.env`)

| Variable | Descripción |
|----------|-------------|
| `MONGODB_CONNECTION_STRING` | URI de MongoDB |
| `AUTH0_AUDIENCE` | Audience de la API Auth0 |
| `AUTH0_ISSUER_BASE_URL` | Issuer URL de Auth0 |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `FRONTEND_URL` | Origen del frontend (ej. `http://localhost:5173`) |
| `PORT` | Puerto del servidor (default 3000) |

### Frontend (`frontend/.env`)

| Variable | Descripción |
|----------|-------------|
| `VITE_AUTH0_DOMAIN` | Dominio Auth0 |
| `VITE_AUTH0_CLIENT_ID` | Client ID |
| `VITE_AUTH0_CALLBACK_URL` | URL de callback |
| `VITE_AUTH0_AUDIENCE` | Audience de la API |
| `VITE_API_URL` | URL del backend |

## Despliegue en Render

1. Sube el repositorio a GitHub (rama `main` estable).
2. En Render, crea un **Web Service** para el backend:
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Añade todas las variables de entorno del backend.
   - En `FRONTEND_URL`, pon la URL del frontend en Render.
3. Crea un **Static Site** para el frontend:
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
   - Variable `VITE_API_URL` = URL del backend en Render.
4. En Auth0, agrega las URLs de producción en Allowed Callback URLs y CORS.

También puedes usar el archivo `render.yaml` como referencia para Blueprint.

## Autores

- Esquivel Padilla Oscar Daniel - 22450165
- Del Río Ramírez Jazmín - 22450671

Instituto Tecnológico de Zacatecas — Temas selectos de programación
