-- Documentation table to store all knowledge base documents
CREATE TABLE IF NOT EXISTS documentation (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  path TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Index for faster path-based lookups
CREATE INDEX IF NOT EXISTS idx_documentation_path ON documentation(path);

-- Function to update last_updated timestamp on modification
CREATE OR REPLACE FUNCTION update_documentation_last_updated()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update last_updated timestamp
CREATE TRIGGER update_documentation_last_updated
BEFORE UPDATE ON documentation
FOR EACH ROW
EXECUTE FUNCTION update_documentation_last_updated();
