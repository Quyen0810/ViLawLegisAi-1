// app/layout.tsx
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import NextAuthWrapper from '@/library/next.auth.wrapper'


const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ViLaw - Nền tảng Hạ tầng Pháp lý Số Toàn Dân',
  description:
    'Mỗi công dân – Một trợ lý pháp lý AI. Nền tảng pháp lý số toàn diện, tích hợp AI để hỗ trợ công dân, doanh nghiệp và cơ quan nhà nước trong việc tiếp cận, hiểu và áp dụng pháp luật một cách hiệu quả.',
  keywords:
    'pháp lý, AI, trợ lý pháp lý, văn bản pháp luật, tư vấn pháp luật, ViLaw',
  authors: [{ name: 'ViLaw Team' }],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1a345d',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <NextAuthWrapper>
          {children}
        </NextAuthWrapper>

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { background: '#363636', color: '#fff' },
            success: { duration: 3000, iconTheme: { primary: '#10B981', secondary: '#fff' } },
            error: { duration: 5000, iconTheme: { primary: '#EF4444', secondary: '#fff' } },
          }}
        />
      </body>
    </html>
  )
}
