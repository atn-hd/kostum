'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NouvelArticlePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [form, setForm] = useState({
    name: '', description: '', price: '', category: 'tops',
    size: 'M', condition: 'Bon état', decade: '1990', is_available: true
  })

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    setUploading(true)

    const uploadedUrls: string[] = []
    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const { error } = await supabase.storage
        .from('products')
        .upload(fileName, file, { cacheControl: '3600', upsert: false })

      if (!error) {
        const { data } = supabase.storage.from('products').getPublicUrl(fileName)
        uploadedUrls.push(data.publicUrl)
      }
    }

    setImages(prev => [...prev, ...uploadedUrls])
    setUploading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (images.length === 0) { alert('Ajoutez au moins une photo.'); return }
    setLoading(true)

    const { error } = await supabase.from('products').insert([{
      ...form,
      price: parseFloat(form.price),
      images,
    }])

    if (!error) {
      router.push('/admin/dashboard')
    } else {
      alert('Erreur lors de la création : ' + error.message)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4">
        <Link href="/admin/dashboard" className="text-gray-400 hover:text-gray-600">← Retour</Link>
        <h1 className="text-lg font-medium text-gray-900">Nouvel article</h1>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photos */}
          <div className="card p-6">
            <h2 className="font-medium text-gray-900 mb-4">Photos</h2>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {images.map((url, i) => (
                <div key={i} className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden relative">
                  <img src={url} alt="" className="object-cover w-full h-full" />
                  <button
                    type="button"
                    onClick={() => setImages(images.filter((_, j) => j !== i))}
                    className="absolute top-1 right-1 bg-white text-red-500 rounded-full w-6 h-6 text-xs flex items-center justify-center shadow-sm"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <label className={`aspect-[3/4] border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-brand-500 transition-colors ${uploading ? 'opacity-50' : ''}`}>
                <span className="text-2xl mb-1">+</span>
                <span className="text-xs text-gray-400">{uploading ? 'Upload...' : 'Ajouter photo'}</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} disabled={uploading} />
              </label>
            </div>
          </div>

          {/* Informations */}
          <div className="card p-6 space-y-4">
            <h2 className="font-medium text-gray-900">Informations</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'article *</label>
              <input className="input-field" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Ex: Levi's 501 Indigo" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea className="input-field h-24 resize-none" value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Décrivez l'article : matière, détails, histoire..." />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prix (€) *</label>
                <input type="number" min="0" step="0.5" className="input-field" value={form.price} onChange={e => setForm({...form, price: e.target.value})} placeholder="45" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Taille</label>
                <select className="input-field" value={form.size} onChange={e => setForm({...form, size: e.target.value})}>
                  {['XS','S','M','L','XL','XXL','36','38','40','42','44','46','Unique'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                <select className="input-field" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                  {['tops','jeans','robes','vestes','manteaux','accessoires'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Décennie</label>
                <select className="input-field" value={form.decade} onChange={e => setForm({...form, decade: e.target.value})}>
                  {['1960','1970','1980','1990','2000','2010'].map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">État</label>
                <select className="input-field" value={form.condition} onChange={e => setForm({...form, condition: e.target.value})}>
                  {['Excellent','Très bon état','Bon état','Correct'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input type="checkbox" id="available" checked={form.is_available} onChange={e => setForm({...form, is_available: e.target.checked})} className="w-4 h-4 accent-brand-500" />
              <label htmlFor="available" className="text-sm text-gray-700">Article disponible à la vente</label>
            </div>
          </div>

          <div className="flex gap-3">
            <Link href="/admin/dashboard" className="btn-secondary flex-1 text-center">Annuler</Link>
            <button type="submit" disabled={loading || uploading} className="btn-primary flex-1 disabled:opacity-50">
              {loading ? 'Publication...' : 'Publier l\'article'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
