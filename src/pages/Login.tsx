"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "../store/authStore"
import { Icons } from "../components/icons"
import toast from "react-hot-toast"

const Login = () => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [selectedRole, setSelectedRole] = useState<"admin" | "teacher" | "student">("admin")
  const [isSettingPassword, setIsSettingPassword] = useState(false)
  const [isVerifyingUsername, setIsVerifyingUsername] = useState(true)
  const navigate = useNavigate()
  const { login, setUser, setPassword: setUserPassword, verifyUsername } = useAuthStore()

  const handleVerifyUsername = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!username.trim()) {
      toast.error("Please enter a username")
      return
    }

    try {
      const exists = await verifyUsername(username, selectedRole)

      if (exists) {
        setIsVerifyingUsername(false)
        if (exists.requiresPasswordSetup) {
          setIsSettingPassword(true)
          toast.success("Please set your password for first-time login")
        }
      } else {
        toast.error("Username not found")
      }
    } catch (error) {
      toast.error("Failed to verify username")
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const user = await login(username, password, selectedRole)

      if (user.requiresPasswordSetup) {
        setIsSettingPassword(true)
        toast.success("Please set your password for first-time login")
        return
      }

      setUser(user)

      // Redirect based on role
      switch (user.role) {
        case "admin":
          navigate("/admin/teachers")
          break
        case "teacher":
          navigate("/teacher")
          break
        case "student":
          navigate("/student/exams")
          break
      }

      toast.success("Login successful")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Invalid username or password")
    }
  }

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long")
      return
    }

    try {
      await setUserPassword(username, newPassword, selectedRole as "teacher" | "student")
      toast.success("Password set successfully")

      // Log in with the new password
      const user = await login(username, newPassword, selectedRole)
      setUser(user)

      // Redirect to appropriate dashboard
      if (selectedRole === "teacher") {
        navigate("/teacher")
      } else {
        navigate("/student/exams")
      }
    } catch (error) {
      toast.error("Failed to set password")
    }
  }

  const resetForm = () => {
    setIsVerifyingUsername(true)
    setIsSettingPassword(false)
    setPassword("")
    setNewPassword("")
    setConfirmPassword("")
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">College Management System</h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {isSettingPassword
            ? "Set Your Password"
            : isVerifyingUsername
              ? "Please enter your username"
              : "Enter your password"}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Role Selection - Always visible */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700">Select Role</label>
            <div className="mt-1 grid grid-cols-3 gap-3">
              {(["admin", "teacher", "student"] as const).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => {
                    setSelectedRole(role)
                    resetForm()
                  }}
                  className={`
                    flex flex-col items-center justify-center p-3 border rounded-lg
                    ${
                      selectedRole === role
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                        : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    }
                  `}
                >
                  <Icons.UserCircle className="w-6 h-6 mb-1" />
                  <span className="text-sm capitalize">{role}</span>
                </button>
              ))}
            </div>
          </div>

          {isVerifyingUsername ? (
            <form className="space-y-6" onSubmit={handleVerifyUsername}>
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Icons.User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder={selectedRole === "teacher" ? "Enter your teacher ID" : "Enter your username"}
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Continue
                </button>
              </div>
            </form>
          ) : isSettingPassword ? (
            <form className="space-y-6" onSubmit={handleSetPassword}>
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Icons.Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="newPassword"
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter new password"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Icons.Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>

              <div className="flex flex-col space-y-3">
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Set Password
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Back
                </button>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Password must be at least 6 characters long</span>
                </div>
              </div>
            </form>
          ) : (
            <form className="space-y-6" onSubmit={handleLogin}>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Icons.Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              <div className="flex flex-col space-y-3">
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Back
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  )
}

export default Login

