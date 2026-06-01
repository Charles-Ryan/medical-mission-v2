'use client'
import { useState, useEffect, useCallback } from 'react'
import { LogOut, Plus, Trash2, Pencil, X } from 'lucide-react'
import { toast } from 'sonner'
import { getServices, createService, updateService, deleteService } from '@/lib/db'
import { useAuth } from '@/lib/auth'
import type { Service } from '@/lib/types'

interface ServiceFormState {
  name: string
  category: string
  description: string
  is_active: boolean
}

const EMPTY_FORM: ServiceFormState = { name: '', category: '', description: '', is_active: true }

export function AdminPanel() {
  const { logout } = useAuth()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editService, setEditService] = useState<Service | null>(null)
  const [form, setForm] = useState<ServiceFormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    try {
      const svcs = await getServices()
      setServices(svcs)
    } catch { toast.error('Failed to load services') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const openAdd = () => { setEditService(null); setForm(EMPTY_FORM); setShowForm(true) }
  const openEdit = (svc: Service) => {
    setEditService(svc)
    setForm({ name: svc.name, category: svc.category, description: svc.description || '', is_active: svc.is_active })
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Service name is required'); return }
    setSaving(true)
    try {
      if (editService) {
        await updateService(editService.id, { ...form, description: form.description || null })
        toast.success('Service updated')
      } else {
        await createService({ ...form, description: form.description || null })
        toast.success('Service added')
      }
      setShowForm(false)
      load()
    } catch { toast.error('Failed to save service') }
    finally { setSaving(false) }
  }

  const handleDelete = async (svc: Service) => {
    if (!confirm(`Delete "${svc.name}"? This cannot be undone.`)) return
    try { await deleteService(svc.id); toast.success('Service deleted'); load() }
    catch { toast.error('Failed to delete') }
  }

  const handleToggle = async (svc: Service) => {
    try {
      await updateService(svc.id, { is_active: !svc.is_active })
      toast.success(`${svc.name} ${svc.is_active ? 'deactivated' : 'activated'}`)
      load()
    } catch { toast.error('Failed to update') }
  }

  const handleReset = async () => {
    if (!confirm('Reset ALL patient data? This will permanently delete all patients, services logged, and counseling records. This CANNOT be undone.')) return
    if (!confirm('Are you absolutely sure? Press Cancel to abort.')) return
    toast.error('Reset function is disabled in this build for safety.')
  }

  const inputStyle = {
    width: '100%',
    padding: '14px 16px',
    border: '1.5px solid #C8E0CA',
    borderRadius: 12,
    fontSize: '16px',
    background: '#fff',
    color: '#152415',
  }

  return (
    <div style={{ background: '#F2F9F2', minHeight: '100%', padding: 16, paddingBottom: 40 }}>

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#152415', letterSpacing: '-0.02em' }}>Admin Panel</div>
          <div style={{ fontSize: 12, color: '#8AAA8C', marginTop: 2, fontWeight: 500 }}>Manage services & settings</div>
        </div>
        <button className="action-btn danger" onClick={logout} style={{ gap: 6 }}>
          <LogOut size={14} /> Sign out
        </button>
      </div>

      {/* Service management section */}
      <div className="section-label">Service Management</div>
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header">
          <span className="card-header-title">Medical Services</span>
          <button className="action-btn primary sm" onClick={openAdd}>
            <Plus size={14} /> Add service
          </button>
        </div>

        {loading ? (
          <div style={{ padding: 28, textAlign: 'center', color: '#8AAA8C', fontSize: 13 }}>
            <div style={{ marginBottom: 6 }}>⏳</div>
            Loading services…
          </div>
        ) : services.length === 0 ? (
          <div style={{ padding: 28, textAlign: 'center', color: '#8AAA8C', fontSize: 13 }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🏥</div>
            No services yet. Tap "Add service" to create one.
          </div>
        ) : (
          services.map((svc, idx) => (
            <div
              key={svc.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 16px',
                borderBottom: idx < services.length - 1 ? '1px solid #E8F5E9' : 'none',
                gap: 10,
                background: idx % 2 === 0 ? '#fff' : '#FAFCFA',
                transition: 'background 0.15s',
              }}
            >
              {/* Name + category */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#152415' }}>{svc.name}</div>
                {svc.category && (
                  <div style={{ fontSize: 11, color: '#8AAA8C', marginTop: 2, fontWeight: 500 }}>{svc.category}</div>
                )}
              </div>

              {/* Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                {/* Status badge */}
                <span
                  className={`badge ${svc.is_active ? 'green' : 'grey'}`}
                  style={{ minWidth: 60, justifyContent: 'center' }}
                >
                  {svc.is_active ? 'Active' : 'Inactive'}
                </span>

                {/* Toggle */}
                <button
                  className={`toggle ${svc.is_active ? 'on' : 'off'}`}
                  onClick={() => handleToggle(svc)}
                  aria-label={`Toggle ${svc.name}`}
                >
                  <div className="toggle-knob" />
                </button>

                <button className="action-btn sm" onClick={() => openEdit(svc)}>
                  <Pencil size={12} />
                </button>
                <button className="action-btn sm danger" onClick={() => handleDelete(svc)}>
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* System settings */}
      <div className="section-label">System Settings</div>
      <div className="card">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '14px 16px',
            gap: 12,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: '#FFF0F0',
              border: '1px solid #FFCDD2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Trash2 size={17} color="#C62828" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#152415' }}>Reset all patient data</div>
            <div style={{ fontSize: 12, color: '#8AAA8C', marginTop: 2 }}>Permanently deletes all records · cannot be undone</div>
          </div>
          <button className="action-btn sm danger" onClick={handleReset}>
            Reset
          </button>
        </div>
      </div>

      {/* Service form sheet */}
      {showForm && (
        <div className="sheet-overlay" onClick={() => setShowForm(false)}>
          <div className="sheet" onClick={e => e.stopPropagation()}>
            <div className="sheet-handle" />

            <div className="sheet-header">
              <span style={{ fontSize: 16, fontWeight: 700, color: '#152415' }}>
                {editService ? 'Edit service' : 'New service'}
              </span>
              <button
                onClick={() => setShowForm(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8AAA8C', padding: 4, WebkitTapHighlightColor: 'transparent' }}
              >
                <X size={22} />
              </button>
            </div>

            <div className="sheet-body">
              {/* Service name */}
              <div className="field">
                <label className="field-label">
                  Service name <span style={{ color: '#C62828', textTransform: 'none', fontWeight: 400 }}>*</span>
                </label>
                <input
                  className="field-input"
                  style={inputStyle}
                  type="text"
                  placeholder="e.g. Check up (Adult)"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  autoFocus
                />
              </div>

              {/* Category */}
              <div className="field">
                <label className="field-label">Category</label>
                <input
                  className="field-input"
                  style={inputStyle}
                  type="text"
                  placeholder="e.g. Medical, Dental, Screening"
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                />
              </div>

              {/* Description */}
              <div className="field">
                <label className="field-label">Description (optional)</label>
                <input
                  className="field-input"
                  style={inputStyle}
                  type="text"
                  placeholder="Brief description"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                />
              </div>

              {/* Active toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderTop: '1px solid #E8F5E9' }}>
                <button
                  className={`toggle ${form.is_active ? 'on' : 'off'}`}
                  onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))}
                >
                  <div className="toggle-knob" />
                </button>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#2E4F30' }}>
                  {form.is_active ? 'Active — will appear in services list' : 'Inactive — hidden from services list'}
                </span>
              </div>
            </div>

            <div className="sheet-footer">
              <button
                onClick={() => setShowForm(false)}
                style={{
                  padding: '14px 20px',
                  border: '1.5px solid #C8E0CA',
                  borderRadius: 12,
                  fontSize: 15,
                  background: '#fff',
                  color: '#8AAA8C',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontFamily: 'inherit',
                  minHeight: 52,
                }}
              >
                Cancel
              </button>
              <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ flex: 1 }}>
                {saving ? 'Saving…' : editService ? 'Save changes →' : 'Add service →'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}