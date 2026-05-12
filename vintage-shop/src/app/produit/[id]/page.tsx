'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { supabase, Product } from '@/lib/supabase'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useLang } from '@/lib/useLang'
import { translations } from '@/lib/i18n'

export default function ProductPage() {
  const { id } = useParams<{ id: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)
  const [zoomed, setZoomed] = useState(false)
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 })
  const [lang, toggleLang] = useLang()
  const t = translations[lang].product

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('products').select('*').eq('id', id).single()
      setProduct(data)
      setLoading(false)
    }
    load()
  }, [id])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoomPos({ x, y })
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#ededed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontSize: 10, letterSpacing: '0.3em', color: '#999' }}>{t.loading}</span>
    </div>
  )

  if (!product) return (
    <div style={{ minHeight: '100vh', background: '#ededed', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
      <span style={{ fontSize: 10, letterSpacing: '0.3em', color: '#999' }}>{t.notFound}</span>
      <Link href="/" style={{ fontSize: 10, letterSpacing: '0.2em', color: '#666', textDecoration: 'none' }}>{t.backFull}</Link>
    </div>
  )

  const images = product.images || []
  const mainImage = images[activeImage]
  const emailSubject = `${t.emailSubjectPrefix} — ${product.name}`
  const emailBody = `${t.emailIntro}\n\n${t.emailName} : ${product.name}${product.designer ? `\n${t.emailDesigner} : ${product.designer}` : ''}${product.size ? `\n${t.emailSize} : ${product.size}` : ''}${product.color ? `\n${t.emailColor} : ${product.color}` : ''}\n\n${t.emailClosing}`

  return (
    <div style={{ minHeight: '100vh', background: '#ededed', fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif' }}>
      <style>{`
        @media (max-width: 768px) {
          .product-layout { flex-direction: column !important; }
          .product-left {
            width: 100% !important;
            position: static !important;
            height: auto !important;
            flex-direction: column !important;
            padding: 0 !important;
            gap: 0 !important;
          }
          .thumbnails {
            flex-direction: row !important;
            gap: 8px !important;
            padding: 12px 16px !important;
            order: -1 !important;
            overflow-x: auto !important;
          }
          .thumb { width: 48px !important; height: 64px !important; }
          .main-image-wrap {
            position: relative !important;
            aspect-ratio: 3/4 !important;
            width: 100% !important;
            height: auto !important;
            flex: none !important;
          }
          .product-right { width: 100% !important; padding: 32px 20px !important; border-left: none !important; border-top: 1px solid #d8d8d8 !important; }
        }
        .thumb-btn { opacity: 0.5; transition: opacity 0.2s; cursor: pointer; background: none; border: none; padding: 0; }
        .thumb-btn:hover { opacity: 0.8; }
        .thumb-btn.active { opacity: 1; }
        .rent-btn { transition: background 0.2s ease; }
        .rent-btn:hover { background: #222 !important; }
        .info-btn { transition: color 0.2s ease, border-color 0.2s ease; }
        .info-btn:hover { color: #111 !important; border-color: #999 !important; }
        .lang-toggle { transition: color 0.15s ease; }
      `}</style>

      {/* Header */}
      <header style={{ borderBottom: '1px solid #d8d8d8', padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ededed', position: 'sticky', top: 0, zIndex: 10 }}>
        <Link href="/" style={{ fontSize: 10, letterSpacing: '0.22em', color: '#888', textDecoration: 'none', transition: 'color 0.2s' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#111')}
          onMouseLeave={e => (e.currentTarget.style.color = '#888')}
        >
          {t.back}
        </Link>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 500, letterSpacing: '0.28em', color: '#111' }}>KOSTUM</div>
          <div style={{ fontSize: 8, letterSpacing: '0.35em', color: '#999', marginTop: 2 }}>ARCHIVES</div>
        </div>
        <button onClick={toggleLang} className="lang-toggle"
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 10, letterSpacing: '0.18em', color: '#888', padding: 0, display: 'flex', alignItems: 'center', gap: 4 }}
        >
          <span style={{ color: lang === 'fr' ? '#111' : '#bbb' }}>FR</span>
          <span style={{ color: '#ccc' }}>|</span>
          <span style={{ color: lang === 'en' ? '#111' : '#bbb' }}>EN</span>
        </button>
      </header>

      {/* Layout */}
      <div className="product-layout" style={{ display: 'flex', minHeight: 'calc(100vh - 65px)' }}>

        {/* Gauche — photos */}
        <div className="product-left" style={{ width: '60%', position: 'sticky', top: 65, height: 'calc(100vh - 65px)', display: 'flex', gap: 12, padding: '32px 24px 32px 40px' }}>

          {images.length > 1 && (
            <div className="thumbnails" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {images.map((img, i) => (
                <button key={i} onClick={() => setActiveImage(i)} className={`thumb-btn${activeImage === i ? ' active' : ''}`}>
                  <div className="thumb" style={{ width: 52, height: 70, position: 'relative', overflow: 'hidden', background: '#ddd' }}>
                    <Image src={img} alt={`${product.name} ${i + 1}`} fill sizes="52px" style={{ objectFit: 'cover' }} />
                  </div>
                </button>
              ))}
            </div>
          )}

          <div
            className="main-image-wrap"
            style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#d8d8d8', cursor: zoomed ? 'zoom-out' : 'zoom-in' }}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setZoomed(true)}
            onMouseLeave={() => setZoomed(false)}
          >
            {mainImage ? (
              <img
                src={mainImage}
                alt={product.name ?? ''}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                  transform: zoomed ? 'scale(2.5)' : 'scale(1)',
                  transition: zoomed ? 'none' : 'transform 0.3s ease',
                }}
              />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: 40 }}>
                {'—'}
              </div>
            )}
            {!zoomed && mainImage && (
              <div style={{ position: 'absolute', bottom: 16, right: 16, fontSize: 9, letterSpacing: '0.2em', color: '#999', background: 'rgba(237,237,237,0.8)', padding: '4px 10px' }}>
                {t.hoverZoom}
              </div>
            )}
          </div>
        </div>

        {/* Droite — infos */}
        <div className="product-right" style={{ width: '40%', padding: '48px 40px 48px 24px', display: 'flex', flexDirection: 'column', borderLeft: '1px solid #d8d8d8' }}>

          <div style={{ fontSize: 9, letterSpacing: '0.25em', color: '#999', marginBottom: 32 }}>
            {[product.category, product.designer].filter(Boolean).map((v, i) => (
              <span key={i}>{i > 0 && ' — '}{v?.toUpperCase()}</span>
            ))}
          </div>

          <h1 style={{ fontSize: 28, fontWeight: 300, letterSpacing: '0.06em', color: '#111', margin: '0 0 8px', lineHeight: 1.2 }}>
            {product.name?.toUpperCase()}
          </h1>

          {product.designer && (
            <div style={{ fontSize: 11, letterSpacing: '0.15em', color: '#888', marginBottom: 32 }}>{product.designer.toUpperCase()}</div>
          )}

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 40 }}>
            {product.size && <span style={{ fontSize: 9, letterSpacing: '0.15em', border: '1px solid #ccc', padding: '4px 10px', color: '#888' }}>{product.size}</span>}
            {product.color && <span style={{ fontSize: 9, letterSpacing: '0.15em', border: '1px solid #ccc', padding: '4px 10px', color: '#888' }}>{product.color.toUpperCase()}</span>}
            {product.category && <span style={{ fontSize: 9, letterSpacing: '0.15em', border: '1px solid #ccc', padding: '4px 10px', color: '#888' }}>{product.category.toUpperCase()}</span>}
          </div>

          {product.description && (
            <div style={{ marginBottom: 48 }}>
              <div style={{ fontSize: 9, letterSpacing: '0.25em', color: '#aaa', marginBottom: 14 }}>{t.description}</div>
              <p style={{ fontSize: 12, letterSpacing: '0.06em', color: '#666', lineHeight: 2, margin: 0 }}>{product.description}</p>
            </div>
          )}

          <div style={{ flex: 1 }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <a
              href={`mailto:contact@kostum-archives.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`}
              className="rent-btn"
              style={{ display: 'block', textAlign: 'center', background: '#111', color: '#e8e4dc', padding: '14px 28px', fontSize: 11, letterSpacing: '0.25em', textDecoration: 'none' }}
            >
              {t.rentCta}
            </a>
            <a
              href={`mailto:contact@kostum-archives.com?subject=${encodeURIComponent(t.questionSubjectPrefix + ' — ' + (product.name ?? ''))}`}
              className="info-btn"
              style={{ display: 'block', textAlign: 'center', color: '#999', fontSize: 10, letterSpacing: '0.2em', textDecoration: 'none', padding: '10px', border: '1px solid #d8d8d8' }}
            >
              {t.questionCta}
            </a>
          </div>

          <div style={{ marginTop: 40, paddingTop: 32, borderTop: '1px solid #d8d8d8' }}>
            {[
              { label: t.leadLabel, value: t.leadValue },
              { label: t.usageLabel, value: t.usageValue },
              { label: t.contactLabel, value: 'contact@kostum-archives.com' },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', gap: 20, marginBottom: 16 }}>
                <div style={{ fontSize: 9, letterSpacing: '0.2em', color: '#aaa', minWidth: 64, paddingTop: 1 }}>{label}</div>
                <div style={{ fontSize: 11, letterSpacing: '0.06em', color: '#888', lineHeight: 1.8 }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
