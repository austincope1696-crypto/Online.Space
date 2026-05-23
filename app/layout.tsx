import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'space.online',
  description: 'Your profile, your CRM, your business — all in one place.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
