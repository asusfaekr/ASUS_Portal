import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // 미들웨어에서 리디렉션 로직 제거
  return NextResponse.next()
}
