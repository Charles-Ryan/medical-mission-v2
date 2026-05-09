'use client'

import { useState, useEffect } from 'react'

export function usePHTime() {
  const [time, setTime] = useState({ timeStr: '--:--:-- --', dateStr: 'Loading…' })

  useEffect(() => {
    const update = () => {
      const now = new Date()
      const ph = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Manila' }))
      const h = ph.getHours()
      const m = ph.getMinutes()
      const s = ph.getSeconds()
      const ap = h >= 12 ? 'PM' : 'AM'
      const hh = h % 12 || 12
      const mm = String(m).padStart(2, '0')
      const ss = String(s).padStart(2, '0')
      const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
      const months = ['January','February','March','April','May','June','July','August','September','October','November','December']
      setTime({
        timeStr: `${hh}:${mm}:${ss} ${ap}`,
        dateStr: `${days[ph.getDay()]}, ${months[ph.getMonth()]} ${ph.getDate()}, ${ph.getFullYear()}`,
      })
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  return time
}
