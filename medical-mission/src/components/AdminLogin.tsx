'use client'
import { useState } from 'react'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'
import { useAuth } from '@/lib/auth'

export function AdminLogin() {
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogin = () => {
    setLoading(true)
    setTimeout(() => {
      const ok = login(username, password)
      if (!ok) setError(true)
      setLoading(false)
    }, 300)
  }

  const inputStyle = {
    width: '100%', padding: '9px 11px',
    border: '1px solid #B8D8B2', borderRadius: 8,
    fontSize: 13, background: '#ffffff', color: '#757575',
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '36px 16px', background: '#F5FAF5', minHeight: '100%' }}>
      <div style={{ background: '#fff', border: '1px solid #D8E8D8', borderRadius: 12, padding: '22px 20px', width: '100%', maxWidth: 320 }}>
        {/* Lock icon */}
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#F0F7F0', border: '1px solid #C8E6C9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
          <span style={{ fontSize: 20 }}>🔒</span>
        </div>
        <div style={{ fontSize: 14, fontWeight: 500, color: '#1C2B1C', textAlign: 'center', marginBottom: 2 }}>Admin access</div>
        <div style={{ fontSize: 11, color: '#7A9A7A', textAlign: 'center', marginBottom: 16 }}>Authorized volunteers only</div>

        {/* Error */}
        {error && (
          <div style={{ background: '#FFF0F0', color: '#C62828', border: '1px solid #FFCDD2', borderRadius: 8, padding: '7px 10px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <AlertCircle size={13} /> Incorrect username or password
          </div>
        )}

        {/* Username */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: '#3D5C3D', marginBottom: 4 }}>Username</div>
          <input
            style={inputStyle}
            type="text"
            placeholder="admin"
            value={username}
            onChange={e => { setUsername(e.target.value); setError(false) }}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            autoComplete="username"
          />
        </div>

        {/* Password */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: '#3D5C3D', marginBottom: 4 }}>Password</div>
          <div style={{ position: 'relative' }}>
            <input
              style={{ ...inputStyle, paddingRight: 36 }}
              type={showPw ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(false) }}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              autoComplete="current-password"
            />
            <button
              onClick={() => setShowPw(v => !v)}
              style={{ position: 'absolute', right: 9, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#7A9A7A' }}
            >
              {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        {/* Sign in */}
        <button
          className="action-btn wide"
          onClick={handleLogin}
          disabled={loading}
          style={{ opacity: loading ? 0.7 : 1 }}
        >
          {loading ? 'Signing in…' : 'Sign in →'}
        </button>
      </div>
    </div>
  )
}
