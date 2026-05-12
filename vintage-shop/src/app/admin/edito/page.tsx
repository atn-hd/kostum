'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { supabase, Edito } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function EditoAdminPage() {
  const router = useRouter()
  const [authChecked, setAuthChecked] = useState(false)
  const [entries, setEntries] = useState<Edito[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [dragging, setDragging] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ title: '', description: '', images: [] as string[] })

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/admin'); return }
      setAuthChecked(true)
      loadEntries()
    }
    init()
  }, [])

  const loadEntries = async () => {
    const { data } = await supabase.from('edito').select('*').order('created_at', { ascending: false })
    setEntries(data || [])
    setLoading(false)
  }

  const resetForm = () => {
    setForm({ title: '', description: '', images: [] })
    setEditingId(null)
    setUploadError('')
  }

  const startEdit = (entry: Edito) => {
    setEditingId(entry.id)
    setForm({ title: entry.title ?? '', description: entry.description ?? '', images: entry.images ?? [] })
    setUploadError('')
  }

  const uploadFiles = async (files: FileList | File[]) => {
    setUploading(true)
    setUploadError('')
    const urls: string[] = []
    let failed = 0
    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop()
      const fileName = `edito-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage.from('products').upload(fileName, file, { contentType: file.type })
      if (error) {
        failed++
      } else {
        const { data } = supabase.storage.from('products').getPublicUrl(fileName)
        urls.push(data.publicUrl)
      }
    }
    if (failed > 0) setUploadError(`${failed} image(s) non uploadée(s). Vérifiez le format.`)
    setForm(prev => ({ ...prev, images: [...prev.images, ...urls] }))
    setUploading(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files) uploadFiles(e.dataTransfer.files)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.images.length === 0) { alert('Ajoutez au moins une photo.'); return }
    setSaving(true)
    if (editingId) {
      const { error } = await supabase.from('edito').update({
        title: form.title || null,
        description: form.description || null,
        images: form.images,
      }).eq('id', editingId)
      if (error) alert('Erreur lors de la mise à jour.')
    } else {
      const { error } = await supabase.from('edito').insert([{
        title: form.title || null,
        description: form.description || null,
        images: form.images,
      }])
      if (error) alert('Erreur lors de la création.')
    }
    setSaving(false)
    resetForm()
    loadEntries()
  }

  const deleteEntry = async (id: string) => {
    if (!confirm('Supprimer cet édito ?')) return
    const { error } = await supabase.from('edito').delete().eq('id', id)
    if (error) { alert('Impossible de supprimer.'); return }
    if (editingId === id) resetForm()
    loadEntries()
  }

  if (!authChecked) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 11, letterSpacing: '0.2em', color: '#333' }}>...</span>
      </div>
    )
  }

  const isEditing = editingId !== null

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#e8e4dc', fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif' }}>
      <style>{`
        .input-dark { background: transparent; border: 1px solid #1a1a1a; color: #e8e4dc; padding: 10px 14px; font-size: 11px; letter-spacing: 0.08em; font-family: inherit; width: 100%; outline: none; box-sizing: border-box; }
        .input-dark::placeholder { color: #333; }
        .input-dark:focus { border-color: #333; }
      `}</style>

      <header style={{ borderBottom: '1px solid #1a1a1a', padding: '24px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 16, letterSpacing: '0.25em' }}>KOSTUM</div>
          <div style={{ fontSize: 10, letterSpacing: '0.25em', color: '#444', marginTop: 2 }}>BACK OFFICE — ÉDITO</div>
        </div>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <Link href="/admin/dashboard" style={{ fontSize: 10, letterSpacing: '0.2em', color: '#555', textDecoration: 'none' }}>VESTIAIRE</Link>
          <Link href="/admin/parametres" style={{ fontSize: 10, letterSpacing: '0.2em', color: '#555', textDecoration: 'none' }}>PARAMÈTRES</Link>
          <Link href="/" style={{ fontSize: 10, letterSpacing: '0.2em', color: '#444', textDecoration: 'none' }}>VITRINE</Link>
          <button onClick={async () => { await supabase.auth.signOut(); router.push('/admin') }}
            style={{ background: 'none', border: 'none', fontSize: 10, letterSpacing: '0.2em', color: '#444', cursor: 'pointer', fontFamily: 'inherit' }}>
            DÉCONNEXION
          </button>
        </div>
      </header>

      <main style={{ padding: '40px', maxWidth: 960, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'start' }}>

          {/* Left: list */}
          <div>
            <div style={{ fontSize: 10, letterSpacing: '0.3em', color: '#444', marginBottom: 24 }}>ENTRÉES EXISTANTES</div>
            {loading ? (
              <div style={{ fontSize: 10, letterSpacing: '0.2em', color: '#333' }}>CHARGEMENT...</div>
            ) : entries.length === 0 ? (
              <div style={{ fontSize: 10, letterSpacing: '0.2em', color: '#333', padding: '40px 0' }}>AUCUNE ENTRÉE</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {entries.map(entry => (
                  <div key={entry.id} style={{
                    display: 'flex', alignItems: 'center', gap: 16, padding: '14px 0',
                    borderBottom: '1px solid #1a1a1a',
                    background: editingId === entry.id ? '#111' : 'transparent',
                    paddingLeft: editingId === entry.id ? 12 : 0,
                    transition: 'all 0.15s',
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, letterSpacing: '0.15em', color: '#e8e4dc' }}>
                        {entry.title ? entry.title.toUpperCase() : <span style={{ color: '#333' }}>SANS TITRE</span>}
                      </div>
                      <div style={{ fontSize: 10, letterSpacing: '0.1em', color: '#444', marginTop: 3 }}>
                        {entry.images.length} PHOTO{entry.images.length !== 1 ? 'S' : ''}
                      </div>
                    </div>
                    <button onClick={() => editingId === entry.id ? resetForm() : startEdit(entry)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 10, letterSpacing: '0.15em', color: editingId === entry.id ? '#e8e4dc' : '#555' }}>
                      {editingId === entry.id ? 'ANNULER' : 'MODIFIER'}
                    </button>
                    <button onClick={() => deleteEntry(entry.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 10, letterSpacing: '0.15em', color: '#3a2a2a' }}>
                      SUPPRIMER
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: form */}
          <div>
            <div style={{ fontSize: 10, letterSpacing: '0.3em', color: '#444', marginBottom: 24 }}>
              {isEditing ? 'MODIFIER L\'ENTRÉE' : 'NOUVELLE ENTRÉE'}
            </div>
            <form onSubmit={handleSave}>
              {/* Photos */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 10, letterSpacing: '0.25em', color: '#444', marginBottom: 10 }}>PHOTOS</div>
                {form.images.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>
                    {form.images.map((url, i) => (
                      <div key={i} style={{ position: 'relative', aspectRatio: '1/1', background: '#111', overflow: 'hidden' }}>
                        <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button type="button" onClick={() => setForm(prev => ({ ...prev, images: prev.images.filter((_, j) => j !== i) }))}
                          style={{ position: 'absolute', top: 4, right: 4, background: '#0a0a0a', border: 'none', color: '#e8e4dc', width: 20, height: 20, fontSize: 10, cursor: 'pointer', fontFamily: 'inherit' }}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
                <div
                  onDragOver={e => { e.preventDefault(); setDragging(true) }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  style={{ border: `1px dashed ${dragging ? '#555' : '#222'}`, padding: '32px 20px', textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.2s', position: 'relative' }}
                >
                  <input type="file" accept="image/*" multiple onChange={e => e.target.files && uploadFiles(e.target.files)} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                  <div style={{ fontSize: 10, letterSpacing: '0.2em', color: '#333' }}>
                    {uploading ? 'UPLOAD EN COURS...' : 'GLISSER LES PHOTOS ICI'}
                  </div>
                </div>
                {uploadError && <div style={{ marginTop: 8, fontSize: 10, color: '#cc4444', letterSpacing: '0.1em' }}>{uploadError}</div>}
              </div>

              {/* Title */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 10, letterSpacing: '0.25em', color: '#444', marginBottom: 8 }}>TITRE (OPTIONNEL)</div>
                <input className="input-dark" value={form.title} onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))} placeholder="Shooting printemps 2024" />
              </div>

              {/* Description */}
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 10, letterSpacing: '0.25em', color: '#444', marginBottom: 8 }}>DESCRIPTION (OPTIONNEL)</div>
                <textarea className="input-dark" value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))} placeholder="Contexte, crédits, notes..." rows={3} style={{ resize: 'vertical' }} />
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button type="submit" disabled={saving || uploading}
                  style={{ flex: 1, background: saving ? 'transparent' : '#e8e4dc', border: '1px solid', borderColor: saving ? '#333' : '#e8e4dc', color: saving ? '#333' : '#0a0a0a', padding: '12px', fontSize: 11, letterSpacing: '0.2em', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}>
                  {saving ? 'SAUVEGARDE...' : isEditing ? 'METTRE À JOUR' : 'PUBLIER'}
                </button>
                {isEditing && (
                  <button type="button" onClick={resetForm}
                    style={{ background: 'transparent', border: '1px solid #1a1a1a', color: '#555', padding: '12px 20px', fontSize: 11, letterSpacing: '0.2em', cursor: 'pointer', fontFamily: 'inherit' }}>
                    ANNULER
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
