'use client'
import { useState, useEffect } from 'react'
import { X, ChevronDown, ChevronUp } from 'lucide-react'
import { toast } from 'sonner'
import { createPatient, updatePatient, getNextPatientNumber } from '@/lib/db'
import type { Patient } from '@/lib/types'

interface PatientFormProps {
  patient?: Patient | null
  onClose: () => void
  onSaved: () => void
}

export function PatientForm({ patient, onClose, onSaved }: PatientFormProps) {
  const isEdit = !!patient

  const [nextNum, setNextNum] = useState<number | null>(null)
  const [medOpen, setMedOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const [form, setForm] = useState({
    full_name: patient?.full_name || '',
    age: patient?.age?.toString() || '',
    gender: (patient?.gender || 'Male') as 'Male' | 'Female',
    contact_number: patient?.contact_number || '',
    address: patient?.address || '',
    medical_history: patient?.medical_history || '',
  })

  useEffect(() => {
    if (!isEdit) getNextPatientNumber().then(setNextNum)
  }, [isEdit])

  // Detect mobile/tablet
  useEffect(() => {
    const update = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    update()

    window.addEventListener('resize', update)

    return () => window.removeEventListener('resize', update)
  }, [])

  // Auto scroll focused inputs into view
  useEffect(() => {
    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement

      setTimeout(() => {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })
      }, 300)
    }

    document.addEventListener('focusin', handleFocus)

    return () => {
      document.removeEventListener('focusin', handleFocus)
    }
  }, [])

  const set = (key: string, val: string) =>
    setForm(f => ({ ...f, [key]: val }))

  const handleSubmit = async () => {
    if (!form.full_name.trim()) {
      toast.error('Full name is required')
      return
    }

    if (!form.age || isNaN(Number(form.age))) {
      toast.error('Valid age is required')
      return
    }

    setSaving(true)

    try {
      const payload = {
        full_name: form.full_name.trim(),
        age: Number(form.age),
        gender: form.gender,
        contact_number: form.contact_number.trim() || null,
        address: form.address.trim() || null,
        medical_history: form.medical_history.trim() || null,
      }

      if (isEdit) {
        await updatePatient(patient!.id, payload)
        toast.success('Patient updated')
      } else {
        await createPatient(payload)
        toast.success('Patient registered')
      }

      onSaved()
      onClose()
    } catch {
      toast.error('Failed to save patient')
    } finally {
      setSaving(false)
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '9px 11px',
    border: '1px solid #B8D8B2',
    borderRadius: 8,
    fontSize: 13,
    background: '#fff',
    color: '#757575',
  }

  const labelStyle = {
    fontSize: 11,
    fontWeight: 500 as const,
    color: '#3D5C3D',
    marginBottom: 4,
    display: 'block' as const,
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: isMobile ? 'stretch' : 'flex-end',
        justifyContent: 'center',
        zIndex: 100,
        padding: isMobile ? 0 : 16,
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          background: '#F5FAF5',
          borderRadius: isMobile ? '0' : '16px 16px 0 0',
          width: '100%',
          maxWidth: 600,
          minHeight: isMobile ? '100dvh' : 'auto',
          maxHeight: '100dvh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '14px 16px',
            background: '#fff',
            borderBottom: '1px solid #D8E8D8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontSize: 15,
              fontWeight: 500,
              color: '#1C2B1C',
            }}
          >
            {isEdit ? 'Edit patient' : 'New patient'}
          </span>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#7A9A7A',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable content */}
        <div
          style={{
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            padding: 16,
            paddingBottom: 120,
            flex: 1,
          }}
        >
          {/* Auto ID */}
          {!isEdit && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '11px 14px',
                background: '#F0F7F0',
                border: '1px solid #C8E6C9',
                borderRadius: 8,
                marginBottom: 16,
              }}
            >
              <span
                style={{
                  fontSize: 20,
                  fontWeight: 500,
                  color: '#2E7D32',
                }}
              >
                #{nextNum ? String(nextNum).padStart(3, '0') : '…'}
              </span>

              <div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    color: '#2E7D32',
                  }}
                >
                  Auto-assigned ID
                </div>

                <div
                  style={{
                    fontSize: 10,
                    color: '#7A9A7A',
                    marginTop: 2,
                  }}
                >
                  Registered immediately on save
                </div>
              </div>
            </div>
          )}

          {/* Required */}
          <div
            style={{
              fontSize: 10,
              fontWeight: 500,
              color: '#7A9A7A',
              letterSpacing: '.07em',
              textTransform: 'uppercase',
              marginBottom: 10,
            }}
          >
            Required
          </div>

          {/* Full name */}
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>
              Full name <span style={{ color: '#C62828' }}>*</span>
            </label>

            <input
              style={inputStyle}
              type="text"
              placeholder="e.g. Maria Santos"
              value={form.full_name}
              onChange={e => set('full_name', e.target.value)}
            />
          </div>

          {/* Age + Gender */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: 10,
              marginBottom: 12,
            }}
          >
            <div>
              <label style={labelStyle}>
                Age <span style={{ color: '#C62828' }}>*</span>
              </label>

              <input
                style={inputStyle}
                type="number"
                placeholder="e.g. 42"
                value={form.age}
                onChange={e => set('age', e.target.value)}
                min={0}
                max={150}
              />
            </div>

            <div>
              <label style={labelStyle}>
                Gender <span style={{ color: '#C62828' }}>*</span>
              </label>

              <div
                style={{
                  display: 'flex',
                  gap: 6,
                  flexWrap: 'wrap',
                }}
              >
                {(['Male', 'Female'] as const).map(g => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => set('gender', g)}
                    style={{
                      flex: isMobile ? 1 : undefined,
                      padding: '9px 16px',
                      borderRadius: 20,
                      fontSize: 12,
                      cursor: 'pointer',
                      background:
                        form.gender === g ? '#2E7D32' : '#fff',
                      color:
                        form.gender === g ? '#fff' : '#3D5C3D',
                      border: `1px solid ${
                        form.gender === g
                          ? '#2E7D32'
                          : '#B8D8B2'
                      }`,
                      fontWeight:
                        form.gender === g ? 500 : 400,
                    }}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div
            style={{
              height: 1,
              background: '#D8E8D8',
              margin: '14px 0',
            }}
          />

          {/* Contact */}
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Contact number</label>

            <input
              style={inputStyle}
              type="tel"
              placeholder="09171234567"
              value={form.contact_number}
              onChange={e => set('contact_number', e.target.value)}
            />
          </div>

          {/* Address */}
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Address</label>

            <input
              style={inputStyle}
              type="text"
              placeholder="Barangay / City"
              value={form.address}
              onChange={e => set('address', e.target.value)}
            />
          </div>

          {/* Medical history */}
          <div
            onClick={() => setMedOpen(o => !o)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '9px 12px',
              background: '#EEF6EE',
              border: '1px solid #D8E8D8',
              borderRadius: 8,
              cursor: 'pointer',
              marginBottom: 6,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: '#3D5C3D',
                }}
              >
                Medical history
              </div>

              <div
                style={{
                  fontSize: 10,
                  color: '#7A9A7A',
                }}
              >
                Optional — tap to expand
              </div>
            </div>

            {medOpen ? (
              <ChevronUp size={13} color="#7A9A7A" />
            ) : (
              <ChevronDown size={13} color="#7A9A7A" />
            )}
          </div>

          {medOpen && (
            <div style={{ marginBottom: 10 }}>
              <textarea
                style={{
                  ...inputStyle,
                  resize: 'vertical',
                  minHeight: 72,
                  fontFamily: 'inherit',
                }}
                placeholder="Known conditions, allergies, medications…"
                value={form.medical_history}
                onChange={e =>
                  set('medical_history', e.target.value)
                }
              />

              <div
                style={{
                  fontSize: 10,
                  color: '#7A9A7A',
                  marginTop: 4,
                }}
              >
                Only visible in patient details — never shown in the list
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px 16px',
            background: '#fff',
            borderTop: '1px solid #D8E8D8',
            display: 'flex',
            gap: 8,
            flexShrink: 0,
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '10px 16px',
              border: '1px solid #B8D8B2',
              borderRadius: 8,
              fontSize: 13,
              background: '#fff',
              color: '#757575',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>

          <button
            className="action-btn"
            onClick={handleSubmit}
            disabled={saving}
            style={{
              flex: 1,
              justifyContent: 'center',
              padding: '10px 16px',
              fontSize: 13,
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving
              ? 'Saving…'
              : isEdit
              ? 'Save changes →'
              : 'Save & register →'}
          </button>
        </div>
      </div>
    </div>
  )
}