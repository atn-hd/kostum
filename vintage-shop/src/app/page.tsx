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
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [colors, setColors] = useState({ bg: '#0a0a0a', text: '#e8e4dc' })

  useEffect(() => {
    loadAll()
  }, [])

  const loadAll = async () => {
    const [productsRes, categoriesRes, settingsRes] = await Promise.all([
      supabase.from('products').select('*').eq('is_available', true).order('created_at', { ascending: false }),
      supabase.from('categories').select('name').order('name'),
      supabase.from('settings').select('*'),
    ])

    const list = productsRes.data || []
    setProducts(list)
    setFiltered(list)

    if (categoriesRes.data) setCategories(categoriesRes.data.map(c => c.name))

    if (settingsRes.data) {
      const bg = settingsRes.data.find(s => s.key === 'bg_color')
      const text = settingsRes.data.find(s => s.key === 'text_color')
      setColors({ bg: bg?.value || '#0a0a0a', text: text?.value || '#e8e4dc' })
    }

    setLoading(false)
  }

  const toggleFilter = (f: string, allProducts: Product[] = products) => {
    if (f === 'TOUT') {
      setActiveFilters(['TOUT'])
      setFiltered(allProducts)
      return
    }
    const current = activeFilters.filter(x => x !== 'TOUT')
    const next = current.includes(f) ? current.filter(x => x !== f) : [...current, f]

    if (next.length === 0) {
      setActiveFilters(['TOUT'])
      setFiltered(allProducts)
    } else {
      setActiveFilters(next)
      setFiltered(allProducts.filter(p =>
        next.some(filter => p.category?.toUpperCase() === filter.toUpperCase())
      ))
    }
  }

  const bg = colors.bg
  const text = colors.text
  const muted = '#666'
  const border = '#1a1a1a'

  return (
    <div style={{ minHeight: '100vh', background: bg }}>
      <style>{`
        @media (max-width: 768px) {
          .grid-products { grid-template-columns: repeat(2, 1fr) !important; }
          .header-inner { padding: 16px 20px !important; }
          .nav-links { gap: 12px !important; }
          .nav-link { font-size: 9px !important; letter-spacing: 0.1em !important; }
          .logo-text { font-size: 16px !important; }
          .logo-sub { font-size: 8px !important; }
          .hero-section { padding: 32px 20px 24px !important; flex-direction: column !important; gap: 12px !important; align-items: flex-start !important; }
          .hero-title { font-size: 32px !important; }
          .hero-sub { text-align: left !important; font-size: 11px !important; }
          .filters-section { padding: 0 20px 16px !important; }
          .footer-inner { padding: 24px 20px !important; }
        }
      `}</style>

      {/* Header */}
      <header style={{ borderBottom: `1px solid ${border}` }}>
        <div className="header-inner" style={{ padding: '24px 40px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div className="logo-text" style={{ fontSize: 22, fontWeight: 400, letterSpacing: '0.25em', lineHeight: 1, color: text }}>KOSTUM</div>
            <div className="logo-sub" style={{ fontSize: 10, letterSpacing: '0.3em', color: muted, marginTop: 4 }}>ARCHIVES</div>
          </div>
          <nav className="nav-links" style={{ display: 'flex', gap: 40, paddingTop: 4, flexWrap: 'nowrap' }}>
            {['VESTIAIRE', 'BOOK', 'ABOUT', 'CGU'].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`}
                className="nav-link"
                style={{ fontSize: 11, letterSpacing: '0.2em', color: muted, textDecoration: 'none', transition: 'color 0.2s', whiteSpace: 'nowrap' }}
                onMouseEnter={e => (e.currentTarget.style.color = text)}
                onMouseLeave={e => (e.currentTarget.style.color = muted)}
              >{item}</a>
            ))}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="hero-section" style={{ padding: '60px 40px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <h1 className="hero-title" style={{ fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif', fontSize: 44, fontWeight: 300, letterSpacing: '0.05em', lineHeight: 1, color: text }}>
          LE VESTIAIRE
        </h1>
        <p className="hero-sub" style={{ fontSize: 12, letterSpacing: '0.12em', color: muted, textAlign: 'right', lineHeight: 2 }}>
          Fashion and Costumes<br />collection for rent
        </p>
      </section>

      {/* Filters */}
      <section id="vestiaire" className="filters-section" style={{ padding: '0 40px 20px', borderBottom: `1px solid ${border}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ fontSize: 11, letterSpacing: '0.2em', color: '#444' }}>
            COLLECTION — {filtered.length} PIÈCES
          </span>
          <span style={{ fontSize: 11, letterSpacing: '0.2em', color: '#444' }}>FILTRER</span>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['TOUT', ...categories].map(f => (
            <button key={f} onClick={() => toggleFilter(f)}
              style={{
                background: activeFilters.includes(f) ? text : 'transparent',
                border: '1px solid',
                borderColor: activeFilters.includes(f) ? text : '#333',
                color: activeFilters.includes(f) ? bg : muted,
                padding: '6px 14px', fontSize: 11, letterSpacing: '0.15em',
                cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit',
              }}
            >{f}</button>
          ))}
        </div>
      </section>

      {/* Grid */}
      <section>
        {loading ? (
          <div style={{ padding: '80px 40px', color: '#333', letterSpacing: '0.2em', fontSize: 11 }}>CHARGEMENT...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '80px 40px', color: '#333', letterSpacing: '0.2em', fontSize: 11 }}>AUCUNE PIÈCE DISPONIBLE</div>
        ) : (
          <div className="grid-products" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {filtered.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} bg={bg} text={text} border={border} />
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${border}`, marginTop: 80 }}>
        <div className="footer-inner" style={{ padding: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 11, letterSpacing: '0.25em', color: '#333' }}>KOSTUM ARCHIVES</span>
          <Link href="/admin" style={{ fontSize: 10, letterSpacing: '0.2em', color: '#333', textDecoration: 'none' }}>BACK OFFICE</Link>
        </div>
      </footer>
    </div>
  )
}

function ProductCard({ product, index, bg, text, border }: { product: Product; index: number; bg: string; text: string; border: string }) {
  const [hovered, setHovered] = useState(false)
  const firstImage = product.images?.[0]
  const secondImage = product.images?.[1]

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRight: (index + 1) % 3 !== 0 ? `1px solid ${border}` : 'none',
        borderBottom: `1px solid ${border}`,
        cursor: 'pointer',
        background: bg,
      }}
    >
      <div style={{ position: 'relative', aspectRatio: '3/4', background: '#111', overflow: 'hidden' }}>
        {firstImage ? (
          <>
            <Image src={firstImage} alt={product.name} fill style={{ objectFit: 'cover', transition: 'opacity 0.4s', opacity: hovered && secondImage ? 0 : 1 }} />
            {secondImage && (
              <Image src={secondImage} alt={product.name} fill style={{ objectFit: 'cover', transition: 'opacity 0.4s', opacity: hovered ? 1 : 0 }} />
            )}
          </>
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#222', fontSize: 48 }}>—</div>
        )}
      </div>
      <div style={{ padding: '16px 20px 20px' }}>
        <div style={{ fontSize: 12, letterSpacing: '0.15em', color: text, marginBottom: 4 }}>{product.name?.toUpperCase()}</div>
        {product.designer && (
          <div style={{ fontSize: 11, letterSpacing: '0.1em', color: '#555', marginBottom: 12 }}>{product.designer?.toUpperCase()}</div>
        )}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {product.size && <span style={{ fontSize: 10, letterSpacing: '0.15em', border: '1px solid #222', padding: '3px 8px', color: '#555' }}>{product.size}</span>}
          {product.color && <span style={{ fontSize: 10, letterSpacing: '0.15em', border: '1px solid #222', padding: '3px 8px', color: '#555' }}>{product.color?.toUpperCase()}</span>}
          {product.category && <span style={{ fontSize: 10, letterSpacing: '0.15em', border: '1px solid #222', padding: '3px 8px', color: '#555' }}>{product.category?.toUpperCase()}</span>}
        </div>
      </div>
    </div>
  )
}
