import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Header } from "@/components/header"
import { AuthProvider } from "@/components/auth-provider"
import { Messenger } from "@/components/messenger"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ASUS Forum",
  description: "A professional forum for ASUS users",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            <Header />
            <main>{children}</main>
            <Messenger />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
