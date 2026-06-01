'use client'
import { useEffect, useState } from 'react'
import { FileText, Download, TrendingUp, Users, Heart, Activity } from 'lucide-react'
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

  const statCards = [
    {
      label: 'Registered',
      value: stats?.total_patients ?? '—',
      icon: Users,
      color: '#1F7326',
      bg: '#E8F5E9',
      border: '#A8D0AB',
    },
    {
      label: 'Services',
      value: stats?.total_services ?? '—',
      icon: Activity,
      color: '#1565C0',
      bg: '#E3F2FD',
      border: '#90CAF9',
    },
    {
      label: 'Counselled',
      value: stats?.total_counselled ?? '—',
      icon: Heart,
      color: '#AD1457',
      bg: '#FCE4EC',
      border: '#F48FB1',
    },
  ]

  return (
    <div
      style={{
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        background: '#F2F9F2',
      }}
    >
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          padding: 16,
          paddingBottom: 140,
        }}
      >

        {/* Clock card */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1F7326 0%, #0C3D10 100%)',
            borderRadius: 18,
            padding: '18px 20px',
            marginBottom: 16,
            boxShadow: '0 6px 24px rgba(31,115,38,0.25)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Decorative ring */}
          <div style={{
            position: 'absolute',
            top: -30,
            right: -30,
            width: 120,
            height: 120,
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.08)',
          }} />
          <div style={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 160,
            height: 160,
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.05)',
          }} />

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, position: 'relative' }}>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 40,
                  fontWeight: 700,
                  color: '#fff',
                  fontVariantNumeric: 'tabular-nums',
                  letterSpacing: '-1px',
                  lineHeight: 1,
                  marginBottom: 6,
                }}
              >
                {timeStr}
              </div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
                {dateStr}
              </div>
            </div>
            <div style={{
              padding: '6px 10px',
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 20,
              fontSize: 11,
              color: '#A5D6A7',
              fontWeight: 700,
              letterSpacing: '0.08em',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}>
              <TrendingUp size={12} />
              LIVE
            </div>
          </div>
        </div>

        {/* Stat cards */}
        <div className="stat-grid" style={{ marginBottom: 16 }}>
          {statCards.map(({ label, value, icon: Icon, color, bg, border }) => (
            <div
              key={label}
              style={{
                background: '#fff',
                border: `1px solid ${border}`,
                borderRadius: 14,
                padding: '14px 14px 16px',
                boxShadow: '0 2px 8px rgba(21,36,21,0.06)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div style={{
                position: 'absolute',
                top: -8,
                right: -8,
                width: 52,
                height: 52,
                borderRadius: '50%',
                background: bg,
                opacity: 0.6,
              }} />
              <div style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 8,
              }}>
                <Icon size={14} color={color} strokeWidth={2.5} />
              </div>
              <div style={{ fontSize: 11, color: '#8AAA8C', fontWeight: 600, letterSpacing: '0.03em', marginBottom: 4 }}>
                {label}
              </div>
              <div style={{ fontSize: 32, fontWeight: 700, color: '#152415', letterSpacing: '-1px', lineHeight: 1 }}>
                {loading ? (
                  <span style={{ fontSize: 18, color: '#C8E0CA' }}>…</span>
                ) : value}
              </div>
            </div>
          ))}
        </div>

        {/* Export buttons */}
        <div
          style={{
            display: 'flex',
            gap: 10,
            marginBottom: 16,
          }}
        >
          <button
            onClick={handleExportPDF}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '13px 16px',
              borderRadius: 12,
              border: '1.5px solid #C8E0CA',
              background: '#fff',
              color: '#1F7326',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 700,
              fontFamily: 'inherit',
              boxShadow: '0 1px 4px rgba(21,36,21,0.06)',
              transition: 'background 0.15s, border-color 0.15s',
              minHeight: 52,
            }}
          >
            <FileText size={17} />
            Export PDF
          </button>
          <button
            onClick={handleExportCSV}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '13px 16px',
              borderRadius: 12,
              border: '1.5px solid #C8E0CA',
              background: '#fff',
              color: '#1F7326',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 700,
              fontFamily: 'inherit',
              boxShadow: '0 1px 4px rgba(21,36,21,0.06)',
              transition: 'background 0.15s, border-color 0.15s',
              minHeight: 52,
            }}
          >
            <Download size={17} />
            Export CSV
          </button>
        </div>

        {/* Breakdowns grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 14,
          }}
        >
          {/* Services breakdown */}
          <div className="card">
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: '#E3F2FD', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Activity size={14} color="#1565C0" strokeWidth={2.5} />
                </div>
                <span className="card-header-title">Services</span>
              </div>
            </div>
            {loading ? (
              <div style={{ padding: 24, color: '#8AAA8C', textAlign: 'center', fontSize: 13 }}>Loading…</div>
            ) : !stats?.service_breakdown.length ? (
              <div style={{ padding: 24, color: '#8AAA8C', textAlign: 'center', fontSize: 13 }}>No services logged yet</div>
            ) : (
              stats.service_breakdown.map(({ name, count }, idx) => {
                const max = Math.max(...stats.service_breakdown.map(s => s.count))
                const pct = max > 0 ? (count / max) * 100 : 0
                return (
                  <div
                    key={name}
                    style={{
                      padding: '10px 16px',
                      borderBottom: idx < stats.service_breakdown.length - 1 ? '1px solid #F0F9F0' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: '#2E4F30' }}>{name}</span>
                      <strong style={{ fontSize: 15, fontWeight: 700, color: '#152415' }}>{count}</strong>
                    </div>
                    <div style={{ height: 5, background: '#E8F5E9', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #3A9E40, #1F7326)', borderRadius: 3, transition: 'width 0.6s ease' }} />
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Counseling breakdown */}
          <div className="card">
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: '#FCE4EC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Heart size={14} color="#AD1457" strokeWidth={2.5} />
                </div>
                <span className="card-header-title">Counseling</span>
              </div>
            </div>
            <div style={{ padding: '8px 16px 12px' }}>
              {COUNSEL_TYPES.map(type => {
                const found = stats?.counsel_breakdown.find(c => c.counsel_type === type)
                const count = found?.count ?? 0
                return (
                  <div
                    key={type}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 12px',
                      marginBottom: 6,
                      borderRadius: 10,
                      background: count > 0 ? '#F2F9F2' : '#FAFAFA',
                      border: `1px solid ${count > 0 ? '#C8E0CA' : '#F0F0F0'}`,
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#2E4F30' }}>{type}</span>
                    <strong style={{ fontSize: 16, fontWeight: 700, color: count > 0 ? '#1F7326' : '#BDBDBD' }}>
                      {count}
                    </strong>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}