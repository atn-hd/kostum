'use client'
import { useState, useEffect } from 'react'
import { supabase, Product } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/admin')
        return
      }
      setAuthChecked(true)
      loadProducts()
    }
    init()
  }, [])

  const loadProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) setProducts(data || [])
    setLoading(false)
  }

  const toggleAvailability = async (id: string, current: boolean) => {
    const { error } = await supabase
      .from('products')
      .update({ is_available: !current })
      .eq('id', id)
    if (error) {
      alert('Impossible de modifier la disponibilité. Réessayez.')
      return
    }
    loadProducts()
  }

  const deleteProduct = async (id: string) => {
    if (!confirm('Supprimer cette pièce ?')) return
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) {
      alert('Impossible de supprimer cette pièce. Réessayez.')
      return
    }
    loadProducts()
  }

  if (!authChecked) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 11, letterSpacing: '0.2em', color: '#333' }}>...</span>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a' }}>
      <header style={{ borderBottom: '1px solid #1a1a1a', padding: '24px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 16, letterSpacing: '0.25em' }}>KOSTUM</div>
          <div style={{ fontSize: 10, letterSpacing: '0.25em', color: '#444', marginTop: 2 }}>BACK OFFICE — {products.length} PIÈCES</div>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <Link href="/admin/nouveau" style={{ border: '1px solid #e8e4dc', color: '#e8e4dc', padding: '8px 20px', fontSize: 11, letterSpacing: '0.15em', textDecoration: 'none' }}>
            + NOUVEAU
          </Link>
          <Link href="/admin/parametres" style={{ fontSize: 10, letterSpacing: '0.2em', color: '#555', textDecoration: 'none' }}>PARAMÈTRES</Link>
          <Link href="/" style={{ fontSize: 10, letterSpacing: '0.2em', color: '#444', textDecoration: 'none' }}>VITRINE</Link>
          <button onClick={async () => { await supabase.auth.signOut(); router.push('/admin') }}
            style={{ background: 'none', border: 'none', fontSize: 10, letterSpacing: '0.2em', color: '#444', cursor: 'pointer', fontFamily: 'inherit' }}>
            DÉCONNEXION
          </button>
        </div>
      </header>

      <main style={{ padding: '40px' }}>
        {loading ? (
          <div style={{ color: '#333', letterSpacing: '0.2em', fontSize: 11 }}>CHARGEMENT...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {products.map((product) => (
              <div key={product.id} style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '16px 0', borderBottom: '1px solid #1a1a1a' }}>
                <div style={{ width: 48, height: 64, background: '#111', flexShrink: 0, overflow: 'hidden', position: 'relative' }}>
                  {product.images?.[0]
                    ? <Image src={product.images[0]} alt={product.name ?? ''} fill style={{ objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#222', fontSize: 18 }}>—</div>
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, letterSpacing: '0.15em', color: '#e8e4dc' }}>{product.name?.toUpperCase()}</div>
                  <div style={{ fontSize: 10, letterSpacing: '0.1em', color: '#444', marginTop: 4 }}>
                    {[product.designer, product.size, product.color, product.category]
                      .filter((v): v is string => Boolean(v))
                      .map(v => v.toUpperCase())
                      .join(' · ')}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexShrink: 0 }}>
                  <button onClick={() => toggleAvailability(product.id, product.is_available)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 10, letterSpacing: '0.15em', color: product.is_available ? '#5a8a5a' : '#555' }}>
                    {product.is_available ? 'DISPONIBLE' : 'LOUÉ'}
                  </button>
                  <Link href={`/admin/modifier/${product.id}`} style={{ fontSize: 10, letterSpacing: '0.15em', color: '#555', textDecoration: 'none' }}>MODIFIER</Link>
                  <button onClick={() => deleteProduct(product.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 10, letterSpacing: '0.15em', color: '#3a2a2a' }}>SUPPRIMER</button>
                </div>
              </div>
            ))}
            {products.length === 0 && (
              <div style={{ padding: '60px 0', color: '#333', letterSpacing: '0.2em', fontSize: 11, textAlign: 'center' }}>
                AUCUNE PIÈCE —{' '}
                <Link href="/admin/nouveau" style={{ color: '#555', textDecoration: 'none' }}>AJOUTER</Link>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
