import { createClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"

// 환경변수에서 Supabase 연결 정보 가져오기
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// 클라이언트 측 Supabase 클라이언트 생성 (싱글톤 패턴)
const createBrowserClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase 환경변수가 설정되지 않았습니다.")
    return createDummyClient()
  }

  try {
    return createClient<Database>(supabaseUrl, supabaseAnonKey)
  } catch (error) {
    console.error("Supabase 클라이언트 생성 오류:", error)
    return createDummyClient()
  }
}

// 서버 측 Supabase 클라이언트 생성
export const createServerClient = () => {
  const serverSupabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const serverSupabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!serverSupabaseUrl || !serverSupabaseServiceKey) {
    console.error("서버 측 Supabase 환경변수가 설정되지 않았습니다.")
    return createDummyClient()
  }

  try {
    return createClient<Database>(serverSupabaseUrl, serverSupabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  } catch (error) {
    console.error("서버 측 Supabase 클라이언트 생성 오류:", error)
    return createDummyClient()
  }
}

// 더미 클라이언트 생성 함수 (환경변수가 없을 때 사용)
const createDummyClient = () => {
  console.warn("Supabase 환경변수가 설정되지 않았습니다. 더미 클라이언트를 반환합니다.")

  // 더미 데이터
  const dummyBoards = [
    { id: 1, name: "공지사항", slug: "announcements" },
    { id: 2, name: "FAE 기술 업데이트", slug: "fae-technical-updates" },
    { id: 3, name: "FAE 리소스", slug: "fae-resources" },
    { id: 4, name: "Sales 기회", slug: "sales-opportunities" },
    { id: 5, name: "Sales 리소스", slug: "sales-resources" },
    { id: 6, name: "Marketing 캠페인", slug: "marketing-campaigns" },
    { id: 7, name: "Marketing 리소스", slug: "marketing-resources" },
  ]

  const dummyUsers = [
    { id: "1", full_name: "관리자", company: "ASUS", position: "관리자", email: "admin@example.com" },
    { id: "2", full_name: "홍길동", company: "ASUS Korea", position: "FAE", email: "hong@example.com" },
    { id: "3", full_name: "김철수", company: "ASUS Korea", position: "Sales", email: "kim@example.com" },
  ]

  const dummyPosts = [
    {
      id: 1,
      title: "환영합니다",
      content: "ACKR Portal에 오신 것을 환영합니다. 이 포털은 ASUS 직원들을 위한 공간입니다.",
      board_id: 1,
      user_id: "1",
      created_at: new Date().toISOString(),
    },
    {
      id: 2,
      title: "FAE 기술 업데이트",
      content: "최신 기술 업데이트에 대한 정보입니다.",
      board_id: 2,
      user_id: "2",
      created_at: new Date().toISOString(),
    },
    {
      id: 3,
      title: "Sales 기회",
      content: "새로운 영업 기회에 대한 정보입니다.",
      board_id: 4,
      user_id: "3",
      created_at: new Date().toISOString(),
    },
  ]

  // 더미 쿼리 결과 생성 함수
  const createQueryBuilder = (table) => {
    const filters = {}
    let selectedFields = "*"
    let limitValue = null
    let orderField = "created_at"
    let orderDirection = { ascending: false }
    let data = []

    // 테이블에 따라 더미 데이터 설정
    if (table === "boards") data = [...dummyBoards]
    else if (table === "users") data = [...dummyUsers]
    else if (table === "posts") data = [...dummyPosts]

    // 더미 쿼리 빌더 객체
    const queryBuilder = {
      select: (fields) => {
        selectedFields = fields
        return queryBuilder
      },
      eq: (field, value) => {
        filters[field] = value
        return queryBuilder
      },
      in: (field, values) => {
        filters[field] = { type: "in", values }
        return queryBuilder
      },
      or: (orFilter) => {
        // or 필터 처리 (간단하게 구현)
        return queryBuilder
      },
      order: (field, options = {}) => {
        orderField = field
        orderDirection = options
        return queryBuilder
      },
      limit: (value) => {
        limitValue = value
        return queryBuilder
      },
      single: () => {
        // 필터 적용
        const result = data.filter((item) => {
          for (const [key, value] of Object.entries(filters)) {
            if (typeof value === "object" && value.type === "in") {
              if (!value.values.includes(item[key])) return false
            } else if (item[key] !== value) {
              return false
            }
          }
          return true
        })

        // 정렬 적용
        result.sort((a, b) => {
          if (orderDirection.ascending) {
            return a[orderField] > b[orderField] ? 1 : -1
          } else {
            return a[orderField] < b[orderField] ? 1 : -1
          }
        })

        // 첫 번째 항목 반환
        return Promise.resolve({ data: result[0] || null, error: null })
      },
      then: (callback) => {
        // 필터 적용
        let result = data.filter((item) => {
          for (const [key, value] of Object.entries(filters)) {
            if (typeof value === "object" && value.type === "in") {
              if (!value.values.includes(item[key])) return false
            } else if (item[key] !== value) {
              return false
            }
          }
          return true
        })

        // 정렬 적용
        result.sort((a, b) => {
          if (orderDirection.ascending) {
            return a[orderField] > b[orderField] ? 1 : -1
          } else {
            return a[orderField] < b[orderField] ? 1 : -1
          }
        })

        // 제한 적용
        if (limitValue) {
          result = result.slice(0, limitValue)
        }

        // 선택된 필드 처리 (간단하게 구현)
        if ((selectedFields !== "*" && selectedFields.includes("users")) || selectedFields.includes("boards")) {
          // 관계 데이터 추가
          result = result.map((item) => {
            if (item.user_id && selectedFields.includes("users")) {
              item.users = dummyUsers.find((user) => user.id === item.user_id)
            }
            if (item.board_id && selectedFields.includes("boards")) {
              item.boards = dummyBoards.find((board) => board.id === item.board_id)
            }
            return item
          })
        }

        return Promise.resolve({ data: result, error: null }).then(callback)
      },
    }

    return queryBuilder
  }

  // 더미 클라이언트 반환
  return {
    from: (table) => {
      return {
        select: (fields) => createQueryBuilder(table).select(fields),
        insert: (data) => Promise.resolve({ data: { ...data, id: Math.floor(Math.random() * 1000) }, error: null }),
        update: (data) => Promise.resolve({ data, error: null }),
        delete: () => Promise.resolve({ data: null, error: null }),
      }
    },
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: null }),
      signUp: () => Promise.resolve({ data: { user: null, session: null }, error: null }),
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: (callback) => {
        callback("SIGNED_OUT", null)
        return { data: { subscription: { unsubscribe: () => {} } } }
      },
      resetPasswordForEmail: () => Promise.resolve({ data: {}, error: null }),
      updateUser: () => Promise.resolve({ data: { user: null }, error: null }),
      exchangeCodeForSession: () => Promise.resolve({ data: {}, error: null }),
    },
  }
}

// 싱글톤 패턴으로 클라이언트 생성
export const supabase = createBrowserClient()
