'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'

export function TopBar() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    const update = () => setIsOnline(navigator.onLine)
    update()
    window.addEventListener('online', update)
    window.addEventListener('offline', update)
    return () => {
      window.removeEventListener('online', update)
      window.removeEventListener('offline', update)
    }
  }, [])

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #1F7326 0%, #145A1A 100%)',
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        boxShadow: '0 2px 12px rgba(20,90,26,0.3)',
      }}
    >
      {/* Logo */}
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          overflow: 'hidden',
          border: '2px solid rgba(255,255,255,0.35)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        }}
      >
        <Image
          src="/logo.png"
          alt="Pilgrim CWOP"
          width={32}
          height={32}
          style={{ objectFit: 'contain', borderRadius: '50%' }}
        />
      </div>

      {/* Title */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: '#fff',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            letterSpacing: '-0.01em',
          }}
        >
          Pilgrim CWOP
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 500, marginTop: 1 }}>
          Medical Mission
        </div>
      </div>

      {/* Online / Offline indicator — matches desktop sidebar style */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          padding: '7px 12px',
          borderRadius: 10,
          background: isOnline
            ? 'rgba(165,214,167,0.12)'
            : 'rgba(255,160,0,0.12)',
          border: `1px solid ${isOnline
            ? 'rgba(165,214,167,0.25)'
            : 'rgba(255,160,0,0.25)'}`,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: isOnline ? '#A5D6A7' : '#FFB300',
            flexShrink: 0,
            boxShadow: isOnline
              ? '0 0 0 2px rgba(165,214,167,0.35)'
              : '0 0 0 2px rgba(255,179,0,0.35)',
            animation: isOnline ? 'topbarPulse 2.5s infinite' : 'none',
          }}
        />
        <div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: isOnline ? 'rgba(255,255,255,0.9)' : '#FFB300',
              lineHeight: 1.1,
            }}
          >
            {isOnline ? 'Online' : 'Offline'}
          </div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', marginTop: 1, lineHeight: 1 }}>
            {isOnline ? 'Data synced' : 'Pending sync'}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes topbarPulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}