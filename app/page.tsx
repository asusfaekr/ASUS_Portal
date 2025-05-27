import { ForumPosts } from "@/components/forum-posts"

export default function Home() {
  return (
    <div className="container py-6">
      <div className="max-w-6xl mx-auto">
        <ForumPosts defaultCategory="all" showFilters={false} simplifiedCategories={true} showSortTabs={false} />
      </div>
    </div>
  )
}
