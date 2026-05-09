export interface Patient {
  id: string
  patient_number: number
  full_name: string
  age: number
  gender: 'Male' | 'Female'
  contact_number: string | null
  address: string | null
  medical_history: string | null
  created_at: string
}

export interface Service {
  id: string
  name: string
  category: string
  description: string | null
  is_active: boolean
  created_at: string
}

export interface PatientService {
  id: string
  patient_id: string
  service_id: string
  logged_at: string
  service?: Service
}

export interface CounselLog {
  id: string
  patient_id: string
  counsel_type: 'Salvation' | 'Baptism' | 'Assurance' | 'Prayer for Health'
  counselor_name: string | null
  logged_at: string
}

export interface PatientWithLogs extends Patient {
  patient_services: (PatientService & { service: Service })[]
  counsel_logs: CounselLog[]
}

export interface DashboardStats {
  total_patients: number
  total_services: number
  total_counselled: number
  service_breakdown: { name: string; count: number }[]
  counsel_breakdown: { counsel_type: string; count: number }[]
}
