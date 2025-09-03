# 📚 BookApp - Plataforma de Descubrimiento y Reseñas de Libros

Una aplicación Next.js para descubrir libros, ver detalles y escribir reseñas usando la API de Google Books.

## 🚀 Demo en Vivo

**URL de la aplicación:** `[AGREGAR_URL_CUANDO_SE_DEPLOYE]`

## ✨ Características

- 🔍 Búsqueda de libros usando Google Books API
- 📖 Vista detallada de cada libro
- ⭐ Sistema de reseñas y calificaciones
- 📱 Diseño responsive con Tailwind CSS
- 🏗️ Arquitectura escalable con TypeScript
- 🧪 Tests unitarios con Vitest
- 🐳 Dockerizado para deployment
- ⚡ CI/CD con GitHub Actions

## 🛠️ Tecnologías

- **Frontend:** Next.js 14, TypeScript, Tailwind CSS
- **API:** Google Books API
- **Testing:** Vitest, Testing Library
- **Deployment:** Docker, Vercel
- **CI/CD:** GitHub Actions

## 📋 Prerrequisitos

- Node.js 18+ 
- npm o yarn
- Docker (opcional, para containerización)
- Google Books API Key

## 🏃‍♂️ Instalación y Desarrollo Local

### 1. Clonar el repositorio
```bash
git clone https://github.com/Joaquinchin/bookApp.git
cd bookApp
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
```bash
cp .env.example .env
```

Editar `.env` y agregar tu Google Books API Key:
```env
NEXT_PUBLIC_GOOGLE_API_KEY=tu_api_key_aqui
```

### 4. Ejecutar en modo desarrollo
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch
npm run test:watch

# Ejecutar tests con coverage
npm run test:coverage
```

## 🐳 Docker

### Construir imagen
```bash
docker build -t bookapp .
```

### Ejecutar container
```bash
docker run -p 3000:3000 -e NEXT_PUBLIC_GOOGLE_API_KEY=tu_api_key bookapp
```

### Usar con docker-compose (próximamente)
```bash
docker-compose up -d
```

## 🚀 Deployment

### Variables de Entorno para Producción

Asegurate de configurar estas variables en tu servicio de hosting:

- `NEXT_PUBLIC_GOOGLE_API_KEY`: Tu API key de Google Books
- `NEXT_PUBLIC_APP_URL`: URL base de tu aplicación
- `NODE_ENV`: `production`

### Deployment en Vercel

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno
3. Deploy automático en cada push a `main`

### Deployment con Docker

La imagen se construye automáticamente y se publica en GitHub Container Registry (ghcr.io) cuando se mergea código a `main`.

```bash
# Usar imagen pre-construida
docker pull ghcr.io/joaquinchin/bookapp:latest
docker run -p 3000:3000 ghcr.io/joaquinchin/bookapp:latest
```

## ⚙️ GitHub Actions (CI/CD)

### Workflows Configurados

1. **PR Build Check** (`.github/workflows/pr-build.yml`)
   - Se ejecuta en cada Pull Request
   - Instala dependencias y buildea la aplicación
   - Falla el PR si hay errores de compilación
   - Comenta en el PR con resultados

2. **PR Test Check** (`.github/workflows/pr-test.yml`)
   - Se ejecuta en cada Pull Request
   - Ejecuta todos los tests unitarios
   - Falla el PR si hay tests fallidos
   - Comenta en el PR con resultados

3. **Docker Build & Publish** (`.github/workflows/docker-publish.yml`)
   - Se ejecuta cuando se mergea a `main`
   - Construye imagen Docker optimizada
   - Publica en GitHub Container Registry
   - Genera tags: `latest`, `v{version}`, `{commit-hash}`

### Estado de los Builds

[![Build Status](https://github.com/Joaquinchin/bookApp/workflows/PR%20–%20Build%20Check/badge.svg)](https://github.com/Joaquinchin/bookApp/actions)
[![Test Status](https://github.com/Joaquinchin/bookApp/workflows/PR%20–%20Test%20Check/badge.svg)](https://github.com/Joaquinchin/bookApp/actions)
[![Docker](https://github.com/Joaquinchin/bookApp/workflows/Docker%20–%20Build%20&%20Publish%20(GHCR)/badge.svg)](https://github.com/Joaquinchin/bookApp/actions)

## 📁 Estructura del Proyecto

```
bookApp/
├── src/
│   ├── app/                 # App Router (Next.js 13+)
│   │   ├── page.tsx         # Página principal
│   │   ├── book/[id]/       # Página de detalle del libro
│   │   └── search/          # Página de búsqueda
│   ├── components/          # Componentes reutilizables
│   └── lib/                 # Utilidades y helpers
├── _tests_/                 # Tests unitarios
├── public/                  # Assets estáticos
├── .github/workflows/       # GitHub Actions
├── Dockerfile               # Configuración Docker
├── next.config.ts           # Configuración Next.js
└── README.md
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-caracteristica`)
3. Commit tus cambios (`git commit -m 'Agregar nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Abre un Pull Request

## 📝 Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build para producción
npm run start        # Servidor de producción
npm run lint         # Linter
npm run test         # Tests unitarios
npm run test:watch   # Tests en modo watch
npm run type-check   # Verificación de tipos TypeScript
```

## 🔧 Configuración Avanzada

### Optimización de Performance
- Imágenes optimizadas con Next.js Image
- Lazy loading automático
- Bundle splitting
- Cache de builds en CI/CD

### Seguridad
- Variables de entorno seguras
- Headers de seguridad configurados
- Rate limiting (próximamente)

## 📄 Licencia

MIT

## 👥 Autor

**Joaquin Chin** - [GitHub](https://github.com/Joaquinchin)

---

⭐ Si te gusta este proyecto, danos una estrella en GitHub!
