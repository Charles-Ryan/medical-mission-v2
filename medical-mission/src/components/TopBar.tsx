'use client'
import Image from 'next/image'

export function TopBar() {
  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #1F7326 0%, #145A1A 100%)',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 2px 12px rgba(20,90,26,0.3)',
      }}
    >
      {/* Logo circle */}
      <div
        style={{
          width: 38,
          height: 38,
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
          width={34}
          height={34}
          style={{ objectFit: 'contain', borderRadius: '50%' }}
        />
      </div>

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
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', fontWeight: 500, marginTop: 1 }}>
          Medical Mission
        </div>
      </div>

      {/* Live indicator */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          padding: '4px 10px',
          background: 'rgba(255,255,255,0.12)',
          borderRadius: 20,
          border: '1px solid rgba(255,255,255,0.2)',
        }}
      >
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: '#A5D6A7',
            boxShadow: '0 0 0 2px rgba(165,214,167,0.4)',
            animation: 'pulse 2s infinite',
          }}
        />
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)', fontWeight: 600, letterSpacing: '0.05em' }}>
          LIVE
        </span>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}