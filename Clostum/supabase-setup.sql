-- Créez ces tables dans votre dashboard Supabase > SQL Editor

-- Table des produits
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category TEXT DEFAULT 'tops',
  size TEXT DEFAULT 'M',
  condition TEXT DEFAULT 'Bon état',
  decade TEXT DEFAULT '1990',
  images TEXT[] DEFAULT '{}',
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activer RLS (Row Level Security)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Lecture publique (site vitrine)
CREATE POLICY "Lecture publique des produits disponibles"
  ON products FOR SELECT
  TO anon
  USING (is_available = true);

-- Tout accès pour les utilisateurs authentifiés (admin)
CREATE POLICY "Admin accès complet"
  ON products FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Bucket Storage pour les photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true);

-- Politique upload (authentifiés seulement)
CREATE POLICY "Upload photos admin"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'products');

-- Politique lecture publique des photos
CREATE POLICY "Lecture publique photos"
  ON storage.objects FOR SELECT
  TO anon
  USING (bucket_id = 'products');

-- Politique suppression (admin)
CREATE POLICY "Suppression photos admin"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'products');
