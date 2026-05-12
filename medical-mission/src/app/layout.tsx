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

        <style>{`
          html {
            height: 100%;
            overflow-x: hidden;
            -webkit-text-size-adjust: 100%;
          }

          body {
            margin: 0;
            min-height: 100%;
            overflow-x: hidden;
            overscroll-behavior-y: contain;
            -webkit-overflow-scrolling: touch;
          }

          * {
            box-sizing: border-box;
          }

          input,
          textarea,
          select {
            font-size: 16px !important;
          }

          input:focus,
          textarea:focus,
          select:focus {
            scroll-margin-top: 120px;
          }

          @media (max-width: 768px) {
            .mobile-stack {
              flex-direction: column !important;
              align-items: stretch !important;
              gap: 10px !important;
            }

            .mobile-full {
              width: 100% !important;
              max-width: 100% !important;
              min-width: 100% !important;
            }

            .mobile-btn {
              width: 100%;
              justify-content: center;
            }

            .mobile-actions {
              flex-wrap: wrap;
            }
          }
        `}</style>
      </head>

      <body
        style={{
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          background: '#F5FAF5',
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