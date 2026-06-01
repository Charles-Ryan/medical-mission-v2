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
    try {
      const p = await getAllPatientsForExport()
      exportToCSV(p)
      toast.success('CSV downloaded')
    } catch {
      toast.error('Export failed')
    }
  }

  const handleExportPDF = async () => {
    try {
      const p = await getAllPatientsForExport()
      await exportToPDF(p, {
        total_patients: stats?.total_patients || 0,
        total_services: stats?.total_services || 0,
        total_counselled: stats?.total_counselled || 0,
      })
      toast.success('PDF downloaded')
    } catch {
      toast.error('PDF export failed')
    }
  }

  const card = (children: React.ReactNode) => (
    <div
      style={{
        background: '#fff',
        border: '1px solid #D8E8D8',
        borderRadius: 12,
        marginBottom: 12,
        overflow: 'hidden',
      }}
    >
      {children}
    </div>
  )

  const cardHdr = (title: string, actions?: React.ReactNode) => (
    <div
      style={{
        padding: '11px 16px',
        borderBottom: '1px solid #D8E8D8',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <span style={{ fontSize: 15, fontWeight: 500, color: '#1C2B1C' }}>
        {title}
      </span>

      {actions && (
        <div style={{ display: 'flex', gap: 6 }}>
          {actions}
        </div>
      )}
    </div>
  )

  const exportButtons = (
    <>
      <button
        onClick={handleExportPDF}
        style={{
          fontSize: 13,
          fontWeight: 600,
          padding: '8px 12px',
          borderRadius: 8,
          border: '1px solid #2E7D32',
          background: '#2E7D32',
          color: '#fff',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <FileText size={16} />
        PDF
      </button>

      <button
        onClick={handleExportCSV}
        style={{
          fontSize: 13,
          fontWeight: 600,
          padding: '8px 12px',
          borderRadius: 8,
          border: '1px solid #2E7D32',
          background: '#2E7D32',
          color: '#fff',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <Download size={16} />
        CSV
      </button>
    </>
  )

  return (
    <div
      style={{
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        background: '#F5FAF5',
      }}
    >
      {/* SCROLLABLE AREA */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          padding: 16,
          paddingBottom: 140,
        }}
      >

        {/* Clock */}
        <div
          style={{
            background: '#fff',
            border: '1px solid #D8E8D8',
            borderRadius: 12,
            padding: '14px 18px',
            marginBottom: 14,
          }}
        >
          <div
            style={{
              fontSize: 32,
              fontWeight: 500,
              color: '#1C2B1C',
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: -0.5,
              lineHeight: 1,
            }}
          >
            {timeStr}
          </div>
          <div style={{ fontSize: 14, color: '#7A9A7A', marginTop: 5 }}>
            {dateStr}
          </div>
        </div>

        {/* Stat cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3,1fr)',
            gap: 10,
            marginBottom: 14,
          }}
        >
          {[
            { label: 'Patients registered', value: stats?.total_patients ?? '—' },
            { label: 'Services rendered', value: stats?.total_services ?? '—' },
            { label: 'Counselled', value: stats?.total_counselled ?? '—' },
          ].map(({ label, value }) => (
            <div
              key={label}
              style={{
                background: '#fff',
                border: '1px solid #D8E8D8',
                borderRadius: 12,
                padding: '14px 16px',
              }}
            >
              <div style={{ fontSize: 13, color: '#7A9A7A', marginBottom: 6 }}>
                {label}
              </div>
              <div style={{ fontSize: 30, fontWeight: 500, color: '#1C2B1C' }}>
                {loading ? '…' : value}
              </div>
            </div>
          ))}
        </div>

        {/* Export Buttons */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 12,
            marginBottom: 14,
            flexWrap: 'wrap',
          }}
        >
          {exportButtons}
        </div>

        {/* Breakdown */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 12,
            marginBottom: 12,
          }}
        >

          {/* SERVICES */}
          {card(
            <>
              {cardHdr('Services breakdown')}

              {loading ? (
                <div style={{ padding: 20, color: '#7A9A7A' }}>Loading…</div>
              ) : stats?.service_breakdown.length === 0 ? (
                <div style={{ padding: 20, color: '#7A9A7A' }}>
                  No services logged yet
                </div>
              ) : (
                stats?.service_breakdown.map(({ name, count }) => (
                  <div
                    key={name}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '9px 16px',
                      borderBottom: '1px solid #D8E8D8',
                    }}
                  >
                    <span>{name}</span>
                    <strong>{count}</strong>
                  </div>
                ))
              )}
            </>
          )}

          {/* Counseling */}
          {card(
            <>
              {cardHdr('Counseling breakdown')}
              <div style={{ padding: 12 }}>
                {COUNSEL_TYPES.map(type => {
                  const found = stats?.counsel_breakdown.find(
                    c => c.counsel_type === type
                  )
                  return (
                    <div
                      key={type}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '8px 10px',
                        marginBottom: 8,
                        borderRadius: 8,
                        borderBottom: '1px solid #D8E8D8',
                      }}
                    >
                      <span>{type}</span>
                      <strong>{found?.count ?? 0}</strong>
                    </div>
                  )
                })}
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  )
}