import { LoginForm } from "@/components/auth/login-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-[#0a66c2] text-white flex items-center justify-center rounded font-bold text-xl">
              in
            </div>
          </div>
          <CardTitle className="text-2xl">ACKR Portal에 로그인</CardTitle>
          <CardDescription>계정에 로그인하여 포털에 참여하세요</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  )
}
