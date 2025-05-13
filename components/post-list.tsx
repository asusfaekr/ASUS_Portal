import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { MessageSquareIcon, ThumbsUpIcon } from "lucide-react"

export function PostList() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Recent Discussions</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            Latest
          </Button>
          <Button variant="ghost" size="sm">
            Popular
          </Button>
        </div>
      </div>
      <div className="grid gap-4">
        {posts.map((post) => (
          <Card key={post.id}>
            <CardHeader className="flex flex-row items-start gap-4 space-y-0">
              <Avatar>
                <AvatarImage src={post.author.avatar} alt={post.author.name} />
                <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h3 className="font-semibold">{post.title}</h3>
                <p className="text-sm text-muted-foreground">
                  Posted by {post.author.name} · {post.postedAt}
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{post.content}</p>
            </CardContent>
            <CardFooter className="flex items-center gap-4">
              <Button variant="ghost" size="sm">
                <ThumbsUpIcon className="mr-2 h-4 w-4" />
                {post.likes}
              </Button>
              <Button variant="ghost" size="sm">
                <MessageSquareIcon className="mr-2 h-4 w-4" />
                {post.comments}
              </Button>
              <Button variant="ghost" size="sm">
                Share
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

const posts = [
  {
    id: 1,
    title: "How to transition from engineering to product management?",
    content:
      "I've been working as a software engineer for 5 years and I'm interested in moving into product management. Has anyone made this transition? Any advice or resources you'd recommend?",
    author: {
      name: "Alex Johnson",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    postedAt: "2 hours ago",
    likes: 24,
    comments: 8,
  },
  {
    id: 2,
    title: "Remote work opportunities in data science",
    content:
      "I'm looking for remote work opportunities in data science. I have experience with Python, R, and machine learning. Any companies you'd recommend that have a good remote work culture?",
    author: {
      name: "Sarah Chen",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    postedAt: "5 hours ago",
    likes: 18,
    comments: 12,
  },
  {
    id: 3,
    title: "Networking strategies for introverts",
    content:
      "As an introvert, I find networking events draining. However, I understand the importance of building professional connections. What strategies have worked for other introverts?",
    author: {
      name: "Michael Park",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    postedAt: "1 day ago",
    likes: 56,
    comments: 23,
  },
]
