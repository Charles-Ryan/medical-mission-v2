'use client'
import { useEffect, useState } from 'react'
import { FileText, Download } from 'lucide-react'
import { toast } from 'sonner'
import { getDashboardStats, getAllPatientsForExport } from '@/lib/db'
import { exportToCSV, exportToPDF } from '@/lib/export'
import { usePHTime } from '@/lib/usePHTime'
import type { DashboardStats } from '@/lib/types'

const COUNSEL_TYPES = ['Salvation', 'Baptism', 'Assurance', 'Prayer for Health']

export function DashboardPage() {
  const { timeStr, dateStr } = usePHTime()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getDashboardStats()
        setStats(data)
      } catch {
        toast.error('Failed to load dashboard stats')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleExportCSV = async () => {
    try { const p = await getAllPatientsForExport(); exportToCSV(p); toast.success('CSV downloaded') }
    catch { toast.error('Export failed') }
  }
  const handleExportPDF = async () => {
    try {
      const p = await getAllPatientsForExport()
      await exportToPDF(p, { total_patients: stats?.total_patients || 0, total_services: stats?.total_services || 0, total_counselled: stats?.total_counselled || 0 })
      toast.success('PDF downloaded')
    } catch { toast.error('PDF export failed') }
  }

  const card = (children: React.ReactNode) => (
    <div style={{ background: '#fff', border: '1px solid #D8E8D8', borderRadius: 12, marginBottom: 12, overflow: 'hidden' }}>
      {children}
    </div>
  )

  const cardHdr = (title: string) => (
    <div style={{ padding: '11px 16px', borderBottom: '1px solid #D8E8D8' }}>
      <span style={{ fontSize: 13, fontWeight: 500, color: '#1C2B1C' }}>{title}</span>
    </div>
  )

  return (
    <div style={{ padding: 16, background: '#F5FAF5', minHeight: '100%' }}>

      {/* Clock */}
      <div style={{ background: '#fff', border: '1px solid #D8E8D8', borderRadius: 12, padding: '14px 18px', marginBottom: 14 }}>
        <div style={{ fontSize: 28, fontWeight: 500, color: '#1C2B1C', fontVariantNumeric: 'tabular-nums', letterSpacing: -0.5, lineHeight: 1 }}>
          {timeStr}
        </div>
        <div style={{ fontSize: 12, color: '#7A9A7A', marginTop: 5 }}>{dateStr}</div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 14 }}>
        {[
          { label: 'Patients registered', value: stats?.total_patients ?? '—' },
          { label: 'Services rendered',   value: stats?.total_services ?? '—' },
          { label: 'Counselled',          value: stats?.total_counselled ?? '—' },
        ].map(({ label, value }) => (
          <div key={label} style={{ background: '#fff', border: '1px solid #D8E8D8', borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ fontSize: 11, color: '#7A9A7A', marginBottom: 6 }}>{label}</div>
            <div style={{ fontSize: 26, fontWeight: 500, color: '#1C2B1C', lineHeight: 1 }}>
              {loading ? '…' : value}
            </div>
          </div>
        ))}
      </div>

      {/* Two-column layout on wide screens */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 12, marginBottom: 12 }}>

        {/* Services breakdown */}
        {card(<>
          {cardHdr('Services breakdown')}
          {loading ? (
            <div style={{ padding: 20, textAlign: 'center', color: '#7A9A7A', fontSize: 12 }}>Loading…</div>
          ) : stats?.service_breakdown.length === 0 ? (
            <div style={{ padding: 20, textAlign: 'center', color: '#7A9A7A', fontSize: 12 }}>No services logged yet</div>
          ) : (
            stats?.service_breakdown.map(({ name, count }) => (
              <div key={name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 16px', borderBottom: '1px solid #D8E8D8' }}>
                <span style={{ fontSize: 12, color: '#3D5C3D' }}>{name}</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: '#1C2B1C', background: '#F0F7F0', border: '1px solid #C8E6C9', borderRadius: 6, padding: '2px 10px', minWidth: 36, textAlign: 'center' }}>{count}</span>
              </div>
            ))
          )}
        </>)}

        {/* Counseling breakdown */}
        {card(<>
          {cardHdr('Counseling breakdown')}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '12px 16px' }}>
            {COUNSEL_TYPES.map(type => {
              const found = stats?.counsel_breakdown.find(c => c.counsel_type === type)
              return (
                <div key={type} style={{ background: '#F0F7F0', border: '1px solid #C8E6C9', borderRadius: 8, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: '#3D5C3D' }}>{type}</span>
                  <span style={{ fontSize: 18, fontWeight: 500, color: '#1C2B1C' }}>{loading ? '…' : (found?.count ?? 0)}</span>
                </div>
              )
            })}
          </div>
        </>)}
      </div>

      {/* Export buttons */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button className="action-btn" onClick={handleExportPDF}>
          <FileText size={13} /> Export PDF
        </button>
        <button className="action-btn" onClick={handleExportCSV}>
          <Download size={13} /> CSV
        </button>
      </div>
    </div>
  )
}
