import { create } from "zustand"
import type { User } from "../types"
import { signIn, setPassword as apiSetPassword, verifyUsername as apiVerifyUsername } from "../lib/api/auth"

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  logout: () => void
  login: (username: string, password: string, role: "admin" | "teacher" | "student") => Promise<User>
  setPassword: (username: string, newPassword: string, role: "teacher" | "student") => Promise<void>
  verifyUsername: (
    username: string,
    role: "admin" | "teacher" | "student",
  ) => Promise<{ exists: boolean; requiresPasswordSetup: boolean } | null>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  logout: () => {
    localStorage.removeItem("token")
    set({ user: null, isAuthenticated: false })
  },

  login: async (username: string, password: string, role: "admin" | "teacher" | "student") => {
    try {
      const data = await signIn(username, password, role)

      // Set the user in the store
      set({ user: data.user, isAuthenticated: true })

      // If the user is a teacher, fetch their subjects
      if (role === "teacher") {
        try {
          // This will be handled by the teacher dashboard component
          // when it mounts, so we don't need to do anything here
        } catch (error) {
          console.error("Failed to fetch teacher subjects:", error)
        }
      }

      return data.user
    } catch (error) {
      console.error("Login error:", error)
      throw new Error("Invalid credentials")
    }
  },

  setPassword: async (username: string, newPassword: string, role: "teacher" | "student") => {
    try {
      await apiSetPassword(username, newPassword, role)
    } catch (error) {
      console.error("Set password error:", error)
      throw new Error("Failed to set password")
    }
  },

  verifyUsername: async (username: string, role: "admin" | "teacher" | "student") => {
    try {
      return await apiVerifyUsername(username, role)
    } catch (error) {
      console.error("Verify username error:", error)
      return null
    }
  },
}))

