"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, LogOut, MessageSquare, Search, Settings, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/components/auth-provider"
import { useState } from "react"
import { Input } from "@/components/ui/input"

export function Header() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")

  const isActive = (path: string) => {
    return pathname === path
  }

  const handleSignOut = async () => {
    await signOut()
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    try {
      // 검색 결과 페이지로 이동하거나 검색 결과를 표시하는 로직
      // 여기서는 간단히 검색 쿼리를 URL 파라미터로 전달하여 /board 페이지로 이동
      router.push(`/board?search=${encodeURIComponent(searchQuery)}`)

      // 검색 쿼리 초기화
      setSearchQuery("")
    } catch (error) {
      console.error("Search error:", error)
    }
  }

  // 사용자 역할에 따라 접근 가능한 메뉴 결정
  const userRole = user?.role_id ? user.role_id : null

  return (
    <header className="border-b bg-white sticky top-0 z-10">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#0a66c2] text-white flex items-center justify-center rounded font-bold">in</div>
            <span className="text-xl font-bold hidden md:inline-block">ASUS Forum</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className={`text-sm font-medium flex flex-col items-center gap-1 hover:text-[#0a66c2] ${
                isActive("/") ? "text-[#0a66c2] border-b-2 border-[#0a66c2]" : ""
              }`}
            >
              <Home className="h-5 w-5" />
              <span>Home</span>
            </Link>
            <Link
              href="/board"
              className={`text-sm font-medium flex flex-col items-center gap-1 hover:text-[#0a66c2] ${
                pathname.startsWith("/board") ? "text-[#0a66c2] border-b-2 border-[#0a66c2]" : ""
              }`}
            >
              <MessageSquare className="h-5 w-5" />
              <span>ASUS Forum</span>
            </Link>
            <Link
              href="/tech-library"
              className={`text-sm font-medium flex flex-col items-center gap-1 hover:text-[#0a66c2] ${
                pathname.startsWith("/tech-library") ? "text-[#0a66c2] border-b-2 border-[#0a66c2]" : ""
              }`}
            >
              <FileText className="h-5 w-5" />
              <span>기술 문서</span>
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <form onSubmit={handleSearch} className="relative hidden md:flex items-center">
            <Input
              type="search"
              placeholder="검색..."
              className="w-[200px] h-9 pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Button type="submit" variant="ghost" size="icon" className="absolute right-0 h-9 w-9">
              <span className="sr-only">검색</span>
            </Button>
          </form>

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
