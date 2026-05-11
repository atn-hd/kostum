import type { Metadata } from 'next'
import './globals.css'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kostum-archives.com'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Kostum Archives — Location de vêtements vintage Paris',
    template: '%s | Kostum Archives',
  },
  description:
    'Kostum Archives est un vestiaire vintage parisien proposant la location de vêtements de créateurs pour shootings photo, tournages, événements et projets créatifs.',
  keywords: [
    'location vêtements vintage',
    'costume événement Paris',
    'shooting photo mode',
    'vestiaire créateurs vintage',
    'location costume tournage',
    'archives mode Paris',
  ],
  openGraph: {
    title: 'Kostum Archives — Location de vêtements vintage Paris',
    description:
      'Vestiaire vintage parisien : location de vêtements de créateurs pour shootings, tournages & événements.',
    url: siteUrl,
    siteName: 'Kostum Archives',
    type: 'website',
    locale: 'fr_FR',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Kostum Archives — Vestiaire vintage parisien',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kostum Archives — Location de vêtements vintage Paris',
    description:
      'Vestiaire vintage parisien : location de vêtements de créateurs pour shootings, tournages & événements.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
