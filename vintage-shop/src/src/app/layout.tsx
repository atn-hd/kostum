import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Kostum Archives',
  description: 'Location de vêtements pour événements & shootings',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
