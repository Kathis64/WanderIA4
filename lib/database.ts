/**
 * WanderIA Database Module - v2.1 with Auto-Seeding
 *
 * Usa better-sqlite3 para persistencia real en SQLite.
 * El archivo wanderia.db se crea automaticamente en /data al arrancar.
 * Incluye auto-seeding de destinos cuando la tabla esta vacia.
 *
 * IMPORTANTE: next.config.mjs debe tener:
 *   serverExternalPackages: ["better-sqlite3"]
 */

// Force module reload by changing version
const DB_MODULE_VERSION = "2.2.0"
console.log(`[WanderIA] Database module version: ${DB_MODULE_VERSION}`)

import path from "path"
import fs from "fs"
import crypto from "crypto"

// ──────────────────────────────────────────────
// Tipos
// ──────────────────────────────────────────────

export interface User {
  id: string
  name: string
  email: string
  password_hash: string
  birth_date: string
  role: 'user' | 'admin'
  created_at: string
  updated_at: string
}

export interface Destination {
  id: string
  name: string
  country: string
  description: string
  culture: string
  gastronomy: string
  climate_spring: string
  climate_summer: string
  climate_autumn: string
  climate_winter: string
  climate_best_season: string
  cost_min: number
  cost_max: number
  cost_currency: string
  budget_level: number
  image_query: string
  tips: string
  tags_climate: string
  tags_safety: string
  tags_language: string
  tags_seasons: string
  tags_nightlife: string
  tags_nature: string
  tags_culture: string
  tags_adventure: string
  tags_connectivity: string
  tags_transport: string
  is_active: number
  created_at: string
  updated_at: string
}

export interface UserPreferences {
  id: string
  user_id: string
  weight_climate: number
  weight_budget: number
  weight_interests: number
  weight_travel_style: number
  weight_continent: number
  weight_activities: number
  weight_food: number
  weight_accommodation: number
  weight_companion: number
  weight_safety: number
  weight_language: number
  weight_season: number
  weight_nightlife: number
  weight_nature: number
  weight_culture: number
  weight_adventure_level: number
  weight_connectivity: number
  weight_photography: number
  weight_crowd_preference: number
  weight_shopping: number
  weight_sustainability: number
  weight_water_activities: number
}

export interface TestSession {
  id: string
  user_id: string
  started_at: string
  completed_at: string | null
  status: "in_progress" | "completed" | "abandoned"
}

export interface TestAnswer {
  id: string
  session_id: string
  question_id: string
  answer_value: string
  answered_at: string
}

export interface Recommendation {
  id: string
  session_id: string
  destination_name: string
  destination_country: string
  match_percentage: number
  rank: number
  ai_reasoning: string | null
  created_at: string
}

// ──────────────────────────────────────────────
// Conexión SQLite (singleton)
// ──────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _db: any = null
let _dbInitialized = false

function getDb() {
  if (_db && _dbInitialized) return _db

  // If we have _db but not initialized, close and recreate
  if (_db && !_dbInitialized) {
    try { _db.close() } catch { /* ignore */ }
    _db = null
  }

  console.log("[WanderIA] Initializing database connection...")

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Database = require("better-sqlite3")

  const dataDir = path.join(process.cwd(), "data")
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }

  const dbPath = path.join(dataDir, "wanderia.db")
  _db = new Database(dbPath)
  _db.pragma("journal_mode = WAL")
  _db.pragma("foreign_keys = ON")

  _db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      birth_date TEXT,
      role TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS destinations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      country TEXT NOT NULL,
      description TEXT NOT NULL,
      culture TEXT NOT NULL,
      gastronomy TEXT NOT NULL,
      climate_spring TEXT,
      climate_summer TEXT,
      climate_autumn TEXT,
      climate_winter TEXT,
      climate_best_season TEXT,
      cost_min INTEGER,
      cost_max INTEGER,
      cost_currency TEXT DEFAULT 'USD',
      budget_level INTEGER DEFAULT 2 CHECK(budget_level >= 1 AND budget_level <= 5),
      image_query TEXT,
      tips TEXT,
      tags_climate TEXT,
      tags_safety TEXT,
      tags_language TEXT,
      tags_seasons TEXT,
      tags_nightlife TEXT,
      tags_nature TEXT,
      tags_culture TEXT,
      tags_adventure TEXT,
      tags_connectivity TEXT,
      tags_transport TEXT,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS user_preferences (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      weight_climate INTEGER DEFAULT 5,
      weight_budget INTEGER DEFAULT 5,
      weight_interests INTEGER DEFAULT 5,
      weight_travel_style INTEGER DEFAULT 5,
      weight_continent INTEGER DEFAULT 5,
      weight_activities INTEGER DEFAULT 5,
      weight_food INTEGER DEFAULT 5,
      weight_accommodation INTEGER DEFAULT 5,
      weight_companion INTEGER DEFAULT 5,
      weight_safety INTEGER DEFAULT 5,
      weight_language INTEGER DEFAULT 5,
      weight_season INTEGER DEFAULT 5,
      weight_nightlife INTEGER DEFAULT 5,
      weight_nature INTEGER DEFAULT 5,
      weight_culture INTEGER DEFAULT 5,
      weight_adventure_level INTEGER DEFAULT 5,
      weight_connectivity INTEGER DEFAULT 5,
      weight_photography INTEGER DEFAULT 5,
      weight_crowd_preference INTEGER DEFAULT 5,
      weight_shopping INTEGER DEFAULT 5,
      weight_sustainability INTEGER DEFAULT 5,
      weight_water_activities INTEGER DEFAULT 5,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS test_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME,
      status TEXT DEFAULT 'in_progress',
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS test_answers (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      question_id TEXT NOT NULL,
      answer_value TEXT NOT NULL,
      answered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (session_id) REFERENCES test_sessions(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS recommendations (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      destination_name TEXT NOT NULL,
      destination_country TEXT NOT NULL,
      match_percentage INTEGER NOT NULL,
      rank INTEGER NOT NULL,
      ai_reasoning TEXT,
      highlights TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (session_id) REFERENCES test_sessions(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS ai_questions_cache (
      id TEXT PRIMARY KEY,
      category TEXT NOT NULL,
      question_text TEXT NOT NULL,
      options_json TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS saved_destinations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      destination_name TEXT NOT NULL,
      destination_country TEXT NOT NULL,
      notes TEXT,
      saved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_users_email     ON users(email);
    CREATE INDEX IF NOT EXISTS idx_sessions_user   ON test_sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_answers_session ON test_answers(session_id);
    CREATE INDEX IF NOT EXISTS idx_recs_session    ON recommendations(session_id);
    CREATE INDEX IF NOT EXISTS idx_prefs_user      ON user_preferences(user_id);
    CREATE INDEX IF NOT EXISTS idx_saved_user      ON saved_destinations(user_id);
  `)

  // Migration: Add role column to users table if it doesn't exist
  try {
    const tableInfo = _db.prepare("PRAGMA table_info(users)").all()
    const hasRoleColumn = tableInfo.some((col: { name: string }) => col.name === 'role')
    if (!hasRoleColumn) {
      _db.exec("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin'))")
      console.log("[WanderIA] Migration: Added 'role' column to users table")
    }
  } catch (error) {
    console.error("[WanderIA] Migration error:", error)
  }

  // Migration: Add missing columns to destinations table
  try {
    const tableInfo = _db.prepare("PRAGMA table_info(destinations)").all() as Array<{ name: string }>
    const columnNames = tableInfo.map(col => col.name)
    
    const migrations = [
      { 
        name: 'image_query', 
        sql: "ALTER TABLE destinations ADD COLUMN image_query TEXT" 
      },
      { 
        name: 'flights_from', 
        sql: "ALTER TABLE destinations ADD COLUMN flights_from TEXT" 
      },
      { 
        name: 'flights_min_price', 
        sql: "ALTER TABLE destinations ADD COLUMN flights_min_price INTEGER" 
      },
      { 
        name: 'flights_currency', 
        sql: "ALTER TABLE destinations ADD COLUMN flights_currency TEXT DEFAULT 'USD'" 
      },
      { 
        name: 'flights_airlines', 
        sql: "ALTER TABLE destinations ADD COLUMN flights_airlines TEXT" 
      }
    ]

    for (const migration of migrations) {
      if (!columnNames.includes(migration.name)) {
        _db.exec(migration.sql)
        console.log(`[WanderIA] Migration: Added '${migration.name}' column to destinations table`)
      }
    }
  } catch (error) {
    console.error("[WanderIA] Destinations migration error:", error)
  }

  // ════ AUTO-SEED DESTINATIONS IF EMPTY ════
  try {
    const count = _db.prepare("SELECT COUNT(*) as count FROM destinations").get() as { count: number }
    if (count.count === 0) {
      console.log("[WanderIA] Seeding initial destinations...")
      seedInitialDestinations(_db)
    } else {
      console.log(`[WanderIA] Database already has ${count.count} destinations`)
    }
  } catch (error) {
    console.error("[WanderIA] Error checking/seeding destinations:", error)
  }

  _dbInitialized = true
  return _db
}

// ──────────────────────────────────────────────
// AUTO-SEED: Initial Destinations Data
// ──────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function seedInitialDestinations(db: any): void {
  const INITIAL_DESTINATIONS = [
    {
      name: "Kioto",
      country: "Japon",
      description: "Antigua capital imperial de Japon, Kioto alberga mas de 2.000 templos, santuarios y jardines. Es el corazon cultural del pais, donde las tradiciones milenarias conviven con la modernidad.",
      culture: "Un destino donde el cambio se mezcla con tradiciones culturales, maravillas y una rica gastronomia. La escena artistica y la convivialidad en sus calles lo hacen unico.",
      gastronomy: "Ramen, sushi artesanal, kaiseki (cocina tradicional multi-plato), matcha, tofu de Kioto y dulces wagashi.",
      climate_spring: "15-20C", climate_summer: "25-35C", climate_autumn: "15-25C", climate_winter: "2-10C",
      climate_best_season: "Primavera (marzo-mayo) para los cerezos en flor",
      cost_min: 600, cost_max: 1000, cost_currency: "USD", budget_level: 3,
      flights_from: "Madrid/CDMX", flights_min_price: 800, flights_currency: "USD",
      flights_airlines: JSON.stringify(["ANA", "Japan Airlines", "KLM"]),
      tips: JSON.stringify(["Comprar el Japan Rail Pass antes de llegar", "Visitar Fushimi Inari al amanecer"]),
      image_query: "Kyoto temple cherry blossom Japan",
      tags_climate: JSON.stringify(["templado", "calido"]), tags_safety: "muy_seguro",
      tags_language: JSON.stringify(["japones", "ingles_basico"]), tags_seasons: JSON.stringify(["primavera", "otono"]),
      tags_nightlife: "cenas", tags_nature: JSON.stringify(["jardines", "montanas"]),
      tags_culture: JSON.stringify(["arquitectura", "tradiciones", "arte"]), tags_adventure: "moderado",
      tags_connectivity: "esencial", tags_transport: JSON.stringify(["transporte", "caminando"])
    },
    {
      name: "Barcelona",
      country: "Espana",
      description: "Ciudad costera con arquitectura modernista de Gaudi, playas mediterraneas y una vibrante vida nocturna. Capital cultural de Cataluna con rica historia.",
      culture: "Mezcla unica de arte, arquitectura vanguardista, tradiciones catalanas y espiritu mediterraneo.",
      gastronomy: "Tapas, paella, jamon iberico, vinos catalanes, crema catalana y mariscos frescos.",
      climate_spring: "15-20C", climate_summer: "25-30C", climate_autumn: "15-22C", climate_winter: "8-15C",
      climate_best_season: "Primavera y otono para clima perfecto",
      cost_min: 400, cost_max: 800, cost_currency: "USD", budget_level: 2,
      flights_from: "CDMX/Bogota", flights_min_price: 500, flights_currency: "USD",
      flights_airlines: JSON.stringify(["Iberia", "Air Europa", "Vueling"]),
      tips: JSON.stringify(["Reservar entrada a la Sagrada Familia con anticipacion", "Visitar el Barrio Gotico de noche"]),
      image_query: "Barcelona Sagrada Familia Gaudi architecture",
      tags_climate: JSON.stringify(["templado", "calido"]), tags_safety: "seguro",
      tags_language: JSON.stringify(["espanol", "catalan", "ingles"]), tags_seasons: JSON.stringify(["primavera", "verano", "otono"]),
      tags_nightlife: "fiestas", tags_nature: JSON.stringify(["playas", "montanas"]),
      tags_culture: JSON.stringify(["arquitectura", "arte", "gastronomia"]), tags_adventure: "moderado",
      tags_connectivity: "esencial", tags_transport: JSON.stringify(["transporte", "caminando"])
    },
    {
      name: "Cusco",
      country: "Peru",
      description: "Antigua capital del Imperio Inca, puerta de entrada a Machu Picchu. Ciudad colonial con impresionante historia precolombina.",
      culture: "Fusion de culturas inca y espanola, con festivales coloridos, textiles tradicionales y misticismo andino.",
      gastronomy: "Ceviche, lomo saltado, cuy, chicha morada, pisco sour y cocina novoandina.",
      climate_spring: "10-20C", climate_summer: "8-18C", climate_autumn: "5-20C", climate_winter: "0-19C",
      climate_best_season: "Abril a octubre (estacion seca)",
      cost_min: 300, cost_max: 600, cost_currency: "USD", budget_level: 1,
      flights_from: "Lima/Bogota", flights_min_price: 200, flights_currency: "USD",
      flights_airlines: JSON.stringify(["LATAM", "Avianca", "Sky Airline"]),
      tips: JSON.stringify(["Aclimatarse a la altura por 1-2 dias", "Reservar Machu Picchu con meses de anticipacion"]),
      image_query: "Machu Picchu Cusco Peru ruins mountains",
      tags_climate: JSON.stringify(["frio", "templado"]), tags_safety: "seguro",
      tags_language: JSON.stringify(["espanol", "quechua"]), tags_seasons: JSON.stringify(["otono", "invierno"]),
      tags_nightlife: "bares", tags_nature: JSON.stringify(["montanas", "ruinas"]),
      tags_culture: JSON.stringify(["historia", "tradiciones", "arqueologia"]), tags_adventure: "activo",
      tags_connectivity: "ocasional", tags_transport: JSON.stringify(["tours", "caminando"])
    },
    {
      name: "Bali",
      country: "Indonesia",
      description: "Isla paradisiaca con templos hindues, arrozales en terrazas, playas de ensueno y una espiritualidad unica.",
      culture: "Espiritualidad hindu-balinesa, danzas tradicionales, ceremonias diarias y artesanias locales.",
      gastronomy: "Nasi goreng, satay, babi guling, gado-gado, cafe balines y frutas tropicales.",
      climate_spring: "27-30C", climate_summer: "26-29C", climate_autumn: "27-30C", climate_winter: "27-30C",
      climate_best_season: "Abril a octubre (estacion seca)",
      cost_min: 400, cost_max: 700, cost_currency: "USD", budget_level: 2,
      flights_from: "Madrid/CDMX", flights_min_price: 700, flights_currency: "USD",
      flights_airlines: JSON.stringify(["Qatar Airways", "Emirates", "Singapore Airlines"]),
      tips: JSON.stringify(["Alquilar una moto para explorar", "Visitar Ubud para cultura y naturaleza"]),
      image_query: "Bali rice terraces temple Indonesia tropical",
      tags_climate: JSON.stringify(["tropical", "calido"]), tags_safety: "seguro",
      tags_language: JSON.stringify(["indonesio", "ingles"]), tags_seasons: JSON.stringify(["primavera", "verano", "otono"]),
      tags_nightlife: "bares", tags_nature: JSON.stringify(["playas", "montanas", "selva"]),
      tags_culture: JSON.stringify(["tradiciones", "arte", "espiritualidad"]), tags_adventure: "moderado",
      tags_connectivity: "importante", tags_transport: JSON.stringify(["moto", "tours"])
    },
    {
      name: "Reikiavik",
      country: "Islandia",
      description: "Capital mas septentrional del mundo, puerta a glaciares, volcanes, auroras boreales y paisajes lunares.",
      culture: "Cultura vikinga moderna, musica innovadora, literatura y tradiciones nordicas unicas.",
      gastronomy: "Cordero islandes, pescado fresco, skyr, hot dogs famosos y cerveza artesanal.",
      climate_spring: "2-10C", climate_summer: "10-15C", climate_autumn: "2-10C", climate_winter: "-3-3C",
      climate_best_season: "Junio-agosto para sol de medianoche, septiembre-marzo para auroras",
      cost_min: 800, cost_max: 1500, cost_currency: "USD", budget_level: 4,
      flights_from: "Madrid/NYC", flights_min_price: 400, flights_currency: "USD",
      flights_airlines: JSON.stringify(["Icelandair", "Play", "Norse Atlantic"]),
      tips: JSON.stringify(["Alquilar 4x4 para la Ring Road", "Reservar Blue Lagoon con anticipacion"]),
      image_query: "Iceland aurora borealis northern lights glacier",
      tags_climate: JSON.stringify(["frio"]), tags_safety: "muy_seguro",
      tags_language: JSON.stringify(["islandes", "ingles"]), tags_seasons: JSON.stringify(["verano", "invierno"]),
      tags_nightlife: "bares", tags_nature: JSON.stringify(["glaciares", "volcanes", "cascadas"]),
      tags_culture: JSON.stringify(["historia", "tradiciones"]), tags_adventure: "activo",
      tags_connectivity: "ocasional", tags_transport: JSON.stringify(["auto", "tours"])
    },
    {
      name: "Cartagena",
      country: "Colombia",
      description: "Ciudad amurallada colonial en el Caribe colombiano, con playas cercanas, historia y vibrante vida nocturna.",
      culture: "Herencia colonial espanola, influencias africanas, musica champeta y vallenato, y calidez caribena.",
      gastronomy: "Ceviche de camarones, arroz con coco, patacones, arepas de huevo y cocadas.",
      climate_spring: "28-32C", climate_summer: "28-33C", climate_autumn: "27-31C", climate_winter: "27-31C",
      climate_best_season: "Diciembre a abril (temporada seca)",
      cost_min: 300, cost_max: 600, cost_currency: "USD", budget_level: 2,
      flights_from: "Bogota/Miami", flights_min_price: 150, flights_currency: "USD",
      flights_airlines: JSON.stringify(["Avianca", "LATAM", "Wingo"]),
      tips: JSON.stringify(["Caminar por la ciudad amurallada al atardecer", "Visitar las Islas del Rosario"]),
      image_query: "Cartagena Colombia colorful colonial streets Caribbean",
      tags_climate: JSON.stringify(["tropical", "calido"]), tags_safety: "seguro",
      tags_language: JSON.stringify(["espanol"]), tags_seasons: JSON.stringify(["invierno", "primavera"]),
      tags_nightlife: "fiestas", tags_nature: JSON.stringify(["playas", "islas"]),
      tags_culture: JSON.stringify(["historia", "arquitectura", "gastronomia"]), tags_adventure: "relajado",
      tags_connectivity: "importante", tags_transport: JSON.stringify(["caminando", "taxi"])
    },
    {
      name: "Praga",
      country: "Republica Checa",
      description: "La Ciudad de las Cien Torres, con arquitectura gotica, barroca y art nouveau perfectamente preservada.",
      culture: "Rica historia bohemia, tradicion cervecera, musica clasica y literatura (Kafka).",
      gastronomy: "Svickova, goulash, trdelnik, cerveza checa y vino moraviano.",
      climate_spring: "8-18C", climate_summer: "15-25C", climate_autumn: "8-15C", climate_winter: "-2-5C",
      climate_best_season: "Primavera y otono para clima agradable",
      cost_min: 350, cost_max: 600, cost_currency: "USD", budget_level: 2,
      flights_from: "Madrid/CDMX", flights_min_price: 400, flights_currency: "USD",
      flights_airlines: JSON.stringify(["Czech Airlines", "Ryanair", "Lufthansa"]),
      tips: JSON.stringify(["Cruzar el Puente de Carlos al amanecer", "Probar la cerveza en una cerveceria tradicional"]),
      image_query: "Prague Charles Bridge old town Czech architecture",
      tags_climate: JSON.stringify(["frio", "templado"]), tags_safety: "muy_seguro",
      tags_language: JSON.stringify(["checo", "ingles"]), tags_seasons: JSON.stringify(["primavera", "verano", "otono"]),
      tags_nightlife: "bares", tags_nature: JSON.stringify(["parques", "rios"]),
      tags_culture: JSON.stringify(["arquitectura", "historia", "arte"]), tags_adventure: "relajado",
      tags_connectivity: "esencial", tags_transport: JSON.stringify(["transporte", "caminando"])
    },
    {
      name: "Ciudad del Cabo",
      country: "Sudafrica",
      description: "Ciudad entre el oceano y la montana, con vinos de clase mundial, safaris cercanos y diversidad cultural unica.",
      culture: "Mezcla de culturas africanas, europeas y asiaticas, con historia del apartheid y renacimiento cultural.",
      gastronomy: "Braai (BBQ), bobotie, biltong, vinos de Stellenbosch y mariscos del Cabo.",
      climate_spring: "15-22C", climate_summer: "20-28C", climate_autumn: "15-22C", climate_winter: "10-18C",
      climate_best_season: "Noviembre a marzo (verano sudafricano)",
      cost_min: 500, cost_max: 900, cost_currency: "USD", budget_level: 2,
      flights_from: "Madrid/NYC", flights_min_price: 600, flights_currency: "USD",
      flights_airlines: JSON.stringify(["South African Airways", "Emirates", "KLM"]),
      tips: JSON.stringify(["Subir Table Mountain temprano", "Hacer la ruta del vino en Stellenbosch"]),
      image_query: "Cape Town Table Mountain South Africa ocean",
      tags_climate: JSON.stringify(["templado", "calido"]), tags_safety: "moderado",
      tags_language: JSON.stringify(["ingles", "afrikaans"]), tags_seasons: JSON.stringify(["primavera", "verano"]),
      tags_nightlife: "bares", tags_nature: JSON.stringify(["montanas", "playas", "vinas"]),
      tags_culture: JSON.stringify(["historia", "arte", "gastronomia"]), tags_adventure: "activo",
      tags_connectivity: "importante", tags_transport: JSON.stringify(["auto", "tours"])
    }
  ]

  const insertStmt = db.prepare(`
    INSERT INTO destinations (
      id, name, country, description, culture, gastronomy,
      climate_spring, climate_summer, climate_autumn, climate_winter, climate_best_season,
      cost_min, cost_max, cost_currency, budget_level,
      flights_from, flights_min_price, flights_currency, flights_airlines,
      tips, image_query,
      tags_climate, tags_safety, tags_language, tags_seasons, tags_nightlife,
      tags_nature, tags_culture, tags_adventure, tags_connectivity, tags_transport,
      is_active
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
  `)

  for (const dest of INITIAL_DESTINATIONS) {
    try {
      insertStmt.run(
        crypto.randomUUID(),
        dest.name, dest.country, dest.description, dest.culture, dest.gastronomy,
        dest.climate_spring, dest.climate_summer, dest.climate_autumn, dest.climate_winter, dest.climate_best_season,
        dest.cost_min, dest.cost_max, dest.cost_currency, dest.budget_level,
        dest.flights_from, dest.flights_min_price, dest.flights_currency, dest.flights_airlines,
        dest.tips, dest.image_query,
        dest.tags_climate, dest.tags_safety, dest.tags_language, dest.tags_seasons, dest.tags_nightlife,
        dest.tags_nature, dest.tags_culture, dest.tags_adventure, dest.tags_connectivity, dest.tags_transport
      )
    } catch (e) {
      console.error(`[WanderIA] Error seeding destination ${dest.name}:`, e)
    }
  }

  console.log(`[WanderIA] Seeded ${INITIAL_DESTINATIONS.length} initial destinations`)
}

// ──────────────────────────────────────────────
// Validacion de edad
// ──────────────────────────────────────────────

export function isAdult(birthDateString: string): boolean {
  const birthDate = new Date(birthDateString)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  
  return age >= 18
}

// ──────────────────────────────────────────────
// Hash de contraseñas — SHA-256 + salt aleatorio
// ──────────────────────────────────────────────

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex")
  const hash = crypto.createHash("sha256").update(salt + password).digest("hex")
  return `sha256$${salt}$${hash}`
}

function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const parts = storedHash.split("$")
    if (parts.length !== 3 || parts[0] !== "sha256") return false
    const [, salt, hash] = parts
    const computed = crypto.createHash("sha256").update(salt + password).digest("hex")
    return computed === hash
  } catch {
    return false
  }
}

// ───────────────────────────────────��──────────
// JWT — HMAC-SHA256 con clave desde .env.local
// ──────────────────────────────────────────────

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret || secret === "your-super-secret-key-change-in-production" || secret.length < 32) {
    // En dev usamos fallback; en producción esto debe estar configurado
    console.warn("[WanderIA] JWT_SECRET no configurado correctamente en .env.local — usando clave de desarrollo")
    return "wanderia-dev-fallback-CHANGE-IN-PRODUCTION"
  }
  return secret
}

export function generateJWT(payload: Record<string, unknown>): string {
  const secret = getJwtSecret()
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url")
  const body = Buffer.from(
    JSON.stringify({
      ...payload,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 86400,
    })
  ).toString("base64url")
  const sig = crypto.createHmac("sha256", secret).update(`${header}.${body}`).digest("base64url")
  return `${header}.${body}.${sig}`
}

export function verifyJWT(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) {
      console.error("[WanderIA JWT] Invalid token format - expected 3 parts, got:", parts.length)
      return null
    }

    const secret = getJwtSecret()
    const expectedSig = crypto
      .createHmac("sha256", secret)
      .update(`${parts[0]}.${parts[1]}`)
      .digest("base64url")

    // FIXED: Compare signatures as base64url strings using timingSafeEqual
    // Both parts[2] and expectedSig are base64url encoded strings
    // We need to decode them from base64url to binary for proper comparison
    const sigBuf = Buffer.from(parts[2], "base64url")
    const expBuf = Buffer.from(expectedSig, "base64url")

    if (sigBuf.length !== expBuf.length) {
      console.error("[WanderIA JWT] Signature length mismatch:", sigBuf.length, "vs", expBuf.length)
      console.error("[WanderIA JWT] Token signature:", parts[2])
      console.error("[WanderIA JWT] Expected signature:", expectedSig)
      return null
    }
    if (!crypto.timingSafeEqual(sigBuf, expBuf)) {
      console.error("[WanderIA JWT] Invalid signature - possible secret mismatch or token tampering")
      console.error("[WanderIA JWT] Current JWT_SECRET length:", secret.length)
      return null
    }

    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"))
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      console.error("[WanderIA JWT] Token expired at:", new Date(payload.exp * 1000).toISOString())
      return null
    }

    return payload
  } catch (error) {
    console.error("[WanderIA JWT] Error verifying token:", error)
    return null
  }
}

// ──────────────────────────────────────────────
// Usuarios
// ──────────────────────────────────────────────

export function createUser(name: string, email: string, password: string, birthDate: string, role: 'user' | 'admin' = 'user'): User | null {
  const db = getDb()
  const normalEmail = email.toLowerCase().trim()

  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(normalEmail)
  if (existing) return null

  const now = new Date().toISOString()
  const user: User = {
    id: crypto.randomUUID(),
    name: name.trim(),
    email: normalEmail,
    password_hash: hashPassword(password),
    birth_date: birthDate,
    role,
    created_at: now,
    updated_at: now,
  }

  db.prepare(
    `INSERT INTO users (id, name, email, password_hash, birth_date, role, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(user.id, user.name, user.email, user.password_hash, user.birth_date, user.role, user.created_at, user.updated_at)

  db.prepare("INSERT INTO user_preferences (id, user_id) VALUES (?, ?)").run(
    crypto.randomUUID(),
    user.id
  )

  return user
}

export function authenticateUser(email: string, password: string): User | null {
  const db = getDb()
  const user = db
    .prepare("SELECT * FROM users WHERE email = ?")
    .get(email.toLowerCase().trim()) as User | undefined
  if (!user) return null
  return verifyPassword(password, user.password_hash) ? user : null
}

export function getUserById(id: string): User | null {
  const db = getDb()
  return (db.prepare("SELECT * FROM users WHERE id = ?").get(id) as User) ?? null
}

export function getUserByEmail(email: string): User | null {
  const db = getDb()
  return (
    (db.prepare("SELECT * FROM users WHERE email = ?").get(email.toLowerCase().trim()) as User) ?? null
  )
}

// ──────────────────────────────────────────────
// Preferencias de usuario
// ──────────────────────────────────────────────

export function getUserPreferences(userId: string): UserPreferences | null {
  const db = getDb()
  return (
    (db.prepare("SELECT * FROM user_preferences WHERE user_id = ?").get(userId) as UserPreferences) ?? null
  )
}

export function updateUserPreferences(
  userId: string,
  updates: Partial<Omit<UserPreferences, "id" | "user_id">>
): UserPreferences | null {
  const db = getDb()
  const existing = getUserPreferences(userId)
  if (!existing) return null

  const keys = Object.keys(updates)
  if (keys.length === 0) return existing

  const setClauses = keys.map((k) => `${k} = @${k}`).join(", ")
  db.prepare(
    `UPDATE user_preferences SET ${setClauses}, updated_at = @updated_at WHERE user_id = @user_id`
  ).run({ ...updates, user_id: userId, updated_at: new Date().toISOString() })

  return getUserPreferences(userId)
}

// ──────────────────────────────────────────────
// Sesiones de test
// ──────────────────────────────────────────────

export function createTestSession(userId: string): TestSession {
  const db = getDb()
  const session: TestSession = {
    id: crypto.randomUUID(),
    user_id: userId,
    started_at: new Date().toISOString(),
    completed_at: null,
    status: "in_progress",
  }
  db.prepare(
    "INSERT INTO test_sessions (id, user_id, started_at, status) VALUES (?, ?, ?, ?)"
  ).run(session.id, session.user_id, session.started_at, session.status)
  return session
}

export function getTestSession(sessionId: string): TestSession | null {
  const db = getDb()
  return (db.prepare("SELECT * FROM test_sessions WHERE id = ?").get(sessionId) as TestSession) ?? null
}

export function completeTestSession(sessionId: string): TestSession | null {
  const db = getDb()
  db.prepare(
    "UPDATE test_sessions SET completed_at = ?, status = 'completed' WHERE id = ?"
  ).run(new Date().toISOString(), sessionId)
  return getTestSession(sessionId)
}

export function getUserTestSessions(userId: string): TestSession[] {
  const db = getDb()
  return db
    .prepare("SELECT * FROM test_sessions WHERE user_id = ? ORDER BY started_at DESC")
    .all(userId) as TestSession[]
}

// ──────────────────────────────────────────────
// Respuestas del test
// ──────────────────────────────────────────────

export function saveTestAnswer(
  sessionId: string,
  questionId: string,
  answerValue: string | string[]
): TestAnswer {
  const db = getDb()
  const answer: TestAnswer = {
    id: crypto.randomUUID(),
    session_id: sessionId,
    question_id: questionId,
    answer_value: Array.isArray(answerValue) ? JSON.stringify(answerValue) : answerValue,
    answered_at: new Date().toISOString(),
  }
  db.prepare(
    `INSERT INTO test_answers (id, session_id, question_id, answer_value, answered_at)
     VALUES (?, ?, ?, ?, ?)`
  ).run(answer.id, answer.session_id, answer.question_id, answer.answer_value, answer.answered_at)
  return answer
}

export function getSessionAnswers(sessionId: string): TestAnswer[] {
  const db = getDb()
  return db
    .prepare("SELECT * FROM test_answers WHERE session_id = ? ORDER BY answered_at ASC")
    .all(sessionId) as TestAnswer[]
}

// ──────────────────────────────────────────────
// Recomendaciones
// ──────────────────────────────────────────────

export function saveRecommendation(
  sessionId: string,
  destinationName: string,
  destinationCountry: string,
  matchPercentage: number,
  rank: number,
  aiReasoning?: string
): Recommendation {
  const db = getDb()
  const rec: Recommendation = {
    id: crypto.randomUUID(),
    session_id: sessionId,
    destination_name: destinationName,
    destination_country: destinationCountry,
    match_percentage: matchPercentage,
    rank,
    ai_reasoning: aiReasoning ?? null,
    created_at: new Date().toISOString(),
  }
  db.prepare(
    `INSERT INTO recommendations
       (id, session_id, destination_name, destination_country,
        match_percentage, rank, ai_reasoning, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    rec.id, rec.session_id, rec.destination_name, rec.destination_country,
    rec.match_percentage, rec.rank, rec.ai_reasoning, rec.created_at
  )
  return rec
}

export function getSessionRecommendations(sessionId: string): Recommendation[] {
  const db = getDb()
  return db
    .prepare("SELECT * FROM recommendations WHERE session_id = ? ORDER BY rank ASC")
    .all(sessionId) as Recommendation[]
}

// ──────────────────────────────────────────────
// Destinations Management (Admin)
// ──────────────────────────────────────────────

export function getAllDestinations(): Destination[] {
  const db = getDb()
  return db
    .prepare("SELECT * FROM destinations ORDER BY name ASC")
    .all() as Destination[]
}

export function getActiveDestinations(): Destination[] {
  const db = getDb()
  return db
    .prepare("SELECT * FROM destinations WHERE is_active = 1 ORDER BY name ASC")
    .all() as Destination[]
}

export function getDestinationById(id: string): Destination | null {
  const db = getDb()
  return (db.prepare("SELECT * FROM destinations WHERE id = ?").get(id) as Destination) ?? null
}

export function getDestinationByName(name: string): Destination | null {
  const db = getDb()
  return (db.prepare("SELECT * FROM destinations WHERE name = ?").get(name) as Destination) ?? null
}

export function createDestination(data: Omit<Destination, 'id' | 'created_at' | 'updated_at'>): Destination | null {
  const db = getDb()
  
  // Check if destination with same name exists
  const existing = getDestinationByName(data.name)
  if (existing) return null

  const now = new Date().toISOString()
  const destination: Destination = {
    id: crypto.randomUUID(),
    ...data,
    created_at: now,
    updated_at: now,
  }

  db.prepare(
    `INSERT INTO destinations (
      id, name, country, description, culture, gastronomy,
      climate_spring, climate_summer, climate_autumn, climate_winter, climate_best_season,
      cost_min, cost_max, cost_currency, budget_level, image_query, tips,
      tags_climate, tags_safety, tags_language, tags_seasons, tags_nightlife,
      tags_nature, tags_culture, tags_adventure, tags_connectivity, tags_transport,
      is_active, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    destination.id, destination.name, destination.country, destination.description,
    destination.culture, destination.gastronomy, destination.climate_spring,
    destination.climate_summer, destination.climate_autumn, destination.climate_winter,
    destination.climate_best_season, destination.cost_min, destination.cost_max,
    destination.cost_currency, destination.budget_level, destination.image_query,
    destination.tips, destination.tags_climate, destination.tags_safety,
    destination.tags_language, destination.tags_seasons, destination.tags_nightlife,
    destination.tags_nature, destination.tags_culture, destination.tags_adventure,
    destination.tags_connectivity, destination.tags_transport, destination.is_active,
    destination.created_at, destination.updated_at
  )

  return destination
}

export function updateDestination(id: string, updates: Partial<Omit<Destination, 'id' | 'created_at' | 'updated_at'>>): Destination | null {
  const db = getDb()
  const existing = getDestinationById(id)
  if (!existing) return null

  // If name is being changed, check it doesn't conflict with another destination
  if (updates.name && updates.name !== existing.name) {
    const nameConflict = getDestinationByName(updates.name)
    if (nameConflict) return null
  }

  const keys = Object.keys(updates)
  if (keys.length === 0) return existing

  const setClauses = keys.map((k) => `${k} = @${k}`).join(", ")
  db.prepare(
    `UPDATE destinations SET ${setClauses}, updated_at = @updated_at WHERE id = @id`
  ).run({ ...updates, id, updated_at: new Date().toISOString() })

  return getDestinationById(id)
}

export function deleteDestination(id: string): boolean {
  const db = getDb()
  const result = db.prepare("DELETE FROM destinations WHERE id = ?").run(id)
  return result.changes > 0
}

export function toggleDestinationActive(id: string): Destination | null {
  const db = getDb()
  const existing = getDestinationById(id)
  if (!existing) return null

  const newActive = existing.is_active === 1 ? 0 : 1
  db.prepare("UPDATE destinations SET is_active = ?, updated_at = ? WHERE id = ?")
    .run(newActive, new Date().toISOString(), id)

  return getDestinationById(id)
}

// ──────────────────────────────────────────────
// Admin User Functions
// ──────────────────────────────────────────────

export function isUserAdmin(userId: string): boolean {
  const db = getDb()
  const user = db.prepare("SELECT role FROM users WHERE id = ?").get(userId) as { role: string } | undefined
  return user?.role === 'admin'
}

export function setUserRole(userId: string, role: 'user' | 'admin'): User | null {
  const db = getDb()
  const existing = getUserById(userId)
  if (!existing) return null

  db.prepare("UPDATE users SET role = ?, updated_at = ? WHERE id = ?")
    .run(role, new Date().toISOString(), userId)

  return getUserById(userId)
}

export function getAllUsers(): User[] {
  const db = getDb()
  return db
    .prepare("SELECT id, name, email, role, created_at, updated_at FROM users ORDER BY created_at DESC")
    .all() as User[]
}

// ──────────────────────────────────────────────
// Get Destinations for Recommendations (with extended tags)
// ──────────────────────────────────────────────

export interface RecommendationDestination {
  name: string
  country: string
  description: string
  culture: string
  gastronomy: string
  climate: { spring: string; summer: string; autumn: string; winter: string; best_season: string }
  estimated_cost: { min: number; max: number; currency: string; budget_level: number }
  flights: { from: string; min_price: number; currency: string; airlines: string[] }
  tips: string[]
  image_query: string
  tags: {
    climate: string[]
    safety: string
    language: string[]
    seasons: string[]
    nightlife: string
    nature: string[]
    culture: string[]
    adventure: string
    connectivity: string
    transport: string[]
  }
}

// Favorites interface
export interface FavoriteDestination {
  id: string
  user_id: string
  destination_name: string
  destination_country: string
  rating: number
  marked_at: string
}

// Recommendation feedback interface
export interface RecommendationFeedback {
  id: string
  session_id: string
  recommendation_id: string
  user_id: string
  destination_name: string
  destination_country: string
  feedback_text: string
  sentiment: 'positive' | 'neutral' | 'negative'
  helpful_score: number
  created_at: string
  updated_at: string
}

export function getDestinationsForRecommendations(): RecommendationDestination[] {
  const db = getDb()
  const rows = db
    .prepare("SELECT * FROM destinations WHERE is_active = 1 ORDER BY name ASC")
    .all() as any[]

  return rows.map((row) => ({
    name: row.name,
    country: row.country,
    description: row.description,
    culture: row.culture,
    gastronomy: row.gastronomy,
    climate: {
      spring: row.climate_spring || "",
      summer: row.climate_summer || "",
      autumn: row.climate_autumn || "",
      winter: row.climate_winter || "",
      best_season: row.climate_best_season || ""
    },
    estimated_cost: {
      min: row.cost_min || 0,
      max: row.cost_max || 0,
      currency: row.cost_currency || "USD",
      budget_level: row.budget_level || 2
    },
    flights: {
      from: row.flights_from || "",
      min_price: row.flights_min_price || 0,
      currency: row.flights_currency || "USD",
      airlines: row.flights_airlines ? JSON.parse(row.flights_airlines) : []
    },
    tips: row.tips ? JSON.parse(row.tips) : [],
    image_query: row.image_query || "",
    tags: {
      climate: row.tags_climate ? JSON.parse(row.tags_climate) : [],
      safety: row.tags_safety || "seguro",
      language: row.tags_language ? JSON.parse(row.tags_language) : [],
      seasons: row.tags_seasons ? JSON.parse(row.tags_seasons) : [],
      nightlife: row.tags_nightlife || "bares",
      nature: row.tags_nature ? JSON.parse(row.tags_nature) : [],
      culture: row.tags_culture ? JSON.parse(row.tags_culture) : [],
      adventure: row.tags_adventure || "moderado",
      connectivity: row.tags_connectivity || "importante",
      transport: row.tags_transport ? JSON.parse(row.tags_transport) : []
    }
  }))
}

// ──────────────────────────────────────────────
// FAVORITES MANAGEMENT
// ──────────────────────────────────────────────

export function createFavorite(
  userId: string,
  destinationName: string,
  destinationCountry: string,
  rating: number = 5
): FavoriteDestination | null {
  try {
    const db = getDb()
    const id = crypto.randomUUID()

    db.prepare(
      `
      INSERT OR REPLACE INTO favorite_destinations
      (id, user_id, destination_name, destination_country, rating)
      VALUES (?, ?, ?, ?, ?)
    `
    ).run(id, userId, destinationName, destinationCountry, Math.max(1, Math.min(5, rating)))

    return getFavoriteById(id)
  } catch (error) {
    console.error("[WanderIA] Error creating favorite:", error)
    return null
  }
}

export function getFavoritesByUser(userId: string): FavoriteDestination[] {
  try {
    const db = getDb()
    return db
      .prepare(
        `
        SELECT * FROM favorite_destinations
        WHERE user_id = ?
        ORDER BY marked_at DESC
      `
      )
      .all(userId) as FavoriteDestination[]
  } catch (error) {
    console.error("[WanderIA] Error fetching favorites:", error)
    return []
  }
}

export function getFavoriteById(id: string): FavoriteDestination | null {
  try {
    const db = getDb()
    return db
      .prepare(`SELECT * FROM favorite_destinations WHERE id = ?`)
      .get(id) as FavoriteDestination | undefined || null
  } catch (error) {
    console.error("[WanderIA] Error fetching favorite:", error)
    return null
  }
}

export function updateFavorite(id: string, rating: number): FavoriteDestination | null {
  try {
    const db = getDb()
    db.prepare(
      `
      UPDATE favorite_destinations
      SET rating = ?, marked_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `
    ).run(Math.max(1, Math.min(5, rating)), id)

    return getFavoriteById(id)
  } catch (error) {
    console.error("[WanderIA] Error updating favorite:", error)
    return null
  }
}

export function removeFavorite(userId: string, destinationName: string): boolean {
  try {
    const db = getDb()
    db.prepare(
      `
      DELETE FROM favorite_destinations
      WHERE user_id = ? AND destination_name = ?
    `
    ).run(userId, destinationName)

    return true
  } catch (error) {
    console.error("[WanderIA] Error removing favorite:", error)
    return false
  }
}

export function isFavorite(userId: string, destinationName: string): boolean {
  try {
    const db = getDb()
    const result = db
      .prepare(
        `
        SELECT id FROM favorite_destinations
        WHERE user_id = ? AND destination_name = ?
      `
      )
      .get(userId, destinationName)

    return result !== undefined
  } catch (error) {
    console.error("[WanderIA] Error checking favorite:", error)
    return false
  }
}

// ──────────────────────────────────────────────
// RECOMMENDATION FEEDBACK
// ──────────────────────────────────────────────

export function createRecommendationFeedback(
  sessionId: string,
  recommendationId: string,
  userId: string,
  destinationName: string,
  destinationCountry: string,
  feedbackText: string,
  sentiment: 'positive' | 'neutral' | 'negative' = 'neutral',
  helpfulScore: number = 0
): RecommendationFeedback | null {
  try {
    const db = getDb()
    const id = crypto.randomUUID()

    db.pragma("foreign_keys = OFF")
    db.prepare(
      `
      INSERT INTO recommendation_feedback
      (id, session_id, recommendation_id, user_id, destination_name, destination_country, feedback_text, sentiment, helpful_score)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
    ).run(
      id,
      sessionId,
      recommendationId,
      userId,
      destinationName,
      destinationCountry,
      feedbackText,
      sentiment,
      Math.max(0, Math.min(10, helpfulScore))
    )
    db.pragma("foreign_keys = ON")

    return getFeedbackById(id)
  } catch (error) {
    console.error("[WanderIA] Error creating feedback:", error)
    return null
  }
}

export function getFeedbackById(id: string): RecommendationFeedback | null {
  try {
    const db = getDb()
    return db
      .prepare(`SELECT * FROM recommendation_feedback WHERE id = ?`)
      .get(id) as RecommendationFeedback | undefined || null
  } catch (error) {
    console.error("[WanderIA] Error fetching feedback:", error)
    return null
  }
}

export function getFeedbackByUser(userId: string): RecommendationFeedback[] {
  try {
    const db = getDb()
    return db
      .prepare(
        `
        SELECT * FROM recommendation_feedback
        WHERE user_id = ?
        ORDER BY created_at DESC
      `
      )
      .all(userId) as RecommendationFeedback[]
  } catch (error) {
    console.error("[WanderIA] Error fetching user feedback:", error)
    return []
  }
}

export function getFeedbackBySession(sessionId: string): RecommendationFeedback[] {
  try {
    const db = getDb()
    return db
      .prepare(
        `
        SELECT * FROM recommendation_feedback
        WHERE session_id = ?
        ORDER BY created_at DESC
      `
      )
      .all(sessionId) as RecommendationFeedback[]
  } catch (error) {
    console.error("[WanderIA] Error fetching session feedback:", error)
    return []
  }
}

export function updateRecommendationFeedback(
  id: string,
  feedbackText?: string,
  sentiment?: 'positive' | 'neutral' | 'negative',
  helpfulScore?: number
): RecommendationFeedback | null {
  try {
    const db = getDb()

    let updateQuery = `UPDATE recommendation_feedback SET updated_at = CURRENT_TIMESTAMP`
    const params: any[] = []

    if (feedbackText !== undefined) {
      updateQuery += `, feedback_text = ?`
      params.push(feedbackText)
    }

    if (sentiment !== undefined) {
      updateQuery += `, sentiment = ?`
      params.push(sentiment)
    }

    if (helpfulScore !== undefined) {
      updateQuery += `, helpful_score = ?`
      params.push(Math.max(0, Math.min(10, helpfulScore)))
    }

    updateQuery += ` WHERE id = ?`
    params.push(id)

    db.prepare(updateQuery).run(...params)

    return getFeedbackById(id)
  } catch (error) {
    console.error("[WanderIA] Error updating feedback:", error)
    return null
  }
}

export function removeFeedback(id: string): boolean {
  try {
    const db = getDb()
    db.prepare(`DELETE FROM recommendation_feedback WHERE id = ?`).run(id)
    return true
  } catch (error) {
    console.error("[WanderIA] Error removing feedback:", error)
    return false
  }
}
