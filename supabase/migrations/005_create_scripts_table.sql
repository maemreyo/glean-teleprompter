-- Create scripts table
CREATE TABLE IF NOT EXISTS scripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  bg_url TEXT,
  music_url TEXT,
  settings JSONB DEFAULT '{}',
  is_public BOOLEAN DEFAULT false,
  share_id UUID UNIQUE DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_scripts_user_id ON scripts(user_id);
CREATE INDEX IF NOT EXISTS idx_scripts_share_id ON scripts(share_id);
CREATE INDEX IF NOT EXISTS idx_scripts_updated_at ON scripts(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_scripts_is_public ON scripts(is_public) WHERE is_public = true;

-- Enable RLS
ALTER TABLE scripts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own scripts"
  ON scripts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scripts"
  ON scripts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scripts"
  ON scripts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own scripts"
  ON scripts FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Public scripts are viewable by all"
  ON scripts FOR SELECT
  USING (is_public = true);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_scripts_updated_at
    BEFORE UPDATE ON scripts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();