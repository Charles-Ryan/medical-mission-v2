'use client'
import { useState, useEffect, useRef } from 'react'
import { X, ChevronDown, ChevronUp } from 'lucide-react'
import { toast } from 'sonner'
import { createPatient, updatePatient, getNextPatientNumber } from '@/lib/db'
import type { Patient } from '@/lib/types'

interface PatientFormProps {
  patient?: Patient | null
  registrationType?: 'walk_in' | 'pre_registered'
  onClose: () => void
  onSaved: () => void
}

function keyboardSafeScroll(el: HTMLElement | null) {
  if (!el) return
  setTimeout(() => {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, 350)
}

export function PatientForm({
  patient,
  registrationType = 'walk_in',
  onClose,
  onSaved,
}: PatientFormProps) {
  const isEdit = !!patient
  const regType = patient?.registration_type ?? registrationType

  const [nextNum, setNextNum] = useState<number | null>(null)
  const [medOpen, setMedOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const fullNameRef = useRef<HTMLInputElement>(null)
  const ageRef      = useRef<HTMLInputElement>(null)
  const contactRef  = useRef<HTMLInputElement>(null)
  const addressRef  = useRef<HTMLInputElement>(null)
  const medicalRef  = useRef<HTMLTextAreaElement>(null)

  const [form, setForm] = useState({
    full_name:       patient?.full_name       || '',
    age:             patient?.age?.toString() || '',
    gender:          (patient?.gender || 'Male') as 'Male' | 'Female',
    contact_number:  patient?.contact_number  || '',
    address:         patient?.address         || '',
    medical_history: patient?.medical_history || '',
  })

  useEffect(() => {
    if (!isEdit && regType === 'walk_in') {
      getNextPatientNumber().then(setNextNum)
    }
  }, [isEdit, regType])

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }))

  const handleSubmit = async () => {
    if (!form.full_name.trim()) { toast.error('Full name is required'); return }
    if (!form.age || isNaN(Number(form.age))) { toast.error('Valid age is required'); return }

    setSaving(true)
    try {
      const payload = {
        full_name:       form.full_name.trim(),
        age:             Number(form.age),
        gender:          form.gender,
        contact_number:  form.contact_number.trim() || null,
        address:         form.address.trim()        || null,
        medical_history: form.medical_history.trim() || null,
      }
      if (isEdit) {
        await updatePatient(patient!.id, payload)
        toast.success('Patient updated')
      } else {
        await createPatient({ ...payload, registration_type: regType, is_arrived: regType === 'walk_in' })
        toast.success(regType === 'walk_in' ? 'Walk-in patient registered' : 'Patient pre-registered')
      }
      onSaved()
      onClose()
    } catch {
      toast.error('Failed to save patient')
    } finally {
      setSaving(false)
    }
  }

  const isPreReg = regType === 'pre_registered'

  const inputStyle = {
    width: '100%',
    padding: '14px 16px',
    border: '1.5px solid #C8E0CA',
    borderRadius: 12,
    fontSize: '16px',
    background: '#fff',
    color: '#152415',
    fontFamily: 'inherit',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  }

  const labelStyle = {
    fontSize: 12,
    fontWeight: 700 as const,
    color: '#2E4F30',
    marginBottom: 6,
    display: 'block',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  }

  return (
    <div className="page-modal-overlay" onClick={onClose}>
      <div className="page-modal" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div
          style={{
            padding: '16px 18px',
            background: '#fff',
            borderBottom: '1px solid #C8E0CA',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 20,
          }}
        >
          <div>
            <span style={{ fontSize: 17, fontWeight: 700, color: '#152415', letterSpacing: '-0.02em' }}>
              {isEdit ? 'Edit patient' : isPreReg ? 'Pre-register patient' : 'Walk-in registration'}
            </span>
            {!isEdit && (
              <div style={{ fontSize: 12, color: isPreReg ? '#E65100' : '#1F7326', marginTop: 3, fontWeight: 600 }}>
                {isPreReg ? 'ID assigned on arrival' : 'ID assigned immediately on save'}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#F2F9F2',
              border: '1px solid #C8E0CA',
              borderRadius: 10,
              cursor: 'pointer',
              color: '#8AAA8C',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 36,
              height: 36,
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div
          style={{
            overflowY: 'auto',
            padding: '18px 18px',
            flex: 1,
            WebkitOverflowScrolling: 'touch',
            paddingBottom: 220,
          }}
        >
          {/* ID badge */}
          {!isEdit && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '14px 16px',
                background: isPreReg ? '#FFF8E1' : '#E8F5E9',
                border: `1.5px solid ${isPreReg ? '#FFE082' : '#A8D0AB'}`,
                borderRadius: 14,
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: isPreReg ? '#E65100' : '#1F7326',
                  letterSpacing: '-1px',
                  lineHeight: 1,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {isPreReg ? '#—' : `#${nextNum ? String(nextNum).padStart(3, '0') : '...'}`}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: isPreReg ? '#E65100' : '#1F7326' }}>
                  {isPreReg ? 'ID assigned on arrival' : 'Auto-assigned on save'}
                </div>
                <div style={{ fontSize: 12, color: '#8AAA8C', marginTop: 3 }}>
                  {isPreReg
                    ? 'Mark as arrived on mission day'
                    : 'Patient registered immediately'}
                </div>
              </div>
            </div>
          )}

          {/* Full name */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>
              Full name <span style={{ color: '#C62828', textTransform: 'none', fontWeight: 400 }}>*</span>
            </label>
            <input
              ref={fullNameRef}
              style={inputStyle}
              type="text"
              value={form.full_name}
              placeholder="Enter full name"
              onFocus={() => keyboardSafeScroll(fullNameRef.current)}
              onChange={e => set('full_name', e.target.value)}
              autoComplete="name"
            />
          </div>

          {/* Age + Gender */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>
                Age <span style={{ color: '#C62828', textTransform: 'none', fontWeight: 400 }}>*</span>
              </label>
              <input
                ref={ageRef}
                style={inputStyle}
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                value={form.age}
                placeholder="Age"
                onFocus={() => keyboardSafeScroll(ageRef.current)}
                onChange={e => set('age', e.target.value)}
              />
            </div>
            <div>
              <label style={labelStyle}>
                Gender <span style={{ color: '#C62828', textTransform: 'none', fontWeight: 400 }}>*</span>
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['Male', 'Female'] as const).map(g => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => set('gender', g)}
                    style={{
                      flex: 1,
                      padding: '13px 8px',
                      borderRadius: 12,
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: 'pointer',
                      background: form.gender === g ? '#1F7326' : '#fff',
                      color: form.gender === g ? '#fff' : '#5A7E5C',
                      border: `1.5px solid ${form.gender === g ? '#1F7326' : '#C8E0CA'}`,
                      fontFamily: 'inherit',
                      WebkitTapHighlightColor: 'transparent',
                      transition: 'background 0.12s, color 0.12s, border-color 0.12s',
                      minHeight: 48,
                    }}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Contact */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Contact number</label>
            <input
              ref={contactRef}
              style={inputStyle}
              type="tel"
              inputMode="tel"
              value={form.contact_number}
              placeholder="09XXXXXXXXX"
              onFocus={() => keyboardSafeScroll(contactRef.current)}
              onChange={e => set('contact_number', e.target.value)}
              autoComplete="tel"
            />
          </div>

          {/* Address */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Address</label>
            <input
              ref={addressRef}
              style={inputStyle}
              type="text"
              value={form.address}
              placeholder="Enter address"
              onFocus={() => keyboardSafeScroll(addressRef.current)}
              onChange={e => set('address', e.target.value)}
              autoComplete="street-address"
            />
          </div>

          {/* Medical history toggle */}
          <button
            type="button"
            onClick={() => setMedOpen(o => !o)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              padding: '14px 16px',
              background: '#E8F5E9',
              border: '1.5px solid #C8E0CA',
              borderRadius: medOpen ? '12px 12px 0 0' : 12,
              cursor: 'pointer',
              marginBottom: medOpen ? 0 : 0,
              fontFamily: 'inherit',
              WebkitTapHighlightColor: 'transparent',
              transition: 'background 0.15s',
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 700, color: '#2E4F30' }}>
              Medical history (optional)
            </span>
            {medOpen
              ? <ChevronUp size={16} color="#8AAA8C" />
              : <ChevronDown size={16} color="#8AAA8C" />
            }
          </button>

          {medOpen && (
            <textarea
              ref={medicalRef}
              style={{
                ...inputStyle,
                resize: 'vertical',
                minHeight: 120,
                borderRadius: '0 0 12px 12px',
                borderTop: 'none',
              }}
              value={form.medical_history}
              placeholder="Enter relevant medical history…"
              onFocus={() => keyboardSafeScroll(medicalRef.current)}
              onChange={e => set('medical_history', e.target.value)}
            />
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '14px 18px',
            background: '#fff',
            borderTop: '1px solid #C8E0CA',
            display: 'flex',
            gap: 10,
            position: 'sticky',
            bottom: 0,
            zIndex: 20,
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '14px 20px',
              border: '1.5px solid #C8E0CA',
              borderRadius: 12,
              fontSize: 15,
              fontWeight: 600,
              background: '#fff',
              color: '#8AAA8C',
              cursor: 'pointer',
              fontFamily: 'inherit',
              minHeight: 52,
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={saving}
            style={{
              flex: 1,
              background: isPreReg && !isEdit
                ? 'linear-gradient(135deg, #E65100 0%, #BF360C 100%)'
                : undefined,
              boxShadow: isPreReg && !isEdit
                ? '0 4px 14px rgba(230,81,0,0.35)'
                : undefined,
            }}
          >
            {saving
              ? 'Saving…'
              : isEdit
              ? 'Save changes →'
              : isPreReg
              ? 'Pre-register →'
              : 'Register walk-in →'}
          </button>
        </div>
      </div>
    </div>
  )
}