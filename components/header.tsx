"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Bell, MessageSquare, User, Home, MessageCircle, FileText, Wrench } from "lucide-react"
import { ThemeToggle } from "./theme-toggle"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "./auth-provider"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export function Header() {
  const { user, profile } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link className="mr-6 flex items-center space-x-2" href="/">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-blue-600 text-white text-xs font-bold">
              LI
            </div>
            <span className="hidden font-bold sm:inline-block">ASUS Forum</span>
          </Link>
        </div>

        <nav className="flex items-center space-x-6 text-sm font-medium">
          <Link
            className="flex items-center space-x-2 transition-colors hover:text-foreground/80 text-foreground/60"
            href="/"
          >
            <Home className="h-4 w-4" />
            <span>Home</span>
          </Link>
          <Link
            className="flex items-center space-x-2 transition-colors hover:text-foreground/80 text-foreground/60"
            href="/board"
          >
            <MessageCircle className="h-4 w-4" />
            <span>ASUS Forum</span>
          </Link>
          <Link
            className="flex items-center space-x-2 transition-colors hover:text-foreground/80 text-foreground/60"
            href="/tech-library"
          >
            <FileText className="h-4 w-4" />
            <span>기술 문서</span>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2">
                <Wrench className="h-4 w-4" />
                <span>Tool</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem asChild>
                <Link href="/tools/tdp-calculator">TDP Calculator</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/tools/product-information">Product Information</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="검색..." className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]" />
            </div>
          </div>
          <nav className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <MessageSquare className="h-4 w-4" />
            </Button>
            <ThemeToggle />
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/profile">프로필 설정</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>로그아웃</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild size="sm">
                <Link href="/login">로그인</Link>
              </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
