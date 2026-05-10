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
    if (!confirm('Supprimer cette pièce ?')) return
    await supabase.from('products').delete().eq('id', id)
    loadProducts()
  }

  const s = (x: React.CSSProperties) => x

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a' }}>
      <header style={{ borderBottom: '1px solid #1a1a1a', padding: '24px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 16, letterSpacing: '0.25em' }}>KOSTUM</div>
          <div style={{ fontSize: 10, letterSpacing: '0.25em', color: '#444', marginTop: 2 }}>BACK OFFICE — {products.length} PIÈCES</div>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <Link href="/admin/nouveau" style={{
            border: '1px solid #e8e4dc', color: '#e8e4dc', padding: '8px 20px',
            fontSize: 11, letterSpacing: '0.15em', textDecoration: 'none', transition: 'all 0.2s'
          }}>
            + NOUVEAU
          </Link>
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
            {products.map((product, i) => (
              <div key={product.id} style={{
                display: 'flex', alignItems: 'center', gap: 24,
                padding: '16px 0', borderBottom: '1px solid #1a1a1a',
              }}>
                {/* Miniature */}
                <div style={{ width: 48, height: 64, background: '#111', flexShrink: 0, overflow: 'hidden', position: 'relative' }}>
                  {product.images?.[0] ? (
                    <Image src={product.images[0]} alt={product.name} fill style={{ objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#222', fontSize: 18 }}>—</div>
                  )}
                </div>

                {/* Infos */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, letterSpacing: '0.15em', color: '#e8e4dc' }}>{product.name?.toUpperCase()}</div>
                  <div style={{ fontSize: 10, letterSpacing: '0.1em', color: '#444', marginTop: 4 }}>
                    {[product.designer, product.size, product.color, product.category].filter(Boolean).map(v => v?.toUpperCase()).join(' · ')}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexShrink: 0 }}>
                  <button
                    onClick={() => toggleAvailability(product.id, product.is_available)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                      fontSize: 10, letterSpacing: '0.15em',
                      color: product.is_available ? '#5a8a5a' : '#555',
                    }}
                  >
                    {product.is_available ? 'DISPONIBLE' : 'LOUÉ'}
                  </button>
                  <Link href={`/admin/modifier/${product.id}`} style={{ fontSize: 10, letterSpacing: '0.15em', color: '#555', textDecoration: 'none' }}>
                    MODIFIER
                  </Link>
                  <button onClick={() => deleteProduct(product.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 10, letterSpacing: '0.15em', color: '#3a2a2a' }}>
                    SUPPRIMER
                  </button>
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
