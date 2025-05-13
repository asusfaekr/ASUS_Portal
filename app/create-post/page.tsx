import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CreatePostForm } from "@/components/create-post-form"
import { RoleGuard } from "@/components/role-guard"

export default function CreatePostPage() {
  return (
    <RoleGuard>
      <div className="container py-10 max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>새 게시글 작성</CardTitle>
            <CardDescription>새로운 게시글을 작성합니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <CreatePostForm />
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  )
}
