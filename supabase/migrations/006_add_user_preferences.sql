-- Add user preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  default_font TEXT DEFAULT 'Classic',
  default_font_size INTEGER DEFAULT 48,
  default_theme TEXT DEFAULT 'system',
  auto_save BOOLEAN DEFAULT true,
  auto_save_interval INTEGER DEFAULT 30,
  default_speed NUMERIC(3,1) DEFAULT 2.0,
  mirror_mode_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default preferences for existing users
INSERT INTO user_preferences (user_id)
SELECT id FROM auth.users
ON CONFLICT (user_id) DO NOTHING;