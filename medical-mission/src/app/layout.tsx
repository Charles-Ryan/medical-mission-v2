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
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover"
        />
        {/* DM Sans — clean, friendly, legible at small sizes */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <style>{`
          html { height: 100%; overflow-x: hidden; -webkit-text-size-adjust: 100%; }
          body {
            margin: 0;
            min-height: 100%;
            overflow-x: hidden;
            overscroll-behavior-y: contain;
            -webkit-overflow-scrolling: touch;
          }
          * { box-sizing: border-box; }
          /* Always 16px on inputs — prevents iOS auto-zoom */
          input, textarea, select { font-size: 16px !important; }
          input:focus, textarea:focus, select:focus { scroll-margin-top: 140px; }
        `}</style>
      </head>
      <body
        style={{
          fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          background: '#F2F9F2',
          minHeight: '100dvh',
          margin: 0,
          overflowX: 'hidden',
        }}
      >
        <AuthProvider>
          {children}
          <Toaster
            position="bottom-center"
            toastOptions={{
              style: {
                background: '#145A1A',
                color: '#BBDEBE',
                border: 'none',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: '500',
                padding: '12px 20px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  )
}