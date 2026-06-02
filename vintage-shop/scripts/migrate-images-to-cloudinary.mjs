import { createClient } from '@supabase/supabase-js'
import { v2 as cloudinary } from 'cloudinary'

// Config
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const DELETE_MODE = process.argv.includes('--delete')

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function migrateImages() {
  console.log('🚀 Démarrage migration images vers Cloudinary...')
  console.log(DELETE_MODE ? '🗑️ Mode DELETE activé' : '📦 Mode migration seul')

  // Récupérer tous les produits
  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, images')

  if (error) { console.error('❌ Erreur Supabase:', error); process.exit(1) }

  console.log(`📦 ${products.length} produits trouvés`)

  let migrated = 0
  let errors = 0

  for (const product of products) {
    if (!product.images || product.images.length === 0) continue

    const newImages = []
    let changed = false

    for (const imageUrl of product.images) {
      // Déjà sur Cloudinary
      if (imageUrl.includes('cloudinary.com')) {
        newImages.push(imageUrl)
        continue
      }

      try {
        console.log(`⬆️ Upload: ${imageUrl.split('/').pop()}`)
        const result = await cloudinary.uploader.upload(imageUrl, {
          folder: 'kostum',
          resource_type: 'image',
        })
        newImages.push(result.secure_url)
        changed = true
        migrated++
        console.log(`✅ Migré: ${result.secure_url}`)
      } catch (err) {
        console.error(`❌ Erreur upload ${imageUrl}:`, err.message)
        newImages.push(imageUrl) // garde l'ancienne URL en cas d'erreur
        errors++
      }
    }

    // Mettre à jour le produit avec les nouvelles URLs
    if (changed) {
      await supabase
        .from('products')
        .update({ images: newImages })
        .eq('id', product.id)
      console.log(`💾 Produit mis à jour: ${product.name}`)
    }
  }

  // Migrer aussi les éditos
  const { data: editos } = await supabase.from('edito').select('id, title, images')

  for (const edito of (editos || [])) {
    if (!edito.images || edito.images.length === 0) continue
    const newImages = []
    let changed = false

    for (const imageUrl of edito.images) {
      if (imageUrl.includes('cloudinary.com')) { newImages.push(imageUrl); continue }
      try {
        const result = await cloudinary.uploader.upload(imageUrl, {
          folder: 'kostum/edito',
          resource_type: 'image',
        })
        newImages.push(result.secure_url)
        changed = true
        migrated++
      } catch (err) {
        console.error(`❌ Erreur édito ${imageUrl}:`, err.message)
        newImages.push(imageUrl)
        errors++
      }
    }

    if (changed) {
      await supabase.from('edito').update({ images: newImages }).eq('id', edito.id)
    }
  }

  console.log(`\n✅ Migration terminée: ${migrated} images migrées, ${errors} erreurs`)
}

migrateImages()
