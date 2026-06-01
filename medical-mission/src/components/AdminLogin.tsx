'use client'
import { useState } from 'react'
import { Eye, EyeOff, AlertCircle, Lock } from 'lucide-react'
import { useAuth } from '@/lib/auth'

export function AdminLogin() {
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogin = () => {
    if (!username || !password) { setError(true); return }
    setLoading(true)
    setTimeout(() => {
      const ok = login(username, password)
      if (!ok) setError(true)
      setLoading(false)
    }, 300)
  }

  const inputStyle = {
    width: '100%',
    padding: '14px 16px',
    border: `1.5px solid ${error ? '#EF9A9A' : '#C8E0CA'}`,
    borderRadius: 12,
    fontSize: '16px',
    background: '#ffffff',
    color: '#152415',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 16px',
        background: '#F2F9F2',
        minHeight: '100%',
      }}
    >
      <div
        style={{
          background: '#fff',
          border: '1px solid #C8E0CA',
          borderRadius: 20,
          padding: '32px 24px',
          width: '100%',
          maxWidth: 360,
          boxShadow: '0 10px 40px rgba(21,36,21,0.10)',
        }}
      >
        {/* Lock icon */}
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)',
            border: '1.5px solid #A8D0AB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: '0 4px 12px rgba(31,115,38,0.15)',
          }}
        >
          <Lock size={22} color="#1F7326" strokeWidth={2.5} />
        </div>

        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: '#152415',
            textAlign: 'center',
            marginBottom: 4,
            letterSpacing: '-0.02em',
          }}
        >
          Admin Access
        </div>
        <div style={{ fontSize: 13, color: '#8AAA8C', textAlign: 'center', marginBottom: 24, fontWeight: 500 }}>
          Authorized volunteers only
        </div>

        {/* Error banner */}
        {error && (
          <div
            style={{
              background: '#FFF0F0',
              color: '#C62828',
              border: '1.5px solid #FFCDD2',
              borderRadius: 10,
              padding: '10px 14px',
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 16,
              fontWeight: 500,
            }}
          >
            <AlertCircle size={15} />
            Incorrect username or password
          </div>
        )}

        {/* Username */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#2E4F30', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Username
          </div>
          <input
            style={inputStyle}
            type="text"
            placeholder="admin"
            value={username}
            onChange={e => { setUsername(e.target.value); setError(false) }}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            autoComplete="username"
            autoCapitalize="off"
          />
        </div>

        {/* Password */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#2E4F30', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Password
          </div>
          <div style={{ position: 'relative' }}>
            <input
              style={{ ...inputStyle, paddingRight: 52 }}
              type={showPw ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(false) }}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              autoComplete="current-password"
            />
            <button
              onClick={() => setShowPw(v => !v)}
              style={{
                position: 'absolute',
                right: 0,
                top: 0,
                height: '100%',
                width: 48,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#8AAA8C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                WebkitTapHighlightColor: 'transparent',
              }}
              type="button"
            >
              {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Sign in button */}
        <button
          className="btn-primary"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? 'Signing in…' : 'Sign in →'}
        </button>
      </div>
    </div>
  )
}