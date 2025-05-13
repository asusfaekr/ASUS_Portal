"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Upload, Loader2, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { RoleGuard } from "@/components/role-guard"

// 카테고리 목록
const categories = ["제품 사양", "기술 가이드", "문제 해결", "보안", "개발", "성능"]

export default function UploadDocumentPage() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    tags: "",
  })
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const router = useRouter()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCategoryChange = (value) => {
    setFormData((prev) => ({ ...prev, category: value }))
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.title || !formData.category || !file) {
      setMessage({ type: "error", text: "제목, 카테고리, 파일은 필수 항목입니다." })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      // 실제로는 파일 업로드 및 문서 정보 저장 로직 구현
      // 여기서는 시뮬레이션만 수행
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setMessage({
        type: "success",
        text: "문서가 성공적으로 업로드되었습니다. 검토 후 라이브러리에 추가됩니다.",
      })

      // 성공 후 폼 초기화
      setFormData({
        title: "",
        description: "",
        category: "",
        tags: "",
      })
      setFile(null)

      // 3초 후 라이브러리 페이지로 이동
      setTimeout(() => {
        router.push("/tech-library")
      }, 3000)
    } catch (error) {
      console.error("Upload error:", error)
      setMessage({ type: "error", text: "문서 업로드 중 오류가 발생했습니다." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <RoleGuard>
      <div className="container py-10 max-w-3xl mx-auto">
        <Button variant="ghost" className="mb-4" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> 돌아가기
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>기술 문서 업로드</CardTitle>
            <CardDescription>새로운 기술 문서를 라이브러리에 추가합니다.</CardDescription>
          </CardHeader>
          <CardContent>
            {message && (
              <Alert variant={message.type === "error" ? "destructive" : "default"} className="mb-6">
                <AlertDescription>{message.text}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">제목 *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="문서 제목을 입력하세요"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">설명</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="문서에 대한 간략한 설명을 입력하세요"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">카테고리 *</Label>
                <Select value={formData.category} onValueChange={handleCategoryChange} required>
                  <SelectTrigger>
                    <SelectValue placeholder="카테고리 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">태그</Label>
                <Input
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="쉼표로 구분된 태그 (예: 설치, 가이드, A100)"
                />
                <p className="text-xs text-muted-foreground">쉼표로 구분하여 여러 태그를 입력할 수 있습니다.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="file">파일 *</Label>
                {file ? (
                  <div className="flex items-center justify-between p-3 border rounded-md">
                    <div className="flex items-center gap-2 truncate">
                      <FileIcon className="h-5 w-5 text-blue-500" />
                      <span className="text-sm truncate">{file.name}</span>
                      <span className="text-xs text-muted-foreground">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => setFile(null)} className="h-8 w-8">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center p-6 border border-dashed rounded-md">
                    <label htmlFor="file-upload" className="cursor-pointer text-center">
                      <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                      <span className="text-sm font-medium">파일을 선택하거나 여기에 드래그하세요</span>
                      <p className="text-xs text-muted-foreground mt-1">PDF, DOCX, PPTX, XLSX (최대 20MB)</p>
                      <Input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        onChange={handleFileChange}
                        accept=".pdf,.docx,.pptx,.xlsx"
                      />
                    </label>
                  </div>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                {loading ? "업로드 중..." : "문서 업로드"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  )
}

function FileIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  )
}
