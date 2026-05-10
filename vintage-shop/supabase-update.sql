-- Ajoutez ces colonnes si votre table products existe déjà
ALTER TABLE products ADD COLUMN IF NOT EXISTS designer TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS color TEXT;

-- Ou si vous repartez de zéro, recréez la table complète :
DROP TABLE IF EXISTS products;

CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  category TEXT,
  designer TEXT,
  size TEXT,
  color TEXT,
  condition TEXT,
  images TEXT[] DEFAULT '{}',
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture publique" ON products FOR SELECT TO anon USING (true);
CREATE POLICY "Admin complet" ON products FOR ALL TO authenticated USING (true) WITH CHECK (true);
