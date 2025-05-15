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
      console.log("Fetching user profile for:", userId)
      const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

      if (error) {
        console.error("Error fetching user profile:", error)
        return null
      }

      if (data) {
        console.log("User profile found:", data)
        setUser(data)
        return data
      } else {
        console.log("User profile not found, creating new profile")
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
              is_verified: false,
              is_active: true,
            })
            .select()

          if (insertError) {
            console.error("Error creating user profile:", insertError)
            return null
          } else if (userData && userData.length > 0) {
            console.log("New user profile created:", userData[0])
            setUser(userData[0])
            return userData[0]
          }
        }
      }
      return null
    } catch (error) {
      console.error("Error in fetchUserProfile:", error)
      return null
    }
  }

  // 사용자 정보 새로고침
  const refreshUser = async () => {
    if (session?.user?.id) {
      return await fetchUserProfile(session.user.id)
    }
    return null
  }

  // 로그아웃
  const signOut = async () => {
    await supabase.auth.signOut()
    setSession(null)
    setUser(null)
    window.location.href = "/login" // 전체 페이지 새로고침으로 변경
  }

  // 인증 상태 변경 감지
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log("Initializing auth...")
        setLoading(true)

        // 세션 가져오기
        const {
          data: { session },
        } = await supabase.auth.getSession()

        console.log("Session from getSession:", session ? "Found" : "Not found")
        setSession(session)

        if (session?.user?.id) {
          await fetchUserProfile(session.user.id)
        } else {
          setUser(null)
        }

        // 인증 상태 변경 감지
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log("Auth state changed:", event, session ? "Session exists" : "No session")
          setSession(session)

          if (session?.user?.id) {
            await fetchUserProfile(session.user.id)
          } else {
            setUser(null)
          }

          // 페이지 새로고침 대신 상태 업데이트
          if (event === "SIGNED_IN") {
            router.refresh()
          } else if (event === "SIGNED_OUT") {
            router.refresh()
          }
        })

        setLoading(false)

        return () => {
          subscription.unsubscribe()
        }
      } catch (error) {
        console.error("Auth initialization error:", error)
        setLoading(false)
      }
    }

    initializeAuth()
  }, [router])

  return (
    <AuthContext.Provider value={{ session, user, loading, signOut, refreshUser }}>{children}</AuthContext.Provider>
  )
}
