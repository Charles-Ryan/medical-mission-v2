'use client'
import { useState, useEffect, useCallback } from 'react'
import { ArrowLeft, Trash2, Activity, Heart, CheckCircle, Clock, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { getPatient, removeService, removeCounsel, getServices, markPatientArrived } from '@/lib/db'
import { format } from 'date-fns'
import type { PatientWithLogs, Service } from '@/lib/types'

interface PatientDetailProps {
  patientId: string
  onBack: () => void
  onEdit: () => void
  onDelete: () => void
}

export function PatientDetail({ patientId, onBack, onEdit, onDelete }: PatientDetailProps) {
  const [patient, setPatient] = useState<PatientWithLogs | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [markingArrived, setMarkingArrived] = useState(false)

  const load = useCallback(async () => {
    try {
      const [p, svcs] = await Promise.all([getPatient(patientId), getServices(true)])
      setPatient(p)
      setServices(svcs)
    } catch { toast.error('Failed to load patient') }
    finally { setLoading(false) }
  }, [patientId])

  useEffect(() => { load() }, [load])

  const handleRemoveService = async (id: string) => {
    try { await removeService(id); toast.success('Service removed'); load() }
    catch { toast.error('Failed') }
  }

  const handleRemoveCounsel = async (id: string) => {
    try { await removeCounsel(id); toast.success('Counseling removed'); load() }
    catch { toast.error('Failed') }
  }

  const handleMarkArrived = async () => {
    setMarkingArrived(true)
    try {
      await markPatientArrived(patientId)
      toast.success('Patient marked as arrived')
      load()
    } catch {
      toast.error('Failed to mark as arrived')
    } finally {
      setMarkingArrived(false)
    }
  }

  if (loading || !patient) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#8AAA8C', fontSize: 14 }}>
        {loading ? 'Loading…' : 'Patient not found'}
      </div>
    )
  }

  const isPreRegPending = patient.registration_type === 'pre_registered' && !patient.is_arrived
  const paddedId = patient.patient_number != null
    ? String(patient.patient_number).padStart(3, '0')
    : '—'
  const initials = patient.full_name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div style={{ padding: 14, background: '#F2F9F2', minHeight: '100%', paddingBottom: 40 }}>

      {/* Back header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 14,
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: '#fff',
            border: '1.5px solid #C8E0CA',
            borderRadius: 10,
            cursor: 'pointer',
            color: '#1F7326',
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            fontSize: 13,
            fontWeight: 700,
            padding: '8px 14px',
            fontFamily: 'inherit',
            WebkitTapHighlightColor: 'transparent',
            minHeight: 40,
          }}
        >
          <ArrowLeft size={15} /> Back
        </button>

        <span style={{ fontSize: 15, fontWeight: 700, color: '#152415', flex: 1 }}>Patient details</span>

        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            background: isPreRegPending ? '#FFF8E1' : '#E8F5E9',
            color: isPreRegPending ? '#E65100' : '#1F7326',
            border: `1.5px solid ${isPreRegPending ? '#FFE082' : '#A8D0AB'}`,
            padding: '4px 12px',
            borderRadius: 20,
            letterSpacing: '0.04em',
          }}
        >
          {isPreRegPending ? 'Pre-registered' : `#${paddedId}`}
        </span>
      </div>

      {/* Pre-reg arrival prompt */}
      {isPreRegPending && (
        <div
          style={{
            background: '#FFF8E1',
            border: '1.5px solid #FFE082',
            borderRadius: 14,
            padding: '14px 16px',
            marginBottom: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <span style={{ fontSize: 13, color: '#E65100', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
            <Clock size={14} /> Awaiting arrival
          </span>
          <button
            onClick={handleMarkArrived}
            disabled={markingArrived}
            className="btn-primary"
            style={{ width: 'auto', padding: '10px 16px', fontSize: 13, minHeight: 44 }}
          >
            <CheckCircle size={14} />
            {markingArrived ? 'Marking…' : 'Mark as arrived'}
          </button>
        </div>
      )}

      {/* Profile card */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: '16px',
          background: '#fff',
          border: '1px solid #C8E0CA',
          borderRadius: 16,
          marginBottom: 12,
          boxShadow: '0 2px 8px rgba(21,36,21,0.06)',
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #8EC892 0%, #5DAF62 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            fontWeight: 700,
            color: '#fff',
            flexShrink: 0,
            boxShadow: '0 3px 10px rgba(31,115,38,0.2)',
            letterSpacing: '0.02em',
          }}
        >
          {initials}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: '#152415', letterSpacing: '-0.02em' }}>
            {patient.full_name}
          </div>
          <div style={{ fontSize: 13, color: '#5A7E5C', marginTop: 3, fontWeight: 500 }}>
            {patient.age} yrs · {patient.gender}
            {patient.patient_number != null ? ` · #${paddedId}` : ''}
          </div>
          {patient.arrived_at && (
            <div style={{ fontSize: 11, color: '#8AAA8C', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
              <CheckCircle size={11} color="#3A9E40" />
              Arrived {format(new Date(patient.arrived_at), 'MMM d, yyyy · h:mm a')}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          <button className="action-btn sm" onClick={onEdit}>
            <Pencil size={12} />
          </button>
          <button className="action-btn sm danger" onClick={onDelete}>
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Info grid */}
      <div
        style={{
          background: '#fff',
          border: '1px solid #C8E0CA',
          borderRadius: 14,
          marginBottom: 12,
          overflow: 'hidden',
          boxShadow: '0 1px 4px rgba(21,36,21,0.04)',
        }}
      >
        {[
          { label: 'Contact', value: patient.contact_number || '—' },
          { label: 'Gender', value: patient.gender },
          { label: 'Address', value: patient.address || '—' },
          { label: 'Type', value: patient.registration_type === 'walk_in' ? 'Walk-in' : 'Pre-registered', highlight: isPreRegPending },
        ].map(({ label, value, highlight }, idx) => (
          <div
            key={label}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              padding: '11px 16px',
              borderBottom: idx < 3 ? '1px solid #F0F9F0' : 'none',
              gap: 10,
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 700, color: '#8AAA8C', textTransform: 'uppercase', letterSpacing: '0.06em', width: 72, flexShrink: 0, paddingTop: 1 }}>
              {label}
            </span>
            <span style={{ fontSize: 13, fontWeight: 600, color: highlight ? '#E65100' : '#152415', flex: 1 }}>
              {value}
            </span>
          </div>
        ))}
        {patient.medical_history && (
          <div style={{ padding: '11px 16px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#8AAA8C', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>Medical history</div>
            <span style={{ fontSize: 13, color: '#2E4F30', lineHeight: 1.6 }}>{patient.medical_history}</span>
          </div>
        )}
      </div>

      {/* Services received */}
      <div className="card" style={{ marginBottom: 12 }}>
        <div className="card-header">
          <span className="card-header-title" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <Activity size={14} color="#1565C0" /> Services received
          </span>
          <span style={{ fontSize: 12, color: '#8AAA8C', fontWeight: 600 }}>
            {patient.patient_services.length}
          </span>
        </div>
        {patient.patient_services.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#8AAA8C', fontSize: 13 }}>
            No services logged yet
          </div>
        ) : (
          patient.patient_services.map((ps, idx) => (
            <div
              key={ps.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                padding: '11px 16px',
                borderBottom: idx < patient.patient_services.length - 1 ? '1px solid #F0F9F0' : 'none',
              }}
            >
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#1565C0', marginTop: 4, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#152415' }}>{ps.service?.name}</div>
                <div style={{ fontSize: 11, color: '#8AAA8C', marginTop: 2 }}>
                  {format(new Date(ps.logged_at), 'MMM d, yyyy · h:mm a')}
                </div>
              </div>
              <button
                onClick={() => handleRemoveService(ps.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#8AAA8C',
                  padding: 4,
                  fontSize: 16,
                  lineHeight: 1,
                  WebkitTapHighlightColor: 'transparent',
                  minWidth: 32,
                  minHeight: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 6,
                }}
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>

      {/* Counseling received */}
      <div className="card">
        <div className="card-header">
          <span className="card-header-title" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <Heart size={14} color="#AD1457" /> Counseling received
          </span>
          <span style={{ fontSize: 12, color: '#8AAA8C', fontWeight: 600 }}>
            {patient.counsel_logs.length}
          </span>
        </div>
        {patient.counsel_logs.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#8AAA8C', fontSize: 13 }}>
            No counseling logged yet
          </div>
        ) : (
          patient.counsel_logs.map((cl, idx) => (
            <div
              key={cl.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                padding: '11px 16px',
                borderBottom: idx < patient.counsel_logs.length - 1 ? '1px solid #F0F9F0' : 'none',
              }}
            >
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#1F7326', marginTop: 4, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#152415' }}>{cl.counsel_type}</div>
                <div style={{ fontSize: 11, color: '#8AAA8C', marginTop: 2 }}>
                  {format(new Date(cl.logged_at), 'MMM d, yyyy · h:mm a')}
                  {cl.counselor_name ? ` · ${cl.counselor_name}` : ''}
                </div>
              </div>
              <button
                onClick={() => handleRemoveCounsel(cl.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#8AAA8C',
                  padding: 4,
                  fontSize: 16,
                  lineHeight: 1,
                  WebkitTapHighlightColor: 'transparent',
                  minWidth: 32,
                  minHeight: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 6,
                }}
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}