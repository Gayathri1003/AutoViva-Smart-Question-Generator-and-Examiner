import axios from "axios"
import type { Student } from "../../types"

const API_URL = "http://localhost:5000/api"

export async function getAllStudents() {
  const { data } = await axios.get(`${API_URL}/students`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  })
  return data
}

export async function getStudentById(id: string) {
  const { data } = await axios.get(`${API_URL}/students/${id}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  })
  return data
}

export async function createStudent(student: Omit<Student, "id">) {
  const { data } = await axios.post(`${API_URL}/students`, student, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  })
  return data
}

export async function updateStudent(id: string, student: Partial<Student>) {
  const { data } = await axios.put(`${API_URL}/students/${id}`, student, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  })
  return data
}

export async function deleteStudent(id: string) {
  const { data } = await axios.delete(`${API_URL}/students/${id}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  })
  return data
}

export async function getStudentsByClass(className: string) {
  const { data } = await axios.get(`${API_URL}/students/class/${className}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  })
  return data
}

export async function getStudentsBySemester(semester: string) {
  const { data } = await axios.get(`${API_URL}/students/semester/${semester}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  })
  return data
}

