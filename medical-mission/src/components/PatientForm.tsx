'use client'

import { useState, useEffect, useRef } from 'react'
import { X, ChevronDown, ChevronUp } from 'lucide-react'
import { toast } from 'sonner'
import {
  createPatient,
  updatePatient,
  getNextPatientNumber,
} from '@/lib/db'
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
  }, 350)
}

export function PatientForm({
  patient,
  onClose,
  onSaved,
}: PatientFormProps) {
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
    if (!isEdit) {
      getNextPatientNumber().then(setNextNum)
    }
  }, [isEdit])

  const set = (key: string, val: string) =>
    setForm(f => ({
      ...f,
      [key]: val,
    }))

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
    padding: '14px 14px',
    border: '1px solid #B8D8B2',
    borderRadius: 10,
    fontSize: 16,
    background: '#fff',
    color: '#1C2B1C',
    outline: 'none',
  }

  const labelStyle = {
    fontSize: 11,
    fontWeight: 500 as const,
    color: '#3D5C3D',
    marginBottom: 4,
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        zIndex: 999,
        overflowY: 'auto',
        overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch',
        padding: '20px 12px 120px',
      }}
    >
      <div
        style={{
          background: '#F5FAF5',
          borderRadius: 18,
          width: '100%',
          maxWidth: 600,
          margin: '0 auto',
          minHeight: 'fit-content',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
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
            position: 'sticky',
            top: 0,
            zIndex: 20,
          }}
        >
          <span
            style={{
              fontSize: 15,
              fontWeight: 600,
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
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div
          style={{
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: 16,
            flex: 1,
            WebkitOverflowScrolling: 'touch',
            paddingBottom: 200,
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
                borderRadius: 10,
                marginBottom: 16,
              }}
            >
              <span
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: '#2E7D32',
                }}
              >
                #{nextNum ? String(nextNum).padStart(3, '0') : '...'}
              </span>

              <div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
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

          {/* Full name */}
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>
              Full name
              <span style={{ color: '#D32F2F', fontSize: 12 }}>*</span>
            </label>

            <input
              required
              ref={fullNameRef}
              style={inputStyle}
              type="text"
              value={form.full_name}
              placeholder="Enter full name"
              onFocus={() => keyboardSafeScroll(fullNameRef.current)}
              onChange={e => set('full_name', e.target.value)}
            />
          </div>

          {/* Age + Gender */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                typeof window !== 'undefined' &&
                window.innerWidth < 768
                  ? '1fr'
                  : '1fr 1fr',
              gap: 12,
              marginBottom: 14,
            }}
          >
            <div>
              <label style={labelStyle}>
                Age
                <span style={{ color: '#D32F2F', fontSize: 12 }}>*</span>
              </label>

              <input
                required
                ref={ageRef}
                style={inputStyle}
                type="number"
                value={form.age}
                placeholder="Age"
                onFocus={() => keyboardSafeScroll(ageRef.current)}
                onChange={e => set('age', e.target.value)}
              />
            </div>

            <div>
              <label style={labelStyle}>
                Gender
                <span style={{ color: '#D32F2F', fontSize: 12 }}>*</span>
              </label>

              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  flexWrap: 'wrap',
                }}
              >
                {(['Male', 'Female'] as const).map(g => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => set('gender', g)}
                    style={{
                      flex: 1,
                      minWidth: 100,
                      padding: '12px 16px',
                      borderRadius: 999,
                      fontSize: 14,
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
                    }}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Contact */}
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Contact number</label>

            <input
              ref={contactRef}
              style={inputStyle}
              type="tel"
              value={form.contact_number}
              placeholder="09XXXXXXXXX"
              onFocus={() => keyboardSafeScroll(contactRef.current)}
              onChange={e => set('contact_number', e.target.value)}
            />
          </div>

          {/* Address */}
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Address</label>

            <input
              ref={addressRef}
              style={inputStyle}
              type="text"
              value={form.address}
              placeholder="Enter address"
              onFocus={() => keyboardSafeScroll(addressRef.current)}
              onChange={e => set('address', e.target.value)}
            />
          </div>

          {/* Medical history toggle */}
          <div
            onClick={() => setMedOpen(o => !o)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              background: '#EEF6EE',
              border: '1px solid #D8E8D8',
              borderRadius: 10,
              cursor: 'pointer',
              marginBottom: 8,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#3D5C3D',
                }}
              >
                Medical history
              </div>
            </div>

            {medOpen ? (
              <ChevronUp size={15} color="#7A9A7A" />
            ) : (
              <ChevronDown size={15} color="#7A9A7A" />
            )}
          </div>

          {medOpen && (
            <textarea
              ref={medicalRef}
              style={{
                ...inputStyle,
                resize: 'vertical',
                minHeight: 120,
                fontFamily: 'inherit',
              }}
              value={form.medical_history}
              onFocus={() => keyboardSafeScroll(medicalRef.current)}
              onChange={e =>
                set('medical_history', e.target.value)
              }
            />
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
            position: 'sticky',
            bottom: 0,
            zIndex: 20,
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '12px 16px',
              border: '1px solid #B8D8B2',
              borderRadius: 10,
              fontSize: 14,
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
              padding: '12px 16px',
              fontSize: 14,
            }}
          >
            {saving
              ? 'Saving...'
              : isEdit
              ? 'Save changes →'
              : 'Save & register →'}
          </button>
        </div>
      </div>
    </div>
  )
}