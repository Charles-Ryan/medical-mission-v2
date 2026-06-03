'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { Search, UserPlus, ClipboardList, X } from 'lucide-react'
import { toast } from 'sonner'
import { getPatients, getServices, deletePatient } from '@/lib/db'
import { PatientCard } from './PatientCard'
import { PatientForm } from './PatientForm'
import { PatientDetail } from './PatientDetail'
import type { PatientWithLogs, Service, Patient } from '@/lib/types'

const PAGE_SIZE = 20
type Tab = 'arrived' | 'pre_registered'

export function PatientsPage() {
  const [patients, setPatients] = useState<PatientWithLogs[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [filterService, setFilterService] = useState('')
  const [tab, setTab] = useState<Tab>('arrived')
  const [page, setPage] = useState(1)
  const [openId, setOpenId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formRegType, setFormRegType] = useState<'walk_in' | 'pre_registered'>('walk_in')
  const [editPatient, setEditPatient] = useState<Patient | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [pts, svcs] = await Promise.all([
        getPatients(debouncedSearch, filterService, tab),
        getServices(true),
      ])
      setPatients(pts)
      setServices(svcs)
    } catch {
      toast.error('Failed to load patients')
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, filterService, tab])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 300)
    return () => clearTimeout(debounceRef.current)
  }, [search])

  useEffect(() => { setPage(1) }, [filterService, tab])

  const handleDelete = async (patient: PatientWithLogs) => {
    if (!confirm(`Delete ${patient.full_name}? This cannot be undone.`)) return
    try {
      await deletePatient(patient.id)
      toast.success('Patient deleted')
      load()
    } catch {
      toast.error('Failed to delete patient')
    }
  }

  const openWalkIn = () => { setEditPatient(null); setFormRegType('walk_in'); setShowForm(true) }
  const openPreRegister = () => { setEditPatient(null); setFormRegType('pre_registered'); setShowForm(true) }

  const totalPages = Math.ceil(patients.length / PAGE_SIZE)
  const paginated = patients.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  if (detailId) {
    const pt = patients.find(p => p.id === detailId)
    return (
      <>
        <PatientDetail
          patientId={detailId}
          onBack={() => { setDetailId(null); load() }}
          onEdit={() => { setEditPatient(pt as Patient | null); setFormRegType((pt?.registration_type as any) ?? 'walk_in'); setShowForm(true) }}
          onDelete={() => { if (pt) handleDelete(pt); setDetailId(null) }}
        />
        {showForm && (
          <PatientForm
            patient={editPatient}
            registrationType={formRegType}
            onClose={() => { setShowForm(false); setEditPatient(null) }}
            onSaved={() => { setShowForm(false); load() }}
          />
        )}
      </>
    )
  }

  return (
    <div style={{ background: '#F2F9F2', minHeight: '100%' }}>
      {/* Sticky toolbar */}
      <div
        style={{
          background: '#fff',
          borderBottom: '1px solid #C8E0CA',
          padding: '12px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          position: 'sticky',
          top: 0,
          zIndex: 20,
          boxShadow: '0 2px 8px rgba(21,36,21,0.05)',
        }}
      >
        {/* Search row */}
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search
              size={16}
              color="#8AAA8C"
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
            />
            <input
              type="text"
              placeholder="Search by name, ID, contact…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={e => { setTimeout(() => { e.target.scrollIntoView({ behavior: 'smooth', block: 'center' }) }, 300) }}
              style={{
                width: '100%',
                padding: '12px 40px 12px 40px',
                border: '1.5px solid #C8E0CA',
                borderRadius: 12,
                fontSize: '16px',
                background: '#fff',
                color: '#152415',
                fontFamily: 'inherit',
              }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{
                  position: 'absolute',
                  right: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: '#E8F5E9',
                  border: 'none',
                  borderRadius: '50%',
                  width: 22,
                  height: 22,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#5A7E5C',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <X size={12} strokeWidth={3} />
              </button>
            )}
          </div>

          {/* Service filter */}
          <select
            value={filterService}
            onChange={e => setFilterService(e.target.value)}
            style={{
              padding: '12px 12px',
              border: '1.5px solid #C8E0CA',
              borderRadius: 12,
              fontSize: '16px',
              background: '#fff',
              color: filterService ? '#152415' : '#8AAA8C',
              minWidth: 120,
              fontFamily: 'inherit',
              fontWeight: 500,
            }}
          >
            <option value="">All services</option>
            {services.map(svc => (
              <option key={svc.id} value={svc.id}>{svc.name}</option>
            ))}
          </select>
        </div>

        {/* Tab + action row */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {/* Tabs */}
          <div
            style={{
              display: 'flex',
              flex: 1,
              background: '#F2F9F2',
              border: '1.5px solid #C8E0CA',
              borderRadius: 12,
              padding: 3,
              gap: 3,
            }}
          >
            {([
              { id: 'arrived' as Tab, label: 'Arrived' },
              { id: 'pre_registered' as Tab, label: 'Pre-reg' },
            ]).map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                style={{
                  flex: 1,
                  padding: '9px 6px',
                  fontSize: 13,
                  fontWeight: 700,
                  background: tab === id ? '#fff' : 'transparent',
                  color: tab === id ? '#1F7326' : '#8AAA8C',
                  border: 'none',
                  borderRadius: 9,
                  cursor: 'pointer',
                  boxShadow: tab === id ? '0 1px 4px rgba(21,36,21,0.10)' : 'none',
                  fontFamily: 'inherit',
                  WebkitTapHighlightColor: 'transparent',
                  transition: 'background 0.15s, color 0.15s',
                  letterSpacing: '0.01em',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Action buttons */}
          <button
            onClick={openWalkIn}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '10px 14px',
              background: '#1F7326',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              fontFamily: 'inherit',
              WebkitTapHighlightColor: 'transparent',
              minHeight: 44,
              boxShadow: '0 2px 8px rgba(31,115,38,0.25)',
            }}
          >
            <UserPlus size={15} /> Walk-in
          </button>
          <button
            onClick={openPreRegister}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '10px 14px',
              background: '#E65100',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              fontFamily: 'inherit',
              WebkitTapHighlightColor: 'transparent',
              minHeight: 44,
              boxShadow: '0 2px 8px rgba(230,81,0,0.25)',
            }}
          >
            <ClipboardList size={15} /> Pre-reg
          </button>
        </div>
      </div>

      {/* List */}
      <div style={{ padding: '12px 12px', paddingBottom: 100 }}>
        {/* Count row */}
        <div style={{ fontSize: 12, color: '#8AAA8C', marginBottom: 12, fontWeight: 600, letterSpacing: '0.02em', padding: '0 2px' }}>
          {loading ? 'Loading…' : (
            tab === 'pre_registered'
              ? `${patients.length} pre-registered · awaiting arrival`
              : `${patients.length} patient${patients.length !== 1 ? 's' : ''} arrived`
          )}
        </div>

        {!loading && paginated.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 20px', color: '#8AAA8C' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>
              {tab === 'pre_registered' ? '📋' : '🏥'}
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#5A7E5C', marginBottom: 6 }}>
              {tab === 'pre_registered'
                ? search ? 'No pre-registered patients found' : 'No pre-registered patients yet'
                : search || filterService ? 'No patients found' : 'No patients arrived yet'}
            </div>
            <div style={{ fontSize: 13, lineHeight: 1.6, maxWidth: 240, margin: '0 auto' }}>
              {tab === 'pre_registered'
                ? 'Tap "Pre-reg" to add patients before the mission.'
                : 'Tap "Walk-in" to register a walk-in patient.'}
            </div>
          </div>
        ) : (
          paginated.map(patient => (
            <PatientCard
              key={patient.id}
              patient={patient}
              activeServices={services}
              isOpen={openId === patient.id}
              onToggle={() => setOpenId(openId === patient.id ? null : patient.id)}
              onViewDetail={() => setDetailId(patient.id)}
              onEdit={() => { setEditPatient(patient); setFormRegType(patient.registration_type); setShowForm(true) }}
              onDelete={() => handleDelete(patient)}
              onRefresh={load}
            />
          ))
        )}

        {/* Pagination — Google-style adaptive window */}
        {totalPages > 1 && (() => {
          // Build the list of items to render: page numbers + ellipsis markers
          // Always show: first, last, current, and 1 neighbour on each side.
          const SIBLINGS = 1 // pages shown on each side of current
          const items: (number | 'ellipsis-start' | 'ellipsis-end')[] = []

          const rangeStart = Math.max(2, page - SIBLINGS)
          const rangeEnd   = Math.min(totalPages - 1, page + SIBLINGS)

          items.push(1)
          if (rangeStart > 2)              items.push('ellipsis-start')
          for (let p = rangeStart; p <= rangeEnd; p++) items.push(p)
          if (rangeEnd < totalPages - 1)   items.push('ellipsis-end')
          if (totalPages > 1)              items.push(totalPages)

          const btnBase = {
            flexShrink: 0,
            width: 44,
            height: 44,
            fontSize: 14,
            border: '1.5px solid #C8E0CA',
            borderRadius: 10,
            background: '#fff',
            color: '#2E4F30',
            cursor: 'pointer' as const,
            fontWeight: 700,
            fontFamily: 'inherit',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.12s, border-color 0.12s, color 0.12s',
            WebkitTapHighlightColor: 'transparent',
          }

          return (
            <div style={{ padding: '20px 0 8px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 5,
                  flexWrap: 'nowrap',
                }}
              >
                {/* ← Prev */}
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  style={{
                    ...btnBase,
                    width: 'auto',
                    padding: '0 14px',
                    gap: 4,
                    opacity: page === 1 ? 0.35 : 1,
                    cursor: page === 1 ? 'default' : 'pointer',
                  }}
                >
                  ← Prev
                </button>

                {/* Page items */}
                {items.map((item, idx) => {
                  if (item === 'ellipsis-start' || item === 'ellipsis-end') {
                    return (
                      <span
                        key={item}
                        style={{
                          width: 36,
                          height: 44,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 15,
                          color: '#8AAA8C',
                          fontWeight: 700,
                          flexShrink: 0,
                          letterSpacing: '0.05em',
                          userSelect: 'none',
                        }}
                      >
                        …
                      </span>
                    )
                  }
                  const isActive = page === item
                  return (
                    <button
                      key={item}
                      onClick={() => setPage(item)}
                      style={{
                        ...btnBase,
                        background: isActive ? '#1F7326' : '#fff',
                        color: isActive ? '#fff' : '#2E4F30',
                        border: `1.5px solid ${isActive ? '#1F7326' : '#C8E0CA'}`,
                        boxShadow: isActive ? '0 2px 8px rgba(31,115,38,0.28)' : 'none',
                        transform: isActive ? 'scale(1.05)' : 'scale(1)',
                      }}
                    >
                      {item}
                    </button>
                  )
                })}

                {/* Next → */}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  style={{
                    ...btnBase,
                    width: 'auto',
                    padding: '0 14px',
                    opacity: page === totalPages ? 0.35 : 1,
                    cursor: page === totalPages ? 'default' : 'pointer',
                  }}
                >
                  Next →
                </button>
              </div>

              {/* "Page X of Y" label below */}
              <div style={{
                textAlign: 'center',
                fontSize: 11,
                color: '#8AAA8C',
                fontWeight: 600,
                marginTop: 10,
                letterSpacing: '0.04em',
              }}>
                Page {page} of {totalPages}
              </div>
            </div>
          )
        })()}
      </div>

      {showForm && (
        <PatientForm
          patient={editPatient}
          registrationType={formRegType}
          onClose={() => { setShowForm(false); setEditPatient(null) }}
          onSaved={load}
        />
      )}
    </div>
  )
}