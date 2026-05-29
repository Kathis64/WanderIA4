#!/usr/bin/env python3
"""
Seed script for WanderIA destinations database
Inserts example destinations into the SQLite database
"""

import sqlite3
import os
from datetime import datetime
import uuid

# Get database path
db_path = os.path.join(os.path.dirname(__file__), "..", "data", "wanderia.db")

# Ensure data directory exists
os.makedirs(os.path.dirname(db_path), exist_ok=True)

# Sample destinations data
destinations = [
    {
        "name": "Barcelona",
        "country": "Spain",
        "description": "Vibrant Mediterranean city known for its modernist architecture and beaches.",
        "culture": "High - Rich history with Roman ruins, Gothic Quarter, and Gaudí's masterpieces",
        "gastronomy": "High - Catalan cuisine, tapas, seafood paella, and local wines",
        "climate_spring": "Mild (15-20°C), pleasant",
        "climate_summer": "Hot (25-30°C), sunny",
        "climate_autumn": "Warm (20-25°C), occasional rain",
        "climate_winter": "Cool (8-13°C), some rainy days",
        "climate_best_season": "Spring (April-May) and Fall (September-October)",
        "cost_min": 50,
        "cost_max": 150,
        "cost_currency": "EUR",
        "budget_level": 2,
        "image_url": "https://images.unsplash.com/photo-1562883714-42f35e79d7fa?w=800",
        "tips": "Avoid peak summer (July-August) for fewer crowds. Book Sagrada Familia tickets in advance.",
        "tags_climate": "Mediterranean, Warm, Sunny",
        "tags_safety": "Very Safe, Well-policed",
        "tags_language": "Spanish, Catalan, English",
        "tags_seasons": "Spring, Fall",
        "tags_nightlife": "Vibrant, Trendy, Clubs and bars",
        "tags_nature": "Beaches, Parks, Urban green spaces",
        "tags_culture": "Art, Architecture, History, Museums",
        "tags_adventure": "Moderate, Hiking nearby",
        "tags_connectivity": "Excellent, High-speed internet",
        "tags_transport": "Excellent metro system, Walkable",
        "is_active": 1,
    },
    {
        "name": "Tokyo",
        "country": "Japan",
        "description": "Futuristic metropolis blending ancient traditions with cutting-edge technology.",
        "culture": "Exceptional - Traditional temples, tea ceremonies, modern pop culture",
        "gastronomy": "Exceptional - Michelin-starred restaurants, street food, sushi",
        "climate_spring": "Pleasant (10-20°C), cherry blossoms",
        "climate_summer": "Hot & humid (25-35°C)",
        "climate_autumn": "Cool (15-25°C), beautiful foliage",
        "climate_winter": "Cold (0-10°C), occasional snow",
        "climate_best_season": "Spring (March-April) and Fall (September-October)",
        "cost_min": 60,
        "cost_max": 200,
        "cost_currency": "JPY",
        "budget_level": 3,
        "image_url": "https://images.unsplash.com/photo-1540959375944-7049f642e9a4?w=800",
        "tips": "Get a Suica card for easy transportation. Book accommodations in advance during cherry blossom season.",
        "tags_climate": "Temperate, Four seasons",
        "tags_safety": "Extremely safe, Low crime",
        "tags_language": "Japanese, Limited English",
        "tags_seasons": "Spring, Fall",
        "tags_nightlife": "Legendary, Karaoke, Clubs, Izakayas",
        "tags_nature": "Parks, Gardens, Mountain trails",
        "tags_culture": "Temples, Traditions, Modern art, Fashion",
        "tags_adventure": "Moderate, Day trips available",
        "tags_connectivity": "Excellent, Widespread WiFi",
        "tags_transport": "Exceptional trains and metro",
        "is_active": 1,
    },
    {
        "name": "Bali",
        "country": "Indonesia",
        "description": "Tropical paradise with beaches, rice terraces, and spiritual culture.",
        "culture": "High - Hindu temples, ceremonies, traditional dance",
        "gastronomy": "High - Indonesian cuisine, street food, tropical fruits",
        "climate_spring": "Warm (26-32°C), some rain",
        "climate_summer": "Hot & humid (28-34°C), rainy season",
        "climate_autumn": "Warm (25-31°C), transitional",
        "climate_winter": "Warm (24-30°C), less rain",
        "climate_best_season": "Dry season (April-October)",
        "cost_min": 20,
        "cost_max": 80,
        "cost_currency": "USD",
        "budget_level": 1,
        "image_url": "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800",
        "tips": "Learn basic Indonesian phrases. Visit temples respectfully in modest clothing.",
        "tags_climate": "Tropical, Warm year-round",
        "tags_safety": "Safe, Tourist-friendly areas",
        "tags_language": "Indonesian, English widely spoken",
        "tags_seasons": "Dry season (April-October)",
        "tags_nightlife": "Great, Beach clubs, Bars",
        "tags_nature": "Beaches, Rice terraces, Mountains, Temples",
        "tags_culture": "Hindu temples, Traditional ceremonies, Crafts",
        "tags_adventure": "High, Surfing, Hiking, Water sports",
        "tags_connectivity": "Good, WiFi available",
        "tags_transport": "Good, Scooters and taxis",
        "is_active": 1,
    },
    {
        "name": "Paris",
        "country": "France",
        "description": "City of light, known for romance, art, and world-class cuisine.",
        "culture": "Exceptional - Louvre, Notre-Dame, Palace of Versailles",
        "gastronomy": "Exceptional - Fine dining, bistros, cafes, French pastries",
        "climate_spring": "Mild (10-16°C), rainy",
        "climate_summer": "Warm (18-25°C), pleasant",
        "climate_autumn": "Cool (12-20°C), some rain",
        "climate_winter": "Cold (3-8°C), occasional snow",
        "climate_best_season": "Spring (April-May) and Fall (September-October)",
        "cost_min": 80,
        "cost_max": 200,
        "cost_currency": "EUR",
        "budget_level": 3,
        "image_url": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800",
        "tips": "Learn some French phrases. Take advantage of free museum hours. Buy a Paris Museum Pass.",
        "tags_climate": "Temperate, Four seasons",
        "tags_safety": "Safe, Well-policed tourist areas",
        "tags_language": "French, English limited",
        "tags_seasons": "Spring, Fall",
        "tags_nightlife": "Sophisticated, Wine bars, Jazz clubs",
        "tags_nature": "Parks, Seine river, Gardens",
        "tags_culture": "World-class museums, Historic monuments, Art",
        "tags_adventure": "Low to moderate, Urban exploration",
        "tags_connectivity": "Excellent, WiFi everywhere",
        "tags_transport": "Excellent metro and buses",
        "is_active": 1,
    },
    {
        "name": "New York City",
        "country": "United States",
        "description": "The city that never sleeps - iconic landmarks, Broadway, and diverse neighborhoods.",
        "culture": "Exceptional - Broadway, museums, street art, diverse neighborhoods",
        "gastronomy": "Exceptional - World cuisine, food trucks, fine dining",
        "climate_spring": "Mild (10-20°C), rainy",
        "climate_summer": "Hot & humid (20-30°C), occasional thunderstorms",
        "climate_autumn": "Cool (10-20°C), pleasant",
        "climate_winter": "Cold (-5 to 5°C), snow possible",
        "climate_best_season": "Fall (September-October) and Spring (April-May)",
        "cost_min": 100,
        "cost_max": 250,
        "cost_currency": "USD",
        "budget_level": 4,
        "image_url": "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800",
        "tips": "Use the subway system. Get a Metrocard. Visit during off-peak for better prices.",
        "tags_climate": "Continental, Four seasons",
        "tags_safety": "Generally safe in tourist areas",
        "tags_language": "English, Multilingual",
        "tags_seasons": "Spring, Fall",
        "tags_nightlife": "World-class, Clubs, Broadway, Rooftop bars",
        "tags_nature": "Central Park, High Line, Urban parks",
        "tags_culture": "Museums, Broadway, Art galleries, Diverse neighborhoods",
        "tags_adventure": "Moderate, City tours, nearby hikes",
        "tags_connectivity": "Excellent, High-speed internet",
        "tags_transport": "Excellent subway system",
        "is_active": 1,
    },
]

def seed_destinations():
    """Insert example destinations into the database"""
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if destinations table exists and has data
        cursor.execute("SELECT COUNT(*) FROM destinations")
        count = cursor.fetchone()[0]
        
        if count > 0:
            print(f"✓ Database already has {count} destinations. Skipping seed.")
            conn.close()
            return
        
        print(f"Seeding {len(destinations)} destinations into {db_path}...")
        
        now = datetime.now().isoformat()
        
        for dest in destinations:
            cursor.execute("""
                INSERT INTO destinations (
                    id, name, country, description, culture, gastronomy,
                    climate_spring, climate_summer, climate_autumn, climate_winter,
                    climate_best_season, cost_min, cost_max, cost_currency, budget_level,
                    image_url, tips, tags_climate, tags_safety, tags_language,
                    tags_seasons, tags_nightlife, tags_nature, tags_culture,
                    tags_adventure, tags_connectivity, tags_transport, is_active,
                    created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                str(uuid.uuid4()),
                dest["name"],
                dest["country"],
                dest["description"],
                dest["culture"],
                dest["gastronomy"],
                dest["climate_spring"],
                dest["climate_summer"],
                dest["climate_autumn"],
                dest["climate_winter"],
                dest["climate_best_season"],
                dest["cost_min"],
                dest["cost_max"],
                dest["cost_currency"],
                dest["budget_level"],
                dest["image_url"],
                dest["tips"],
                dest["tags_climate"],
                dest["tags_safety"],
                dest["tags_language"],
                dest["tags_seasons"],
                dest["tags_nightlife"],
                dest["tags_nature"],
                dest["tags_culture"],
                dest["tags_adventure"],
                dest["tags_connectivity"],
                dest["tags_transport"],
                dest["is_active"],
                now,
                now,
            ))
        
        conn.commit()
        print(f"✓ Successfully seeded {len(destinations)} destinations!")
        print(f"✓ Database location: {db_path}")
        
    except sqlite3.OperationalError as e:
        if "no such table" in str(e):
            print("✗ Error: destinations table does not exist")
            print("Run 'setup-database.bat' first to initialize the database")
        else:
            print(f"✗ Database error: {e}")
    except Exception as e:
        print(f"✗ Error: {e}")
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    seed_destinations()
