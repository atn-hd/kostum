'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '36', '38', '40', '42', '44', 'UNIQUE']
const COLORS = ['NOIR', 'BLANC', 'BLEU', 'ROUGE', 'VERT', 'BEIGE', 'GRIS', 'AUTRE']

export default function NouvelArticlePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [dragging, setDragging] = useState(false)
  const [designers, setDesigners] = useState<string[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [form, setForm] = useState({
    name: '', description: '', price: '',
    category: '', designer: '', size: '', color: '',
    is_available: true
  })

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/admin')
        return
      }
      loadOptions()
    }
    init()
  }, [])

  const loadOptions = async () => {
    const [d, c] = await Promise.all([
      supabase.from('designers').select('name').order('name'),
      supabase.from('categories').select('name').order('name'),
    ])
    if (d.data) setDesigners(d.data.map(x => x.name))
    if (c.data) setCategories(c.data.map(x => x.name))
  }

  const uploadFiles = async (files: FileList | File[]) => {
    setUploading(true)
    setUploadError('')
    const urls: string[] = []
    let failed = 0
    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage.from('products').upload(fileName, file, { contentType: file.type })
      if (error) {
        failed++
      } else {
        const { data } = supabase.storage.from('products').getPublicUrl(fileName)
        urls.push(data.publicUrl)
      }
    }
    if (failed > 0) {
      setUploadError(`${failed} image(s) n'ont pas pu être uploadées. Vérifiez le format (JPG, PNG, WEBP) et réessayez.`)
    }
    setImages(prev => [...prev, ...urls])
    setUploading(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files) uploadFiles(e.dataTransfer.files)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (images.length === 0) { alert('Ajoutez au moins une photo.'); return }
    setLoading(true)
    const { error } = await supabase.from('products').insert([{
      ...form,
      price: form.price ? parseFloat(form.price) : null,
      images,
    }])
    if (!error) {
      router.push('/admin/dashboard')
    } else {
      alert('Une erreur est survenue lors de la publication. Réessayez.')
    }
    setLoading(false)
  }

  const Toggle = ({ label, field, options }: { label: string, field: keyof typeof form, options: string[] }) => (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 10, letterSpacing: '0.25em', color: '#888', marginBottom: 10 }}>{label}</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {options.map(opt => (
          <button key={opt} type="button" onClick={() => setForm({ ...form, [field]: form[field] === opt ? '' : opt })}
            style={{ background: form[field] === opt ? '#e8e4dc' : 'transparent', border: '1px solid', borderColor: form[field] === opt ? '#e8e4dc' : '#2a2a2a', color: form[field] === opt ? '#0a0a0a' : '#888', padding: '7px 14px', fontSize: 10, letterSpacing: '0.12em', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
          >{opt}</button>
        ))}
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a' }}>
      <header style={{ borderBottom: '1px solid #1a1a1a', padding: '24px 40px', display: 'flex', alignItems: 'center', gap: 24 }}>
        <Link href="/admin/dashboard" style={{ fontSize: 10, letterSpacing: '0.2em', color: '#888', textDecoration: 'none' }}>← RETOUR</Link>
        <span style={{ fontSize: 11, letterSpacing: '0.25em', color: '#e8e4dc' }}>NOUVEAU PRODUIT</span>
      </header>
      <main style={{ maxWidth: 900, margin: '0 auto', padding: '48px 40px' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48 }}>
            <div>
              <div style={{ marginBottom: 32 }}>
                <div style={{ fontSize: 10, letterSpacing: '0.25em', color: '#888', marginBottom: 10 }}>PHOTOS</div>
                {images.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>
                    {images.map((url, i) => (
                      <div key={i} style={{ position: 'relative', aspectRatio: '3/4', background: '#111', overflow: 'hidden' }}>
                        <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button type="button" onClick={() => setImages(images.filter((_, j) => j !== i))}
                          style={{ position: 'absolute', top: 6, right: 6, background: '#0a0a0a', border: 'none', color: '#e8e4dc', width: 20, height: 20, fontSize: 10, cursor: 'pointer', fontFamily: 'inherit' }}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
                <div onDragOver={e => { e.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={handleDrop}
                  style={{ border: `1px dashed ${dragging ? '#555' : '#222'}`, padding: '40px 20px', textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.2s', position: 'relative' }}>
                  <input type="file" accept="image/*" multiple onChange={e => e.target.files && uploadFiles(e.target.files)} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                  <div style={{ fontSize: 10, letterSpacing: '0.2em', color: '#888' }}>{uploading ? 'UPLOAD EN COURS...' : 'GLISSER LES PHOTOS ICI'}</div>
                </div>
                {uploadError && (
                  <div style={{ marginTop: 8, fontSize: 10, letterSpacing: '0.1em', color: '#cc4444' }}>{uploadError}</div>
                )}
              </div>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 10, letterSpacing: '0.25em', color: '#888', marginBottom: 8 }}>NOM DU VÊTEMENT</div>
                <input className="input-dark" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Chemise L bleue Jean Paul Gaultier" required />
              </div>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 10, letterSpacing: '0.25em', color: '#888', marginBottom: 8 }}>DESCRIPTION</div>
                <textarea className="input-dark" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Chemise en soie, col ouvert..." rows={4} style={{ resize: 'none' }} />
              </div>
            </div>
            <div>
              <Toggle label="TYPE" field="category" options={categories} />
              <Toggle label="DESIGNER" field="designer" options={designers} />
              <Toggle label="COULEUR" field="color" options={COLORS} />
              <Toggle label="TAILLE" field="size" options={SIZES} />
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 10, letterSpacing: '0.25em', color: '#888', marginBottom: 8 }}>TARIF LOCATION (€)</div>
                <input type="number" min="0" step="5" className="input-dark" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="150" style={{ width: 120 }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 }}>
                <input type="checkbox" id="available" checked={form.is_available} onChange={e => setForm({ ...form, is_available: e.target.checked })} style={{ width: 14, height: 14, accentColor: '#e8e4dc', cursor: 'pointer' }} />
                <label htmlFor="available" style={{ fontSize: 10, letterSpacing: '0.2em', color: '#888', cursor: 'pointer' }}>DISPONIBLE À LA LOCATION</label>
              </div>
              <button type="submit" disabled={loading || uploading}
                style={{ width: '100%', background: loading ? 'transparent' : '#e8e4dc', border: '1px solid', borderColor: loading ? '#333' : '#e8e4dc', color: loading ? '#666' : '#0a0a0a', padding: '14px', fontSize: 11, letterSpacing: '0.2em', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}>
                {loading ? 'PUBLICATION...' : 'PUBLIER'}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  )
}
