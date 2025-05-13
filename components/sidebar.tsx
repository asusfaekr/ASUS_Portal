import type React from "react"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className, ...props }: SidebarProps) {
  return (
    <div className={`space-y-4 ${className}`} {...props}>
      <div className="space-y-2">
        <Button className="w-full justify-start" variant="outline">
          <PlusIcon className="mr-2 h-4 w-4" />
          New Post
        </Button>
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Categories</h3>
        <ul className="space-y-1">
          {categories.map((category) => (
            <li key={category.id}>
              <Button variant="ghost" className="w-full justify-start">
                {category.name}
              </Button>
            </li>
          ))}
        </ul>
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Popular Tags</h3>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Button key={tag} variant="secondary" size="sm">
              {tag}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}

const categories = [
  { id: 1, name: "Career Advice" },
  { id: 2, name: "Job Opportunities" },
  { id: 3, name: "Networking" },
  { id: 4, name: "Industry News" },
  { id: 5, name: "Professional Development" },
]

const tags = ["remote-work", "tech", "leadership", "startups", "interviews", "resume", "career-change"]
