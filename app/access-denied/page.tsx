import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldAlert } from "lucide-react"
import Link from "next/link"

export default function AccessDeniedPage() {
  return (
    <div className="container py-10 max-w-md mx-auto">
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <ShieldAlert className="h-16 w-16 text-red-500" />
          </div>
          <CardTitle className="text-2xl">접근 권한이 없습니다</CardTitle>
          <CardDescription>이 페이지에 접근할 수 있는 권한이 없습니다.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <p className="text-center mb-6">
            이 페이지는 특정 역할을 가진 사용자만 접근할 수 있습니다. 관리자에게 문의하여 적절한 권한을 요청하세요.
          </p>
          <Link href="/" passHref>
            <Button>홈으로 돌아가기</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
