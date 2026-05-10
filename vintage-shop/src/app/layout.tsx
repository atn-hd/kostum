import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'VintageThread - Mode Seconde Main',
  description: 'Découvrez notre sélection de vêtements vintage et seconde main.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-gray-50 min-h-screen">
        {children}
      </body>
    </html>
  )
}
