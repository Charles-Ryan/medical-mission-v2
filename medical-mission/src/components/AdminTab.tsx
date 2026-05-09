'use client'
import { useAuth } from '@/lib/auth'
import { AdminLogin } from './AdminLogin'
import { AdminPanel } from './AdminPanel'

export function AdminTab() {
  const { isAdmin } = useAuth()
  return isAdmin ? <AdminPanel /> : <AdminLogin />
}
