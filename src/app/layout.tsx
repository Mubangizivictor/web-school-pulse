import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'School Pulse — Admin Console',
  description: 'Platform owner console for School Pulse',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
