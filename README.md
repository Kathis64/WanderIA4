# WanderIA - Recomendador Inteligente de Destinos de Viaje

WanderIA es una aplicacion web **Powered by AI** que utiliza inteligencia artificial (Ollama con LLama 3.2:3b) para recomendar destinos de viaje personalizados. A partir de un test de perfilado de 20 preguntas extensas, el motor de IA analiza las preferencias del usuario (clima, presupuesto, intereses, estilo de viaje, seguridad, idioma, etc.) y genera recomendaciones con informacion detallada sobre cultura, gastronomia, costos estimados, clima y vuelos reales.

---

## Tecnologias Utilizadas

### Frontend

| Tecnologia | Version | Uso |
|---|---|---|
| **Next.js** | 16.1.6 | Framework principal (App Router, API Routes, SSR) |
| **React** | 19.2.4 | Biblioteca UI con hooks y Context API |
| **TypeScript** | 5.7.3 | Tipado estatico en todo el proyecto |
| **Tailwind CSS** | 4.2.0 | Sistema de estilos utility-first con design tokens |
| **lucide-react** | 0.564.0 | Libreria de iconos (unica libreria de iconos usada) |

### Backend (API Routes de Next.js)

La arquitectura simula el patron de APIs REST que usaria un backend Django REST Framework. Las API Routes de Next.js actuan como endpoints modulares equivalentes a los views de Django.

| Endpoint | Metodo | Descripcion |
|---|---|---|
| `/api/auth/signup` | POST | Registro de usuarios con hash SHA-256 |
| `/api/auth/login` | POST | Autenticacion con verificacion de hash |
| `/api/recommendations` | POST | Motor de IA con pesos configurables (protegido JWT) |
| `/api/ollama` | GET/POST | Integracion con Ollama para preguntas dinamicas |

### IA - Ollama (LLama 3.2:3b)

| Componente | Descripcion |
|---|---|
| **Modelo** | `llama3.2:3b` ejecutandose localmente via Ollama |
| **Endpoint Base** | `http://localhost:11434/api/generate` |
| **Funcionalidades** | Generacion de preguntas dinamicas, recomendaciones personalizadas |
| **Prompt System** | Incluye especificacion de iconos Lucide para UI dinamica |

### Base de Datos (SQLite)

| Tabla | Descripcion |
|---|---|
| `users` | Usuarios con hash de contrasena (SHA-256 con salt) |
| `user_preferences` | Pesos configurables (1-10) por categoria |
| `test_sessions` | Historial de tests tomados |
| `test_answers` | Respuestas individuales por sesion |
| `recommendations` | Recomendaciones generadas por IA |
| `ai_questions_cache` | Cache de preguntas generadas por Ollama |

### Autenticacion y Seguridad

- **JWT (JSON Web Tokens)**: Generacion manual con estructura `header.payload.signature`
- **Hash de contrasenas**: SHA-256 con salt aleatorio de 16 caracteres
- **Formato de hash**: `sha256$<salt>$<hash_hex>`
- Tokens con expiracion de 24 horas
- Verificacion de token en cada request a rutas protegidas

---

## Sistema de IA - Arquitectura

### Ollama Microservice

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Frontend      │────>│  Next.js API     │────>│    Ollama       │
│   (React)       │<────│  /api/ollama     │<────│  localhost:11434│
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               │
                               v
                        ┌──────────────────┐
                        │  llama3.2:3b     │
                        │  Model           │
                        └──────────────────┘
```

### Instalacion de Ollama en Windows

1. **Descargar Ollama:**
   ```
   https://ollama.ai/download/windows
   ```

2. **Instalar y ejecutar el servicio:**
   ```cmd
   ollama serve
   ```

3. **Descargar el modelo LLama 3.2:**
   ```cmd
   ollama pull llama3.2:3b
   ```

4. **Verificar que esta funcionando:**
   ```cmd
   curl http://localhost:11434/api/tags
   ```

### Prompt de Generacion de Preguntas

El sistema envia a Ollama un prompt estructurado que especifica:

- El formato JSON esperado
- La lista de **iconos Lucide validos** que puede usar
- Las categorias disponibles (clima, presupuesto, intereses, etc.)
- Reglas de generacion (4-6 opciones, texto en espanol, etc.)

```typescript
// Ejemplo de respuesta esperada de Ollama
{
  "id": "safety_question_1",
  "category": "safety",
  "question": "¿Que nivel de seguridad busca en su destino?",
  "type": "single",
  "options": [
    { "value": "muy_seguro", "label": "Muy seguro", "icon": "ShieldCheck" },
    { "value": "moderado", "label": "Moderado", "icon": "Shield" }
  ]
}
```

---

## Pesos Configurables (1-10)

El sistema permite al usuario configurar la importancia de cada factor en las recomendaciones:

| Factor | Icono | Descripcion |
|---|---|---|
| Clima | Thermometer | Preferencia de temperatura y clima |
| Presupuesto | Wallet | Nivel de gasto esperado |
| Intereses | Compass | Areas de interes principal |
| Estilo de viaje | Backpack | Tipo de experiencia de viaje |
| Region | Globe | Continente o zona geografica |
| Actividades | Footprints | Actividades especificas |
| Gastronomia | UtensilsCrossed | Preferencias culinarias |
| Alojamiento | Hotel | Tipo de hospedaje |
| Compania | Users | Con quien viaja |
| Seguridad | Shield | Nivel de seguridad del destino |
| Idioma | MessageCircle | Barrera de idioma |
| Temporada | Calendar | Epoca del ano |
| Vida nocturna | Moon | Actividades nocturnas |
| Naturaleza | TreePine | Tipo de entorno natural |
| Cultura | Landmark | Aspectos culturales |
| Aventura | Mountain | Nivel de actividad fisica |
| Conectividad | Wifi | Necesidad de internet |

### UI de Configuracion

El panel de configuracion se abre desde un boton en la esquina superior derecha de la pagina de test:

- Sliders de 1 a 10 para cada parametro
- Icono + etiqueta a la izquierda
- Valor numerico X/10 a la derecha
- Boton de reset a valores predeterminados

---

## Test de Perfilado (20 Preguntas Expandidas)

| # | Categoria | Pregunta | Tipo |
|---|---|---|---|
| 1 | Clima | Tipo de clima preferido | Unica |
| 2 | Presupuesto | Presupuesto aproximado | Unica |
| 3 | Duracion | Tiempo disponible | Unica |
| 4 | Intereses | Intereses principales | Multiple (3) |
| 5 | Estilo | Estilo de viaje | Unica |
| 6 | Continente | Region del mundo | Unica |
| 7 | Actividades | Actividades preferidas | Multiple (3) |
| 8 | Gastronomia | Preferencia culinaria | Unica |
| 9 | Alojamiento | Tipo de hospedaje | Unica |
| 10 | Compania | Con quien viaja | Unica |
| 11 | Seguridad | Nivel de seguridad | Unica |
| 12 | Idioma | Importancia del idioma | Unica |
| 13 | Temporada | Epoca del ano | Unica |
| 14 | Vida nocturna | Tipo de vida nocturna | Unica |
| 15 | Naturaleza | Tipo de naturaleza | Unica |
| 16 | Cultura | Aspecto cultural | Unica |
| 17 | Aventura | Nivel de aventura | Unica |
| 18 | Transporte | Forma de moverse | Unica |
| 19 | Conectividad | Necesidad de WiFi/datos | Unica |
| 20 | Salud | Consideraciones de salud | Unica |

---

## Base de Datos de Destinos

El sistema incluye **15 destinos reales** con atributos extendidos para matching:

| Destino | Pais | Costo (USD) | Seguridad | Idiomas | Naturaleza |
|---|---|---|---|---|---|
| Kioto | Japon | $600-$1,000 | Muy seguro | Ingles, Aprender | Bosques, Montanas |
| Barcelona | Espana | $400-$800 | Seguro | Espanol, Ingles | Playas |
| Bali | Indonesia | $300-$600 | Seguro | Ingles, Aprender | Playas, Selva, Montanas |
| Estambul | Turquia | $350-$700 | Seguro | Ingles, Aprender | - |
| Cusco | Peru | $250-$500 | Seguro | Espanol | Montanas |
| Reikiavik | Islandia | $800-$1,500 | Muy seguro | Ingles | Montanas, Desiertos |
| Cartagena | Colombia | $200-$450 | Moderado | Espanol | Playas |
| Praga | Rep. Checa | $300-$600 | Muy seguro | Ingles | - |
| Marrakech | Marruecos | $250-$500 | Moderado | Aprender | Desiertos |
| Queenstown | Nueva Zelanda | $700-$1,200 | Muy seguro | Ingles | Montanas, Bosques |
| Ciudad del Cabo | Sudafrica | $400-$800 | Moderado | Ingles | Montanas, Playas |
| Hanoi | Vietnam | $200-$400 | Seguro | Aprender | Bosques |
| Lisboa | Portugal | $350-$700 | Muy seguro | Espanol, Ingles | Playas |
| Dubai | EAU | $500-$1,500 | Muy seguro | Ingles | Desiertos |
| Buenos Aires | Argentina | $250-$500 | Moderado | Espanol | - |

---

## Estructura del Proyecto

```
wanderia/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts         # POST - Auth con hash verification
│   │   │   └── signup/route.ts        # POST - Registro con hash SHA-256
│   │   ├── ollama/route.ts            # GET/POST - Integracion Ollama
│   │   └── recommendations/route.ts    # POST - Motor IA con pesos
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   ├── test/page.tsx                   # Test + boton config de pesos
│   ├── results/page.tsx
│   ├── providers.tsx                   # Auth + Theme + Weights providers
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── destination-card.tsx
│   ├── features-section.tsx
│   ├── hero-section.tsx
│   ├── navbar.tsx
│   ├── protected-route.tsx
│   ├── question-card.tsx
│   ├── weights-config.tsx              # Panel de configuracion de pesos
│   └── ui/
├── context/
│   ├── auth-context.tsx                # JWT + hash verification
│   ├── theme-context.tsx
│   └── weights-context.tsx             # Estado de pesos configurables
├── database/
│   └── schema.sql                      # Esquema SQLite completo
├── lib/
│   ├── database.ts                     # Operaciones BD + hash functions
│   ├── ollama.ts                       # Cliente Ollama + prompts IA
│   ├── test-questions.ts               # 20 preguntas expandidas
│   └── utils.ts
└── package.json
```

---

## Despliegue en Windows (VS Code)

### Requisitos

- **Node.js** >= 18.18 (recomendado: 20 LTS)
- **pnpm** >= 8
- **Ollama** instalado y ejecutandose
- **Visual Studio Code**

### Paso 1: Configurar Ollama

```cmd
REM Abrir PowerShell o CMD como administrador

REM Verificar que Ollama esta instalado
ollama --version

REM Iniciar el servicio de Ollama (en una terminal separada)
ollama serve

REM En otra terminal, descargar el modelo
ollama pull llama3.2:3b

REM Verificar que el modelo esta disponible
ollama list
```

### Paso 2: Clonar y configurar el proyecto

```cmd
REM Clonar el repositorio
git clone https://github.com/tu-usuario/wanderia.git
cd wanderia

REM Instalar dependencias
npm install


REM Crear archivo de variables de entorno (opcional)
copy .env.example .env.local
```

### Paso 3: Configurar variables de entorno

Crear archivo `.env.local` en la raiz:

```env
# Ollama (opcional, usa localhost:11434 por defecto)
OLLAMA_URL=http://localhost:11434

# JWT Secret (para produccion)
JWT_SECRET=tu_secreto_super_seguro_aqui
```

### Paso 4: Iniciar el desarrollo

```cmd
\scripts\start-wanderia.bat
```

Abrir `http://localhost:3000` en el navegador.

### Extensiones VS Code Recomendadas

- **ESLint** - Linting de codigo
- **Prettier** - Formateo de codigo
- **Tailwind CSS IntelliSense** - Autocompletado Tailwind
- **TypeScript Vue Plugin** - Soporte TypeScript
- **REST Client** - Probar APIs desde VS Code

---

## Scripts Disponibles

| Comando | Descripcion |
|---|---|
| `pnpm dev` | Inicia servidor de desarrollo con Turbopack |
| `pnpm build` | Genera build de produccion |
| `pnpm start` | Inicia servidor de produccion |
| `pnpm lint` | Ejecuta ESLint |

---

## APIs y Endpoints

### Internas

| Endpoint | Metodo | Auth | Body | Response |
|---|---|---|---|---|
| `/api/auth/signup` | POST | - | `{name, email, password}` | `{token, user}` |
| `/api/auth/login` | POST | - | `{email, password}` | `{token, user}` |
| `/api/recommendations` | POST | Bearer JWT | `{answers, weights}` | `{recommendations[], weights_used}` |
| `/api/ollama` | GET | - | - | `{status, models[]}` |
| `/api/ollama` | POST | Bearer JWT | `{action, category?, answers?, weights?}` | Varies by action |

### Ollama Actions

| Action | Descripcion | Parametros |
|---|---|---|
| `generate_question` | Genera una pregunta por categoria | `category`, `existingQuestions[]` |
| `generate_questions_batch` | Genera multiples preguntas | `categories[]` |
| `generate_recommendations` | Genera recomendaciones via IA | `answers`, `weights` |

---

## Seguridad

### Hash de Contrasenas

```typescript
// Formato: sha256$<salt_16_chars>$<hash_hex_64_chars>
// Ejemplo: sha256$a1b2c3d4e5f6g7h8$e3b0c44298fc1c149...

async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomUUID().slice(0, 16)
  const encoder = new TextEncoder()
  const data = encoder.encode(salt + password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashHex = Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0')).join('')
  return `sha256$${salt}$${hashHex}`
}
```

### Verificacion de JWT

```typescript
function verifyJWT(token: string): Record<string, unknown> | null {
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const payload = JSON.parse(atob(parts[1]))
  if (payload.exp < Date.now()) return null // Expirado
  return payload
}
```

---

## Migracion a Django (Backend Real)

Para migrar a un backend Django con base de datos real:

1. **Crear proyecto Django:**
   ```bash
   django-admin startproject wanderia_backend
   cd wanderia_backend
   python manage.py startapp accounts
   python manage.py startapp recommendations
   ```

2. **Instalar dependencias:**
   ```bash
   pip install djangorestframework djangorestframework-simplejwt django-cors-headers bcrypt
   ```

3. **Crear modelos (accounts/models.py):**
   ```python
   from django.contrib.auth.models import AbstractUser
   from django.db import models

   class User(AbstractUser):
       pass

   class UserPreferences(models.Model):
       user = models.OneToOneField(User, on_delete=models.CASCADE)
       weight_climate = models.IntegerField(default=5)
       weight_budget = models.IntegerField(default=5)
       # ... otros pesos
   ```

4. **Aplicar el schema SQL:**
   ```bash
   sqlite3 db.sqlite3 < database/schema.sql
   ```

5. **Actualizar URLs del frontend:**
   ```typescript
   // De: /api/auth/login
   // A: http://localhost:8000/api/auth/login
   ```

---

## Licencia

Proyecto academico - WanderIA
