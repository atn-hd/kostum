'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Product } from '@/lib/types'

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('')

  useEffect(() => {
    fetchProducts()
  }, [filter])

  async function fetchProducts() {
    setLoading(true)
    const supabase = createClient()
    
    let query = supabase.from('products').select('*').order('created_at', { ascending: false })

    if (filter) {
      query = query.eq('category', filter)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching products:', error)
    } else {
      setProducts(data || [])
    }
    
    setLoading(false)
  }

  const categories = ['Toutes', 'T-shirts', 'Jeans', 'Robes', 'Vestes', 'Accessoires']

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold">VintageThread</h1>
          <Link href="/admin" className="text-sm px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800">
            Admin
          </Link>
        </div>
      </header>

      {/* Filters */}
      <div className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex gap-3 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat === 'Toutes' ? '' : cat)}
                className={`px-4 py-2 rounded whitespace-nowrap transition ${
                  (cat === 'Toutes' && !filter) || filter === cat
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Gallery */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        {loading ? (
          <div className="text-center py-12">Chargement...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            Aucun produit trouvé
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <div key={product.id} className="group cursor-pointer">
                <div className="bg-gray-100 rounded-lg overflow-hidden mb-4 h-80 relative">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.image_alt || product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      Pas d'image
                    </div>
                  )}
                </div>
                <h2 className="text-lg font-semibold mb-2">{product.title}</h2>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xl font-bold">{product.price}€</span>
                  <span className="text-sm bg-gray-100 px-3 py-1 rounded">Taille {product.size}</span>
                </div>
                <div className="flex gap-2 text-xs text-gray-500">
                  <span className="bg-gray-100 px-2 py-1 rounded">{product.era}</span>
                  <span className="bg-gray-100 px-2 py-1 rounded capitalize">{product.condition}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
