-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  short_description TEXT NOT NULL,
  description TEXT NOT NULL,
  price_ars INTEGER NOT NULL,
  tags TEXT[]
);

-- Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON products
  FOR SELECT
  USING (true);

-- Allow public write access (temporarily, adjust later if needed)
CREATE POLICY "Allow public write access" ON products
  FOR ALL
  USING (true)
  WITH CHECK (true);
