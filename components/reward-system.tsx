import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function RewardSystem() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">보상 시스템</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">레벨 혜택</h3>
            <div className="grid grid-cols-2 gap-2">
              {levels.map((level) => (
                <div key={level.id} className="flex items-center gap-2">
                  <Badge
                    variant={level.current ? "default" : "outline"}
                    className={level.current ? "bg-[#0a66c2]" : ""}
                  >
                    Lv.{level.id}
                  </Badge>
                  <span className="text-xs">{level.benefit}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t">
            <h3 className="text-sm font-medium">포인트 획득 방법</h3>
            <ul className="space-y-1 text-xs">
              {pointSources.map((source, index) => (
                <li key={index} className="flex justify-between">
                  <span>{source.activity}</span>
                  <span className="font-medium">+{source.points}P</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const levels = [
  { id: 1, benefit: "기본 접근", current: false },
  { id: 2, benefit: "댓글 작성", current: false },
  { id: 3, benefit: "게시글 작성", current: true },
  { id: 4, benefit: "파일 업로드", current: false },
  { id: 5, benefit: "특별 이벤트", current: false },
  { id: 6, benefit: "VIP 혜택", current: false },
]

const pointSources = [
  { activity: "로그인", points: 5 },
  { activity: "게시글 작성", points: 20 },
  { activity: "댓글 작성", points: 5 },
  { activity: "좋아요 받기", points: 2 },
  { activity: "게시글 조회수", points: 1 },
]
