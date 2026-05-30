# WanderIA — Recomendador Inteligente de Destinos de Viaje

WanderIA es una aplicación web **impulsada por IA** que recomienda destinos de viaje personalizados. A través de un test de perfilado de hasta 25 preguntas (generadas dinámicamente por Ollama o de un banco estático), el motor analiza las preferencias del usuario —clima, presupuesto, intereses, seguridad, idioma, etc.— y genera recomendaciones con información detallada sobre cultura, gastronomía, costos, clima y vuelos reales.

---

## Tecnologías Utilizadas

### Frontend

| Tecnología | Versión | Uso |
|---|---|---|
| **Next.js** | 16.1.6 | Framework principal (App Router, API Routes, SSR) |
| **React** | 19.2.4 | Biblioteca UI con hooks y Context API |
| **TypeScript** | 5.7.3 | Tipado estático en todo el proyecto |
| **Tailwind CSS** | 4.2.0 | Estilos utility-first con design tokens |
| **lucide-react** | 0.564.0 | Biblioteca de iconos (única librería de iconos) |
| **shadcn/ui** | — | Componentes accesibles sobre Radix UI |

### Backend (API Routes de Next.js)

| Endpoint | Método | Descripción |
|---|---|---|
| `/api/auth/signup` | POST | Registro con validación de mayoría de edad y hash SHA-256 |
| `/api/auth/login` | POST | Autenticación con verificación de hash |
| `/api/auth/change-password` | POST | Cambio de contraseña autenticado |
| `/api/recommendations` | POST | Motor de scoring con pesos configurables (protegido JWT) |
| `/api/ollama` | GET/POST | Integración con Ollama para preguntas y recomendaciones dinámicas |
| `/api/flights` | GET | Información de vuelos estimada con redirección a Skyscanner |
| `/api/favorites` | GET/POST/DELETE | Gestión de destinos favoritos con calificación por estrellas |
| `/api/feedback` | GET/POST/PATCH/DELETE | Comentarios y sentimiento sobre recomendaciones |
| `/api/admin/destinations` | GET/POST | CRUD de destinos (solo admin) |
| `/api/admin/destinations/[id]` | GET/PUT/DELETE/PATCH | Operaciones sobre destino individual (solo admin) |
| `/api/health` | GET | Health check para Docker/Kubernetes |
| `/api/debug/jwt` | GET/POST | Diagnóstico del sistema JWT |

### IA — Ollama (LLaMA 3.2:3b)

| Componente | Descripción |
|---|---|
| **Modelo** | `llama3.2:3b` ejecutándose localmente vía Ollama |
| **Endpoint base** | `http://localhost:11434/api/generate` |
| **Funcionalidades** | Generación dinámica de preguntas por lotes, recomendaciones personalizadas |
| **Caché** | Preguntas generadas se cachean 24 h en `localStorage` del cliente |
| **Contexto de usuario** | Perfil abstracto de preferencias derivado de favoritos y feedback (sin mencionar destinos específicos) |
| **Fallback** | Si Ollama no está disponible, se usan las 25 preguntas estáticas incluidas |

### Base de Datos (SQLite + better-sqlite3)

| Tabla | Descripción |
|---|---|
| `users` | Usuarios con hash SHA-256+salt, fecha de nacimiento y rol |
| `destinations` | Destinos con atributos extendidos; auto-seeded si la tabla está vacía |
| `user_preferences` | Pesos configurables (1–10) por categoría |
| `test_sessions` | Historial de tests completados |
| `test_answers` | Respuestas individuales por sesión |
| `recommendations` | Recomendaciones generadas y guardadas |
| `favorite_destinations` | Favoritos con calificación de 1–5 estrellas |
| `recommendation_feedback` | Comentarios con sentimiento y puntuación de utilidad |
| `ai_questions_cache` | Caché de preguntas generadas por Ollama |
| `saved_destinations` | Destinos guardados con notas personales |

### Autenticación y Seguridad

- **JWT (JSON Web Tokens):** generación manual HMAC-SHA256, expiración automática de 24 h con logout programado en el cliente.
- **Hash de contraseñas:** SHA-256 con salt aleatorio de 16 bytes en formato `sha256$<salt>$<hash>`.
- **Validación de edad:** se requiere ser mayor de 18 años en el registro.
- **Roles:** `user` y `admin`; rutas de administración protegidas con verificación de rol.
- **Timing-safe comparison:** las firmas JWT se comparan con `crypto.timingSafeEqual` para prevenir timing attacks.

---

## Sistema de IA — Arquitectura

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Frontend      │────>│  Next.js API     │────>│    Ollama       │
│   (React)       │<────│  /api/ollama     │<────│  localhost:11434│
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌──────────────────┐
                        │  llama3.2:3b     │
                        └──────────────────┘
```

### Generación de preguntas dinámicas

Ollama recibe un system prompt que especifica:
- Formato JSON estricto con cierre de corchetes y sin comentarios.
- Lista de **iconos Lucide válidos** para el campo `icon` de cada opción.
- Mínimo 4 opciones por pregunta, etiquetas en español, valores en `snake_case`.
- Lotes de hasta 5 categorías por request para distribuir la carga.

### Personalización con historial del usuario

El sistema extrae **insights abstractos** de favoritos y feedback anteriores (sin mencionar nombres de destinos) para personalizar tanto las preguntas como las recomendaciones futuras, evitando sesgos de repetición.

---

## Pesos Configurables (1–10)

El panel de configuración (botón de engranaje en el test) permite ajustar la importancia de cada factor:

| Factor | Descripción |
|---|---|
| Clima | Preferencia de temperatura y tipo de clima |
| Presupuesto | Nivel de gasto esperado |
| Intereses | Áreas de interés principales |
| Estilo de viaje | Tipo de experiencia (mochilero, confort, lujo, cultural) |
| Región | Continente o zona geográfica |
| Actividades | Actividades específicas preferidas |
| Gastronomía | Preferencias culinarias |
| Alojamiento | Tipo de hospedaje |
| Compañía | Con quién viaja |
| Seguridad | Nivel de seguridad requerido |
| Idioma | Importancia de la barrera del idioma |
| Temporada | Época del año preferida |
| Vida nocturna | Tipo de actividades nocturnas |
| Naturaleza | Tipo de entorno natural |
| Cultura | Aspectos culturales de interés |
| Aventura | Nivel de actividad física |
| Conectividad | Necesidad de internet/datos |
| Fotografía | Importancia de oportunidades fotográficas |
| Multitudes | Preferencia respecto a zonas turísticas concurridas |
| Compras | Interés en actividades de compra |
| Sostenibilidad | Importancia del turismo sostenible |
| Actividades acuáticas | Interés en deportes o actividades en el agua |

---

## Test de Perfilado

### Modo dinámico (con Ollama)
25 preguntas generadas por IA distribuidas en estas categorías: clima, presupuesto, duración, intereses, estilo de viaje, continente, actividades, comida, alojamiento, compañía, seguridad, idioma, movilidad, temporada, vida nocturna, naturaleza, cultura, nivel de aventura, conectividad, fotografía, sostenibilidad, compras, multitudes, actividades acuáticas.

### Modo estático (fallback sin Ollama)
25 preguntas predefinidas que cubren las mismas categorías.

### Formato de opciones
Cada pregunta muestra entre 4 y 6 opciones con icono Lucide + etiqueta. Las de tipo `multiple` permiten hasta N selecciones configuradas.

---

## Motor de Recomendaciones

El endpoint `/api/recommendations` aplica un algoritmo de scoring ponderado sobre los destinos activos de la base de datos:

| Criterio | Puntos base | Peso |
|---|---|---|
| Clima | 30 | `weights.climate` |
| Presupuesto | 25 | `weights.budget` |
| Intereses | 20 | `weights.interests` |
| Estilo de viaje | 15 | `weights.travelStyle` |
| Continente | 20 | `weights.continent` |
| Actividades | 15 | `weights.activities` |
| Seguridad | 10 | `weights.safety` |
| Idioma | 10 | `weights.language` |
| Temporada | 10 | `weights.season` |
| Vida nocturna | 8 | `weights.nightlife` |
| Naturaleza | 12 | `weights.nature` |
| Cultura | 12 | `weights.culture` |
| Aventura | 10 | `weights.adventureLevel` |
| Conectividad | 8 | `weights.connectivity` |
| Transporte | 8 | `weights.travelStyle` |

El score final se escala al rango 60–97 % para mostrar compatibilidad. Se retornan los 3 destinos con mayor puntuación.

---

## Información de Vuelos

El módulo de vuelos (`/api/flights`) proporciona:
- Detección de ciudad de origen por IP (vía `ip-api.com`).
- Base de datos de códigos IATA para más de 80 ciudades en Latinoamérica, Europa, Asia, África y Oceanía.
- Estimación de precios por ruta (origen → destino).
- URL de reserva en Skyscanner con fechas por defecto (30 días desde hoy, 7 días de duración).

---

## Panel de Administración

Accesible en `/admin` únicamente para usuarios con rol `admin`.

**Funcionalidades:**
- Listar todos los destinos con búsqueda por nombre o país.
- Crear, editar y eliminar destinos.
- Activar/desactivar destinos (los inactivos no aparecen en recomendaciones).
- Estadísticas básicas: total, activos e inactivos.

**Crear usuario admin:**
```cmd
npx tsx scripts/create-admin.ts "Nombre Admin" admin@correo.com contraseña123
```

---

## Perfil de Usuario

En `/profile` el usuario puede:
- Ver y eliminar destinos favoritos (con calificación de estrellas).
- Consultar el historial de comentarios con sentimiento y puntuación de utilidad.
- Cambiar su contraseña con validación de contraseña actual.

---

## Estructura del Proyecto

```
wanderia/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts
│   │   │   ├── signup/route.ts
│   │   │   └── change-password/route.ts
│   │   ├── admin/destinations/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── feedback/route.ts
│   │   ├── favorites/route.ts
│   │   ├── flights/route.ts
│   │   ├── ollama/route.ts
│   │   ├── recommendations/route.ts
│   │   ├── health/route.ts
│   │   └── debug/jwt/route.ts
│   ├── admin/page.tsx
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   ├── test/page.tsx
│   ├── results/page.tsx
│   ├── profile/page.tsx
│   ├── providers.tsx
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── admin-protected-route.tsx
│   ├── change-password-modal.tsx
│   ├── destination-card.tsx
│   ├── destination-form.tsx
│   ├── favorite-comment-section.tsx
│   ├── features-section.tsx
│   ├── hero-section.tsx
│   ├── navbar.tsx
│   ├── protected-route.tsx
│   ├── question-card.tsx
│   ├── weights-config.tsx
│   └── ui/                        # Componentes shadcn/ui
├── context/
│   ├── auth-context.tsx
│   ├── theme-context.tsx
│   └── weights-context.tsx
├── database/
│   └── schema.sql
├── lib/
│   ├── database.ts                # SQLite + JWT + hash functions
│   ├── ollama.ts                  # Cliente Ollama + prompts IA
│   ├── test-questions.ts          # 25 preguntas estáticas
│   └── utils.ts
├── scripts/
│   ├── create-admin.ts
│   ├── init_database.py
│   ├── seed-destinations.py
│   ├── setup-ollama.bat
│   ├── start-wanderia.bat
│   └── validate-jwt-system.js
├── tests/
│   ├── api/
│   ├── concurrent/
│   ├── fixtures/
│   ├── integration/
│   ├── matrix/
│   └── unit/
├── jest.config.js
├── jest.setup.js
└── package.json
```

---

## Instalación y Despliegue (Windows)

### Requisitos

- **Node.js** ≥ 18.18 (recomendado: 20 LTS)
- **pnpm** ≥ 8
- **Ollama** instalado y ejecutándose (opcional — el sistema funciona sin él)

### Paso 1: Configurar Ollama (opcional)

```cmd
REM Descargar desde https://ollama.ai/download/windows e instalar

REM En una terminal separada:
ollama serve

REM Descargar el modelo:
ollama pull llama3.2:3b

REM Verificar:
ollama list
```

También puede ejecutar el script incluido:
```cmd
scripts\setup-ollama.bat
```

### Paso 2: Instalar dependencias

```cmd
git clone https://github.com/tu-usuario/wanderia.git
cd wanderia
pnpm install
```

### Paso 3: Variables de entorno

Crear `.env.local` en la raíz del proyecto:

```env
# JWT Secret (mínimo 32 caracteres — cambiar en producción)
JWT_SECRET=tu_secreto_super_seguro_de_al_menos_32_chars

# Ollama (opcional, usa localhost:11434 por defecto)
OLLAMA_URL=http://localhost:11434
```

Para validar que el sistema JWT funciona correctamente:
```cmd
node scripts\validate-jwt-system.js
```

### Paso 4: Iniciar la aplicación

```cmd
scripts\start-wanderia.bat
```

O manualmente:
```cmd
pnpm dev
```

Abrir `http://localhost:3000` en el navegador.

La base de datos SQLite (`data/wanderia.db`) se crea automáticamente con 8 destinos de ejemplo al primer arranque.

---

## Scripts Disponibles

| Comando | Descripción |
|---|---|
| `pnpm dev` | Servidor de desarrollo |
| `pnpm build` | Build de producción |
| `pnpm start` | Servidor de producción |
| `pnpm lint` | ESLint |
| `pnpm test` | Todos los tests con coverage |
| `pnpm test:unit` | Tests unitarios |
| `pnpm test:api` | Tests de endpoints |
| `pnpm test:integration` | Tests de integración |
| `pnpm test:concurrent` | Tests de concurrencia |
| `pnpm test:ci` | Tests para CI/CD |

---

## Suite de Tests

```
tests/
├── unit/
│   ├── database.test.ts       # Hash de contraseñas y JWT
│   └── validation.test.ts     # Validación de emails, contraseñas, etc.
├── api/
│   ├── auth-endpoints.test.ts # Flujo de autenticación HTTP
│   ├── favorites.test.ts      # API de favoritos
│   └── recommendations.test.ts # API de recomendaciones
├── integration/
│   ├── auth-flow.test.ts      # Flujo completo de registro/login
│   └── test-flow.test.ts      # Flujo test → recomendaciones → feedback
├── concurrent/
│   └── concurrency.test.ts    # Registros y sesiones simultáneas
└── matrix/
    └── cross-matrix.test.ts   # 367 combinaciones de escenarios
```

---

## Seguridad

### Hash de contraseñas

```
Formato: sha256$<salt_16_bytes_hex>$<hash_sha256_hex>
```

### JWT

```
Formato: base64url(header).base64url(payload).base64url(signature)
Algoritmo: HMAC-SHA256
Expiración: 24 horas
Comparación: crypto.timingSafeEqual (resistente a timing attacks)
```

### Validaciones de negocio

- Edad mínima de 18 años para registro.
- Tokens expirados generan logout automático con redirección a `/login?expired=1`.
- Rutas de administración verifican rol `admin` en cada request.

---

## Licencia

Proyecto académico — WanderIA
