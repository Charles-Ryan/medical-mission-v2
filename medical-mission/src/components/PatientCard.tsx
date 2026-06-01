'use client'
import { useState, useEffect, useRef } from 'react'
import { ChevronDown, User, Phone, MapPin, Eye, Pencil, Trash2, Check, Save, CheckCircle, Clock, Heart } from 'lucide-react'
import { toast } from 'sonner'
import { logService, logCounsel, markPatientArrived } from '@/lib/db'
import type { PatientWithLogs, Service } from '@/lib/types'

const COUNSEL_TYPES = ['Salvation', 'Baptism', 'Assurance', 'Prayer for Health'] as const

interface PatientCardProps {
  patient: PatientWithLogs
  activeServices: Service[]
  isOpen: boolean
  onToggle: () => void
  onViewDetail: () => void
  onEdit: () => void
  onDelete: () => void
  onRefresh: () => void
}

export function PatientCard({
  patient, activeServices, isOpen, onToggle,
  onViewDetail, onEdit, onDelete, onRefresh,
}: PatientCardProps) {
  const [counselorName, setCounselorName] = useState('')
  const [tempCounselorName, setTempCounselorName] = useState('')
  const [logging, setLogging] = useState<string | null>(null)
  const [markingArrived, setMarkingArrived] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(`counselorName_${patient.id}`) || '' : ''
    setCounselorName(saved)
    setTempCounselorName(saved)
  }, [patient.id])

  const handleSaveCounselorName = () => {
    const name = tempCounselorName.trim()
    setCounselorName(name)
    localStorage.setItem(`counselorName_${patient.id}`, name)
    toast.success('Counselor name saved')
  }

  const loggedServiceIds = new Set(patient.patient_services.map(ps => ps.service_id))
  const loggedCounselTypes = new Set(patient.counsel_logs.map(cl => cl.counsel_type))

  const handleLogService = async (service: Service) => {
    if (logging) return
    setLogging(service.id)
    try {
      await logService(patient.id, service.id)
      toast.success(`${service.name} recorded`)
      onRefresh()
    } catch {
      toast.error('Failed to log service')
    } finally {
      setLogging(null)
    }
  }

  const handleLogCounsel = async (type: typeof COUNSEL_TYPES[number]) => {
    if (logging || loggedCounselTypes.has(type)) return
    setLogging(type)
    try {
      await logCounsel(patient.id, type, counselorName.trim() || null)
      toast.success(`${type} recorded${counselorName.trim() ? ` · ${counselorName.trim()}` : ''}`)
      onRefresh()
    } catch {
      toast.error('Failed to log counseling')
    } finally {
      setLogging(null)
    }
  }

  const handleMarkArrived = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setMarkingArrived(true)
    try {
      await markPatientArrived(patient.id)
      toast.success(`${patient.full_name} marked as arrived`)
      onRefresh()
    } catch {
      toast.error('Failed to mark as arrived')
    } finally {
      setMarkingArrived(false)
    }
  }

  const isPreRegPending = patient.registration_type === 'pre_registered' && !patient.is_arrived
  const paddedId = patient.patient_number != null
    ? String(patient.patient_number).padStart(3, '0')
    : '—'

  return (
    <div
      style={{
        background: '#fff',
        border: `1.5px solid ${isPreRegPending ? '#FFE082' : isOpen ? '#5DAF62' : '#C8E0CA'}`,
        borderRadius: 14,
        marginBottom: 10,
        overflow: 'hidden',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        boxShadow: isOpen
          ? '0 4px 16px rgba(31,115,38,0.12)'
          : '0 1px 4px rgba(21,36,21,0.06)',
      }}
    >
      {/* Pre-reg banner */}
      {isPreRegPending && (
        <div
          style={{
            background: '#FFF8E1',
            borderBottom: '1px solid #FFE082',
            padding: '8px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
          }}
        >
          <span style={{ fontSize: 12, color: '#E65100', display: 'flex', alignItems: 'center', gap: 5, fontWeight: 600 }}>
            <Clock size={12} /> Pre-registered · awaiting arrival
          </span>
          <button
            onClick={handleMarkArrived}
            disabled={markingArrived}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '6px 12px',
              background: '#1F7326',
              border: 'none',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 700,
              color: '#fff',
              cursor: markingArrived ? 'default' : 'pointer',
              opacity: markingArrived ? 0.7 : 1,
              WebkitTapHighlightColor: 'transparent',
              minHeight: 36,
              fontFamily: 'inherit',
            }}
          >
            <CheckCircle size={12} />
            {markingArrived ? 'Marking…' : 'Mark arrived'}
          </button>
        </div>
      )}

      {/* Main row — clickable */}
      <div
        onClick={onToggle}
        style={{
          padding: '13px 14px',
          display: 'flex',
          alignItems: 'flex-start',
          cursor: 'pointer',
          WebkitTapHighlightColor: 'transparent',
          gap: 10,
        }}
      >
        {/* Patient number */}
        <div
          style={{
            flexShrink: 0,
            width: 36,
            height: 36,
            borderRadius: 10,
            background: isPreRegPending ? '#FFF3E0' : '#E8F5E9',
            border: `1px solid ${isPreRegPending ? '#FFE082' : '#A8D0AB'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 11,
            fontWeight: 700,
            color: isPreRegPending ? '#E65100' : '#1F7326',
            letterSpacing: '0.02em',
          }}
        >
          {patient.patient_number != null ? paddedId : '—'}
        </div>

        {/* Name + info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#152415', letterSpacing: '-0.01em' }}>
            {patient.full_name}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', columnGap: 10, rowGap: 3, marginTop: 4 }}>
            <span style={{ fontSize: 12, color: '#5A7E5C', display: 'flex', alignItems: 'center', gap: 3, fontWeight: 500 }}>
              <User size={11} color="#8AAA8C" />{patient.age} yrs, {patient.gender}
            </span>
            {patient.contact_number && (
              <span style={{ fontSize: 12, color: '#5A7E5C', display: 'flex', alignItems: 'center', gap: 3, fontWeight: 500 }}>
                <Phone size={11} color="#8AAA8C" />{patient.contact_number}
              </span>
            )}
            {patient.address && (
              <span style={{ fontSize: 12, color: '#5A7E5C', display: 'flex', alignItems: 'center', gap: 3, fontWeight: 500 }}>
                <MapPin size={11} color="#8AAA8C" />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 140 }}>
                  {patient.address}
                </span>
              </span>
            )}
          </div>

          {/* Tags */}
          {(patient.patient_services.length > 0 || patient.counsel_logs.length > 0) && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 7 }}>
              {patient.patient_services.map(ps => (
                <span key={ps.id} className="badge service">
                  <Check size={9} strokeWidth={3} /> {ps.service?.name}
                </span>
              ))}
              {patient.counsel_logs.map(cl => (
                <span key={cl.id} className="badge counsel">
                  <Heart size={9} strokeWidth={2.5} /> {cl.counsel_type}
                  {cl.counselor_name ? ` · ${cl.counselor_name}` : ''}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Chevron */}
        <div
          style={{
            flexShrink: 0,
            width: 30,
            height: 30,
            borderRadius: 9,
            background: isOpen ? '#D6EED8' : '#F2F9F2',
            border: `1px solid ${isOpen ? '#A8D0AB' : '#C8E0CA'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            alignSelf: 'flex-start',
            transition: 'background 0.15s, border-color 0.15s',
          }}
        >
          <ChevronDown
            size={15}
            color={isOpen ? '#1F7326' : '#8AAA8C'}
            strokeWidth={2.5}
            style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
          />
        </div>
      </div>

      {/* Expanded panel */}
      {isOpen && (
        <div className="card-panel" style={{ borderTop: '1px solid #E8F5E9', padding: '14px 14px 18px', background: '#F2F9F2' }}>

          {isPreRegPending ? (
            <div style={{ textAlign: 'center', padding: '8px 0 12px' }}>
              <div style={{ fontSize: 13, color: '#8AAA8C', marginBottom: 14, lineHeight: 1.5 }}>
                Services and counseling can be logged<br />after the patient arrives.
              </div>
              <button
                onClick={handleMarkArrived}
                disabled={markingArrived}
                className="btn-primary"
                style={{ maxWidth: 260, margin: '0 auto' }}
              >
                <CheckCircle size={16} />
                {markingArrived ? 'Marking as arrived…' : 'Mark as arrived'}
              </button>
              <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'center' }}>
                <button className="action-btn sm" onClick={e => { e.stopPropagation(); onEdit() }}>
                  <Pencil size={12} /> Edit
                </button>
                <button className="action-btn sm danger" onClick={e => { e.stopPropagation(); onDelete() }}>
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Services */}
              <div className="section-label" style={{ marginBottom: 8 }}>Add service</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 14 }}>
                {activeServices.map(svc => {
                  const done = loggedServiceIds.has(svc.id)
                  return (
                    <button
                      key={svc.id}
                      onClick={() => !done && handleLogService(svc)}
                      disabled={logging !== null}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        padding: '9px 14px',
                        background: done ? '#C8E6C9' : '#fff',
                        border: `1.5px solid ${done ? '#8EC892' : '#C8E0CA'}`,
                        borderRadius: 20,
                        fontSize: 13,
                        fontWeight: 600,
                        color: done ? '#1F7326' : '#2E4F30',
                        cursor: done ? 'default' : 'pointer',
                        whiteSpace: 'nowrap',
                        minHeight: 40,
                        fontFamily: 'inherit',
                        WebkitTapHighlightColor: 'transparent',
                        transition: 'background 0.12s, border-color 0.12s',
                        opacity: logging && logging !== svc.id ? 0.6 : 1,
                      }}
                    >
                      {done && <Check size={13} strokeWidth={3} />}
                      {svc.name}
                    </button>
                  )
                })}
              </div>

              <div className="divider" />

              {/* Counseling */}
              <div className="section-label" style={{ marginBottom: 10 }}>Add counseling</div>

              {/* Counselor name row */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                <input
                  ref={inputRef}
                  type="text"
                  value={tempCounselorName}
                  onChange={e => setTempCounselorName(e.target.value)}
                  placeholder="Counselor name (optional)…"
                  onClick={e => e.stopPropagation()}
                  onFocus={e => {
                    e.stopPropagation()
                    setTimeout(() => { e.target.scrollIntoView({ behavior: 'smooth', block: 'center' }) }, 350)
                  }}
                  style={{
                    flex: 1,
                    padding: '12px 14px',
                    fontSize: '16px',
                    borderRadius: 10,
                    border: '1.5px solid #C8E0CA',
                    minWidth: 0,
                    background: '#fff',
                    color: '#152415',
                    fontFamily: 'inherit',
                  }}
                />
                <button
                  onClick={handleSaveCounselorName}
                  style={{
                    padding: '10px 14px',
                    background: '#1F7326',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    fontFamily: 'inherit',
                    WebkitTapHighlightColor: 'transparent',
                    minHeight: 48,
                    flexShrink: 0,
                  }}
                >
                  <Save size={14} /> Save
                </button>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {COUNSEL_TYPES.map(type => {
                  const done = loggedCounselTypes.has(type)
                  return (
                    <button
                      key={type}
                      onClick={() => handleLogCounsel(type)}
                      disabled={logging !== null || done}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        padding: '9px 14px',
                        background: done ? '#8EC892' : '#fff',
                        border: `1.5px solid ${done ? '#5DAF62' : '#C8E0CA'}`,
                        borderRadius: 20,
                        fontSize: 13,
                        fontWeight: 600,
                        color: done ? '#0C3D10' : '#2E4F30',
                        cursor: done ? 'default' : 'pointer',
                        whiteSpace: 'nowrap',
                        minHeight: 40,
                        fontFamily: 'inherit',
                        WebkitTapHighlightColor: 'transparent',
                        transition: 'background 0.12s, border-color 0.12s',
                      }}
                    >
                      {done && <Check size={13} strokeWidth={3} />}
                      {type}
                    </button>
                  )
                })}
              </div>

              {/* Footer actions */}
              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  marginTop: 14,
                  paddingTop: 14,
                  borderTop: '1px solid #D6EED8',
                }}
              >
                <button className="action-btn sm" onClick={e => { e.stopPropagation(); onViewDetail() }}>
                  <Eye size={13} /> Details
                </button>
                <button className="action-btn sm" onClick={e => { e.stopPropagation(); onEdit() }}>
                  <Pencil size={13} /> Edit
                </button>
                <button className="action-btn sm danger" style={{ marginLeft: 'auto' }} onClick={e => { e.stopPropagation(); onDelete() }}>
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}