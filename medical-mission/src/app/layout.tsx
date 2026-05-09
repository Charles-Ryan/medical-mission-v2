import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/auth'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'Pilgrim CWOP Medical Mission',
  description: 'Patient registration and tracking for Pilgrim CWOP Medical Mission',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', background: '#F5FAF5', minHeight: '100vh', margin: 0 }}>
        <AuthProvider>
          {children}
          <Toaster
            position="bottom-center"
            toastOptions={{
              style: {
                background: '#1B5E20',
                color: '#C8E6C9',
                border: 'none',
                borderRadius: '20px',
                fontSize: '13px',
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  )
}
