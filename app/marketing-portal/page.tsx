import { ProfileCard } from "@/components/profile-card"
import { ForumPosts } from "@/components/forum-posts"
import { RewardSystem } from "@/components/reward-system"
import { RoleGuard } from "@/components/role-guard"
import { ROLES } from "@/lib/constants"

export default function MarketingPortalPage() {
  return (
    <RoleGuard requiredRoles={[ROLES.MARKETING]}>
      <div className="container py-6 grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-3 space-y-6">
          <ProfileCard />
          <RewardSystem />
        </div>
        <div className="md:col-span-9">
          <ForumPosts defaultCategory="marketing" />
        </div>
      </div>
    </RoleGuard>
  )
}
