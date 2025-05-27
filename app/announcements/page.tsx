import { ForumPosts } from "@/components/forum-posts"

export default function AnnouncementsPage() {
  return (
    <div className="container py-6">
      <div className="max-w-6xl mx-auto">
        <ForumPosts defaultCategory="announcements" />
      </div>
    </div>
  )
}
