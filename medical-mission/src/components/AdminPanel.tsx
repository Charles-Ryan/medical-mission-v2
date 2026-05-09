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
  const openEdit = (svc: Service) => { setEditService(svc); setForm({ name: svc.name, category: svc.category, description: svc.description || '', is_active: svc.is_active }); setShowForm(true) }

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
    if (!confirm('Are you absolutely sure? Type OK to confirm — press Cancel to abort.')) return
    toast.error('Reset function is disabled in this build for safety. Connect Supabase and implement via dashboard.')
  }

  const inputStyle = { width: '100%', padding: '8px 10px', border: '1px solid #B8D8B2', borderRadius: 8, fontSize: 12, background: '#fff', color: '#757575' }

  return (
    <div style={{ background: '#F5FAF5', minHeight: '100%', padding: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: '#1C2B1C' }}>Admin panel</span>
        <button className="action-btn sm danger" onClick={logout}>
          <LogOut size={11} /> Sign out
        </button>
      </div>

      {/* Service management */}
      <div style={{ fontSize: 10, fontWeight: 500, color: '#7A9A7A', letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: 8 }}>Service management</div>
      <div style={{ background: '#fff', border: '1px solid #D8E8D8', borderRadius: 12, marginBottom: 12, overflow: 'hidden' }}>
        <div style={{ padding: '11px 14px', borderBottom: '1px solid #D8E8D8', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: '#1C2B1C' }}>Medical services</span>
          <button className="action-btn sm" onClick={openAdd}><Plus size={12} /> Add</button>
        </div>

        {loading ? (
          <div style={{ padding: 20, textAlign: 'center', color: '#7A9A7A', fontSize: 12 }}>Loading…</div>
        ) : services.length === 0 ? (
          <div style={{ padding: 20, textAlign: 'center', color: '#7A9A7A', fontSize: 12 }}>No services yet. Tap &quot;Add&quot; to create one.</div>
        ) : (
          services.map(svc => (
            <div key={svc.id} style={{ display: 'flex', alignItems: 'center', padding: '9px 14px', borderBottom: '1px solid #D8E8D8', gap: 8 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: '#1C2B1C' }}>{svc.name}</div>
                <div style={{ fontSize: 10, color: '#7A9A7A', marginTop: 1 }}>{svc.category}</div>
              </div>
              {/* Active/Inactive badge + toggle pushed right */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto', flexShrink: 0 }}>
                <span style={{
                  fontSize: 10, fontWeight: 500, padding: '2px 8px', borderRadius: 20, minWidth: 54, textAlign: 'center',
                  background: svc.is_active ? '#F0F7F0' : '#F5F5F5',
                  color: svc.is_active ? '#1B5E20' : '#757575',
                  border: `1px solid ${svc.is_active ? '#C8E6C9' : '#E0E0E0'}`,
                }}>
                  {svc.is_active ? 'Active' : 'Inactive'}
                </span>
                {/* Toggle */}
                <div onClick={() => handleToggle(svc)} style={{
                  width: 30, height: 17, borderRadius: 9, position: 'relative',
                  background: svc.is_active ? '#2E7D32' : '#BDBDBD', cursor: 'pointer', flexShrink: 0,
                }}>
                  <div style={{
                    position: 'absolute', top: 2, left: svc.is_active ? 15 : 2,
                    width: 13, height: 13, borderRadius: '50%', background: '#fff',
                    transition: 'left .15s',
                  }} />
                </div>
                <button className="action-btn sm" onClick={() => openEdit(svc)}><Pencil size={11} /> Edit</button>
                <button className="action-btn sm danger" onClick={() => handleDelete(svc)}><Trash2 size={11} /> Del</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* System settings */}
      <div style={{ fontSize: 10, fontWeight: 500, color: '#7A9A7A', letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: 8 }}>System settings</div>
      <div style={{ background: '#fff', border: '1px solid #D8E8D8', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '11px 14px', gap: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: '#1C2B1C' }}>Reset all patient data</div>
            <div style={{ fontSize: 10, color: '#7A9A7A', marginTop: 2 }}>Permanent — cannot be undone</div>
          </div>
          <button className="action-btn sm danger" onClick={handleReset}><Trash2 size={12} /> Reset</button>
        </div>
      </div>

      {/* Service form modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#F5FAF5', borderRadius: '16px 16px 0 0', width: '100%', maxWidth: 600 }}>
            <div style={{ padding: '14px 16px', background: '#fff', borderBottom: '1px solid #D8E8D8', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 14, fontWeight: 500, color: '#1C2B1C' }}>{editService ? 'Edit service' : 'New service'}</span>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7A9A7A' }}><X size={20} /></button>
            </div>
            <div style={{ padding: 16 }}>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 500, color: '#3D5C3D', marginBottom: 4 }}>Service name <span style={{ color: '#C62828' }}>*</span></div>
                <input style={inputStyle} type="text" placeholder="e.g. Check up (Adult)" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 500, color: '#3D5C3D', marginBottom: 4 }}>Category</div>
                <input style={inputStyle} type="text" placeholder="e.g. Medical, Dental, Screening" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 500, color: '#3D5C3D', marginBottom: 4 }}>Description (optional)</div>
                <input style={inputStyle} type="text" placeholder="Brief description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))} style={{ width: 30, height: 17, borderRadius: 9, position: 'relative', background: form.is_active ? '#2E7D32' : '#BDBDBD', cursor: 'pointer' }}>
                  <div style={{ position: 'absolute', top: 2, left: form.is_active ? 15 : 2, width: 13, height: 13, borderRadius: '50%', background: '#fff', transition: 'left .15s' }} />
                </div>
                <span style={{ fontSize: 12, color: '#3D5C3D' }}>{form.is_active ? 'Active' : 'Inactive'}</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setShowForm(false)} style={{ padding: '10px 16px', border: '1px solid #B8D8B2', borderRadius: 8, fontSize: 13, background: '#fff', color: '#757575', cursor: 'pointer' }}>Cancel</button>
                <button className="action-btn" onClick={handleSave} disabled={saving} style={{ flex: 1, justifyContent: 'center', padding: '10px 16px', fontSize: 13, opacity: saving ? 0.7 : 1 }}>
                  {saving ? 'Saving…' : editService ? 'Save changes →' : 'Add service →'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
