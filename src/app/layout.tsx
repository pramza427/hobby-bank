import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import "react-tooltip/dist/react-tooltip.css";

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'Hobby Bank',
    description: 'Track time and money while doing your hobbies',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <script src="https://kit.fontawesome.com/f1945f82f5.js" crossOrigin="anonymous"></script>
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
