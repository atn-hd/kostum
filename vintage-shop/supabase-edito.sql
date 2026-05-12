CREATE TABLE edito (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text,
  description text,
  images text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE edito ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read" ON edito FOR SELECT USING (true);
CREATE POLICY "Auth insert" ON edito FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth update" ON edito FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth delete" ON edito FOR DELETE USING (auth.role() = 'authenticated');
