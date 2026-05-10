'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Product } from '@/lib/types'

export default function AdminPage() {
  const router = useRouter()
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'T-shirts',
    size: 'M',
    condition: 'good' as const,
    era: '1990s',
    image_url: '',
    image_alt: '',
  })
  const [uploadingImage, setUploadingImage] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    if (authenticated) {
      fetchProducts()
    }
  }, [authenticated])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD || password === 'VintageShop2024') {
      setAuthenticated(true)
      setPassword('')
    } else {
      alert('Mot de passe incorrect')
    }
  }

  async function fetchProducts() {
    const supabase = createClient()
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    
    if (error) console.error('Error:', error)
    else setProducts(data || [])
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', 'vintage_shop')

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      )

      const data = await response.json()
      setFormData((prev) => ({
        ...prev,
        image_url: data.secure_url,
        image_alt: file.name.split('.')[0],
      }))
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Erreur lors de l\'upload de l\'image')
    } finally {
      setUploadingImage(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.title || !formData.image_url) {
      alert('Remplissez tous les champs obligatoires')
      return
    }

    setSubmitting(true)
    const supabase = createClient()

    try {
      if (editingId) {
        const { error } = await supabase
          .from('products')
          .update({
            ...formData,
            price: parseFloat(formData.price),
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingId)

        if (error) throw error
      } else {
        const { error } = await supabase.from('products').insert([
          {
            ...formData,
            price: parseFloat(formData.price),
          },
        ])

        if (error) throw error
      }

      setFormData({
        title: '',
        description: '',
        price: '',
        category: 'T-shirts',
        size: 'M',
        condition: 'good',
        era: '1990s',
        image_url: '',
        image_alt: '',
      })
      setEditingId(null)
      await fetchProducts()
    } catch (error) {
      console.error('Submit error:', error)
      alert('Erreur lors de la sauvegarde')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Êtes-vous sûr ?')) return

    const supabase = createClient()
    const { error } = await supabase.from('products').delete().eq('id', id)

    if (error) {
      alert('Erreur lors de la suppression')
    } else {
      await fetchProducts()
    }
  }

  function handleEdit(product: Product) {
    setFormData({
      title: product.title,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      size: product.size,
      condition: product.condition,
      era: product.era,
      image_url: product.image_url,
      image_alt: product.image_alt,
    })
    setEditingId(product.id)
    window.scrollTo(0, 0)
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6">Admin - VintageThread</h1>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              placeholder="Mot de passe admin"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
            <button
              type="submit"
              className="w-full bg-gray-900 text-white py-2 rounded hover:bg-gray-800 transition"
            >
              Connexion
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b border-gray-200 sticky top-0">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Admin VintageThread</h1>
          <button
            onClick={() => setAuthenticated(false)}
            className="text-sm px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Déconnexion
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-6">{editingId ? 'Modifier' : 'Ajouter'} un produit</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Titre *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="Ex: Levi's 501 1990s"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="Décrivez le produit..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Prix (€) *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-900"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Taille</label>
                  <select
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-900"
                  >
                    {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Catégorie</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-900"
                  >
                    {['T-shirts', 'Jeans', 'Robes', 'Vestes', 'Accessoires'].map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Décennie</label>
                  <select
                    value={formData.era}
                    onChange={(e) => setFormData({ ...formData, era: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-900"
                  >
                    {['1960s', '1970s', '1980s', '1990s', '2000s', '2010s', '2020s'].map((e) => (
                      <option key={e} value={e}>
                        {e}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">État</label>
                <select
                  value={formData.condition}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-900"
                >
                  {['excellent', 'good', 'fair', 'poor'].map((c) => (
                    <option key={c} value={c}>
                      {c === 'excellent' ? 'Excellent' : c === 'good' ? 'Bon' : c === 'fair' ? 'Acceptable' : 'Usé'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Image *</label>
                {formData.image_url && (
                  <div className="mb-4 relative w-full h-48 bg-gray-100 rounded">
                    <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover rounded" />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
                {uploadingImage && <p className="text-sm text-gray-500 mt-2">Upload en cours...</p>}
              </div>

              <button
                type="submit"
                disabled={submitting || uploadingImage}
                className="w-full bg-gray-900 text-white py-2 rounded hover:bg-gray-800 transition disabled:bg-gray-500"
              >
                {submitting ? 'Sauvegarde...' : editingId ? 'Modifier' : 'Ajouter'}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null)
                    setFormData({
                      title: '',
                      description: '',
                      price: '',
                      category: 'T-shirts',
                      size: 'M',
                      condition: 'good',
                      era: '1990s',
                      image_url: '',
                      image_alt: '',
                    })
                  }}
                  className="w-full bg-gray-300 text-gray-900 py-2 rounded hover:bg-gray-400 transition"
                >
                  Annuler l'édition
                </button>
              )}
            </form>
          </div>

          {/* Product List */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-6">Produits ({products.length})</h2>
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {products.length === 0 ? (
                <p className="text-gray-500">Aucun produit</p>
              ) : (
                products.map((product) => (
                  <div key={product.id} className="border border-gray-200 rounded p-4 hover:bg-gray-50">
                    <div className="flex gap-4 items-start">
                      {product.image_url && (
                        <img
                          src={product.image_url}
                          alt={product.title}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold">{product.title}</h3>
                        <p className="text-sm text-gray-600">{product.price}€ • Taille {product.size}</p>
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            Éditer
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="text-sm px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
