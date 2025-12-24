import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: "Yash's Bachelor 2025 | Brutal Awards",
  description: 'Where friendships are tested & legends are made',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: "Brutal Awards",
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0A0A0F',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {/* Background Effects */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          {/* Gradient Orbs */}
          <div className="absolute w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-[100px] -top-[200px] -left-[200px] animate-pulse-slow" />
          <div className="absolute w-[500px] h-[500px] bg-yellow-500/15 rounded-full blur-[100px] top-1/2 -right-[150px] animate-pulse-slow" style={{ animationDelay: '-2s' }} />
          <div className="absolute w-[400px] h-[400px] bg-pink-500/10 rounded-full blur-[100px] -bottom-[100px] left-1/3 animate-pulse-slow" style={{ animationDelay: '-4s' }} />
          
          {/* Grid Pattern */}
          <div 
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '50px 50px'
            }}
          />
        </div>

        {/* Main Content */}
        <main className="relative z-10 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
}
