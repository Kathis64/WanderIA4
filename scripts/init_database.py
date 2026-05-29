#!/usr/bin/env python3
"""
WanderIA - Database Initialization Script
Initializes the SQLite database with schema and loads 54 default destinations
"""

import os
import sqlite3
import sys
import json
from pathlib import Path
from datetime import datetime

# Colores para la consola
class Colors:
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    END = '\033[0m'

    @staticmethod
    def enable_windows_colors():
        if sys.platform == 'win32':
            try:
                import ctypes
                kernel32 = ctypes.windll.kernel32
                kernel32.SetConsoleMode(kernel32.GetStdHandle(-11), 7)
            except:
                pass

def print_header():
    print("\n" + "=" * 60)
    print("  WanderIA - Database Initialization")
    print("=" * 60 + "\n")

def print_success(msg):
    print(f"{Colors.GREEN}[✓]{Colors.END} {msg}")

def print_info(msg):
    print(f"{Colors.BLUE}[ℹ]{Colors.END} {msg}")

def print_error(msg):
    print(f"{Colors.RED}[✗]{Colors.END} {msg}")

def print_warning(msg):
    print(f"{Colors.YELLOW}[⚠]{Colors.END} {msg}")

def load_destinations_from_json(json_path):
    """Load destinations from the exported JSON file"""
    try:
        if os.path.exists(json_path):
            with open(json_path, 'r', encoding='utf-8') as f:
                return json.load(f)
    except Exception as e:
        print_warning(f"Could not load from JSON: {e}")
    return None

def seed_destinations(cursor, destinations):
    """Insert destinations into the database"""
    if not destinations:
        print_warning("No destinations to seed")
        return 0

    print_info(f"Loading {len(destinations)} destinations...")
    
    inserted = 0
    errors = 0
    
    for dest in destinations:
        try:
            # Prepare values with None defaults for optional fields
            values = (
                dest.get('id'),
                dest.get('name'),
                dest.get('country'),
                dest.get('description'),
                dest.get('culture'),
                dest.get('gastronomy'),
                dest.get('climate_spring'),
                dest.get('climate_summer'),
                dest.get('climate_autumn'),
                dest.get('climate_winter'),
                dest.get('climate_best_season'),
                dest.get('cost_min'),
                dest.get('cost_max'),
                dest.get('cost_currency', 'USD'),
                dest.get('budget_level', 2),
                dest.get('image_url'),
                dest.get('tips'),
                dest.get('tags_climate'),
                dest.get('tags_safety'),
                dest.get('tags_language'),
                dest.get('tags_seasons'),
                dest.get('tags_nightlife'),
                dest.get('tags_nature'),
                dest.get('tags_culture'),
                dest.get('tags_adventure'),
                dest.get('tags_connectivity'),
                dest.get('tags_transport'),
                dest.get('is_active', 1),
                dest.get('created_at', datetime.now().isoformat()),
                dest.get('updated_at', datetime.now().isoformat()),
                dest.get('image_query'),
                dest.get('flights_from'),
                dest.get('flights_min_price'),
                dest.get('flights_currency', 'USD'),
                dest.get('flights_airlines'),
            )
            
            cursor.execute("""
                INSERT INTO destinations (
                    id, name, country, description, culture, gastronomy,
                    climate_spring, climate_summer, climate_autumn, climate_winter,
                    climate_best_season, cost_min, cost_max, cost_currency, budget_level,
                    image_url, tips, tags_climate, tags_safety, tags_language,
                    tags_seasons, tags_nightlife, tags_nature, tags_culture,
                    tags_adventure, tags_connectivity, tags_transport, is_active,
                    created_at, updated_at, image_query, flights_from, flights_min_price,
                    flights_currency, flights_airlines
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, values)
            inserted += 1
            
        except sqlite3.IntegrityError:
            # Destination might already exist, skip
            errors += 1
        except Exception as e:
            print_error(f"Error inserting {dest.get('name', 'unknown')}: {e}")
            errors += 1
    
    return inserted

def main():
    try:
        Colors.enable_windows_colors()
    except:
        pass

    print_header()

    # Paths
    script_dir = Path(__file__).parent.absolute()
    project_dir = script_dir.parent
    data_dir = project_dir / "data"
    db_path = data_dir / "wanderia.db"
    schema_path = project_dir / "database" / "schema.sql"
    json_path = project_dir / "destinations_export.json"

    print_info(f"Project directory: {project_dir}")

    # Create data directory
    if not data_dir.exists():
        print_info("Creating data directory...")
        data_dir.mkdir(parents=True, exist_ok=True)
        print_success(f"Created: {data_dir}")

    # Verify schema
    if not schema_path.exists():
        print_error(f"Schema not found: {schema_path}")
        return

    print_info(f"Schema: {schema_path}")

    # Handle existing database
    if db_path.exists():
        print_warning(f"Database already exists: {db_path}")
        response = input(f"{Colors.CYAN}Do you want to reinitialize it? (y/N): {Colors.END}").strip().lower()
        
        if response != 'y':
            print_info("Operation cancelled.")
            return

        print_info("Removing existing database...")
        try:
            os.remove(db_path)
            # Remove WAL files if they exist
            for wal_file in [str(db_path) + "-shm", str(db_path) + "-wal"]:
                if os.path.exists(wal_file):
                    os.remove(wal_file)
            print_success("Database removed")
        except Exception as e:
            print_error(f"Failed to remove database: {e}")
            return

    # Read schema
    print_info("Reading schema.sql...")
    try:
        with open(schema_path, "r", encoding="utf-8") as f:
            schema_sql = f.read()
        print_success("Schema loaded")
    except Exception as e:
        print_error(f"Failed to read schema: {e}")
        return

    # Create and initialize database
    print_info("Connecting to SQLite...")
    try:
        conn = sqlite3.connect(str(db_path))
        cursor = conn.cursor()
        
        # Enable foreign keys
        cursor.execute("PRAGMA foreign_keys = ON;")
        
        # Execute schema
        print_info("Creating tables from schema...")
        cursor.executescript(schema_sql)
        
        # Get list of tables
        cursor.execute("""
            SELECT name FROM sqlite_master
            WHERE type='table' ORDER BY name;
        """)
        tables = cursor.fetchall()
        
        print_success("Tables created successfully!")
        print_info("Tables:")
        for table in tables:
            print(f"  • {table[0]}")
        
        # Load destinations
        print("\n" + "-" * 60)
        print_info("Loading destinations data...")
        
        # Try to load from JSON first
        destinations = load_destinations_from_json(str(json_path))
        
        if destinations:
            inserted = seed_destinations(cursor, destinations)
            conn.commit()
            print_success(f"Inserted {inserted}/{len(destinations)} destinations")
        else:
            print_warning("No destinations data found in JSON file")
        
        conn.close()
        
        print("\n" + "=" * 60)
        print_success("Database initialized successfully!")
        print("=" * 60)
        print(f"\nDatabase location: {db_path}")
        print(f"Database size: {os.path.getsize(db_path) / 1024:.2f} KB")
        
    except Exception as e:
        print_error(f"Database initialization failed: {e}")
        import traceback
        traceback.print_exc()
        return

if __name__ == "__main__":
    main()