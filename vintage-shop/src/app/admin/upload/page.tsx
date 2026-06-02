'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function UploadPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState<string | null>(null)

  const fetchProducts = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('products')
      .select('id, name, images')
      .order('name')
    setProducts(data || [])
    setLoading(false)
  }

  useState(() => { fetchProducts() })

  const handleUpload = async (productId: string, files: FileList) => {
    setUploading(productId)
    const newUrls: string[] = []

    for (const file of Array.from(files)) {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('productId', productId)

      const res = await fetch('/api/upload-cloudinary', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (data.url) newUrls.push(data.url)
    }

    if (newUrls.length > 0) {
      const product = products.find(p => p.id === productId)
      const existingUrls = (product?.images || []).filter((u: string) => u.includes('cloudinary.com'))
      await supabase.from('products').update({ images: [...existingUrls, ...newUrls] }).eq('id', productId)
      fetchProducts()
    }

    setUploading(null)
  }

  const handleRemoveImages = async (productId: string) => {
    if (!confirm('Supprimer toutes les images de ce produit ?')) return
    await supabase.from('products').update({ images: [] }).eq('id', productId)
    fetchProducts()
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 1rem', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>Upload photos produits</h1>
      <p style={{ color: '#666', marginBottom: 24, fontSize: 14 }}>
        Les anciennes photos ont été perdues lors de la migration. Ré-uploadez les photos depuis votre téléphone ou ordinateur.
      </p>

      {loading ? <p>Chargement...</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {products.map(p => {
            const hasCloudinary = p.images?.some((u: string) => u.includes('cloudinary.com'))
            return (
              <div key={p.id} style={{
                padding: '1rem', borderRadius: 10,
                border: `1px solid ${hasCloudinary ? '#bbf7d0' : '#fca5a5'}`,
                background: hasCloudinary ? '#f0fdf4' : '#fff5f5',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 4 }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: hasCloudinary ? '#166534' : '#dc2626' }}>
                      {hasCloudinary ? `✅ ${p.images.filter((u: string) => u.includes('cloudinary.com')).length} photo(s)` : '❌ Aucune photo'}
                    </div>
                    {hasCloudinary && (
                      <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                        {p.images.filter((u: string) => u.includes('cloudinary.com')).map((url: string, i: number) => (
                          <img key={i} src={url} alt="" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6 }} />
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                    <label style={{
                      padding: '8px 14px', borderRadius: 8, background: '#111827',
                      color: 'white', fontSize: 13, cursor: 'pointer', textAlign: 'center'
                    }}>
                      {uploading === p.id ? 'Upload...' : '📷 Ajouter photos'}
                      <input type="file" accept="image/*" multiple style={{ display: 'none' }}
                        onChange={e => e.target.files && handleUpload(p.id, e.target.files)}
                        disabled={uploading === p.id} />
                    </label>
                    {hasCloudinary && (
                      <button onClick={() => handleRemoveImages(p.id)}
                        style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #fca5a5', background: 'transparent', color: '#dc2626', fontSize: 12, cursor: 'pointer' }}>
                        Supprimer tout
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
