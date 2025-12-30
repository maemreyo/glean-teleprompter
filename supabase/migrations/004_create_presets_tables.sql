-- Presets table for storing teleprompter configuration presets
CREATE TABLE IF NOT EXISTS presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
  description TEXT CHECK (char_length(description) <= 500),
  config JSONB NOT NULL,
  thumbnail_url TEXT,
  collection_id UUID REFERENCES preset_collections(id) ON DELETE SET NULL,
  tags TEXT[] CHECK (array_length(tags, 1) <= 10),
  is_shared BOOLEAN DEFAULT FALSE,
  sync_status TEXT NOT NULL DEFAULT 'synced' CHECK (sync_status IN ('synced', 'pending', 'error')),
  last_synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Preset collections table for organizing presets
CREATE TABLE IF NOT EXISTS preset_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 50),
  description TEXT CHECK (char_length(description) <= 200),
  icon TEXT,
  color TEXT CHECK (color ~ '^#[0-9A-Fa-f]{6}$'),
  is_system BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_presets_user_id ON presets(user_id);
CREATE INDEX IF NOT EXISTS idx_presets_collection_id ON presets(collection_id);
CREATE INDEX IF NOT EXISTS idx_presets_sync_status ON presets(sync_status);
CREATE INDEX IF NOT EXISTS idx_presets_tags ON presets USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_collections_user_id ON preset_collections(user_id);

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for presets table
DROP TRIGGER IF EXISTS update_presets_updated_at ON presets;
CREATE TRIGGER update_presets_updated_at BEFORE UPDATE ON presets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security for presets
ALTER TABLE presets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own presets" ON presets
  FOR SELECT USING (auth.uid() = user_id OR is_shared = TRUE);

CREATE POLICY "Users can insert own presets" ON presets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own presets" ON presets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own presets" ON presets
  FOR DELETE USING (auth.uid() = user_id);

-- Row Level Security for preset_collections
ALTER TABLE preset_collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own collections" ON preset_collections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own collections" ON preset_collections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own collections" ON preset_collections
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own collections" ON preset_collections
  FOR DELETE USING (auth.uid() = user_id);

-- Insert system collections
INSERT INTO preset_collections (user_id, name, description, icon, color, is_system)
SELECT 
  id,
  'Favorites',
  'Favorite presets',
  'Star',
  '#fbbf24',
  TRUE
FROM auth.users
ON CONFLICT (user_id, name) DO NOTHING;

INSERT INTO preset_collections (user_id, name, description, icon, color, is_system)
SELECT 
  id,
  'Broadcast',
  'Professional broadcast presets',
  'Radio',
  '#60a5fa',
  TRUE
FROM auth.users
ON CONFLICT (user_id, name) DO NOTHING;

INSERT INTO preset_collections (user_id, name, description, icon, color, is_system)
SELECT 
  id,
  'Creative',
  'Creative and artistic presets',
  'Palette',
  '#f472b6',
  TRUE
FROM auth.users
ON CONFLICT (user_id, name) DO NOTHING;
