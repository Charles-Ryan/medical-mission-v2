import { createClient } from './supabase/client'
import type { Patient, Service, PatientService, CounselLog, PatientWithLogs, DashboardStats } from './types'

// ─── PATIENTS ────────────────────────────────────────────────────────────────

export async function getPatients(search = '', serviceId = '') {
  const supabase = createClient()
  let query = supabase
    .from('patients')
    .select(`
      *,
      patient_services(*, service:services(*)),
      counsel_logs(*)
    `)
    .order('patient_number', { ascending: true })

  if (search) {
    query = query.or(
      `full_name.ilike.%${search}%,contact_number.ilike.%${search}%,patient_number.eq.${isNaN(Number(search)) ? 0 : Number(search)}`
    )
  }

  const { data, error } = await query
  if (error) throw error

  if (serviceId && data) {
    return data.filter((p: PatientWithLogs) =>
      p.patient_services.some((ps) => ps.service_id === serviceId)
    ) as PatientWithLogs[]
  }

  return (data || []) as PatientWithLogs[]
}

export async function getPatient(id: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('patients')
    .select(`
      *,
      patient_services(*, service:services(*)),
      counsel_logs(*)
    `)
    .eq('id', id)
    .single()
  if (error) throw error
  return data as PatientWithLogs
}

export async function getNextPatientNumber() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('patients')
    .select('patient_number')
    .order('patient_number', { ascending: false })
    .limit(1)
  if (error) throw error
  return data && data.length > 0 ? data[0].patient_number + 1 : 1
}

export async function createPatient(patient: Omit<Patient, 'id' | 'patient_number' | 'created_at'>) {
  const supabase = createClient()
  const maxAttempts = 5

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const nextNum = await getNextPatientNumber()
    const { data, error } = await supabase
      .from('patients')
      .insert({ ...patient, patient_number: nextNum })
      .select()
      .single()

    if (!error) return data as Patient

    const isDuplicate = error.code === '23505' || error.message?.includes('duplicate key') || error.details?.includes('already exists')
    if (!isDuplicate) throw error
  }

  throw new Error('Could not assign unique patient number after several attempts')
}

export async function updatePatient(id: string, updates: Partial<Patient>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('patients')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Patient
}

export async function deletePatient(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from('patients').delete().eq('id', id)
  if (error) throw error
}

// ─── SERVICES ────────────────────────────────────────────────────────────────

export async function getServices(activeOnly = false) {
  const supabase = createClient()
  let query = supabase.from('services').select('*').order('name')
  if (activeOnly) query = query.eq('is_active', true)
  const { data, error } = await query
  if (error) throw error
  return (data || []) as Service[]
}

export async function createService(service: Omit<Service, 'id' | 'created_at'>) {
  const supabase = createClient()
  const { data, error } = await supabase.from('services').insert(service).select().single()
  if (error) throw error
  return data as Service
}

export async function updateService(id: string, updates: Partial<Service>) {
  const supabase = createClient()
  const { data, error } = await supabase.from('services').update(updates).eq('id', id).select().single()
  if (error) throw error
  return data as Service
}

export async function deleteService(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from('services').delete().eq('id', id)
  if (error) throw error
}

// ─── PATIENT SERVICES ─────────────────────────────────────────────────────────

export async function logService(patientId: string, serviceId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('patient_services')
    .insert({ patient_id: patientId, service_id: serviceId })
    .select('*, service:services(*)')
    .single()
  if (error) throw error
  return data as PatientService & { service: Service }
}

export async function removeService(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from('patient_services').delete().eq('id', id)
  if (error) throw error
}

// ─── COUNSEL LOGS ─────────────────────────────────────────────────────────────

export async function logCounsel(
  patientId: string,
  counselType: CounselLog['counsel_type'],
  counselorName: string | null
) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('counsel_logs')
    .insert({ patient_id: patientId, counsel_type: counselType, counselor_name: counselorName })
    .select()
    .single()
  if (error) throw error
  return data as CounselLog
}

export async function removeCounsel(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from('counsel_logs').delete().eq('id', id)
  if (error) throw error
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = createClient()

  const [patientsRes, servicesRes, counselRes, svcBreakdownRes, cslBreakdownRes, allServicesRes] = await Promise.all([
    supabase.from('patients').select('id', { count: 'exact', head: true }),
    supabase.from('patient_services').select('id', { count: 'exact', head: true }),
    supabase.from('counsel_logs').select('id', { count: 'exact', head: true }),
    supabase.from('patient_services').select('service:services(name)'),
    supabase.from('counsel_logs').select('counsel_type'),
    supabase.from('services').select('name').eq('is_active', true),
  ])

  // Service breakdown - include all active services
  const svcMap: Record<string, number> = {}

  ;(svcBreakdownRes.data || []).forEach((ps: any) => {
    const serviceData = Array.isArray(ps.service)
      ? ps.service[0]
      : ps.service

    const name = (serviceData?.name || 'Unknown').trim()

    svcMap[name] = (svcMap[name] || 0) + 1
  })

  const activeServiceNames = new Set(
    (allServicesRes.data || []).map(
      (s: { name: string }) => s.name.trim()
    )
  )

  const service_breakdown = Array.from(activeServiceNames)
    .map(name => ({
      name,
      count: svcMap[name] || 0
    }))
    .sort((a, b) => b.count - a.count)

  // Counsel breakdown
  const cslMap: Record<string, number> = {}
  ;(cslBreakdownRes.data || []).forEach((cl: { counsel_type: string }) => {
    cslMap[cl.counsel_type] = (cslMap[cl.counsel_type] || 0) + 1
  })
  const counsel_breakdown = Object.entries(cslMap).map(([counsel_type, count]) => ({ counsel_type, count }))

  return {
    total_patients: patientsRes.count || 0,
    total_services: servicesRes.count || 0,
    total_counselled: counselRes.count || 0,
    service_breakdown,
    counsel_breakdown,
  }
}

// ─── EXPORT ───────────────────────────────────────────────────────────────────

export async function getAllPatientsForExport() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('patients')
    .select(`
      *,
      patient_services(*, service:services(name)),
      counsel_logs(counsel_type, counselor_name, logged_at)
    `)
    .order('patient_number', { ascending: true })
  if (error) throw error
  return (data || []) as PatientWithLogs[]
}

// ─── REALTIME ─────────────────────────────────────────────────────────────────

export function subscribeToPatients(callback: () => void) {
  const supabase = createClient()
  const channel = supabase
    .channel('patients-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'patients' }, callback)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'patient_services' }, callback)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'counsel_logs' }, callback)
    .subscribe()
  return () => supabase.removeChannel(channel)
}
