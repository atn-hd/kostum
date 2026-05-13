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

  const handleLogin = async () => {
    setLoading(true)
    setError('')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    console.log('réponse supabase', data, error)
    if (error) {
      setError(error.message)
    } else {
      await new Promise(resolve => setTimeout(resolve, 500))
      window.location.href = '/admin/dashboard'
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
          <div style={{ fontSize: 18, letterSpacing: '0.3em', color: '#e8e4dc' }}>KOSTUM</div>
          <div style={{ fontSize: 10, letterSpacing: '0.25em', color: '#888', marginTop: 4 }}>BACK OFFICE</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="EMAIL"
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{
              background: 'transparent', border: '1px solid #333',
              color: '#e8e4dc', padding: '12px', fontSize: 11,
              letterSpacing: '0.15em', fontFamily: 'inherit', outline: 'none',
            }}
          />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="MOT DE PASSE"
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{
              background: 'transparent', border: '1px solid #333',
              color: '#e8e4dc', padding: '12px', fontSize: 11,
              letterSpacing: '0.15em', fontFamily: 'inherit', outline: 'none',
            }}
          />
          {error && (
            <p style={{ fontSize: 11, letterSpacing: '0.1em', color: '#e05555', textAlign: 'center', margin: 0 }}>
              {error}
            </p>
          )}
          <button
            type="button"
            onClick={handleLogin}
            disabled={loading}
            style={{
              marginTop: 8, background: 'transparent', border: '1px solid #333',
              color: loading ? '#333' : '#e8e4dc', padding: '12px', fontSize: 11,
              letterSpacing: '0.2em', cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', transition: 'all 0.2s',
            }}
          >
            {loading ? '...' : 'CONNEXION'}
          </button>
        </div>
      </div>
    </div>
  )
}