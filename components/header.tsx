"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell, Home, LogOut, MessageSquare, Search, User, BarChart, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"

export function Header() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const router = useRouter()

  const isActive = (path: string) => {
    return pathname === path
  }

  const handleSignOut = async () => {
    await signOut()
  }

  // 사용자 역할에 따라 접근 가능한 메뉴 결정
  const userRole = user?.role_id ? user.role_id : null

  return (
    <header className="border-b bg-white sticky top-0 z-10">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#0a66c2] text-white flex items-center justify-center rounded font-bold">in</div>
            <span className="text-xl font-bold hidden md:inline-block">ACKR Portal</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className={`text-sm font-medium flex flex-col items-center gap-1 hover:text-[#0a66c2] ${isActive("/") ? "text-[#0a66c2] border-b-2 border-[#0a66c2]" : ""}`}
            >
              <Home className="h-5 w-5" />
              <span>Home</span>
            </Link>
            <Link
              href="/announcements"
              className={`text-sm font-medium flex flex-col items-center gap-1 hover:text-[#0a66c2] ${isActive("/announcements") ? "text-[#0a66c2] border-b-2 border-[#0a66c2]" : ""}`}
            >
              <Bell className="h-5 w-5" />
              <span>공지</span>
            </Link>
            <Link
              href="/fae-portal"
              className={`text-sm font-medium flex flex-col items-center gap-1 hover:text-[#0a66c2] ${
                pathname.startsWith("/fae-portal") ? "text-[#0a66c2] border-b-2 border-[#0a66c2]" : ""
              }`}
            >
              <MessageSquare className="h-5 w-5" />
              <span>FAE Portal</span>
            </Link>
            <Link
              href="/sales-portal"
              className={`text-sm font-medium flex flex-col items-center gap-1 hover:text-[#0a66c2] ${
                pathname.startsWith("/sales-portal") ? "text-[#0a66c2] border-b-2 border-[#0a66c2]" : ""
              }`}
            >
              <User className="h-5 w-5" />
              <span>Sales Portal</span>
            </Link>
            <Link
              href="/marketing-portal"
              className={`text-sm font-medium flex flex-col items-center gap-1 hover:text-[#0a66c2] ${
                pathname.startsWith("/marketing-portal") ? "text-[#0a66c2] border-b-2 border-[#0a66c2]" : ""
              }`}
            >
              <BarChart className="h-5 w-5" />
              <span>Marketing Portal</span>
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search..." className="w-[200px] pl-8 bg-gray-100 border-none" />
          </div>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <div className="w-8 h-8 bg-[#0a66c2] text-white flex items-center justify-center rounded-full font-bold">
                    {user.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push("/profile")}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>프로필 설정</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>로그아웃</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={() => router.push("/login")} variant="default" size="sm">
              로그인
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
