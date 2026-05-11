'use client'
import { useState, useEffect, useRef } from 'react'
import { ChevronDown, User, Phone, MapPin, Eye, Pencil, Trash2, Check, Save } from 'lucide-react'
import { toast } from 'sonner'
import { logService, logCounsel } from '@/lib/db'
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
    toast.success('Counselor name recorded')
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

  const paddedId = String(patient.patient_number).padStart(3, '0')

  return (
    <div style={{
      background: '#fff',
      border: `1px solid ${isOpen ? '#4CAF50' : '#D8E8D8'}`,
      borderRadius: 12,
      marginBottom: 8,
      overflow: 'hidden',
      transition: 'border-color .15s',
    }}>
      {/* Main row */}
      <div onClick={onToggle} style={{ padding: '12px 14px', display: 'flex', alignItems: 'flex-start', cursor: 'pointer' }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: '#7A9A7A', flexShrink: 0, width: 32, paddingTop: 2 }}>
          {paddedId}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 500, color: '#1C2B1C' }}>{patient.full_name}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', columnGap: 10, rowGap: 3, marginTop: 4 }}>
            <span style={{ fontSize: 13, color: '#3D5C3D', display: 'flex', alignItems: 'center', gap: 3 }}>
              <User size={12} color="#7A9A7A" />{patient.age} yrs, {patient.gender}
            </span>
            {patient.contact_number && (
              <span style={{ fontSize: 13, color: '#3D5C3D', display: 'flex', alignItems: 'center', gap: 3 }}>
                <Phone size={12} color="#7A9A7A" />{patient.contact_number}
              </span>
            )}
            {patient.address && (
              <span style={{ fontSize: 13, color: '#3D5C3D', display: 'flex', alignItems: 'center', gap: 3 }}>
                <MapPin size={12} color="#7A9A7A" />{patient.address}
              </span>
            )}
          </div>
          {/* Tags */}
          {(patient.patient_services.length > 0 || patient.counsel_logs.length > 0) && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
              {patient.patient_services.map(ps => (
                <span key={ps.id} style={{ fontSize: 10, padding: '2px 7px', borderRadius: 20, border: '1px solid #A5D6A7', color: '#1B5E20', background: '#C8E6C9' }}>
                  {ps.service?.name}
                </span>
              ))}
              {patient.counsel_logs.map(cl => (
                <span key={cl.id} style={{ fontSize: 10, padding: '2px 7px', borderRadius: 20, border: '1px solid #4CAF50', color: '#1B5E20', background: '#A5D6A7' }}>
                  {cl.counsel_type}{cl.counselor_name ? ` · ${cl.counselor_name}` : ''}
                </span>
              ))}
            </div>
          )}
        </div>
        {/* Chevron */}
        <div style={{
          flexShrink: 0, width: 26, height: 26, borderRadius: 8,
          background: isOpen ? '#C8E6C9' : '#EEF6EE',
          border: `1px solid ${isOpen ? '#A5D6A7' : '#D8E8D8'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          alignSelf: 'flex-start', marginLeft: 8,
        }}>
          <ChevronDown
            size={14}
            color={isOpen ? '#2E7D32' : '#7A9A7A'}
            style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}
          />
        </div>
      </div>

      {/* Action panel */}
      {isOpen && (
        <div style={{ borderTop: '1px solid #D8E8D8', padding: '12px 14px', background: '#EEF6EE' }}>
          {/* Services */}
          <div style={{ fontSize: 10, fontWeight: 500, color: '#7A9A7A', letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: 7 }}>
            Add service
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 12 }}>
            {activeServices.map(svc => {
              const done = loggedServiceIds.has(svc.id)
              return (
                <button
                  key={svc.id}
                  onClick={() => !done && handleLogService(svc)}
                  disabled={logging !== null}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    padding: '5px 10px', background: done ? '#C8E6C9' : '#fff',
                    border: `1px solid ${done ? '#BDBDBD' : '#B8D8B2'}`,
                    borderRadius: 20, fontSize: 11,
                    color: done ? '#9E9E9E' : '#2E7D32',
                    cursor: done ? 'default' : 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {done && <Check size={11} />}{svc.name}
                </button>
              )
            })}
          </div>

          {/* Separator */}
          <div style={{ height: 1, background: '#D8E8D8', margin: '10px 0' }} />

          {/* Counseling */}
          <div style={{ fontSize: 10, fontWeight: 500, color: '#7A9A7A', letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: 7 }}>
            Add counseling
          </div>
          {/* Counselor name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <input
              ref={inputRef}
              type="text"
              value={tempCounselorName}
              onChange={e => setTempCounselorName(e.target.value)}
              placeholder="Enter counselor name…"
              onClick={e => e.stopPropagation()}
              style={{ flex: 1, padding: '6px 10px', fontSize: 12, borderRadius: 8, border: '1px solid #B8D8B2' }}
            />
            <button onClick={handleSaveCounselorName} style={{ padding: '6px 12px', background: '#2E7D32', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Save size={12} /> Save
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {COUNSEL_TYPES.map(type => {
              const done = loggedCounselTypes.has(type)
              return (
                <button
                  key={type}
                  onClick={() => handleLogCounsel(type)}
                  disabled={logging !== null || done}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    padding: '5px 10px', background: done ? '#A5D6A7' : '#fff',
                    border: `1px solid ${done ? '#BDBDBD' : '#B8D8B2'}`,
                    borderRadius: 20, fontSize: 11,
                    color: done ? '#9E9E9E' : '#2E7D32',
                    cursor: done ? 'default' : 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {done && <Check size={11} />}{type}
                </button>
              )
            })}
          </div>

          {/* Footer actions */}
          <div style={{ display: 'flex', gap: 6, marginTop: 10, paddingTop: 10, borderTop: '1px solid #D8E8D8' }}>
            <button className="action-btn sm" onClick={e => { e.stopPropagation(); onViewDetail() }}>
              <Eye size={11} /> View details
            </button>
            <button className="action-btn sm" onClick={e => { e.stopPropagation(); onEdit() }}>
              <Pencil size={11} /> Edit
            </button>
            <button className="action-btn sm danger" onClick={e => { e.stopPropagation(); onDelete() }}>
              <Trash2 size={11} /> Delete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
