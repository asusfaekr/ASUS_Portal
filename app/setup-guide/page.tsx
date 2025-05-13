import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info, AlertTriangle } from "lucide-react"

export default function SetupGuidePage() {
  return (
    <div className="container py-10 max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Supabase 설정 가이드</CardTitle>
          <CardDescription>ACKR Portal을 위한 Supabase 설정 방법</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <Info className="h-5 w-5" />
            <AlertTitle>환경 변수 설정 필요</AlertTitle>
            <AlertDescription>
              이 애플리케이션은 Supabase를 데이터베이스 및 인증 서비스로 사용합니다. 정상적인 작동을 위해 환경 변수를
              설정해야 합니다.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">1. Supabase 프로젝트 생성</h3>
            <p>
              아직 Supabase 프로젝트가 없다면,{" "}
              <a
                href="https://supabase.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Supabase 웹사이트
              </a>
              에서 새 프로젝트를 생성하세요.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">2. API 키 및 URL 가져오기</h3>
            <p>Supabase 프로젝트 대시보드에서 "Settings" &gt; "API" 메뉴로 이동하여 다음 정보를 찾을 수 있습니다:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Project URL</strong>: NEXT_PUBLIC_SUPABASE_URL 환경 변수에 사용
              </li>
              <li>
                <strong>anon public</strong>: NEXT_PUBLIC_SUPABASE_ANON_KEY 환경 변수에 사용
              </li>
              <li>
                <strong>service_role</strong>: SUPABASE_SERVICE_ROLE_KEY 환경 변수에 사용 (주의: 이 키는 공개되면
                안됩니다)
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">3. 환경 변수 설정</h3>
            <p>
              Vercel에 배포한 경우, Vercel 대시보드에서 프로젝트 설정 &gt; "Environment Variables" 메뉴에서 다음 환경
              변수를 추가하세요:
            </p>
            <div className="bg-gray-100 p-4 rounded-md space-y-2">
              <div>
                <strong>NEXT_PUBLIC_SUPABASE_URL</strong>
                <br />
                <code className="text-sm">https://your-project-id.supabase.co</code>
              </div>
              <div>
                <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY</strong>
                <br />
                <code className="text-sm">eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...</code>
              </div>
              <div>
                <strong>SUPABASE_SERVICE_ROLE_KEY</strong>
                <br />
                <code className="text-sm">eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...</code>
              </div>
            </div>
          </div>

          <Alert variant="warning">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle>중요</AlertTitle>
            <AlertDescription>
              환경 변수를 설정한 후에는 애플리케이션을 다시 배포하거나 개발 서버를 재시작해야 변경사항이 적용됩니다.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">4. 로컬 개발 환경 설정</h3>
            <p>
              로컬 개발 환경에서는 프로젝트 루트 디렉토리에 <code>.env.local</code> 파일을 생성하고 위의 환경 변수를
              추가하세요.
            </p>
            <pre className="bg-gray-100 p-4 rounded-md text-sm">
              {`NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
