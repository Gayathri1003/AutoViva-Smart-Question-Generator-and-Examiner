import axios from "axios"
import type { Teacher } from "../../types"

const API_URL = "http://localhost:5000/api"

export async function getTeachers(): Promise<Teacher[]> {
  const { data } = await axios.get(`${API_URL}/teachers`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  })

  // Log the raw data for debugging
  console.log("Raw teacher data from API:", data)

  return data.map(
    (teacher: any): Teacher => ({
      id: teacher._id,
      name: teacher.name,
      username: teacher.username,
      email: teacher.email,
      subjects: teacher.subjects || [],
      hasSetPassword: teacher.hasSetPassword,
    }),
  )
}

export async function addTeacher(
  teacher: Omit<Teacher, "id" | "hasSetPassword" | "subjects" | "password" | "department">,
) {
  const { data } = await axios.post(`${API_URL}/teachers`, teacher, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  })
  return data
}

export async function updateTeacher(id: string, teacher: Partial<Teacher>) {
  const { data } = await axios.put(`${API_URL}/teachers/${id}`, teacher, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  })
  return data
}

export async function deleteTeacher(id: string) {
  const { data } = await axios.delete(`${API_URL}/teachers/${id}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  })
  return data
}

