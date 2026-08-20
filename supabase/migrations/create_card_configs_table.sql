-- Create card_configs table
CREATE TABLE IF NOT EXISTS card_configs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  scan_type TEXT CHECK (scan_type IN ('profile', 'business', 'contact', 'social', 'portfolio', 'certificates', 'event', 'link', 'cv', 'custom')) DEFAULT 'profile',
  enabled BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 1,
  custom_url TEXT,
  custom_title TEXT,
  custom_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_card_configs_profile_id ON card_configs(profile_id);
CREATE INDEX IF NOT EXISTS idx_card_configs_scan_type ON card_configs(scan_type);
CREATE INDEX IF NOT EXISTS idx_card_configs_priority ON card_configs(priority);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_card_configs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_card_configs_updated_at_trigger ON card_configs;
CREATE TRIGGER update_card_configs_updated_at_trigger
  BEFORE UPDATE ON card_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_card_configs_updated_at();

-- Enable RLS
ALTER TABLE card_configs ENABLE ROW LEVEL SECURITY;

-- Policies for card_configs
CREATE POLICY "Users can view own card_configs" ON card_configs
  FOR SELECT
  USING (profile_id = auth.uid());

CREATE POLICY "Users can insert own card_configs" ON card_configs
  FOR INSERT
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Users can update own card_configs" ON card_configs
  FOR UPDATE
  USING (profile_id = auth.uid());

CREATE POLICY "Users can delete own card_configs" ON card_configs
  FOR DELETE
  USING (profile_id = auth.uid());