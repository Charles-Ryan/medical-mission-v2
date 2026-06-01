'use client'
import { BarChart2, Users, Settings } from 'lucide-react'
import type { ElementType, CSSProperties } from 'react'

type Tab = 'dashboard' | 'patients' | 'admin'

interface TabBarProps {
  active: Tab
  onTabChange: (tab: Tab) => void
}

const tabs: { id: Tab; label: string; Icon: ElementType }[] = [
  { id: 'dashboard', label: 'Dashboard', Icon: BarChart2 },
  { id: 'patients',  label: 'Patients',  Icon: Users },
  { id: 'admin',     label: 'Admin',     Icon: Settings },
]

export function TabBar({ active, onTabChange }: TabBarProps) {
  return (
    <div
      style={{
        background: '#fff',
        borderBottom: '1px solid #C8E0CA',
        display: 'flex',
        position: 'sticky',
        top: 62,
        zIndex: 40,
        padding: '0 8px',
        gap: 4,
        boxShadow: '0 2px 8px rgba(21,36,21,0.05)',
      }}
    >
      {tabs.map(({ id, label, Icon }) => {
        const isActive = active === id
        const btnStyle: CSSProperties = {
          flex: 1,
          padding: '10px 8px 8px',
          fontSize: 11,
          fontWeight: isActive ? 700 : 500,
          color: isActive ? '#1F7326' : '#8AAA8C',
          background: 'none',
          border: 'none',
          borderBottom: `3px solid ${isActive ? '#1F7326' : 'transparent'}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3,
          cursor: 'pointer',
          transition: 'color 0.15s, border-color 0.15s',
          WebkitTapHighlightColor: 'transparent',
          minHeight: 54,
          letterSpacing: '0.02em',
          textTransform: 'uppercase',
          position: 'relative',
        }
        return (
          <button key={id} onClick={() => onTabChange(id)} style={btnStyle}>
            {isActive && (
              <div style={{
                position: 'absolute',
                top: 6,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 32,
                height: 32,
                borderRadius: 10,
                background: '#E8F5E9',
                zIndex: -1,
              }} />
            )}
            <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
            <span>{label}</span>
          </button>
        )
      })}
    </div>
  )
}