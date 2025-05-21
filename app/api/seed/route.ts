import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // 1. 기본 역할 추가
    await supabase.from("roles").upsert(
      [
        { id: 1, name: "FAE", description: "Field Application Engineer", created_at: new Date().toISOString() },
        { id: 2, name: "Sales", description: "Sales Team", created_at: new Date().toISOString() },
        { id: 3, name: "Marketing", description: "Marketing Team", created_at: new Date().toISOString() },
      ],
      { onConflict: "id" },
    )

    // 2. 기본 게시판 추가
    await supabase.from("boards").upsert(
      [
        {
          id: 1,
          name: "공지사항",
          slug: "announcements",
          description: "공지사항 게시판",
          role_id: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 2,
          name: "FAE",
          slug: "fae",
          description: "FAE 게시판",
          role_id: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 3,
          name: "Sales",
          slug: "sales",
          description: "Sales 게시판",
          role_id: 2,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 4,
          name: "Marketing",
          slug: "marketing",
          description: "Marketing 게시판",
          role_id: 3,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
      { onConflict: "id" },
    )

    // 3. 현재 로그인한 사용자 정보 가져오기
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: "로그인한 사용자가 없습니다. 로그인 후 다시 시도해주세요." },
        { status: 401 },
      )
    }

    // 4. 테스트 게시글 추가
    // 공지사항 게시글
    await supabase.from("posts").upsert(
      [
        {
          id: 1,
          title: "[공지] ACKR Portal 오픈 안내",
          content:
            "안녕하세요, ASUS 직원 여러분.\n\nACKR Portal이 오픈되었습니다. 이 포털은 ASUS 직원들 간의 정보 공유와 소통을 위한 공간입니다.\n\n주요 기능:\n- 각 부서별 전용 게시판\n- 기술 문서 라이브러리\n- 실시간 메시징\n- 알림 시스템\n\n많은 이용 부탁드립니다.",
          board_id: 1,
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 2,
          title: "[공지] 시스템 점검 안내",
          content:
            "안녕하세요, ASUS 직원 여러분.\n\n시스템 점검으로 인해 다음 주 토요일 오전 2시부터 4시까지 서비스 이용이 제한됩니다.\n\n점검 내용:\n- 서버 업그레이드\n- 보안 패치 적용\n- 데이터베이스 최적화\n\n양해 부탁드립니다.",
          board_id: 1,
          user_id: user.id,
          created_at: new Date(Date.now() - 86400000).toISOString(), // 1일 전
          updated_at: new Date(Date.now() - 86400000).toISOString(),
        },
      ],
      { onConflict: "id" },
    )

    // FAE 게시글
    await supabase.from("posts").upsert(
      [
        {
          id: 3,
          title: "A100 시리즈 기술 업데이트",
          content:
            "A100 시리즈의 최신 펌웨어 업데이트가 릴리스되었습니다.\n\n주요 변경사항:\n- 성능 최적화\n- 버그 수정\n- 새로운 기능 추가\n\n자세한 내용은 첨부된 문서를 참조하세요.",
          board_id: 2,
          user_id: user.id,
          created_at: new Date(Date.now() - 172800000).toISOString(), // 2일 전
          updated_at: new Date(Date.now() - 172800000).toISOString(),
        },
      ],
      { onConflict: "id" },
    )

    // Sales 게시글
    await supabase.from("posts").upsert(
      [
        {
          id: 4,
          title: "2023년 4분기 판매 전략",
          content:
            "2023년 4분기 판매 전략에 대한 내용입니다.\n\n주요 포인트:\n- 타겟 시장 분석\n- 경쟁사 동향\n- 프로모션 계획\n\n자세한 내용은 회의에서 논의하겠습니다.",
          board_id: 3,
          user_id: user.id,
          created_at: new Date(Date.now() - 345600000).toISOString(), // 4일 전
          updated_at: new Date(Date.now() - 345600000).toISOString(),
        },
      ],
      { onConflict: "id" },
    )

    // Marketing 게시글
    await supabase.from("posts").upsert(
      [
        {
          id: 5,
          title: "신제품 출시 마케팅 계획",
          content:
            "다가오는 신제품 출시를 위한 마케팅 계획입니다.\n\n주요 일정:\n- 티저 캠페인: 10월 1일\n- 소셜미디어 홍보: 10월 10일\n- 공식 출시 이벤트: 10월 15일\n\n각 팀별 역할과 책임은 첨부 문서를 참조하세요.",
          board_id: 4,
          user_id: user.id,
          created_at: new Date(Date.now() - 518400000).toISOString(), // 6일 전
          updated_at: new Date(Date.now() - 518400000).toISOString(),
        },
      ],
      { onConflict: "id" },
    )

    // 5. 테스트 댓글 추가
    await supabase.from("comments").upsert(
      [
        {
          id: 1,
          content: "포털 오픈을 축하합니다! 많은 도움이 될 것 같습니다.",
          post_id: 1,
          user_id: user.id,
          created_at: new Date(Date.now() - 43200000).toISOString(), // 12시간 전
          updated_at: new Date(Date.now() - 43200000).toISOString(),
        },
        {
          id: 2,
          content: "시스템 점검 일정 확인했습니다. 감사합니다.",
          post_id: 2,
          user_id: user.id,
          created_at: new Date(Date.now() - 64800000).toISOString(), // 18시간 전
          updated_at: new Date(Date.now() - 64800000).toISOString(),
        },
      ],
      { onConflict: "id" },
    )

    return NextResponse.json({ success: true, message: "테스트 데이터가 성공적으로 추가되었습니다." })
  } catch (error) {
    console.error("Seed error:", error)
    return NextResponse.json({ success: false, error: "테스트 데이터 추가 중 오류가 발생했습니다." }, { status: 500 })
  }
}
