import { Suspense } from "react"
import { LoginForm } from "@/components/auth/login-form"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">로그인</h1>
          <p className="text-sm text-muted-foreground">이메일과 비밀번호를 입력하여 로그인하세요</p>
        </div>
        <Suspense
          fallback={
            <div className="flex justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
