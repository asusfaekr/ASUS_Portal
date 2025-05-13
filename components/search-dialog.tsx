"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export function SearchDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (open && searchQuery.length > 2) {
      performSearch()
    }
  }, [searchQuery, open])

  const performSearch = async () => {
    if (searchQuery.length < 3) return

    setLoading(true)
    try {
      // 게시글 검색
      const { data: postsData, error: postsError } = await supabase
        .from("posts")
        .select(`
          id, 
          title, 
          content,
          created_at,
          users:user_id (*),
          boards:board_id (*)
        `)
        .or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`)
        .order("created_at", { ascending: false })
        .limit(5)

      if (postsError) {
        console.error("Search error:", postsError)
        return
      }

      setSearchResults(postsData || [])
    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleResultClick = (postId: number) => {
    router.push(`/post/${postId}`)
    onOpenChange(false)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>검색</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="검색어를 입력하세요 (3자 이상)"
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>
            <Button onClick={performSearch} disabled={searchQuery.length < 3 || loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "검색"}
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : searchResults.length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-sm font-medium">검색 결과</h3>
              {searchResults.map((result) => (
                <div
                  key={result.id}
                  className="border rounded-md p-4 hover:bg-accent cursor-pointer"
                  onClick={() => handleResultClick(result.id)}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{result.users?.full_name?.[0] || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{result.users?.full_name || "사용자"}</span>
                          <span className="text-xs text-muted-foreground">{formatDate(result.created_at)}</span>
                        </div>
                        <Badge className="bg-[#0a66c2]">{result.boards?.name || "게시판"}</Badge>
                      </div>
                      <h4 className="font-semibold">{result.title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">{result.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : searchQuery.length >= 3 ? (
            <div className="text-center py-8 text-muted-foreground">검색 결과가 없습니다.</div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
