-- ═══════════════════════════════════════════
-- СВОИ в LA — Supabase Database Schema
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════

-- Places table (user-submitted)
CREATE TABLE places (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,       -- restaurants, bars, coffee, hiking, etc.
  district TEXT NOT NULL,       -- weho, hollywood, glendale, dtla, etc.
  address TEXT,
  tip TEXT NOT NULL,             -- user's secret/tip
  rating FLOAT DEFAULT 0,
  added_by TEXT NOT NULL,        -- display name
  user_id UUID REFERENCES auth.users(id),
  img TEXT DEFAULT '📍',
  photos TEXT[] DEFAULT '{}',
  likes_count INT DEFAULT 0
);

-- Likes table
CREATE TABLE likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  place_id UUID REFERENCES places(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  UNIQUE(place_id, user_id)
);

-- Update likes_count trigger
CREATE OR REPLACE FUNCTION update_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE places SET likes_count = likes_count + 1 WHERE id = NEW.place_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE places SET likes_count = likes_count - 1 WHERE id = OLD.place_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_like_change
AFTER INSERT OR DELETE ON likes
FOR EACH ROW EXECUTE FUNCTION update_likes_count();

-- Row Level Security
ALTER TABLE places ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- Everyone can read places
CREATE POLICY "Anyone can read places" ON places FOR SELECT USING (true);

-- Logged-in users can insert places
CREATE POLICY "Logged in users can add places" ON places FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own places
CREATE POLICY "Users can update own places" ON places FOR UPDATE
  USING (auth.uid() = user_id);

-- Everyone can read likes
CREATE POLICY "Anyone can read likes" ON likes FOR SELECT USING (true);

-- Logged-in users can like/unlike
CREATE POLICY "Users can like" ON likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike" ON likes FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes for search
CREATE INDEX idx_places_district ON places(district);
CREATE INDEX idx_places_category ON places(category);
CREATE INDEX idx_places_search ON places USING GIN (to_tsvector('russian', name || ' ' || tip || ' ' || COALESCE(address, '')));
