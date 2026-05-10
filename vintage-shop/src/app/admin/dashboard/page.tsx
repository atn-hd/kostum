'use client'
import { useState, useEffect } from 'react'
import { supabase, Product } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    loadProducts()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) router.push('/admin')
  }

  const loadProducts = async () => {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    setProducts(data || [])
    setLoading(false)
  }

  const toggleAvailability = async (id: string, current: boolean) => {
    await supabase.from('products').update({ is_available: !current }).eq('id', id)
    loadProducts()
  }

  const deleteProduct = async (id: string) => {
    if (!confirm('Supprimer cet article ?')) return
    await supabase.from('products').delete().eq('id', id)
    loadProducts()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-medium text-gray-900">Back office</h1>
          <p className="text-xs text-gray-500">{products.length} articles</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/nouveau" className="btn-primary text-sm">+ Nouvel article</Link>
          <button onClick={() => { supabase.auth.signOut(); router.push('/admin') }} className="btn-secondary text-sm">Déconnexion</button>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-8">
        {loading ? <div className="text-center py-20 text-gray-400">Chargement...</div> : (
          <div className="space-y-3">
            {products.map((product) => (
              <div key={product.id} className="card flex items-center gap-4 p-4">
                <div className="w-16 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  {product.images?.[0]
                    ? <Image src={product.images[0]} alt={product.name} width={64} height={80} className="object-cover w-full h-full" />
                    : <div className="w-full h-full flex items-center justify-center text-gray-300 text-2xl">👗</div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">{product.price}€ · {product.size} · {product.category} · {product.decade}s</p>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-1">{product.description}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <button
                    onClick={() => toggleAvailability(product.id, product.is_available)}
                    className={`text-xs px-3 py-1 rounded-full font-medium ${product.is_available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                  >
                    {product.is_available ? 'Disponible' : 'Vendu'}
                  </button>
                  <Link href={`/admin/modifier/${product.id}`} className="text-sm text-gray-600 hover:text-brand-500">Modifier</Link>
                  <button onClick={() => deleteProduct(product.id)} className="text-sm text-red-400 hover:text-red-600">Supprimer</button>
                </div>
              </div>
            ))}
            {products.length === 0 && (
              <div className="text-center py-20 text-gray-400">
                <p className="mb-4">Aucun article. Commencez par en ajouter un !</p>
                <Link href="/admin/nouveau" className="btn-primary inline-block">Ajouter un article</Link>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
