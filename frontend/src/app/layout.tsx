import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SecurityProvider } from '@/components/security/SecurityProvider'
import { ErrorProvider } from '@/components/ui/error-boundary'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Quiz Generator Platform',
  description: 'Modern SaaS Quiz Generator Platform with AI-powered question creation',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorProvider>
          <SecurityProvider>
            {children}
          </SecurityProvider>
        </ErrorProvider>
      </body>
    </html>
  )
}
