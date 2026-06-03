import type { PatientWithLogs } from './types'

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function padId(n: number | null) {
  if (n == null) return 'Pre-reg'
  return String(n).padStart(3, '0')
}

function serviceNames(patient: PatientWithLogs): string {
  const names = patient.patient_services.map(ps => ps.service?.name || '').filter(Boolean)
  return names.length > 0 ? names.join('; ') : '—'
}

function counselTypes(patient: PatientWithLogs): string {
  if (patient.counsel_logs.length === 0) return '—'
  return patient.counsel_logs.map(cl => cl.counsel_type).join('; ')
}

function counselorNames(patient: PatientWithLogs): string {
  const names = patient.counsel_logs.map(cl => cl.counselor_name?.trim()).filter(Boolean)
  return names.length > 0 ? [...new Set(names)].join('; ') : '—'
}

const escape = (cell: string | number) =>
  `"${String(cell).replace(/"/g, '""')}"`

// ─── CSV EXPORT ───────────────────────────────────────────────────────────────

export function exportToCSV(patients: PatientWithLogs[]) {
  const HEADERS = [
    'Patient ID',
    'Full Name',
    'Age',
    'Gender',
    'Contact Number',
    'Address',
    'Medical History',
    'Services Received',
    'Counseling',
    'Counselor Name',
  ]

  const rows = patients.map(p => [
    padId(p.patient_number),
    p.full_name,
    p.age,
    p.gender,
    p.contact_number || '—',
    p.address        || '—',
    p.medical_history || '—',
    serviceNames(p),
    counselTypes(p),
    counselorNames(p),
  ])

  const csvContent = [
    HEADERS.map(escape).join(','),
    ...rows.map(row => row.map(escape).join(',')),
  ].join('\n')

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href     = url
  link.download = `CWOP-Patients-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// ─── PDF EXPORT ───────────────────────────────────────────────────────────────

export async function exportToPDF(
  patients: PatientWithLogs[],
  stats: { total_patients: number; total_services: number; total_counselled: number }
) {
  const { default: jsPDF }     = await import('jspdf')
  const { default: autoTable } = await import('jspdf-autotable')

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

  const date = new Date().toLocaleDateString('en-PH', {
    timeZone: 'Asia/Manila',
    year: 'numeric', month: 'long', day: 'numeric',
  })

  // Header
  doc.setFontSize(14)
  doc.setTextColor(31, 115, 38)
  doc.text('Pilgrim CWOP — Patient Records', 14, 16)

  doc.setFontSize(9)
  doc.setTextColor(90, 90, 90)
  doc.text(`Generated: ${date}`, 14, 23)

  doc.setFontSize(9)
  doc.setTextColor(40, 40, 40)
  doc.text(
    `Patients: ${stats.total_patients}     Services rendered: ${stats.total_services}     Counselled: ${stats.total_counselled}`,
    14, 30
  )

  autoTable(doc, {
    startY: 36,
    head: [[
      'ID',
      'Full Name',
      'Age',
      'Gender',
      'Contact No.',
      'Address',
      'Medical History',
      'Services Received',
      'Counseling',
      'Counselor',
    ]],
    body: patients.map(p => [
      padId(p.patient_number),
      p.full_name,
      p.age,
      p.gender,
      p.contact_number  || '—',
      p.address         || '—',
      p.medical_history || '—',
      serviceNames(p),
      counselTypes(p),
      counselorNames(p),
    ]),
    styles: {
      fontSize: 7,
      cellPadding: 2,
      lineColor: [200, 230, 201] as [number, number, number],
      lineWidth: 0.1,
      overflow: 'linebreak',
    },
    headStyles: {
      fillColor: [31, 115, 38] as [number, number, number],
      textColor: [255, 255, 255] as [number, number, number],
      fontStyle: 'bold' as const,
      fontSize: 7,
    },
    alternateRowStyles: {
      fillColor: [240, 249, 240] as [number, number, number],
    },
    columnStyles: {
      0: { cellWidth: 12 },  // ID
      1: { cellWidth: 36 },  // Full Name
      2: { cellWidth: 10 },  // Age
      3: { cellWidth: 14 },  // Gender
      4: { cellWidth: 24 },  // Contact
      5: { cellWidth: 38 },  // Address
      6: { cellWidth: 30 },  // Medical History
      7: { cellWidth: 38 },  // Services
      8: { cellWidth: 30 },  // Counseling
      9: { cellWidth: 26 },  // Counselor
    },
    margin: { left: 14, right: 14 },
  })

  doc.save(`CWOP-Patients-${new Date().toISOString().slice(0, 10)}.pdf`)
}

// ─── GOOGLE SHEETS ────────────────────────────────────────────────────────────

export function exportToGoogleSheets(patients: PatientWithLogs[]) {
  exportToCSV(patients)
  setTimeout(() => { window.open('https://sheets.new', '_blank') }, 800)
}