'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect, useMemo, useRef } from 'react'
import { supabase, Product, Edito } from '@/lib/supabase'
import Link from 'next/link'
import { useLang } from '@/lib/useLang'
import { translations, translateColor, translateCategory } from '@/lib/i18n'
import Image from 'next/image'
import { optimizeImage } from '@/lib/cloudinary'

type ActiveDims = { types: boolean, designers: boolean, colors: boolean, sizes: boolean }
type ActiveFilters = { types: string[], designers: string[], colors: string[], sizes: string[] }

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [colors, setColors] = useState({ bg: '#0a0a0a', text: '#e8e4dc' })
  const [gridKey, setGridKey] = useState(0)
  const [editoEntries, setEditoEntries] = useState<Edito[]>([])
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)
  const [filterOpen, setFilterOpen] = useState(false)
  const [activeDims, setActiveDims] = useState<ActiveDims>({ types: true, designers: false, colors: false, sizes: false })
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({ types: [], designers: [], colors: [], sizes: [] })
  const filterRef = useRef<HTMLDivElement>(null)
  const [lang, toggleLang] = useLang()
  const t = translations[lang]

  useEffect(() => { loadAll() }, [])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const loadAll = async () => {
    const [productsRes, settingsRes, editoRes] = await Promise.all([
      supabase.from('products').select('*').eq('is_available', true).order('created_at', { ascending: false }),
      supabase.from('settings').select('*'),
      supabase.from('edito').select('*').order('created_at', { ascending: false }),
    ])
    const list = productsRes.data || []
    setProducts(list)
    if (settingsRes.data) {
      const bg = settingsRes.data.find(s => s.key === 'bg_color')
      const text = settingsRes.data.find(s => s.key === 'text_color')
      setColors({ bg: bg?.value || '#0a0a0a', text: text?.value || '#e8e4dc' })
    }
    setEditoEntries(editoRes.data || [])
    setLoading(false)
  }

  const availableFilters = useMemo(() => {
    const types = Array.from(new Set(products.map(p => p.category).filter(Boolean) as string[])).sort()
    const designers = Array.from(new Set(products.map(p => p.designer).filter(Boolean) as string[])).sort()
    const cols = Array.from(new Set(products.map(p => p.color).filter(Boolean) as string[])).sort()
    const sizes = Array.from(new Set(products.map(p => p.size).filter(Boolean) as string[])).sort()
    return { types, designers, colors: cols, sizes }
  }, [products])

  const filtered = useMemo(() => {
    return products.filter(p => {
      if (activeFilters.types.length > 0 && !activeFilters.types.some(f => p.category?.toUpperCase() === f.toUpperCase())) return false
      if (activeFilters.designers.length > 0 && !activeFilters.designers.some(f => p.designer?.toUpperCase() === f.toUpperCase())) return false
      if (activeFilters.colors.length > 0 && !activeFilters.colors.some(f => p.color?.toUpperCase() === f.toUpperCase())) return false
      if (activeFilters.sizes.length > 0 && !activeFilters.sizes.includes(p.size ?? '')) return false
      return true
    })
  }, [products, activeFilters])

  const toggleFilter = (dim: keyof ActiveFilters, value: string) => {
    setGridKey(k => k + 1)
    setActiveFilters(prev => {
      const current = prev[dim]
      const next = current.includes(value) ? current.filter(v => v !== value) : [...current, value]
      return { ...prev, [dim]: next }
    })
  }

  const toggleDim = (dim: keyof ActiveDims) => {
    setActiveDims(prev => ({ ...prev, [dim]: !prev[dim] }))
    if (activeDims[dim]) {
      setActiveFilters(prev => ({ ...prev, [dim]: [] }))
      setGridKey(k => k + 1)
    }
  }

  const clearFilters = () => {
    setGridKey(k => k + 1)
    setActiveFilters({ types: [], designers: [], colors: [], sizes: [] })
  }

  const totalActive = activeFilters.types.length + activeFilters.designers.length + activeFilters.colors.length + activeFilters.sizes.length

  const editoImages = editoEntries.flatMap(e => (e.images ?? []).map(url => ({ url, description: e.description ?? '' })))

  const bg = colors.bg
  const text = colors.text
  const muted = '#555'
  const border = '#1a1a1a'

  const dimOptions: { key: keyof ActiveDims, label: string }[] = [
    { key: 'types', label: t.filters.type },
    { key: 'designers', label: t.filters.designer },
    { key: 'colors', label: t.filters.color },
    { key: 'sizes', label: t.filters.size },
  ]

  const navItems = [
    { label: t.nav.wardrobe, href: 'vestiaire' },
    { label: t.nav.book, href: 'book' },
    { label: t.nav.about, href: 'about' },
    { label: t.nav.cgu, href: 'cgu' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: bg, color: text, fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif' }}>
      <style>{`
        @media (max-width: 768px) {
          .grid-products { grid-template-columns: repeat(2, 1fr) !important; }
          .header-inner { padding: 16px 20px !important; }
          .nav-links { gap: 16px !important; }
          .nav-link { font-size: 9px !important; letter-spacing: 0.1em !important; }
          .logo-text { font-size: 16px !important; }
          .logo-sub { font-size: 8px !important; }
          .hero-section { padding: 40px 20px 28px !important; flex-direction: column !important; gap: 16px !important; align-items: flex-start !important; }
          .hero-title { font-size: 28px !important; }
          .hero-sub { text-align: left !important; font-size: 11px !important; }
          .filters-section { padding: 16px 20px !important; }
          .filters-row { margin-bottom: 14px !important; }
          .footer-inner { padding: 24px 20px !important; }
          .section-inner { padding: 60px 20px !important; }
          .section-two-col { flex-direction: column !important; gap: 40px !important; }
          .filter-dropdown { right: 0; width: 220px !important; }
        }
        @keyframes gridFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes dropdownIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .grid-animate { animation: gridFadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) both; }
        .filter-btn {
          transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease, transform 0.15s ease;
        }
        .filter-btn:hover { transform: translateY(-1px); }
        .filter-btn:active { transform: scale(0.96); }
        .cta-link { display: inline-block; transition: background 0.22s ease, color 0.22s ease; }
        .cta-link:hover { background: var(--text) !important; color: var(--bg) !important; }
        .nav-link { transition: color 0.2s ease; }
        .grid-products {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          align-items: stretch;
          border-left: 1px solid #1a1a1a;
          border-top: 1px solid #1a1a1a;
        }
        .product-card {
          border-right: 1px solid #1a1a1a !important;
          border-bottom: 1px solid #1a1a1a !important;
          display: flex;
          flex-direction: column;
          height: 100%;
          transition: background 0.2s ease;
        }
        .filter-dropdown { animation: dropdownIn 0.18s ease both; }
        .dim-check:hover { background: #f0f0f0 !important; color: #111 !important; }
        .lang-btn { transition: color 0.15s ease; }
        .lang-btn:hover { color: #888 !important; }
        .grid-edito {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          border-left: 1px solid #1a1a1a;
          border-top: 1px solid #1a1a1a;
        }
        @media (max-width: 768px) {
          .grid-edito { grid-template-columns: repeat(2, 1fr) !important; }
        }
        .edito-cell {
          border-right: 1px solid #1a1a1a;
          border-bottom: 1px solid #1a1a1a;
          display: block; padding: 0; background: none;
          cursor: pointer; position: relative; overflow: hidden;
          aspect-ratio: 1/1;
        }
        .edito-cell img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s ease; display: block; }
        .edito-cell:hover img { transform: scale(1.04); }
        .edito-overlay { position: absolute; bottom: 0; left: 0; right: 0; background: rgba(237,237,237,0.9); padding: 12px 16px; font-size: 10px; letter-spacing: 0.1em; color: #111; opacity: 0; transition: opacity 0.2s; pointer-events: none; }
        .edito-cell:hover .edito-overlay { opacity: 1; }
      `}</style>

      {/* Header */}
      <header style={{ borderBottom: `1px solid ${border}`, position: 'sticky', top: 0, zIndex: 10, background: bg }}>
        <div className="header-inner" style={{ padding: '22px 40px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div className="logo-text" style={{ fontSize: 20, fontWeight: 500, letterSpacing: '0.28em', lineHeight: 1, color: text }}>KOSTUM</div>
            <div className="logo-sub" style={{ fontSize: 9, letterSpacing: '0.35em', color: '#444', marginTop: 5 }}>ARCHIVES</div>
          </div>
          <nav className="nav-links" style={{ display: 'flex', gap: 40, paddingTop: 2, flexWrap: 'nowrap', alignItems: 'center' }}>
            {navItems.map(item => (
              <a key={item.href} href={`#${item.href}`} className="nav-link"
                style={{ fontSize: 10, letterSpacing: '0.22em', color: '#444', textDecoration: 'none', whiteSpace: 'nowrap', paddingBottom: 2, borderBottom: '1px solid transparent' }}
                onMouseEnter={e => { e.currentTarget.style.color = text; e.currentTarget.style.borderBottomColor = text }}
                onMouseLeave={e => { e.currentTarget.style.color = '#444'; e.currentTarget.style.borderBottomColor = 'transparent' }}
              >{item.label}</a>
            ))}
            <button onClick={toggleLang} className="lang-btn"
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 10, letterSpacing: '0.18em', color: '#444', padding: 0, paddingTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <span style={{ color: lang === 'fr' ? text : '#333' }}>FR</span>
              <span style={{ color: '#2a2a2a' }}>|</span>
              <span style={{ color: lang === 'en' ? text : '#333' }}>EN</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="hero-section" style={{ padding: '64px 40px 44px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: `1px solid ${border}` }}>
        <div>
          <h1 className="hero-title" style={{ fontSize: 32, fontWeight: 300, letterSpacing: '0.04em', lineHeight: 1, color: text, margin: 0 }}>{t.hero.title}</h1>
        </div>
        <p className="hero-sub" style={{ fontSize: 11, letterSpacing: '0.14em', color: muted, textAlign: 'right', lineHeight: 2.2 }}>
          {t.hero.sub}
        </p>
      </section>

      {/* Filters */}
      <section id="vestiaire" className="filters-section" style={{ padding: '16px 40px', borderBottom: `1px solid ${border}` }}>
        <div className="filters-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <span style={{ fontSize: 10, letterSpacing: '0.25em', color: '#444' }}>
            {t.filters.collection}&ensp;—&ensp;
            <span style={{ color: text }}>{filtered.length} {filtered.length !== 1 ? t.filters.pieces : t.filters.piece}</span>
            {totalActive > 0 && (
              <button onClick={clearFilters} style={{ background: 'none', border: 'none', fontSize: 9, letterSpacing: '0.2em', color: '#444', cursor: 'pointer', fontFamily: 'inherit', marginLeft: 16 }}>
                {t.filters.clear} ✕
              </button>
            )}
          </span>

          <div ref={filterRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setFilterOpen(o => !o)}
              style={{
                background: filterOpen ? text : 'transparent',
                border: `1px solid ${filterOpen ? text : '#2a2a2a'}`,
                color: filterOpen ? bg : '#555',
                padding: '6px 16px', fontSize: 10, letterSpacing: '0.22em',
                cursor: 'pointer', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', gap: 8,
                transition: 'all 0.2s',
              }}
            >
              {t.filters.filterBy}
              <span style={{ fontSize: 8, transform: filterOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
            </button>

            {filterOpen && (
              <div className="filter-dropdown" style={{
                position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                background: bg, border: `1px solid ${border}`,
                width: 200, zIndex: 50, padding: '8px 0',
              }}>
                {dimOptions.filter(d => availableFilters[d.key].length > 0).map(d => (
                  <button
                    key={d.key}
                    onClick={() => toggleDim(d.key)}
                    className="dim-check"
                    style={{
                      width: '100%', background: 'transparent',
                      border: 'none', borderLeft: activeDims[d.key] ? `2px solid ${text}` : '2px solid transparent',
                      color: activeDims[d.key] ? text : '#666',
                      padding: '10px 20px', fontSize: 10, letterSpacing: '0.2em',
                      cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                      display: 'flex', alignItems: 'center', gap: 10,
                      transition: 'all 0.15s',
                    }}
                  >
                    <span style={{
                      width: 12, height: 12, border: `1px solid ${activeDims[d.key] ? text : '#333'}`,
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, fontSize: 8,
                      color: activeDims[d.key] ? text : 'transparent',
                    }}>✓</span>
                    {d.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {dimOptions.map(d => activeDims[d.key] && availableFilters[d.key].length > 0 && (
          <div key={d.key} style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 9, letterSpacing: '0.25em', color: '#333', marginBottom: 7 }}>{d.label}</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {availableFilters[d.key].map(f => {
                const active = activeFilters[d.key].includes(f)
                const label = d.key === 'colors'
                  ? translateColor(f, lang).toUpperCase()
                  : d.key === 'types'
                  ? translateCategory(f, lang).toUpperCase()
                  : f.toUpperCase()
                return (
                  <button key={f} onClick={() => toggleFilter(d.key, f)}
                    className="filter-btn"
                    style={{
                      background: active ? text : 'transparent',
                      border: '1px solid', borderColor: active ? text : '#2a2a2a',
                      color: active ? bg : '#555',
                      padding: '5px 14px', fontSize: 10, letterSpacing: '0.18em',
                      cursor: 'pointer', fontFamily: 'inherit',
                    }}
                  >{label}</button>
                )
              })}
            </div>
          </div>
        ))}
      </section>

      {/* Schema.org */}
      {!loading && filtered.length > 0 && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org', '@type': 'ItemList',
          name: 'Catalogue Kostum Archives',
          description: 'Location de vêtements vintage pour shootings, événements & projets créatifs',
          numberOfItems: filtered.length,
          itemListElement: filtered.map((product, index) => ({
            '@type': 'ListItem', position: index + 1,
            item: {
              '@type': 'Product', name: product.name,
              description: product.description || (product.designer ? `${product.name} par ${product.designer}` : product.name),
              ...(product.images?.[0] && { image: product.images[0] }),
              ...(product.designer && { brand: { '@type': 'Brand', name: product.designer } }),
              ...(product.category && { category: product.category }),
              offers: { '@type': 'Offer', availability: 'https://schema.org/InStock', priceCurrency: 'EUR', seller: { '@type': 'Organization', name: 'Kostum Archives' } },
            },
          })),
        })}} />
      )}

      {/* Grid */}
      <section style={{ minHeight: 320 }}>
        {loading ? (
          <div style={{ padding: '100px 40px', color: '#2a2a2a', letterSpacing: '0.25em', fontSize: 10 }}>{t.loading}</div>
        ) : products.length === 0 ? (
          <div style={{ padding: '100px 40px', borderBottom: `1px solid ${border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ fontSize: 9, letterSpacing: '0.35em', color: '#333', marginBottom: 28 }}>{t.emptyWardrobe.label}</div>
            <h2 style={{ fontSize: 28, fontWeight: 300, letterSpacing: '0.04em', color: text, marginBottom: 16, lineHeight: 1.2 }}>{t.emptyWardrobe.title}</h2>
            <p style={{ fontSize: 11, letterSpacing: '0.1em', color: muted, lineHeight: 2.2, marginBottom: 44, maxWidth: 360 }}>
              {t.emptyWardrobe.body1}<br />{t.emptyWardrobe.body2}
            </p>
            <a href="#book" className="cta-link"
              style={{ '--text': text, '--bg': bg, border: `1px solid ${text}`, color: text, padding: '10px 28px', fontSize: 10, letterSpacing: '0.22em', textDecoration: 'none' } as React.CSSProperties}
            >{t.emptyWardrobe.cta}</a>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '100px 40px', borderBottom: `1px solid ${border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ fontSize: 9, letterSpacing: '0.35em', color: '#333', marginBottom: 28 }}>{t.noResults.label}</div>
            <h2 style={{ fontSize: 28, fontWeight: 300, letterSpacing: '0.04em', color: text, marginBottom: 16, lineHeight: 1.2 }}>{t.noResults.title}</h2>
            <p style={{ fontSize: 11, letterSpacing: '0.1em', color: muted, lineHeight: 2.2, marginBottom: 44 }}>{t.noResults.body}</p>
            <button onClick={clearFilters} className="cta-link"
              style={{ '--text': text, '--bg': bg, border: `1px solid ${text}`, color: text, background: 'transparent', padding: '10px 28px', fontSize: 10, letterSpacing: '0.22em', cursor: 'pointer', fontFamily: 'inherit' } as React.CSSProperties}
            >{t.noResults.cta}</button>
          </div>
        ) : (
          <div key={gridKey} className="grid-products grid-animate">
            {filtered.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} bg={bg} text={text} border={border} muted={muted} lang={lang} />
            ))}
          </div>
        )}
      </section>

      {/* BOOK / ÉDITO */}
      <section id="book" style={{ borderTop: `1px solid ${border}`, borderBottom: `1px solid ${border}` }}>
        {/* Header */}
        <div className="section-inner" style={{ padding: '80px 40px 48px' }}>
          <p style={{ fontSize: 9, letterSpacing: '0.35em', color: '#444', marginBottom: 28 }}>{t.book.label}</p>
          <p style={{ fontSize: 22, letterSpacing: '0.08em', color: '#444', marginBottom: 0 }}>ARCHIVES SHOTS</p>
        </div>

        {/* Photo grid */}
        {editoImages.length > 0 ? (
          <div className="grid-edito">
            {editoImages.map((img, i) => (
              <button key={i} className="edito-cell" onClick={() => setLightboxIdx(i)}>
                <img src={img.url} alt="" />
                {img.description && <div className="edito-overlay">{img.description}</div>}
              </button>
            ))}
          </div>
        ) : (
          <div style={{ padding: '60px 40px', borderTop: `1px solid ${border}`, borderBottom: `1px solid ${border}`, textAlign: 'center' }}>
            <span style={{ fontSize: 10, letterSpacing: '0.3em', color: '#333' }}>COMING SOON</span>
          </div>
        )}

        {/* Contact CTA */}
        <div className="section-inner" style={{ padding: '48px 40px 80px' }}>
          <h2 style={{ fontSize: 22, fontWeight: 300, letterSpacing: '0.04em', color: text, marginBottom: 24, lineHeight: 1.2 }}>{t.book.title}</h2>
          <p style={{ fontSize: 11, letterSpacing: '0.1em', color: muted, lineHeight: 2.2, marginBottom: 16 }}>{t.book.body1}</p>
          <p style={{ fontSize: 11, letterSpacing: '0.1em', color: muted, lineHeight: 2.2, marginBottom: 44 }}>{t.book.body2}</p>
          <a href="mailto:contact@kostum-archives.com" className="cta-link"
            style={{ '--text': text, '--bg': bg, border: `1px solid ${text}`, color: text, padding: '10px 28px', fontSize: 10, letterSpacing: '0.22em', textDecoration: 'none' } as React.CSSProperties}
          >{t.book.cta}</a>
        </div>
      </section>

      {/* Lightbox */}
      {lightboxIdx !== null && (
        <div
          onClick={() => setLightboxIdx(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <button
            onClick={e => { e.stopPropagation(); setLightboxIdx(i => i !== null && i > 0 ? i - 1 : editoImages.length - 1) }}
            style={{ position: 'absolute', left: 24, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#888', fontSize: 28, cursor: 'pointer', padding: 16, lineHeight: 1 }}
          >‹</button>
          <img
            src={editoImages[lightboxIdx].url}
            alt=""
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '88vw', maxHeight: '88vh', objectFit: 'contain', display: 'block' }}
          />
          <button
            onClick={e => { e.stopPropagation(); setLightboxIdx(i => i !== null && i < editoImages.length - 1 ? i + 1 : 0) }}
            style={{ position: 'absolute', right: 24, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#888', fontSize: 28, cursor: 'pointer', padding: 16, lineHeight: 1 }}
          >›</button>
          <button
            onClick={() => setLightboxIdx(null)}
            style={{ position: 'absolute', top: 20, right: 24, background: 'none', border: 'none', color: '#666', fontSize: 20, cursor: 'pointer', padding: 8, lineHeight: 1, letterSpacing: '0.1em' }}
          >✕</button>
          <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', fontSize: 10, letterSpacing: '0.2em', color: '#444' }}>
            {lightboxIdx + 1} / {editoImages.length}
          </div>
        </div>
      )}

      {/* ABOUT */}
      <section id="about" style={{ borderBottom: `1px solid ${border}` }}>
        <div className="section-inner" style={{ padding: '80px 40px' }}>
          <div className="section-two-col" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 80 }}>
            <div style={{ flex: 1, maxWidth: 480 }}>
              <p style={{ fontSize: 9, letterSpacing: '0.35em', color: '#444', marginBottom: 28 }}>{t.about.label}</p>
              <h2 style={{ fontSize: 32, fontWeight: 300, letterSpacing: '0.04em', color: text, marginBottom: 24, lineHeight: 1.15 }}>{t.about.title}</h2>
              <p style={{ fontSize: 11, letterSpacing: '0.1em', color: muted, lineHeight: 2.2, marginBottom: 20 }}>{t.about.body1}</p>
              <p style={{ fontSize: 11, letterSpacing: '0.1em', color: muted, lineHeight: 2.2, marginBottom: 20 }}>{t.about.body2}</p>
              <p style={{ fontSize: 11, letterSpacing: '0.1em', color: muted, lineHeight: 2.2, marginBottom: 20 }}>{t.about.body3}</p>
              <p style={{ fontSize: 11, letterSpacing: '0.1em', color: muted, lineHeight: 2.2 }}>{t.about.body4}</p>
            </div>
            <div style={{ flex: 1, maxWidth: 320, paddingTop: 4 }}>
              <div style={{ borderTop: `1px solid ${border}`, paddingTop: 24, marginBottom: 24 }}>
                <div style={{ fontSize: 9, letterSpacing: '0.25em', color: '#444', marginBottom: 10 }}>{t.about.locationLabel}</div>
                <div style={{ fontSize: 11, letterSpacing: '0.08em', color: muted, lineHeight: 2 }}>{t.about.location.map((line, i) => <span key={i}>{line}<br /></span>)}</div>
              </div>
              <div style={{ borderTop: `1px solid ${border}`, paddingTop: 24, marginBottom: 24 }}>
                <div style={{ fontSize: 9, letterSpacing: '0.25em', color: '#444', marginBottom: 10 }}>{t.about.catalogLabel}</div>
                <div style={{ fontSize: 11, letterSpacing: '0.01em', color: muted, lineHeight: 2 }}>{t.about.catalog.map((line, i) => <span key={i}>{line}<br /></span>)}</div>
              </div>
              <div style={{ borderTop: `1px solid ${border}`, paddingTop: 24 }}>
                <div style={{ fontSize: 9, letterSpacing: '0.25em', color: '#444', marginBottom: 10 }}>{t.about.contactLabel}</div>
                <a href="mailto:contact@kostum-archives.com"
                  style={{ fontSize: 11, letterSpacing: '0.08em', color: muted, lineHeight: 2, textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = text)}
                  onMouseLeave={e => (e.currentTarget.style.color = muted)}
                >contact@kostum-archives.com</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CGU */}
      <section id="cgu" style={{ borderBottom: `1px solid ${border}` }}>
        <div className="section-inner" style={{ padding: '80px 40px' }}>
          <p style={{ fontSize: 9, letterSpacing: '0.35em', color: '#444', marginBottom: 28 }}>{t.cgu.label}</p>
          <h2 style={{ fontSize: 22, fontWeight: 300, letterSpacing: '0.04em', color: text, marginBottom: 40, lineHeight: 1.2 }}>{t.cgu.title}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '40px 80px', maxWidth: 960 }}>
            {t.cgu.items.map(({ titre, texte }) => (
              <div key={titre} style={{ borderTop: `1px solid ${border}`, paddingTop: 20 }}>
                <div style={{ fontSize: 10, letterSpacing: '0.2em', color: text, marginBottom: 12 }}>{titre.toUpperCase()}</div>
                <p style={{ fontSize: 11, letterSpacing: '0.06em', color: muted, lineHeight: 2 }}>{texte}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="footer-inner" style={{ padding: '32px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 10, letterSpacing: '0.28em', color: '#2a2a2a' }}>KOSTUM ARCHIVES — PARIS</span>
          <Link href="/admin" style={{ fontSize: 9, letterSpacing: '0.2em', color: '#2a2a2a', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#555')}
            onMouseLeave={e => (e.currentTarget.style.color = '#2a2a2a')}
          >LOGIN</Link>
        </div>
      </footer>
    </div>
  )
}

function ProductCard({ product, index, bg, text, border, muted, lang }: { product: Product; index: number; bg: string; text: string; border: string; muted: string; lang: 'fr' | 'en' }) {
  const [hovered, setHovered] = useState(false)
  const firstImage = product.images?.[0]
  const secondImage = product.images?.[1]

  return (
    <Link href={`/produit/${product.id}`} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="product-card"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ cursor: 'pointer', background: bg }}
      >
        <div style={{ position: 'relative', aspectRatio: '3/4', flexShrink: 0, background: '#0d0d0d', overflow: 'hidden' }}>
          {firstImage ? (
            <>
              <Image src={optimizeImage(firstImage)} alt={product.name ?? ''} fill sizes="(max-width: 768px) 50vw, 33vw" style={{ objectFit: 'cover', transition: 'opacity 0.5s ease', opacity: hovered && secondImage ? 0 : 1 }} />
              {secondImage && (
                <Image src={optimizeImage(secondImage)} alt={product.name ?? ''} fill sizes="(max-width: 768px) 50vw, 33vw" style={{ objectFit: 'cover', transition: 'opacity 0.5s ease', opacity: hovered ? 1 : 0 }} />
              )}
            </>
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1e1e1e', fontSize: 40, letterSpacing: '0.2em' }}>—</div>
          )}
        </div>
        <div style={{ padding: '18px 20px 22px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', minHeight: 140 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.18em', color: text, marginBottom: 6, fontWeight: 400 }}>{product.name?.toUpperCase()}</div>
          {product.designer && (
            <div style={{ fontSize: 10, letterSpacing: '0.12em', color: '#444', marginBottom: 14, overflow: 'hidden' }}>{product.designer?.toUpperCase()}</div>
          )}
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {product.size && <span style={{ fontSize: 9, letterSpacing: '0.15em', border: '1px solid #1e1e1e', padding: '3px 8px', color: '#444' }}>{product.size}</span>}
            {product.color && <span style={{ fontSize: 9, letterSpacing: '0.15em', border: '1px solid #1e1e1e', padding: '3px 8px', color: '#444' }}>{translateColor(product.color, lang).toUpperCase()}</span>}
            {product.category && <span style={{ fontSize: 9, letterSpacing: '0.15em', border: '1px solid #1e1e1e', padding: '3px 8px', color: '#444' }}>{translateCategory(product.category, lang).toUpperCase()}</span>}
          </div>
        </div>
      </div>
    </Link>
  )
}
