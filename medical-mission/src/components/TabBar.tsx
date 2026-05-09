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
    <div style={{ background: '#fff', borderBottom: '1px solid #D8E8D8', display: 'flex', position: 'sticky', top: 54, zIndex: 40 }}>
      {tabs.map(({ id, label, Icon }) => {
        const isActive = active === id
        const btnStyle: CSSProperties = {
          flex: 1, padding: '10px 4px', fontSize: 11, textAlign: 'center',
          color: isActive ? '#2E7D32' : '#7A9A7A',
          borderBottom: `2px solid ${isActive ? '#2E7D32' : 'transparent'}`,
          fontWeight: isActive ? 500 : 400,
          background: 'none', borderTop: 'none', borderLeft: 'none', borderRight: 'none',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
          cursor: 'pointer', transition: 'color .15s',
        }
        return (
          <button key={id} onClick={() => onTabChange(id)} style={btnStyle}>
            <Icon size={17} />
            <span>{label}</span>
          </button>
        )
      })}
    </div>
  )
}
