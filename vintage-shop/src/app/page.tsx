'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { supabase, Product } from '@/lib/supabase'
import Image from 'next/image'
import Link from 'next/link'

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filtered, setFiltered] = useState<Product[]>([])
  const [activeFilters, setActiveFilters] = useState<string[]>(['TOUT'])
  const [loading, setLoading] = useState(true)

  const filterOptions = ['TOUT', 'CHEMISES', 'VESTES', 'ROBES', 'PANTALONS']

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('is_available', true)
      .order('created_at', { ascending: false })
    const list = data || []
    setProducts(list)
    setFiltered(list)
    setLoading(false)
  }

  const toggleFilter = (f: string) => {
    if (f === 'TOUT') {
      setActiveFilters(['TOUT'])
      setFiltered(products)
      return
    }
    const next = activeFilters.filter(x => x !== 'TOUT').includes(f)
      ? activeFilters.filter(x => x !== f)
      : [...activeFilters.filter(x => x !== 'TOUT'), f]

    if (next.length === 0) {
      setActiveFilters(['TOUT'])
      setFiltered(products)
    } else {
      setActiveFilters(next)
      setFiltered(products.filter(p =>
        next.some(f => p.category?.toUpperCase() === f || p.color?.toUpperCase() === f || p.designer?.toUpperCase() === f)
      ))
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a' }}>
      {/* Header */}
      <header style={{
        borderBottom: '1px solid #1a1a1a',
        padding: '24px 40px',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between'
      }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 400, letterSpacing: '0.25em', lineHeight: 1 }}>KOSTUM</div>
          <div style={{ fontSize: 10, letterSpacing: '0.3em', color: '#555', marginTop: 4 }}>ARCHIVES</div>
        </div>
        <nav style={{ display: 'flex', gap: 40, paddingTop: 4 }}>
          {['VESTIAIRE', 'BOOK', 'ABOUT', 'CGU'].map(item => (
            <a key={item} href={`#${item.toLowerCase()}`} style={{
              fontSize: 11, letterSpacing: '0.2em', color: '#666', textDecoration: 'none',
              transition: 'color 0.2s'
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#e8e4dc')}
            onMouseLeave={e => (e.currentTarget.style.color = '#666')}
            >{item}</a>
          ))}
        </nav>
      </header>

      {/* Hero */}
      <section style={{ padding: '60px 40px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <h1 style={{ fontStyle: 'italic', fontSize: 64, fontWeight: 300, letterSpacing: '-0.01em', lineHeight: 1, color: '#e8e4dc' }}>
          le vestiaire
        </h1>
        <p style={{ fontSize: 12, letterSpacing: '0.12em', color: '#555', textAlign: 'right', lineHeight: 2 }}>
          Location de vêtements<br />pour événements<br />& shootings
        </p>
      </section>

      {/* Filters bar */}
      <section id="vestiaire" style={{ padding: '0 40px 20px', borderBottom: '1px solid #1a1a1a' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ fontSize: 11, letterSpacing: '0.2em', color: '#444' }}>
            COLLECTION — {filtered.length} PIÈCES
          </span>
          <span style={{ fontSize: 11, letterSpacing: '0.2em', color: '#444' }}>FILTRER</span>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {filterOptions.map(f => (
            <button
              key={f}
              onClick={() => toggleFilter(f)}
              style={{
                background: activeFilters.includes(f) ? '#e8e4dc' : 'transparent',
                border: '1px solid',
                borderColor: activeFilters.includes(f) ? '#e8e4dc' : '#333',
                color: activeFilters.includes(f) ? '#0a0a0a' : '#666',
                padding: '6px 14px',
                fontSize: 11,
                letterSpacing: '0.15em',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontFamily: 'inherit',
              }}
            >{f}</button>
          ))}
        </div>
      </section>

      {/* Grid */}
      <section style={{ padding: '0' }}>
        {loading ? (
          <div style={{ padding: '80px 40px', color: '#333', letterSpacing: '0.2em', fontSize: 11 }}>
            CHARGEMENT...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '80px 40px', color: '#333', letterSpacing: '0.2em', fontSize: 11 }}>
            AUCUNE PIÈCE DISPONIBLE
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
          }}>
            {filtered.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #1a1a1a', padding: '40px', marginTop: 80 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 11, letterSpacing: '0.25em', color: '#333' }}>KOSTUM ARCHIVES</span>
          <Link href="/admin" style={{ fontSize: 10, letterSpacing: '0.2em', color: '#333', textDecoration: 'none' }}>
            BACK OFFICE
          </Link>
        </div>
      </footer>
    </div>
  )
}

function ProductCard({ product, index }: { product: Product; index: number }) {
  const [hovered, setHovered] = useState(false)
  const firstImage = product.images?.[0]
  const secondImage = product.images?.[1]

  const borderRight = (index + 1) % 3 !== 0 ? '1px solid #1a1a1a' : 'none'
  const borderBottom = '1px solid #1a1a1a'

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRight,
        borderBottom,
        cursor: 'pointer',
      }}
    >
      {/* Image */}
      <div style={{ position: 'relative', aspectRatio: '3/4', background: '#111', overflow: 'hidden' }}>
        {firstImage ? (
          <>
            <Image
              src={firstImage}
              alt={product.name}
              fill
              style={{ objectFit: 'cover', transition: 'opacity 0.4s', opacity: hovered && secondImage ? 0 : 1 }}
            />
            {secondImage && (
              <Image
                src={secondImage}
                alt={product.name}
                fill
                style={{ objectFit: 'cover', transition: 'opacity 0.4s', opacity: hovered ? 1 : 0 }}
              />
            )}
          </>
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#222', fontSize: 48 }}>
            —
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '16px 20px 20px' }}>
        <div style={{ fontSize: 12, letterSpacing: '0.15em', color: '#e8e4dc', marginBottom: 4 }}>
          {product.name?.toUpperCase()}
        </div>
        {product.designer && (
          <div style={{ fontSize: 11, letterSpacing: '0.1em', color: '#555', marginBottom: 12 }}>
            {product.designer?.toUpperCase()}
          </div>
        )}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {product.size && (
            <span style={{ fontSize: 10, letterSpacing: '0.15em', border: '1px solid #222', padding: '3px 8px', color: '#555' }}>
              {product.size}
            </span>
          )}
          {product.color && (
            <span style={{ fontSize: 10, letterSpacing: '0.15em', border: '1px solid #222', padding: '3px 8px', color: '#555' }}>
              {product.color?.toUpperCase()}
            </span>
          )}
          {product.category && (
            <span style={{ fontSize: 10, letterSpacing: '0.15em', border: '1px solid #222', padding: '3px 8px', color: '#555' }}>
              {product.category?.toUpperCase()}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
