import { AuthCheck } from "@/components/auth/auth-check"

export default function TechnicalDocumentsPage() {
  return (
    <AuthCheck>
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6">Docs</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-lg">기술 문서 내용이 여기에 표시됩니다.</p>
        </div>
      </div>
    </AuthCheck>
  )
}
