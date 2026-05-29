/**
 * Script to create an admin user for WanderIA
 * 
 * Usage:
 *   npx tsx scripts/create-admin.ts <name> <email> <password>
 * 
 * Example:
 *   npx tsx scripts/create-admin.ts "Admin User" admin@wanderia.com mySecurePassword123
 */

import path from "path"
import fs from "fs"
import crypto from "crypto"

// Database setup (inline to avoid circular dependencies)
function getDb() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Database = require("better-sqlite3")

  const dataDir = path.join(process.cwd(), "data")
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }

  const dbPath = path.join(dataDir, "wanderia.db")
  const db = new Database(dbPath)
  db.pragma("journal_mode = WAL")
  db.pragma("foreign_keys = ON")

  // Ensure users table has role column
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin')),
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
  `)

  return db
}

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex")
  const hash = crypto.createHash("sha256").update(salt + password).digest("hex")
  return `sha256$${salt}$${hash}`
}

function createAdminUser(name: string, email: string, password: string): boolean {
  const db = getDb()
  const normalEmail = email.toLowerCase().trim()

  // Check if user already exists
  const existing = db.prepare("SELECT id, role FROM users WHERE email = ?").get(normalEmail)
  
  if (existing) {
    if (existing.role === "admin") {
      console.log(`[WanderIA] User ${normalEmail} is already an admin.`)
      return true
    }
    
    // Update existing user to admin
    db.prepare("UPDATE users SET role = 'admin', updated_at = ? WHERE email = ?")
      .run(new Date().toISOString(), normalEmail)
    console.log(`[WanderIA] User ${normalEmail} has been promoted to admin.`)
    return true
  }

  // Create new admin user
  const now = new Date().toISOString()
  const userId = crypto.randomUUID()
  
  db.prepare(
    `INSERT INTO users (id, name, email, password_hash, role, created_at, updated_at)
     VALUES (?, ?, ?, ?, 'admin', ?, ?)`
  ).run(userId, name.trim(), normalEmail, hashPassword(password), now, now)

  // Create default preferences
  db.prepare("INSERT INTO user_preferences (id, user_id) VALUES (?, ?)")
    .run(crypto.randomUUID(), userId)

  console.log(`[WanderIA] Admin user created successfully!`)
  console.log(`  Name: ${name}`)
  console.log(`  Email: ${normalEmail}`)
  console.log(`  Role: admin`)
  
  return true
}

// Main execution
const args = process.argv.slice(2)

if (args.length < 3) {
  console.log("WanderIA - Create Admin User Script")
  console.log("")
  console.log("Usage: npx tsx scripts/create-admin.ts <name> <email> <password>")
  console.log("")
  console.log("Example:")
  console.log('  npx tsx scripts/create-admin.ts "Admin User" admin@wanderia.com myPassword123')
  process.exit(1)
}

const [name, email, password] = args

if (password.length < 6) {
  console.error("[Error] Password must be at least 6 characters long.")
  process.exit(1)
}

try {
  createAdminUser(name, email, password)
  console.log("")
  console.log("You can now log in at /login with your admin credentials.")
  console.log("Access the admin panel at /admin after logging in.")
} catch (error) {
  console.error("[Error] Failed to create admin user:", error)
  process.exit(1)
}
