'use client'
import { useState, useEffect, useCallback } from 'react'
import { ArrowLeft, Pencil, Trash2, Activity, Heart, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { getPatient, logService, logCounsel, removeService, removeCounsel, getServices } from '@/lib/db'
import { format } from 'date-fns'
import type { PatientWithLogs, Service } from '@/lib/types'

const COUNSEL_TYPES = ['Salvation', 'Baptism', 'Assurance', 'Prayer for Health'] as const

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
  const [showAddService, setShowAddService] = useState(false)
  const [showAddCounsel, setShowAddCounsel] = useState(false)
  const [counselorName, setCounselorName] = useState('')

  const load = useCallback(async () => {
    try {
      const [p, svcs] = await Promise.all([getPatient(patientId), getServices(true)])
      setPatient(p)
      setServices(svcs)
      const savedCounselor = localStorage.getItem(`counselorName_${patientId}`) || ''
      setCounselorName(savedCounselor)
    } catch { toast.error('Failed to load patient') }
    finally { setLoading(false) }
  }, [patientId])

  useEffect(() => { load() }, [load])

  const handleLogService = async (svc: Service) => {
    try {
      await logService(patientId, svc.id)
      toast.success(`${svc.name} recorded`)
      load()
      setShowAddService(false)
    } catch { toast.error('Failed to log service') }
  }

  const handleLogCounsel = async (type: typeof COUNSEL_TYPES[number]) => {
    try {
      await logCounsel(patientId, type, counselorName.trim() || null)
      toast.success(`${type} recorded`)
      setCounselorName('')
      load()
      setShowAddCounsel(false)
    } catch { toast.error('Failed to log counseling') }
  }

  const handleRemoveService = async (id: string) => {
    try { await removeService(id); toast.success('Service removed'); load() }
    catch { toast.error('Failed') }
  }

  const handleRemoveCounsel = async (id: string) => {
    try { await removeCounsel(id); toast.success('Counseling removed'); load() }
    catch { toast.error('Failed') }
  }

  if (loading || !patient) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#7A9A7A' }}>
        {loading ? 'Loading…' : 'Patient not found'}
      </div>
    )
  }

  const paddedId = String(patient.patient_number).padStart(3, '0')
  const initials = patient.full_name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
  const loggedServiceIds = new Set(patient.patient_services.map(ps => ps.service_id))

  return (
    <div style={{ padding: 14, background: '#F5FAF5', minHeight: '100%' }}>
      {/* Back header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2E7D32', display: 'flex', alignItems: 'center', gap: 3, fontSize: 12 }}>
          <ArrowLeft size={14} /> Patients
        </button>
        <span style={{ fontSize: 13, fontWeight: 500, color: '#1C2B1C' }}>Patient details</span>
        <span style={{ marginLeft: 'auto', fontSize: 11, background: '#C8E6C9', color: '#1B5E20', border: '1px solid #A5D6A7', padding: '2px 9px', borderRadius: 20 }}>#{paddedId}</span>
      </div>

      {/* Profile card */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, background: '#fff', border: '1px solid #D8E8D8', borderRadius: 12, marginBottom: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#C8E6C9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 500, color: '#2E7D32', flexShrink: 0, border: '1px solid #A5D6A7' }}>
          {initials}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 500, color: '#1C2B1C' }}>{patient.full_name}</div>
          <div style={{ fontSize: 12, color: '#3D5C3D', marginTop: 2 }}>{patient.age} yrs · {patient.gender} · #{paddedId}</div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="action-btn sm" onClick={onEdit}><Pencil size={11} /> Edit</button>
          <button className="action-btn sm danger" onClick={onDelete}><Trash2 size={11} /> Delete</button>
        </div>
      </div>

      {/* Full info */}
      <div style={{ background: '#fff', border: '1px solid #D8E8D8', borderRadius: 12, marginBottom: 12, overflow: 'hidden' }}>
        <div style={{ padding: '11px 14px', borderBottom: '1px solid #D8E8D8' }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: '#1C2B1C' }}>Full information</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '12px 14px' }}>
          <div><label style={{ fontSize: 10, color: '#7A9A7A', textTransform: 'uppercase', letterSpacing: '.05em', display: 'block', marginBottom: 3 }}>Contact</label><span style={{ fontSize: 12, fontWeight: 500, color: '#1C2B1C' }}>{patient.contact_number || '—'}</span></div>
          <div><label style={{ fontSize: 10, color: '#7A9A7A', textTransform: 'uppercase', letterSpacing: '.05em', display: 'block', marginBottom: 3 }}>Gender</label><span style={{ fontSize: 12, fontWeight: 500, color: '#1C2B1C' }}>{patient.gender}</span></div>
          <div style={{ gridColumn: '1/-1' }}><label style={{ fontSize: 10, color: '#7A9A7A', textTransform: 'uppercase', letterSpacing: '.05em', display: 'block', marginBottom: 3 }}>Address</label><span style={{ fontSize: 12, fontWeight: 500, color: '#1C2B1C' }}>{patient.address || '—'}</span></div>
          {patient.medical_history && (
            <div style={{ gridColumn: '1/-1' }}><label style={{ fontSize: 10, color: '#7A9A7A', textTransform: 'uppercase', letterSpacing: '.05em', display: 'block', marginBottom: 3 }}>Medical history</label><span style={{ fontSize: 11, color: '#3D5C3D', fontWeight: 400 }}>{patient.medical_history}</span></div>
          )}
        </div>
      </div>

      {/* Services received */}
      <div style={{ background: '#fff', border: '1px solid #D8E8D8', borderRadius: 12, marginBottom: 12, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid #D8E8D8' }}>
          <span style={{ fontSize: 12, fontWeight: 500, color: '#1C2B1C', display: 'flex', alignItems: 'center', gap: 6 }}><Activity size={13} /> Services received</span>
          <button className="action-btn sm" onClick={() => setShowAddService(s => !s)}><Plus size={11} /> Add</button>
        </div>
        {showAddService && (
          <div style={{ padding: 12, borderBottom: '1px solid #D8E8D8', background: '#EEF6EE' }}>
            <div style={{ fontSize: 10, fontWeight: 500, color: '#7A9A7A', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 7 }}>Select service to log</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {services.map(svc => {
                const done = loggedServiceIds.has(svc.id)
                return (
                  <button key={svc.id} onClick={() => !done && handleLogService(svc)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 10px', background: done ? '#C8E6C9' : '#fff', border: `1px solid ${done ? '#BDBDBD' : '#B8D8B2'}`, borderRadius: 20, fontSize: 11, color: done ? '#9E9E9E' : '#2E7D32', cursor: done ? 'default' : 'pointer', whiteSpace: 'nowrap' }}>
                    {svc.name}
                  </button>
                )
              })}
            </div>
          </div>
        )}
        {patient.patient_services.length === 0 ? (
          <div style={{ padding: 20, textAlign: 'center', color: '#7A9A7A', fontSize: 12 }}>No services logged yet</div>
        ) : (
          patient.patient_services.map(ps => (
            <div key={ps.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, padding: '9px 14px', borderBottom: '1px solid #D8E8D8' }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#1565C0', marginTop: 4, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: '#1C2B1C' }}>{ps.service?.name}</div>
                <div style={{ fontSize: 10, color: '#7A9A7A', marginTop: 2 }}>{format(new Date(ps.logged_at), 'MMM d, yyyy · h:mm a')}</div>
              </div>
              <button onClick={() => handleRemoveService(ps.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7A9A7A', padding: 2 }}>✕</button>
            </div>
          ))
        )}
      </div>

      {/* Counseling received */}
      <div style={{ background: '#fff', border: '1px solid #D8E8D8', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid #D8E8D8' }}>
          <span style={{ fontSize: 12, fontWeight: 500, color: '#1C2B1C', display: 'flex', alignItems: 'center', gap: 6 }}><Heart size={13} /> Counseling received</span>
          <button className="action-btn sm" onClick={() => setShowAddCounsel(s => !s)}><Plus size={11} /> Add</button>
        </div>
        {showAddCounsel && (
          <div style={{ padding: 12, borderBottom: '1px solid #D8E8D8', background: '#EEF6EE' }}>
            <div style={{ fontSize: 10, fontWeight: 500, color: '#7A9A7A', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 7 }}>Counselor: {counselorName || 'Not set'}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {COUNSEL_TYPES.map(type => (
                <button key={type} onClick={() => handleLogCounsel(type)}
                  style={{ padding: '5px 10px', background: '#fff', border: '1px solid #B8D8B2', borderRadius: 20, fontSize: 11, color: '#2E7D32', cursor: 'pointer' }}>
                  {type}
                </button>
              ))}
            </div>
          </div>
        )}
        {patient.counsel_logs.length === 0 ? (
          <div style={{ padding: 20, textAlign: 'center', color: '#7A9A7A', fontSize: 12 }}>No counseling logged yet</div>
        ) : (
          patient.counsel_logs.map(cl => (
            <div key={cl.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, padding: '9px 14px', borderBottom: '1px solid #D8E8D8' }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#2E7D32', marginTop: 4, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: '#1C2B1C' }}>{cl.counsel_type}</div>
                <div style={{ fontSize: 10, color: '#7A9A7A', marginTop: 2 }}>
                  {format(new Date(cl.logged_at), 'MMM d, yyyy · h:mm a')}
                  {cl.counselor_name && ` · ${cl.counselor_name}`}
                </div>
              </div>
              <button onClick={() => handleRemoveCounsel(cl.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7A9A7A', padding: 2 }}>✕</button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
