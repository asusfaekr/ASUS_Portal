import { Suspense } from "react"
import { ProfileCard } from "@/components/profile-card"
import { ForumPosts } from "@/components/forum-posts"
import { RewardSystem } from "@/components/reward-system"
import { RoleGuard } from "@/components/role-guard"
import { ROLES } from "@/lib/constants"
import { Loader2 } from "lucide-react"

export default function FaePortalPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <RoleGuard requiredRoles={[ROLES.FAE]}>
        <div className="container py-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-3 space-y-6">
            <ProfileCard />
            <RewardSystem />
          </div>
          <div className="md:col-span-9">
            <ForumPosts defaultCategory="fae" />
          </div>
        </div>
      </RoleGuard>
    </Suspense>
  )
}
