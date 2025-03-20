import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserCircle, Bell, MessageSquare, Search, Briefcase, Users, TrendingUp, Award } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="container flex items-center justify-between h-16 px-4 mx-auto">
          <div className="flex items-center space-x-10">
            <div className="text-2xl font-bold text-blue-600">ProForum</div>
            <nav className="hidden md:flex">
              <ul className="flex space-x-8">
                <li className="font-medium text-blue-600">Home</li>
                <li className="font-medium text-gray-600 hover:text-blue-600">공지</li>
                <li className="font-medium text-gray-600 hover:text-blue-600">FAE Portal</li>
                <li className="font-medium text-gray-600 hover:text-blue-600">Sales Portal</li>
                <li className="font-medium text-gray-600 hover:text-blue-600">게시판</li>
              </ul>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search"
                className="w-64 pl-10 pr-4 py-2 text-sm border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Button variant="ghost" size="icon">
              <Bell className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <MessageSquare className="w-5 h-5" />
            </Button>
            <Avatar className="w-8 h-8 border">
              <UserCircle className="w-8 h-8" />
            </Avatar>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 py-6 mx-auto">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          {/* Profile Section (Left) */}
          <div className="md:col-span-1">
            <Card className="overflow-hidden">
              <div className="h-24 bg-gradient-to-r from-blue-500 to-blue-600"></div>
              <div className="px-4 pt-0 pb-4 -mt-12">
                <Avatar className="w-24 h-24 border-4 border-white bg-white">
                  <UserCircle className="w-24 h-24 text-gray-400" />
                </Avatar>
                <h2 className="mt-2 text-xl font-bold">홍길동</h2>
                <p className="text-sm text-gray-600">Senior Engineer at ABC Tech</p>

                <div className="flex items-center mt-4 space-x-2">
                  <Badge variant="secondary" className="px-3 py-1">
                    <Award className="w-3.5 h-3.5 mr-1" />
                    Level 5
                  </Badge>
                  <Badge variant="outline" className="px-3 py-1">
                    <TrendingUp className="w-3.5 h-3.5 mr-1" />
                    Expert
                  </Badge>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium">Activity Score</span>
                    <span className="text-xs font-medium">750/1000</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>

                <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                  <div className="p-2 rounded-md bg-gray-50">
                    <div className="font-bold">42</div>
                    <div className="text-xs text-gray-500">Posts</div>
                  </div>
                  <div className="p-2 rounded-md bg-gray-50">
                    <div className="font-bold">156</div>
                    <div className="text-xs text-gray-500">Connections</div>
                  </div>
                  <div className="p-2 rounded-md bg-gray-50">
                    <div className="font-bold">28</div>
                    <div className="text-xs text-gray-500">Badges</div>
                  </div>
                </div>

                <Button className="w-full mt-4" variant="outline">
                  View Profile
                </Button>
              </div>
            </Card>

            <Card className="mt-4 p-4">
              <h3 className="font-medium">My Communities</h3>
              <div className="mt-3 space-y-3">
                <div className="flex items-center">
                  <Users className="w-5 h-5 mr-3 text-blue-500" />
                  <span className="text-sm">FAE Community</span>
                </div>
                <div className="flex items-center">
                  <Briefcase className="w-5 h-5 mr-3 text-blue-500" />
                  <span className="text-sm">Sales Professionals</span>
                </div>
                <div className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-3 text-blue-500" />
                  <span className="text-sm">Tech Leaders</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content (Right) */}
          <div className="md:col-span-3">
            <Card className="p-4 mb-4">
              <div className="flex items-center space-x-3">
                <Avatar className="w-10 h-10">
                  <UserCircle className="w-10 h-10" />
                </Avatar>
                <input
                  type="text"
                  placeholder="Share an update or post..."
                  className="flex-1 p-2 text-sm border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-between mt-3 pt-3 border-t">
                <Button variant="ghost" size="sm" className="text-xs">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Photo
                </Button>
                <Button variant="ghost" size="sm" className="text-xs">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  Video
                </Button>
                <Button variant="ghost" size="sm" className="text-xs">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Document
                </Button>
                <Button variant="ghost" size="sm" className="text-xs">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Event
                </Button>
              </div>
            </Card>

            <Tabs defaultValue="trending">
              <TabsList className="w-full mb-4">
                <TabsTrigger value="trending" className="flex-1">
                  Trending
                </TabsTrigger>
                <TabsTrigger value="recent" className="flex-1">
                  Recent
                </TabsTrigger>
                <TabsTrigger value="following" className="flex-1">
                  Following
                </TabsTrigger>
              </TabsList>

              <TabsContent value="trending" className="space-y-4">
                {[1, 2, 3].map((post) => (
                  <PostCard key={post} />
                ))}
              </TabsContent>

              <TabsContent value="recent" className="space-y-4">
                <div className="p-8 text-center text-gray-500">Recent posts will appear here</div>
              </TabsContent>

              <TabsContent value="following" className="space-y-4">
                <div className="p-8 text-center text-gray-500">Posts from people you follow will appear here</div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  )
}

function PostCard() {
  return (
    <Card className="overflow-hidden">
      <div className="p-4">
        <div className="flex items-start space-x-3">
          <Avatar className="w-10 h-10">
            <UserCircle className="w-10 h-10" />
          </Avatar>
          <div>
            <div className="flex items-center">
              <h3 className="font-medium">김철수</h3>
              <Badge variant="secondary" className="ml-2 text-xs">
                Level 4
              </Badge>
            </div>
            <p className="text-xs text-gray-500">Product Manager at XYZ Corp • 2h</p>
            <p className="mt-2 text-sm">
              오늘 새로운 프로젝트에 대한 회의가 있었습니다. 팀원들과 함께 혁신적인 아이디어를 논의했고, 다음 분기에
              출시할 제품에 대한 계획을 세웠습니다. 여러분의 의견도 듣고 싶습니다!
            </p>
          </div>
        </div>
      </div>
      <div className="bg-gray-100 h-64 flex items-center justify-center">
        <img src="/placeholder.svg?height=256&width=600" alt="Post image" className="object-cover w-full h-full" />
      </div>
      <div className="p-4 border-t">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <span>42 likes</span>
            <span>•</span>
            <span>12 comments</span>
          </div>
          <span>3 shares</span>
        </div>
        <div className="flex justify-between mt-3 pt-3 border-t">
          <Button variant="ghost" size="sm" className="flex-1">
            <svg
              className="w-5 h-5 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
              />
            </svg>
            Like
          </Button>
          <Button variant="ghost" size="sm" className="flex-1">
            <svg
              className="w-5 h-5 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
              />
            </svg>
            Comment
          </Button>
          <Button variant="ghost" size="sm" className="flex-1">
            <svg
              className="w-5 h-5 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
            Share
          </Button>
        </div>
      </div>
    </Card>
  )
}

