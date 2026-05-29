-- WanderIA Database Schema
-- SQLite Database for User Management and Test Results

-- Users table with password hashing support and role
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

-- Destinations table for admin management
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
    image_url TEXT,
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
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    image_query TEXT,
    flights_from TEXT,
    flights_min_price INTEGER,
    flights_currency TEXT DEFAULT 'USD',
    flights_airlines TEXT
);

-- User weight preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    weight_climate INTEGER DEFAULT 5 CHECK(weight_climate >= 1 AND weight_climate <= 10),
    weight_budget INTEGER DEFAULT 5 CHECK(weight_budget >= 1 AND weight_budget <= 10),
    weight_interests INTEGER DEFAULT 5 CHECK(weight_interests >= 1 AND weight_interests <= 10),
    weight_travel_style INTEGER DEFAULT 5 CHECK(weight_travel_style >= 1 AND weight_travel_style <= 10),
    weight_continent INTEGER DEFAULT 5 CHECK(weight_continent >= 1 AND weight_continent <= 10),
    weight_activities INTEGER DEFAULT 5 CHECK(weight_activities >= 1 AND weight_activities <= 10),
    weight_food INTEGER DEFAULT 5 CHECK(weight_food >= 1 AND weight_food <= 10),
    weight_accommodation INTEGER DEFAULT 5 CHECK(weight_accommodation >= 1 AND weight_accommodation <= 10),
    weight_companion INTEGER DEFAULT 5 CHECK(weight_companion >= 1 AND weight_companion <= 10),
    weight_safety INTEGER DEFAULT 5 CHECK(weight_safety >= 1 AND weight_safety <= 10),
    weight_language INTEGER DEFAULT 5 CHECK(weight_language >= 1 AND weight_language <= 10),
    weight_season INTEGER DEFAULT 5 CHECK(weight_season >= 1 AND weight_season <= 10),
    weight_nightlife INTEGER DEFAULT 5 CHECK(weight_nightlife >= 1 AND weight_nightlife <= 10),
    weight_nature INTEGER DEFAULT 5 CHECK(weight_nature >= 1 AND weight_nature <= 10),
    weight_culture INTEGER DEFAULT 5 CHECK(weight_culture >= 1 AND weight_culture <= 10),
    weight_adventure_level INTEGER DEFAULT 5 CHECK(weight_adventure_level >= 1 AND weight_adventure_level <= 10),
    weight_connectivity INTEGER DEFAULT 5 CHECK(weight_connectivity >= 1 AND weight_connectivity <= 10),
    weight_photography INTEGER DEFAULT 5 CHECK(weight_photography >= 1 AND weight_photography <= 10),
    weight_crowd_preference INTEGER DEFAULT 5 CHECK(weight_crowd_preference >= 1 AND weight_crowd_preference <= 10),
    weight_shopping INTEGER DEFAULT 5 CHECK(weight_shopping >= 1 AND weight_shopping <= 10),
    weight_sustainability INTEGER DEFAULT 5 CHECK(weight_sustainability >= 1 AND weight_sustainability <= 10),
    weight_water_activities INTEGER DEFAULT 5 CHECK(weight_water_activities >= 1 AND weight_water_activities <= 10),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Test sessions table
CREATE TABLE IF NOT EXISTS test_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    status TEXT DEFAULT 'in_progress' CHECK(status IN ('in_progress', 'completed', 'abandoned')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Test answers table
CREATE TABLE IF NOT EXISTS test_answers (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    question_id TEXT NOT NULL,
    answer_value TEXT NOT NULL,
    answered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES test_sessions(id) ON DELETE CASCADE
);

-- Recommendations table (stores AI-generated recommendations)
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

-- AI generated questions cache (for Ollama responses)
CREATE TABLE IF NOT EXISTS ai_questions_cache (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    question_text TEXT NOT NULL,
    options_json TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME
);

-- User saved destinations (favorites)
CREATE TABLE IF NOT EXISTS saved_destinations (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    destination_name TEXT NOT NULL,
    destination_country TEXT NOT NULL,
    notes TEXT,
    saved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Favorite destinations (with star rating)
CREATE TABLE IF NOT EXISTS favorite_destinations (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    destination_name TEXT NOT NULL,
    destination_country TEXT NOT NULL,
    rating INTEGER DEFAULT 5 CHECK(rating >= 1 AND rating <= 5),
    marked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, destination_name)
);

-- Recommendation feedback (comments on recommendations)
CREATE TABLE IF NOT EXISTS recommendation_feedback (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    recommendation_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    destination_name TEXT NOT NULL,
    destination_country TEXT NOT NULL,
    feedback_text TEXT NOT NULL,
    sentiment TEXT CHECK(sentiment IN ('positive', 'neutral', 'negative')),
    helpful_score INTEGER DEFAULT 0 CHECK(helpful_score >= 0 AND helpful_score <= 10),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES test_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (recommendation_id) REFERENCES recommendations(id) ON DELETE CASCADE
);

-- AI feedback history (for improving future recommendations)
CREATE TABLE IF NOT EXISTS ai_feedback_history (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    destination_name TEXT NOT NULL,
    destination_country TEXT NOT NULL,
    feedback_type TEXT NOT NULL CHECK(feedback_type IN ('favorite', 'comment', 'interaction')),
    feedback_data TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON test_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_answers_session ON test_answers(session_id);
CREATE INDEX IF NOT EXISTS idx_recs_session ON recommendations(session_id);
CREATE INDEX IF NOT EXISTS idx_prefs_user ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_user ON saved_destinations(user_id);
CREATE INDEX IF NOT EXISTS idx_favorite_destinations_user ON favorite_destinations(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendation_feedback_user ON recommendation_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendation_feedback_session ON recommendation_feedback(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_feedback_history_user ON ai_feedback_history(user_id);
CREATE INDEX IF NOT EXISTS idx_destinations_name ON destinations(name);
CREATE INDEX IF NOT EXISTS idx_destinations_country ON destinations(country);
