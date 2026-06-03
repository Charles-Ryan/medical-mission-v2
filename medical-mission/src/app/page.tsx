'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { BarChart2, Users, Settings } from 'lucide-react'
import { TopBar } from '@/components/TopBar'
import { TabBar } from '@/components/TabBar'
import { DashboardPage } from '@/components/DashboardPage'
import { PatientsPage } from '@/components/PatientsPage'
import { AdminTab } from '@/components/AdminTab'

type Tab = 'dashboard' | 'patients' | 'admin'

const NAV_ITEMS: { id: Tab; label: string; Icon: typeof BarChart2; desc: string }[] = [
  { id: 'dashboard', label: 'Dashboard',  Icon: BarChart2, desc: 'Stats & exports' },
  { id: 'patients',  label: 'Patients',   Icon: Users,     desc: 'Register & manage' },
  { id: 'admin',     label: 'Admin',      Icon: Settings,  desc: 'Services & settings' },
]

const PAGE_TITLES: Record<Tab, string> = {
  dashboard: 'Dashboard',
  patients:  'Patients',
  admin:     'Admin Panel',
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
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
    <div className="app-shell">
      <div className="app-inner">

        {/* ── DESKTOP SIDEBAR (hidden on mobile) ── */}
        <aside className="app-sidebar">
          <div className="sidebar-brand">
            <div style={{
              width: 42, height: 42, borderRadius: '50%',
              background: '#fff', display: 'flex', alignItems: 'center',
              justifyContent: 'center', flexShrink: 0, overflow: 'hidden',
              border: '2px solid rgba(255,255,255,0.3)',
              boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
            }}>
              <Image src="/logo.png" alt="Pilgrim CWOP" width={38} height={38}
                style={{ objectFit: 'contain', borderRadius: '50%' }} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', letterSpacing: '-0.01em' }}>
                Pilgrim CWOP
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', fontWeight: 500, marginTop: 2 }}>
                Medical Mission
              </div>
            </div>
          </div>

          <nav className="sidebar-nav">
            <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.35)',
              letterSpacing: '0.1em', textTransform: 'uppercase', padding: '8px 16px 4px' }}>
              Navigation
            </div>
            {NAV_ITEMS.map(({ id, label, Icon, desc }) => (
              <button
                key={id}
                className={`sidebar-nav-item${activeTab === id ? ' active' : ''}`}
                onClick={() => setActiveTab(id)}
              >
                <div className="sidebar-nav-icon">
                  <Icon size={17} strokeWidth={activeTab === id ? 2.5 : 2} />
                </div>
                <div>
                  <div style={{ fontSize: 14, lineHeight: 1.2 }}>{label}</div>
                  <div style={{ fontSize: 11, opacity: 0.6, fontWeight: 400, marginTop: 1 }}>{desc}</div>
                </div>
              </button>
            ))}
          </nav>

          <div className="sidebar-footer">
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 12px', borderRadius: 10,
              background: isOnline ? 'rgba(165,214,167,0.12)' : 'rgba(255,160,0,0.12)',
              border: `1px solid ${isOnline ? 'rgba(165,214,167,0.25)' : 'rgba(255,160,0,0.25)'}`,
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: isOnline ? '#A5D6A7' : '#FFB300',
                flexShrink: 0,
              }} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: isOnline ? 'rgba(255,255,255,0.85)' : '#FFB300' }}>
                  {isOnline ? 'Online' : 'Offline'}
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>
                  {isOnline ? 'Data synced' : 'Changes pending sync'}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* ── MOBILE + DESKTOP MAIN COLUMN ── */}
        <div className="app-main">

          {/*
            MOBILE LAYOUT (< 1024px):
            - TopBar  → sticky top, z-index 50  (visible on mobile only)
            - TabBar  → sticky top below TopBar  (visible on mobile only)
            - offline banner (optional)
            - app-content → flex-1, overflow-y scroll (the ONE scroll container)

            All three header elements are SIBLINGS of app-content, so they are
            never "inside" the scroll area and can never scroll away.
          */}

          {/* Top bar — mobile only, sticky */}
          <div className="app-topbar">
            <TopBar />
          </div>

          {/* Tab bar — mobile only, sticky */}
          <div className="app-tabbar">
            <TabBar active={activeTab} onTabChange={setActiveTab} />
          </div>

          {/* Offline banner — mobile only */}
          {!isOnline && (
            <div className="app-tabbar" style={{
              background: '#FFFDE7', borderBottom: '1px solid #F9A825',
              padding: '7px 16px', fontSize: 12, color: '#F57F17',
              display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600,
            }}>
              <span>⚠</span> Offline — data will sync when reconnected.
            </div>
          )}

          {/* Desktop content header — desktop only */}
          <div className="desktop-content-header">
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#152415', letterSpacing: '-0.03em' }}>
                {PAGE_TITLES[activeTab]}
              </div>
              <div style={{ fontSize: 13, color: '#8AAA8C', marginTop: 2, fontWeight: 500 }}>
                Pilgrim CWOP Medical Mission
              </div>
            </div>
            {!isOnline && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 14px', borderRadius: 20,
                background: '#FFF3E0', border: '1px solid #FFE0B2',
                fontSize: 12, color: '#E65100', fontWeight: 600,
              }}>
                ⚠ Offline — data will sync when reconnected
              </div>
            )}
          </div>

          {/* THE single scroll container */}
          <div className="app-content">
            {activeTab === 'dashboard' && <DashboardPage />}
            {activeTab === 'patients'  && <PatientsPage />}
            {activeTab === 'admin'     && <AdminTab />}
          </div>

        </div>
      </div>
    </div>
  )
}