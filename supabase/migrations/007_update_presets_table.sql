-- Check if presets table exists and add user_id if missing
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'presets') THEN
    -- Add user_id column if it doesn't exist
    ALTER TABLE presets ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
    ALTER TABLE presets ADD COLUMN IF NOT EXISTS is_builtin BOOLEAN DEFAULT false;
    ALTER TABLE presets ADD COLUMN IF NOT EXISTS share_id UUID UNIQUE DEFAULT gen_random_uuid();
    ALTER TABLE presets ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;
    ALTER TABLE presets ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_presets_user_id ON presets(user_id);
    CREATE INDEX IF NOT EXISTS idx_presets_is_builtin ON presets(is_builtin);

    -- Enable RLS if not already enabled
    ALTER TABLE presets ENABLE ROW LEVEL SECURITY;

    -- Update policies
    DROP POLICY IF EXISTS "Users can view own presets" ON presets;
    CREATE POLICY "Users can view own presets"
      ON presets FOR SELECT
      USING (auth.uid() = user_id OR is_builtin = true);

    DROP POLICY IF EXISTS "Users can insert own presets" ON presets;
    CREATE POLICY "Users can insert own presets"
      ON presets FOR INSERT
      WITH CHECK (auth.uid() = user_id AND NOT is_builtin);

    DROP POLICY IF EXISTS "Users can update own presets" ON presets;
    CREATE POLICY "Users can update own presets"
      ON presets FOR UPDATE
      USING (auth.uid() = user_id AND NOT is_builtin);

    DROP POLICY IF EXISTS "Users can delete own presets" ON presets;
    CREATE POLICY "Users can delete own presets"
      ON presets FOR DELETE
      USING (auth.uid() = user_id AND NOT is_builtin);
  END IF;
END $$;