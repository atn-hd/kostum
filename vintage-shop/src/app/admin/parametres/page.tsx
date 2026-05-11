'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ParametresPage() {
  const router = useRouter()
  const [bgColor, setBgColor] = useState('#0a0a0a')
  const [textColor, setTextColor] = useState('#e8e4dc')
  const [designers, setDesigners] = useState<string[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [newDesigner, setNewDesigner] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/admin')
        return
      }
      loadData()
    }
    init()
  }, [])

  const loadData = async () => {
    const [settingsRes, designersRes, categoriesRes] = await Promise.all([
      supabase.from('settings').select('*'),
      supabase.from('designers').select('name').order('name'),
      supabase.from('categories').select('name').order('name'),
    ])
    if (settingsRes.data) {
      const bg = settingsRes.data.find(s => s.key === 'bg_color')
      const text = settingsRes.data.find(s => s.key === 'text_color')
      if (bg) setBgColor(bg.value)
      if (text) setTextColor(text.value)
    }
    if (designersRes.data) setDesigners(designersRes.data.map(d => d.name))
    if (categoriesRes.data) setCategories(categoriesRes.data.map(c => c.name))
  }

  const saveColors = async () => {
    setSaving(true)
    setSaveError('')
    const results = await Promise.all([
      supabase.from('settings').upsert({ key: 'bg_color', value: bgColor }),
      supabase.from('settings').upsert({ key: 'text_color', value: textColor }),
    ])
    const hasError = results.some(r => r.error)
    setSaving(false)
    if (hasError) {
      setSaveError('Erreur lors de la sauvegarde. Réessayez.')
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  const addDesigner = async () => {
    const name = newDesigner.trim().toUpperCase()
    if (!name) return
    const { error } = await supabase.from('designers').insert({ name })
    if (!error) {
      setDesigners(prev => [...prev, name].sort())
      setNewDesigner('')
    } else {
      alert('Impossible d\'ajouter ce créateur. Il existe peut-être déjà.')
    }
  }

  const removeDesigner = async (name: string) => {
    if (!confirm(`Supprimer "${name}" ?`)) return
    const { error } = await supabase.from('designers').delete().eq('name', name)
    if (!error) {
      setDesigners(prev => prev.filter(d => d !== name))
    } else {
      alert('Impossible de supprimer ce créateur.')
    }
  }

  const addCategory = async () => {
    const name = newCategory.trim().toUpperCase()
    if (!name) return
    const { error } = await supabase.from('categories').insert({ name })
    if (!error) {
      setCategories(prev => [...prev, name].sort())
      setNewCategory('')
    } else {
      alert('Impossible d\'ajouter cette catégorie. Elle existe peut-être déjà.')
    }
  }

  const removeCategory = async (name: string) => {
    if (!confirm(`Supprimer "${name}" ?`)) return
    const { error } = await supabase.from('categories').delete().eq('name', name)
    if (!error) {
      setCategories(prev => prev.filter(c => c !== name))
    } else {
      alert('Impossible de supprimer cette catégorie.')
    }
  }

  const label = (txt: string) => (
    <div style={{ fontSize: 10, letterSpacing: '0.25em', color: '#444', marginBottom: 10 }}>{txt}</div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a' }}>
      <header style={{ borderBottom: '1px solid #1a1a1a', padding: '24px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <Link href="/admin/dashboard" style={{ fontSize: 10, letterSpacing: '0.2em', color: '#444', textDecoration: 'none' }}>← RETOUR</Link>
          <span style={{ fontSize: 11, letterSpacing: '0.25em', color: '#555' }}>PARAMÈTRES</span>
        </div>
      </header>

      <main style={{ maxWidth: 800, margin: '0 auto', padding: '48px 40px', display: 'flex', flexDirection: 'column', gap: 48 }}>

        <section>
          <div style={{ fontSize: 12, letterSpacing: '0.3em', color: '#e8e4dc', marginBottom: 24, paddingBottom: 12, borderBottom: '1px solid #1a1a1a' }}>
            COULEURS DU SITE
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginBottom: 24 }}>
            <div>
              {label('COULEUR DE FOND')}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <input
                  type="color"
                  value={bgColor}
                  onChange={e => setBgColor(e.target.value)}
                  style={{ width: 48, height: 36, border: '1px solid #2a2a2a', background: 'none', cursor: 'pointer', padding: 2 }}
                />
                <input
                  type="text"
                  value={bgColor}
                  onChange={e => setBgColor(e.target.value)}
                  className="input-dark"
                  style={{ width: 120 }}
                  placeholder="#0a0a0a"
                />
              </div>
            </div>

            <div>
              {label('COULEUR DES TEXTES')}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <input
                  type="color"
                  value={textColor}
                  onChange={e => setTextColor(e.target.value)}
                  style={{ width: 48, height: 36, border: '1px solid #2a2a2a', background: 'none', cursor: 'pointer', padding: 2 }}
                />
                <input
                  type="text"
                  value={textColor}
                  onChange={e => setTextColor(e.target.value)}
                  className="input-dark"
                  style={{ width: 120 }}
                  placeholder="#e8e4dc"
                />
              </div>
            </div>
          </div>

          <div style={{ background: bgColor, border: '1px solid #2a2a2a', padding: '20px 24px', marginBottom: 20, borderRadius: 2 }}>
            <div style={{ color: textColor, fontSize: 18, letterSpacing: '0.25em', marginBottom: 6 }}>KOSTUM</div>
            <div style={{ color: textColor, fontSize: 11, letterSpacing: '0.15em', opacity: 0.5 }}>ARCHIVES — APERÇU</div>
          </div>

          {saveError && (
            <div style={{ marginBottom: 12, fontSize: 10, letterSpacing: '0.1em', color: '#cc4444' }}>{saveError}</div>
          )}
          <button
            onClick={saveColors}
            disabled={saving}
            style={{ background: saved ? '#2a4a2a' : 'transparent', border: '1px solid', borderColor: saved ? '#5a8a5a' : '#333', color: saved ? '#5a8a5a' : '#e8e4dc', padding: '10px 24px', fontSize: 11, letterSpacing: '0.2em', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}
          >
            {saved ? 'SAUVEGARDÉ ✓' : saving ? '...' : 'SAUVEGARDER LES COULEURS'}
          </button>
        </section>

        <section>
          <div style={{ fontSize: 12, letterSpacing: '0.3em', color: '#e8e4dc', marginBottom: 24, paddingBottom: 12, borderBottom: '1px solid #1a1a1a' }}>
            CRÉATEURS & MARQUES
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            <input
              type="text"
              value={newDesigner}
              onChange={e => setNewDesigner(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addDesigner()}
              className="input-dark"
              placeholder="Ajouter un créateur..."
              style={{ flex: 1 }}
            />
            <button
              onClick={addDesigner}
              style={{ background: '#e8e4dc', border: 'none', color: '#0a0a0a', padding: '0 20px', fontSize: 16, cursor: 'pointer', fontFamily: 'inherit' }}
            >+</button>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {designers.map(d => (
              <div key={d} style={{ display: 'flex', alignItems: 'center', gap: 0, border: '1px solid #2a2a2a' }}>
                <span style={{ fontSize: 10, letterSpacing: '0.12em', color: '#888', padding: '7px 12px' }}>{d}</span>
                <button
                  onClick={() => removeDesigner(d)}
                  style={{ background: 'none', border: 'none', borderLeft: '1px solid #2a2a2a', color: '#444', padding: '7px 10px', cursor: 'pointer', fontSize: 10, fontFamily: 'inherit', transition: 'color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#cc4444')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#444')}
                >✕</button>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div style={{ fontSize: 12, letterSpacing: '0.3em', color: '#e8e4dc', marginBottom: 24, paddingBottom: 12, borderBottom: '1px solid #1a1a1a' }}>
            CATÉGORIES
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            <input
              type="text"
              value={newCategory}
              onChange={e => setNewCategory(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addCategory()}
              className="input-dark"
              placeholder="Ajouter une catégorie..."
              style={{ flex: 1 }}
            />
            <button
              onClick={addCategory}
              style={{ background: '#e8e4dc', border: 'none', color: '#0a0a0a', padding: '0 20px', fontSize: 16, cursor: 'pointer', fontFamily: 'inherit' }}
            >+</button>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {categories.map(c => (
              <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 0, border: '1px solid #2a2a2a' }}>
                <span style={{ fontSize: 10, letterSpacing: '0.12em', color: '#888', padding: '7px 12px' }}>{c}</span>
                <button
                  onClick={() => removeCategory(c)}
                  style={{ background: 'none', border: 'none', borderLeft: '1px solid #2a2a2a', color: '#444', padding: '7px 10px', cursor: 'pointer', fontSize: 10, fontFamily: 'inherit', transition: 'color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#cc4444')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#444')}
                >✕</button>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  )
}
