-- Create parameters table
CREATE TABLE IF NOT EXISTS parameters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  type TEXT CHECK (type IN ('string', 'number', 'boolean', 'json')) DEFAULT 'string',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_parameters_profile_id ON parameters(profile_id);
CREATE INDEX IF NOT EXISTS idx_parameters_key ON parameters(key);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_parameters_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_parameters_updated_at_trigger ON parameters;
CREATE TRIGGER update_parameters_updated_at_trigger
  BEFORE UPDATE ON parameters
  FOR EACH ROW
  EXECUTE FUNCTION update_parameters_updated_at();

-- Enable RLS
ALTER TABLE parameters ENABLE ROW LEVEL SECURITY;

-- Policies for parameters
CREATE POLICY "Users can view own parameters" ON parameters
  FOR SELECT
  USING (profile_id = auth.uid());

CREATE POLICY "Users can insert own parameters" ON parameters
  FOR INSERT
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Users can update own parameters" ON parameters
  FOR UPDATE
  USING (profile_id = auth.uid());

CREATE POLICY "Users can delete own parameters" ON parameters
  FOR DELETE
  USING (profile_id = auth.uid());