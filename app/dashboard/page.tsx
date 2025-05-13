"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { RoleGuard } from "@/components/role-guard"
import { ROLES } from "@/lib/constants"
import {
  BarChart,
  LineChart,
  PieChart,
  Activity,
  Users,
  FileText,
  MessageSquare,
  TrendingUp,
  Calendar,
} from "lucide-react"
import { useRouter } from "next/navigation"

// 임시 통계 데이터
const stats = {
  totalUsers: 256,
  activeUsers: 178,
  totalPosts: 423,
  totalComments: 1245,
  totalDocuments: 87,
  userGrowth: 12.5,
  postGrowth: 8.3,
  engagementRate: 64,
}

// 임시 차트 데이터
const chartData = {
  userActivity: [65, 72, 86, 81, 56, 55, 60, 70, 75, 80, 85, 90],
  postsByCategory: [
    { name: "FAE", value: 35 },
    { name: "Sales", value: 25 },
    { name: "Marketing", value: 20 },
    { name: "공지사항", value: 10 },
    { name: "기타", value: 10 },
  ],
  engagementTrend: [40, 45, 50, 55, 60, 65, 70, 65, 60, 65, 70, 75],
}

// 임시 최근 활동 데이터
const recentActivities = [
  {
    id: 1,
    type: "post",
    user: "김철수",
    action: "새 게시글 작성",
    target: "A100 시리즈 기술 업데이트",
    time: "10분 전",
  },
  {
    id: 2,
    type: "comment",
    user: "이영희",
    action: "댓글 작성",
    target: "제품 로드맵 공유",
    time: "30분 전",
  },
  {
    id: 3,
    type: "document",
    user: "박지민",
    action: "문서 업로드",
    target: "A100 시리즈 사용자 매뉴얼",
    time: "1시간 전",
  },
  {
    id: 4,
    type: "user",
    user: "시스템",
    action: "새 사용자 등록",
    target: "최동욱",
    time: "2시간 전",
  },
  {
    id: 5,
    type: "post",
    user: "정수민",
    action: "게시글 수정",
    target: "영업 전략 회의 결과",
    time: "3시간 전",
  },
]

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const router = useRouter()

  return (
    <RoleGuard requiredRoles={[ROLES.FAE, ROLES.SALES, ROLES.MARKETING]}>
      <div className="container py-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">대시보드</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Calendar className="mr-2 h-4 w-4" />
              이번 주
            </Button>
            <Button variant="outline" size="sm">
              <FileText className="mr-2 h-4 w-4" />
              보고서 다운로드
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">개요</TabsTrigger>
            <TabsTrigger value="users">사용자</TabsTrigger>
            <TabsTrigger value="content">콘텐츠</TabsTrigger>
            <TabsTrigger value="engagement">참여도</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="총 사용자"
                value={stats.totalUsers}
                icon={<Users className="h-5 w-5" />}
                description={`전월 대비 ${stats.userGrowth}% 증가`}
                trend="up"
              />
              <StatCard
                title="총 게시글"
                value={stats.totalPosts}
                icon={<FileText className="h-5 w-5" />}
                description={`전월 대비 ${stats.postGrowth}% 증가`}
                trend="up"
              />
              <StatCard
                title="총 댓글"
                value={stats.totalComments}
                icon={<MessageSquare className="h-5 w-5" />}
                description="활발한 토론 진행 중"
                trend="neutral"
              />
              <StatCard
                title="참여율"
                value={`${stats.engagementRate}%`}
                icon={<Activity className="h-5 w-5" />}
                description="활성 사용자 비율"
                trend="up"
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">사용자 활동 추이</CardTitle>
                  <CardDescription>최근 12개월 활성 사용자 수</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center">
                  <LineChartPlaceholder data={chartData.userActivity} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">카테고리별 게시글</CardTitle>
                  <CardDescription>카테고리별 게시글 분포</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center">
                  <PieChartPlaceholder data={chartData.postsByCategory} />
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">최근 활동</CardTitle>
                <CardDescription>포털 내 최근 활동 내역</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3">
                      <ActivityIcon type={activity.type} />
                      <div className="space-y-1">
                        <p className="text-sm">
                          <span className="font-medium">{activity.user}</span>님이 {activity.action}:{" "}
                          <span className="text-blue-600 hover:underline cursor-pointer">{activity.target}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>사용자 분석</CardTitle>
                <CardDescription>사용자 통계 및 활동 분석</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">활성 사용자</span>
                        <span className="text-sm text-muted-foreground">
                          {stats.activeUsers}/{stats.totalUsers}
                        </span>
                      </div>
                      <Progress value={(stats.activeUsers / stats.totalUsers) * 100} />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">FAE 사용자</span>
                        <span className="text-sm text-muted-foreground">35%</span>
                      </div>
                      <Progress value={35} />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Sales 사용자</span>
                        <span className="text-sm text-muted-foreground">40%</span>
                      </div>
                      <Progress value={40} />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Marketing 사용자</span>
                        <span className="text-sm text-muted-foreground">25%</span>
                      </div>
                      <Progress value={25} />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">이메일 인증 완료</span>
                        <span className="text-sm text-muted-foreground">95%</span>
                      </div>
                      <Progress value={95} />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">프로필 완성도</span>
                        <span className="text-sm text-muted-foreground">78%</span>
                      </div>
                      <Progress value={78} />
                    </div>
                  </div>

                  <div className="pt-6">
                    <h3 className="text-lg font-medium mb-4">사용자 성장 추이</h3>
                    <div className="h-[300px] flex items-center justify-center">
                      <BarChartPlaceholder data={[30, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90]} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>콘텐츠 분석</CardTitle>
                <CardDescription>게시글, 댓글, 문서 통계</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-3">
                    <StatCard
                      title="총 게시글"
                      value={stats.totalPosts}
                      icon={<FileText className="h-5 w-5" />}
                      description={`전월 대비 ${stats.postGrowth}% 증가`}
                      trend="up"
                    />
                    <StatCard
                      title="총 댓글"
                      value={stats.totalComments}
                      icon={<MessageSquare className="h-5 w-5" />}
                      description="게시글당 평균 2.9개 댓글"
                      trend="up"
                    />
                    <StatCard
                      title="총 문서"
                      value={stats.totalDocuments}
                      icon={<FileText className="h-5 w-5" />}
                      description="기술 문서 라이브러리"
                      trend="up"
                    />
                  </div>

                  <div className="pt-6">
                    <h3 className="text-lg font-medium mb-4">카테고리별 게시글 분포</h3>
                    <div className="h-[300px] flex items-center justify-center">
                      <PieChartPlaceholder data={chartData.postsByCategory} />
                    </div>
                  </div>

                  <div className="pt-6">
                    <h3 className="text-lg font-medium mb-4">인기 게시글 (조회수 기준)</h3>
                    <div className="space-y-4">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center gap-4">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-medium">
                            {i}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-medium">A100 시리즈 기술 업데이트 및 성능 최적화 가이드</h4>
                            <p className="text-xs text-muted-foreground">FAE 포털 • 조회수 {120 - i * 10}회</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="engagement" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>참여도 분석</CardTitle>
                <CardDescription>사용자 참여 및 상호작용 통계</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">참여율</span>
                        <span className="text-sm text-muted-foreground">{stats.engagementRate}%</span>
                      </div>
                      <Progress value={stats.engagementRate} />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">댓글 참여</span>
                        <span className="text-sm text-muted-foreground">45%</span>
                      </div>
                      <Progress value={45} />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">좋아요 참여</span>
                        <span className="text-sm text-muted-foreground">72%</span>
                      </div>
                      <Progress value={72} />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">문서 다운로드</span>
                        <span className="text-sm text-muted-foreground">38%</span>
                      </div>
                      <Progress value={38} />
                    </div>
                  </div>

                  <div className="pt-6">
                    <h3 className="text-lg font-medium mb-4">참여도 추이</h3>
                    <div className="h-[300px] flex items-center justify-center">
                      <LineChartPlaceholder data={chartData.engagementTrend} />
                    </div>
                  </div>

                  <div className="pt-6">
                    <h3 className="text-lg font-medium mb-4">활발한 사용자</h3>
                    <div className="space-y-4">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center gap-4">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-medium">
                            {i}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-medium">김철수</h4>
                            <p className="text-xs text-muted-foreground">
                              게시글 {15 - i}개 • 댓글 {30 - i * 2}개 • 좋아요 {50 - i * 3}개
                            </p>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => router.push("/profile")}>
                            프로필
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </RoleGuard>
  )
}

function StatCard({ title, value, icon, description, trend }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">{icon}</div>
          {trend === "up" && <TrendingUp className="h-5 w-5 text-green-500" />}
          {trend === "down" && <TrendingUp className="h-5 w-5 text-red-500 rotate-180" />}
          {trend === "neutral" && <Activity className="h-5 w-5 text-yellow-500" />}
        </div>
        <div className="mt-4">
          <h3 className="text-2xl font-bold">{value}</h3>
          <p className="text-sm text-muted-foreground">{title}</p>
        </div>
        <p className="text-xs text-muted-foreground mt-2">{description}</p>
      </CardContent>
    </Card>
  )
}

function ActivityIcon({ type }) {
  switch (type) {
    case "post":
      return <FileText className="h-5 w-5 text-blue-500" />
    case "comment":
      return <MessageSquare className="h-5 w-5 text-green-500" />
    case "document":
      return <FileText className="h-5 w-5 text-purple-500" />
    case "user":
      return <Users className="h-5 w-5 text-orange-500" />
    default:
      return <Activity className="h-5 w-5 text-gray-500" />
  }
}

// 차트 플레이스홀더 컴포넌트들
function LineChartPlaceholder({ data }) {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <LineChart className="h-8 w-8 text-muted-foreground" />
      <span className="ml-2 text-muted-foreground">라인 차트 플레이스홀더</span>
    </div>
  )
}

function BarChartPlaceholder({ data }) {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <BarChart className="h-8 w-8 text-muted-foreground" />
      <span className="ml-2 text-muted-foreground">바 차트 플레이스홀더</span>
    </div>
  )
}

function PieChartPlaceholder({ data }) {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <PieChart className="h-8 w-8 text-muted-foreground" />
      <span className="ml-2 text-muted-foreground">파이 차트 플레이스홀더</span>
    </div>
  )
}
