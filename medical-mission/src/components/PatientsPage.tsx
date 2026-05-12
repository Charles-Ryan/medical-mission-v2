'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { Search, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { getPatients, getServices, deletePatient } from '@/lib/db'
import { PatientCard } from './PatientCard'
import { PatientForm } from './PatientForm'
import { PatientDetail } from './PatientDetail'
import type { PatientWithLogs, Service, Patient } from '@/lib/types'

const PAGE_SIZE = 20

export function PatientsPage() {
  const [patients, setPatients] = useState<PatientWithLogs[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [filterService, setFilterService] = useState('')
  const [page, setPage] = useState(1)
  const [openId, setOpenId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editPatient, setEditPatient] = useState<Patient | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [pts, svcs] = await Promise.all([
        getPatients(debouncedSearch, filterService),
        getServices(true),
      ])
      setPatients(pts)
      setServices(svcs)
    } catch {
      toast.error('Failed to load patients')
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, filterService])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 300)
    return () => clearTimeout(debounceRef.current)
  }, [search])

  useEffect(() => {
    setPage(1)
  }, [filterService])

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

  const totalPages = Math.ceil(patients.length / PAGE_SIZE)
  const paginated = patients.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  if (detailId) {
    const pt = patients.find(p => p.id === detailId)
    return (
      <>
        <PatientDetail
          patientId={detailId}
          onBack={() => { setDetailId(null); load() }}
          onEdit={() => { setEditPatient(pt as Patient | null); setShowForm(true) }}
          onDelete={() => {
            if (pt) handleDelete(pt)
            setDetailId(null)
          }}
        />
        {showForm && (
          <PatientForm
            patient={editPatient}
            onClose={() => { setShowForm(false); setEditPatient(null) }}
            onSaved={() => { setShowForm(false); load() }}
          />
        )}
      </>
    )
  }

  return (
    <div
      style={{
        background: '#F5FAF5',
        height: '100dvh',
        overflowY: 'auto',
        overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch',
        paddingBottom: '120px',
      }}
    >
      {/* Search, filter, and add */}
      <div
        className="mobile-stack"
        style={{
          background: '#fff',
          borderBottom: '1px solid #D8E8D8',
          padding: '12px 14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 10,
          position: 'sticky',
          top: 0,
          zIndex: 20,
        }}
      >
        <div
          className="mobile-stack"
          style={{
            display: 'flex',
            gap: 8,
            alignItems: 'center',
            flex: 1,
            width: '100%',
          }}
        >
          <div
            className="mobile-full"
            style={{
              maxWidth: '60%',
              flex: 1,
              position: 'relative',
            }}
          >
            <Search
              size={15}
              color="#7A9A7A"
              style={{
                position: 'absolute',
                left: 9,
                top: '50%',
                transform: 'translateY(-50%)',
              }}
            />

            <input
              type="text"
              placeholder="Search by name, ID, or contact…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={(e) => {
                setTimeout(() => {
                  e.target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                  })
                }, 300)
              }}
              style={{
                width: '100%',
                padding: '12px 12px 12px 34px',
                border: '1px solid #B8D8B2',
                borderRadius: 10,
                fontSize: 16,
                background: '#fff',
                color: '#757575',
              }}
            />
          </div>

          <select
            className="mobile-full"
            value={filterService}
            onChange={e => setFilterService(e.target.value)}
            onFocus={(e) => {
              setTimeout(() => {
                e.target.scrollIntoView({
                  behavior: 'smooth',
                  block: 'center',
                })
              }, 300)
            }}
            style={{
              padding: '12px 10px',
              border: '1px solid #B8D8B2',
              borderRadius: 10,
              fontSize: 16,
              background: '#fff',
              color: '#757575',
              minWidth: 120,
            }}
          >
            <option value="">All services</option>

            {services.map(svc => (
              <option key={svc.id} value={svc.id}>
                {svc.name}
              </option>
            ))}
          </select>
        </div>

        <button
          className="action-btn mobile-btn"
          onClick={() => {
            setEditPatient(null)
            setShowForm(true)
          }}
        >
          <Plus size={13} /> Add
        </button>
      </div>

      <div
        style={{
          padding: 14,
          paddingBottom: 180,
          minHeight: 'calc(100dvh - 120px)',
        }}
      >
        <div style={{ fontSize: 13, color: '#7A9A7A', marginBottom: 10 }}>
          {loading ? 'Loading…' : `${patients.length} patient${patients.length !== 1 ? 's' : ''} ${filterService ? 'with selected service' : 'registered'} · showing ${patients.length === 0 ? 0 : Math.min((page-1)*PAGE_SIZE+1, patients.length)}–${Math.min(page*PAGE_SIZE, patients.length)}`}
        </div>

        {!loading && paginated.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#7A9A7A', fontSize: 15 }}>
            {search || filterService ? 'No patients found matching your search/filter.' : 'No patients registered yet. Tap "Add" to register the first patient.'}
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
              onEdit={() => { setEditPatient(patient); setShowForm(true) }}
              onDelete={() => handleDelete(patient)}
              onRefresh={load}
            />
          ))
        )}

        {totalPages > 1 && (
            <div
              style={{
                position: 'sticky',
                bottom: 0,
                background: '#F5FAF5',
                padding: '12px 10px',
                borderTop: '1px solid #D8E8D8',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 10,
                zIndex: 10,
              }}
            >
              {/* Previous */}
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  flex: 1,
                  padding: '10px',
                  fontSize: 13,
                  border: '1px solid #D8E8D8',
                  borderRadius: 10,
                  background: '#fff',
                  color: '#3D5C3D',
                  opacity: page === 1 ? 0.5 : 1,
                  cursor: page === 1 ? 'default' : 'pointer',
                }}
              >
                ← Previous
              </button>
            
              {/* Page indicator */}
              <div
                style={{
                  fontSize: 13,
                  color: '#2E7D32',
                  fontWeight: 500,
                  minWidth: 80,
                  textAlign: 'center',
                }}
              >
                {page} / {totalPages}
              </div>
              {/* Next */}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={{
                  flex: 1,
                  padding: '10px',
                  fontSize: 13,
                  border: '1px solid #D8E8D8',
                  borderRadius: 10,
                  background: '#fff',
                  color: '#3D5C3D',
                  opacity: page === totalPages ? 0.5 : 1,
                  cursor: page === totalPages ? 'default' : 'pointer',
                }}
              >
                Next →
              </button>
            </div>
        )}
      </div>

      {showForm && (
        <PatientForm
          patient={editPatient}
          onClose={() => { setShowForm(false); setEditPatient(null) }}
          onSaved={load}
        />
      )}
    </div>
  )
}
