// 애플리케이션 상수
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://asus-portal.vercel.app"

// 역할 ID
export const ROLES = {
  FAE: 1,
  SALES: 2,
  MARKETING: 3,
  ADMIN: 999, // 관리자 역할 ID 추가
}

// 역할별 접근 가능한 게시판
export const ROLE_BOARDS = {
  [ROLES.FAE]: ["fae"],
  [ROLES.SALES]: ["sales"],
  [ROLES.MARKETING]: ["marketing"],
  [ROLES.ADMIN]: ["announcements", "fae", "sales", "marketing"],
  // 모든 사용자가 접근 가능한 게시판
  ALL: ["announcements"],
}
