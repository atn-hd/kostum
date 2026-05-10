# VintageThread — Site vitrine + back office

Stack : Next.js 14 · Supabase · Vercel · OVH
Coût : ~10€/an (domaine OVH uniquement)

---

## 1. Prérequis

- Node.js 18+ installé
- Un compte GitHub
- Un compte Supabase (gratuit) → https://supabase.com
- Un compte Vercel (gratuit) → https://vercel.com
- Un domaine OVH (~10€/an) → https://ovh.com

---

## 2. Supabase — Configuration initiale

1. Créez un nouveau projet sur https://app.supabase.com
2. Allez dans **SQL Editor** et collez le contenu de `supabase-setup.sql`
3. Exécutez le SQL (bouton "Run")
4. Allez dans **Authentication > Users** et créez votre compte admin :
   - Email : votre email
   - Password : un mot de passe fort
5. Récupérez vos clés dans **Settings > API** :
   - `Project URL` → NEXT_PUBLIC_SUPABASE_URL
   - `anon public` → NEXT_PUBLIC_SUPABASE_ANON_KEY
   - `service_role secret` → SUPABASE_SERVICE_ROLE_KEY

---

## 3. Installation locale

```bash
# Cloner votre repo GitHub (après y avoir poussé ce projet)
git clone https://github.com/VOTRE_USER/vintage-shop.git
cd vintage-shop

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.local.example .env.local
# Éditez .env.local avec vos clés Supabase

# Lancer en local
npm run dev
# → http://localhost:3000
```

---

## 4. Déploiement Vercel

```bash
# 1. Pushez votre code sur GitHub
git add .
git commit -m "Initial commit"
git push origin main

# 2. Sur vercel.com > New Project > Import depuis GitHub
# 3. Ajoutez les variables d'environnement dans Vercel :
#    - NEXT_PUBLIC_SUPABASE_URL
#    - NEXT_PUBLIC_SUPABASE_ANON_KEY
#    - SUPABASE_SERVICE_ROLE_KEY
# 4. Déployez → Vercel vous donne une URL .vercel.app
```

---

## 5. Domaine OVH

1. Achetez votre domaine sur ovh.com
2. Dans OVH > Domaines > Votre domaine > Zone DNS
3. Ajoutez un enregistrement CNAME :
   - Sous-domaine : `www`
   - Cible : `cname.vercel-dns.com`
4. Pour le domaine nu (sans www), ajoutez un A record :
   - Cible : `76.76.21.21`
5. Dans Vercel > Votre projet > Settings > Domains
6. Ajoutez votre domaine OVH → Vercel valide automatiquement

---

## 6. Utilisation du back office

- **URL** : `votresite.com/admin`
- **Connexion** : email/mot de passe créé dans Supabase Auth
- **Dashboard** : `/admin/dashboard` → liste tous vos articles
- **Nouvel article** : `/admin/nouveau` → upload photos + formulaire

---

## 7. Structure du projet

```
src/
├── app/
│   ├── page.tsx              ← Site vitrine (public)
│   ├── layout.tsx            ← Layout global
│   ├── globals.css           ← Styles Tailwind
│   └── admin/
│       ├── page.tsx          ← Login admin
│       ├── dashboard/        ← Liste des articles
│       └── nouveau/          ← Ajout d'un article
├── lib/
│   └── supabase.ts           ← Client Supabase + types
```

---

## 8. Personnalisation

- **Nom du site** : cherchez "VintageThread" dans le code
- **Couleur principale** : `brand-500` dans tailwind.config.js (#d4537e)
- **Email contact** : dans `src/app/page.tsx`
- **Catégories** : dans `src/app/admin/nouveau/page.tsx`

