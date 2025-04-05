import axios from "axios"

const API_URL = "http://localhost:5000/api"

export async function signIn(username: string, password: string, role: "admin" | "teacher" | "student") {
  const { data } = await axios.post(`${API_URL}/auth/login`, {
    username,
    password,
    role,
  })

  // Store the token in localStorage
  if (data.token) {
    localStorage.setItem("token", data.token)
  }

  return data
}

export async function verifyUsername(username: string, role: "admin" | "teacher" | "student") {
  try {
    const { data } = await axios.post(`${API_URL}/auth/verify-username`, {
      username,
      role,
    })
    return data
  } catch (error) {
    return null
  }
}

export async function setPassword(username: string, newPassword: string, role: "teacher" | "student") {
  const { data } = await axios.post(`${API_URL}/auth/set-password`, {
    username,
    newPassword,
    role,
  })
  return data
}

