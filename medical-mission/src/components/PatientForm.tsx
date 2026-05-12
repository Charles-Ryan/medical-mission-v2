'use client'
import { useState, useEffect, useRef } from 'react'
import { X, ChevronDown, ChevronUp } from 'lucide-react'
import { toast } from 'sonner'
import { createPatient, updatePatient, getNextPatientNumber } from '@/lib/db'
import type { Patient } from '@/lib/types'

interface PatientFormProps {
  patient?: Patient | null
  onClose: () => void
  onSaved: () => void
}

function keyboardSafeScroll(el: HTMLElement | null) {
  if (!el) return

  setTimeout(() => {
    el.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    })
  }, 250)
}

export function PatientForm({ patient, onClose, onSaved }: PatientFormProps) {
  const isEdit = !!patient

  const [nextNum, setNextNum] = useState<number | null>(null)
  const [medOpen, setMedOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const fullNameRef = useRef<HTMLInputElement>(null)
  const ageRef = useRef<HTMLInputElement>(null)
  const contactRef = useRef<HTMLInputElement>(null)
  const addressRef = useRef<HTMLInputElement>(null)
  const medicalRef = useRef<HTMLTextAreaElement>(null)

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
    padding: '11px 12px',
    border: '1px solid #B8D8B2',
    borderRadius: 8,
    fontSize: 16,
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
        alignItems: 'flex-end',
        justifyContent: 'center',
        zIndex: 100,
      }}
    >
      <div
        style={{
          background: '#F5FAF5',
          borderRadius: '16px 16px 0 0',
          width: '100%',
          maxWidth: 600,
          height: '100dvh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            padding: '14px 16px',
            background: '#fff',
            borderBottom: '1px solid #D8E8D8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ fontSize: 15, fontWeight: 500, color: '#1C2B1C' }}>
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

        <div
          style={{
            overflowY: 'auto',
            padding: 16,
            flex: 1,
            WebkitOverflowScrolling: 'touch',
            paddingBottom: 180,
          }}
        >
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

          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Full name</label>

            <input
              ref={fullNameRef}
              style={inputStyle}
              type="text"
              value={form.full_name}
              onFocus={() => keyboardSafeScroll(fullNameRef.current)}
              onChange={e => set('full_name', e.target.value)}
            />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 10,
              marginBottom: 12,
            }}
          >
            <div>
              <label style={labelStyle}>Age</label>

              <input
                ref={ageRef}
                style={inputStyle}
                type="number"
                value={form.age}
                onFocus={() => keyboardSafeScroll(ageRef.current)}
                onChange={e => set('age', e.target.value)}
              />
            </div>

            <div>
              <label style={labelStyle}>Gender</label>

              <div style={{ display: 'flex', gap: 6 }}>
                {(['Male', 'Female'] as const).map(g => (
                  <button
                    key={g}
                    onClick={() => set('gender', g)}
                    style={{
                      padding: '9px 16px',
                      borderRadius: 20,
                      fontSize: 12,
                      cursor: 'pointer',
                      background:
                        form.gender === g ? '#2E7D32' : '#fff',
                      color:
                        form.gender === g ? '#fff' : '#3D5C3D',
                      border: `1px solid ${
                        form.gender === g ? '#2E7D32' : '#B8D8B2'
                      }`,
                    }}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Contact number</label>

            <input
              ref={contactRef}
              style={inputStyle}
              type="tel"
              value={form.contact_number}
              onFocus={() => keyboardSafeScroll(contactRef.current)}
              onChange={e => set('contact_number', e.target.value)}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Address</label>

            <input
              ref={addressRef}
              style={inputStyle}
              type="text"
              value={form.address}
              onFocus={() => keyboardSafeScroll(addressRef.current)}
              onChange={e => set('address', e.target.value)}
            />
          </div>

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
            </div>

            {medOpen ? (
              <ChevronUp size={13} color="#7A9A7A" />
            ) : (
              <ChevronDown size={13} color="#7A9A7A" />
            )}
          </div>

          {medOpen && (
            <textarea
              ref={medicalRef}
              style={{
                ...inputStyle,
                resize: 'vertical',
                minHeight: 90,
                fontFamily: 'inherit',
              }}
              value={form.medical_history}
              onFocus={() => keyboardSafeScroll(medicalRef.current)}
              onChange={e => set('medical_history', e.target.value)}
            />
          )}
        </div>

        <div
          style={{
            padding: '12px 16px',
            background: '#fff',
            borderTop: '1px solid #D8E8D8',
            display: 'flex',
            gap: 8,
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