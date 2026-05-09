'use client'
import { AlertTriangle } from 'lucide-react'

interface ConfirmDialogProps {
  title: string
  message: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
  danger?: boolean
}

export function ConfirmDialog({ title, message, confirmLabel = 'Confirm', onConfirm, onCancel, danger = false }: ConfirmDialogProps) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 12, padding: 20, width: '100%', maxWidth: 320, boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
          {danger && <AlertTriangle size={20} color="#C62828" style={{ flexShrink: 0, marginTop: 1 }} />}
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, color: '#1C2B1C', marginBottom: 4 }}>{title}</div>
            <div style={{ fontSize: 12, color: '#7A9A7A', lineHeight: 1.5 }}>{message}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: '9px 16px', border: '1px solid #B8D8B2', borderRadius: 8, fontSize: 13, background: '#fff', color: '#757575', cursor: 'pointer' }}>
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={danger ? 'action-btn danger' : 'action-btn'}
            style={{ flex: 1, justifyContent: 'center', padding: '9px 16px', fontSize: 13 }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
