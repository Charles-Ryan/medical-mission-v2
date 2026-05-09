import type { PatientWithLogs } from './types'

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function padId(n: number) {
  return String(n)
}

function counselStatus(patient: PatientWithLogs): string {
  if (patient.counsel_logs.length === 0) return 'NONE'
  return patient.counsel_logs.map(cl => {
    const t = cl.counsel_type.toUpperCase()
    if (t === 'PRAYER FOR HEALTH') return 'PRAYER'
    return t
  }).join('; ')
}

function counselorNames(patient: PatientWithLogs): string {
  const names = patient.counsel_logs.map(cl => cl.counselor_name?.trim()).filter(Boolean)
  return names.length > 0 ? names.join('; ') : 'NONE'
}

function serviceNames(patient: PatientWithLogs): string {
  const names = patient.patient_services.map(ps => ps.service?.name || '').filter(Boolean)
  return names.length > 0 ? names.join('; ') : 'NONE'
}

// ─── CSV EXPORT ───────────────────────────────────────────────────────────────

export function exportToCSV(patients: PatientWithLogs[]) {
  const HEADERS = [
    'PATIENT ID','NAME','ADDRESS','AGE','GENDER','CONTACT NUMBER',
    'SERVICE','COUNSELING STATUS','COUNSELOR NAME',
  ]

  const rows = patients.map(p => [
    padId(p.patient_number),
    p.full_name.toUpperCase(),
    (p.address || 'NONE').toUpperCase(),
    String(p.age),
    p.gender.toUpperCase(),
    p.contact_number || 'NONE',
    serviceNames(p),
    counselStatus(p),
    counselorNames(p),
  ])

  const csvContent = [
    'PERSONAL INFORMATION,,,,,, SERVICES AND COUNSELLING,,',
    HEADERS.join(','),
    ...rows.map(row =>
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ),
  ].join('\n')

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `CWOP-Patient-Database-${new Date().toISOString().slice(0, 10)}.csv`
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
  const { default: jsPDF } = await import('jspdf')
  const { default: autoTable } = await import('jspdf-autotable')

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

  const date = new Date().toLocaleDateString('en-PH', {
    timeZone: 'Asia/Manila',
    year: 'numeric', month: 'long', day: 'numeric',
  })

  doc.setFontSize(14)
  doc.setTextColor(46, 125, 50)
  doc.text('CWOP Patient Database', 14, 16)

  doc.setFontSize(9)
  doc.setTextColor(80)
  doc.text(`Pilgrim CWOP Medical Mission  ·  Generated: ${date}`, 14, 23)

  doc.setFontSize(9)
  doc.setTextColor(30)
  doc.text(
    `Total Patients: ${stats.total_patients}     Total Services: ${stats.total_services}     Total Counselled: ${stats.total_counselled}`,
    14, 30
  )

  autoTable(doc, {
    startY: 35,
    head: [
      [
        { content: 'PERSONAL INFORMATION', colSpan: 6, styles: { halign: 'center' as const, fillColor: [200, 230, 201] as [number,number,number], textColor: [27, 94, 32] as [number,number,number], fontStyle: 'bold' as const, fontSize: 8 } },
        { content: 'SERVICES AND COUNSELLING', colSpan: 3, styles: { halign: 'center' as const, fillColor: [165, 214, 167] as [number,number,number], textColor: [27, 94, 32] as [number,number,number], fontStyle: 'bold' as const, fontSize: 8 } },
      ],
      ['PATIENT ID','NAME','ADDRESS','AGE','GENDER','CONTACT NUMBER','SERVICE','COUNSELING STATUS','COUNSELOR NAME'],
    ],
    body: patients.map(p => [
      padId(p.patient_number),
      p.full_name.toUpperCase(),
      (p.address || 'NONE').toUpperCase(),
      p.age,
      p.gender.toUpperCase(),
      p.contact_number || 'NONE',
      serviceNames(p),
      counselStatus(p),
      counselorNames(p),
    ]),
    styles: { fontSize: 7, cellPadding: 2, lineColor: [200, 230, 201] as [number,number,number], lineWidth: 0.1 },
    headStyles: { fillColor: [46, 125, 50] as [number,number,number], textColor: [255,255,255] as [number,number,number], fontStyle: 'bold' as const, fontSize: 7 },
    alternateRowStyles: { fillColor: [240, 247, 240] as [number,number,number] },
    columnStyles: {
      0: { cellWidth: 14 },
      1: { cellWidth: 38 },
      2: { cellWidth: 52 },
      3: { cellWidth: 10 },
      4: { cellWidth: 14 },
      5: { cellWidth: 26 },
      6: { cellWidth: 36 },
      7: { cellWidth: 28 },
      8: { cellWidth: 30 },
    },
    margin: { left: 14, right: 14 },
  })

  doc.save(`CWOP-Patient-Database-${new Date().toISOString().slice(0, 10)}.pdf`)
}

// ─── GOOGLE SHEETS ────────────────────────────────────────────────────────────

export function exportToGoogleSheets(patients: PatientWithLogs[]) {
  exportToCSV(patients)
  setTimeout(() => { window.open('https://sheets.new', '_blank') }, 800)
}
