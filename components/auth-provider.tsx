"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import type { User } from "@/lib/database.types"
import type { Session } from "@supabase/supabase-js"

interface AuthContextType {
  session: Session | null
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  signOut: async () => {},
  refreshUser: async () => {},
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // 사용자 정보 가져오기
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase.from("users").select("*, roles(*)").eq("id", userId).single()

      if (error) {
        console.error("Error fetching user profile:", error)
        return
      }

      if (data) {
        setUser(data)
      } else {
        // 사용자 프로필이 없는 경우 기본 정보로 생성
        const authUser = (await supabase.auth.getUser()).data.user
        if (authUser) {
          const { data: userData, error: insertError } = await supabase
            .from("users")
            .insert({
              id: userId,
              email: authUser.email,
              full_name: authUser.user_metadata.full_name || "",
              company: authUser.user_metadata.company || "",
              position: authUser.user_metadata.position || "",
              is_verified: true,
              is_active: true,
            })
            .select()

          if (insertError) {
            console.error("Error creating user profile:", insertError)
          } else if (userData && userData.length > 0) {
            setUser(userData[0])
          }
        }
      }
    } catch (error) {
      console.error("Error fetching user profile:", error)
    }
  }

  // 사용자 정보 새로고침
  const refreshUser = async () => {
    if (session?.user?.id) {
      await fetchUserProfile(session.user.id)
    }
  }

  // 로그아웃
  const signOut = async () => {
    await supabase.auth.signOut()
    setSession(null)
    setUser(null)
    router.push("/login")
  }

  // 인증 상태 변경 감지
  useEffect(() => {
    const initializeAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setSession(session)

      if (session?.user?.id) {
        await fetchUserProfile(session.user.id)
      }

      setLoading(false)

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        setSession(session)

        if (session?.user?.id) {
          await fetchUserProfile(session.user.id)
        } else {
          setUser(null)
        }

        router.refresh()
      })

      return () => {
        subscription.unsubscribe()
      }
    }

    initializeAuth()
  }, [router])

  return (
    <AuthContext.Provider value={{ session, user, loading, signOut, refreshUser }}>{children}</AuthContext.Provider>
  )
}
