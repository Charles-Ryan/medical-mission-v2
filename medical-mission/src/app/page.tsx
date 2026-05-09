'use client'
import { useState, useEffect } from 'react'
import { TopBar } from '@/components/TopBar'
import { TabBar } from '@/components/TabBar'
import { DashboardPage } from '@/components/DashboardPage'
import { PatientsPage } from '@/components/PatientsPage'
import { AdminTab } from '@/components/AdminTab'

type Tab = 'dashboard' | 'patients' | 'admin'

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const up = () => setIsOnline(true)
    const down = () => setIsOnline(false)
    window.addEventListener('online', up)
    window.addEventListener('offline', down)
    return () => { window.removeEventListener('online', up); window.removeEventListener('offline', down) }
  }, [])

  return (
    <div className="app-shell">
      <div className="app-inner">
        <TopBar />
        <TabBar active={activeTab} onTabChange={setActiveTab} />
        {!isOnline && (
          <div style={{ background: '#FFFDE7', borderBottom: '1px solid #F9A825', padding: '6px 16px', fontSize: 11, color: '#F57F17', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>⚠</span> You are offline — data will sync when connection is restored. CSV export still available.
          </div>
        )}
        <div className="app-content">
          {activeTab === 'dashboard' && <DashboardPage />}
          {activeTab === 'patients' && <PatientsPage />}
          {activeTab === 'admin' && <AdminTab />}
        </div>
      </div>
    </div>
  )
}
