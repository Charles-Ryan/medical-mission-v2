'use client'
import Image from 'next/image'

export function TopBar() {

  return (
    <div style={{
      background: '#2E7D32',
      padding: '11px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <div style={{
        width: 34, height: 34, borderRadius: '50%',
        background: '#fff', display: 'flex', alignItems: 'center',
        justifyContent: 'center', flexShrink: 0, overflow: 'hidden',
        border: '2px solid rgba(255,255,255,0.4)',
      }}>
        <Image
          src="/logo.png"
          alt="Pilgrim CWOP"
          width={30}
          height={30}
          style={{ objectFit: 'contain', borderRadius: '50%' }}
        />
      </div>
      <span style={{
        fontSize: 14,
        fontWeight: 500,
        color: '#fff',
        flex: 1,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}>
        Pilgrim CWOP - Medical Mission
      </span>
    </div>
  )
}
