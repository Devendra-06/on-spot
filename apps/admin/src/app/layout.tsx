import React from 'react'
import type { Metadata } from 'next'
import { Manrope } from 'next/font/google'
import './css/globals.css'
import { ThemeProvider } from '@/components/theme-provider'

const manrope = Manrope({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Food Admin Panel',
  description: 'Restaurant Management System',
}

import { Toaster } from 'sonner';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='en' suppressHydrationWarning>
      <head>
        <link rel='icon' href='/favicon.svg' type='image/svg+xml' />
        {/* {typeof window !== 'undefined' && <ThemeModeScript />} */}
      </head>
      <body className={`${manrope.className}`}>
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange>
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  )
}
