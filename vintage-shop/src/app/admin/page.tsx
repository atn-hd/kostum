'use client'
export const dynamic = 'force-dynamic'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Identifiants incorrects.')
    } else {
      router.push('/admin/dashboard')
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#0a0a0a', display: 'flex',
      alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{ width: 320 }}>
        <div style={{ marginBottom: 48, textAlign: 'center' }}>
          <div style={{ fontSize: 18, letterSpacing: '0.3em' }}>KOSTUM</div>
          <div style={{ fontSize: 10, letterSpacing: '0.25em', color: '#444', marginTop: 4 }}>BACK OFFICE</div>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="EMAIL"
            className="input-dark"
            required
          />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="MOT DE PASSE"
            className="input-dark"
            required
          />

          {error && (
            <p style={{ fontSize: 11, letterSpacing: '0.1em', color: '#666', textAlign: 'center' }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 8,
              background: 'transparent',
              border: '1px solid #333',
              color: loading ? '#333' : '#e8e4dc',
              padding: '12px',
              fontSize: 11,
              letterSpacing: '0.2em',
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.2s',
            }}
          >
            {loading ? '...' : 'CONNEXION'}
          </button>
        </form>
      </div>
    </div>
  )
}
