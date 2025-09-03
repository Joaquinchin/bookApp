# BookApp - Plataforma de Descubrimiento y Reseñas de Libros

Aplicación Next.js para buscar libros y escribir reseñas usando la API de Google Books.

## URL de la Aplicación Deployada

**Producción**: https://book-app-xi-ten.vercel.app

## Descripción

Esta aplicación permite a los usuarios:
- Buscar libros usando la API de Google Books
- Ver detalles de cada libro
- Escribir y leer reseñas
- Votar en reseñas existentes

## Tecnologías

- Next.js 14 con TypeScript
- React 18
- Tailwind CSS
- Vitest para testing
- Docker para containerización
- GitHub Actions para CI/CD
- Vercel para deployment

## Instalación y Deploy Local

### Prerrequisitos
- Node.js 18 o superior
- npm
- API Key de Google Books

### Pasos

1. Clonar repositorio:
```bash
git clone https://github.com/joaquinchin/bookApp.git
cd bookApp
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
```bash
cp .env.example .env.local
```

Editar `.env.local` con tu API key:
```
NEXT_PUBLIC_GOOGLE_API_KEY=tu_api_key_aqui
```

4. Ejecutar en desarrollo:
```bash
npm run dev
```

La aplicación estará en http://localhost:3000

## Variables de Entorno Necesarias

### Para desarrollo local:
- `NEXT_PUBLIC_GOOGLE_API_KEY`: API key de Google Books (requerida)
- `NEXT_PUBLIC_API_URL`: URL base de la aplicación (opcional)

### Para producción:
- `NEXT_PUBLIC_GOOGLE_API_KEY`: API key de Google Books
- `NODE_ENV=production`
- `PORT=3000`

### Obtener Google Books API Key:
1. Ir a Google Cloud Console
2. Crear un proyecto nuevo
3. Habilitar Books API
4. Crear credenciales (API Key)
5. Copiar la key al archivo .env.local

## GitHub Actions

### Workflows Configurados

#### 1. Build Check (pr-build.yml)
- **Trigger**: Pull Requests hacia main
- **Función**: Verifica que la aplicación compile correctamente
- **Pasos**:
  - Instala dependencias en Node.js 18 y 20
  - Ejecuta npm run build
  - Cachea dependencias para acelerar builds futuros
  - Comenta resultados en el PR
  - Bloquea merge si el build falla

#### 2. Test Check (pr-test.yml)
- **Trigger**: Pull Requests hacia main
- **Función**: Ejecuta suite de tests unitarios
- **Pasos**:
  - Instala dependencias
  - Ejecuta npm run test:ci con Vitest
  - Reporta resultados en el PR
  - Bloquea merge si algún test falla

#### 3. Docker Build & Publish (docker-publish.yml)
- **Trigger**: Push a rama main
- **Función**: Construye y publica imagen Docker
- **Pasos**:
  - Construye imagen optimizada con multi-stage build
  - Publica en GitHub Container Registry (ghcr.io)
  - Genera tags: latest, v{version}, {commit-hash}
  - Utiliza cache de Docker layers para optimización

### Cache Implementado
- **npm**: Cache de node_modules basado en package-lock.json
- **Next.js build**: Cache de .next/cache para builds más rápidos
- **Docker layers**: Cache de layers entre builds Docker

### Secrets Utilizados
- `GITHUB_TOKEN`: Token automático para publicar en GitHub Container Registry

## Instrucciones Docker

### Construir imagen local:
```bash
docker build -t bookapp .
```

### Ejecutar container:
```bash
docker run -p 3000:3000 -e NEXT_PUBLIC_GOOGLE_API_KEY=tu_key bookapp
```

### Usar imagen publicada:
```bash
docker pull ghcr.io/joaquinchin/bookapp:latest
docker run -p 3000:3000 -e NEXT_PUBLIC_GOOGLE_API_KEY=tu_key ghcr.io/joaquinchin/bookapp:latest
```

## Testing

Ejecutar tests:
```bash
npm test          # Tests en modo interactivo
npm run test:ci   # Tests para CI/CD
```

Los tests cubren:
- Componentes React
- Server Actions
- Utilidades y helpers
- Integración con APIs

## Estructura del Proyecto

```
bookApp/
├── src/
│   ├── app/                 # App Router Next.js
│   ├── components/          # Componentes React
│   └── lib/                 # Utilidades y APIs
├── _tests_/                 # Tests unitarios
├── .github/workflows/       # GitHub Actions
├── public/                  # Assets estáticos
├── Dockerfile              # Configuración Docker
└── package.json            # Dependencias
```

## Deployment

### Opción 1: Vercel (Recomendada)

Vercel es la plataforma recomendada para aplicaciones Next.js por su simplicidad y rendimiento.

#### Pasos para deployar en Vercel:

1. **Crear cuenta en Vercel**
   - Ir a https://vercel.com
   - Registrarse con tu cuenta de GitHub

2. **Importar proyecto**
   - Click en "New Project"
   - Seleccionar tu repositorio bookApp
   - Vercel detectará automáticamente que es Next.js

3. **Configurar variables de entorno**
   - En la página de configuración, agregar:
   - `NEXT_PUBLIC_GOOGLE_API_KEY` = tu_api_key_de_google_books

4. **Deploy automático**
   - Vercel buildea y deploya automáticamente
   - Te dará una URL como: https://bookapp-abc123.vercel.app

5. **Deploy continuo**
   - Cada push a main actualizará automáticamente el deployment
   - Los PRs crean preview deployments automáticamente


## Demostración GitHub Actions

Los workflows están configurados y funcionando:
- Pull Requests activan build y test checks automáticamente
- Push a main activa build y publicación de Docker
- Todos los workflows incluyen cache para optimización
- Comentarios automáticos en PRs con resultados
- Bloqueo de merge si hay fallos

