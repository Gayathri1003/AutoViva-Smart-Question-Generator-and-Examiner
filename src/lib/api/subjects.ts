import axios from "axios"
import type { Subject } from "../../types"

const API_URL = "http://localhost:5000/api"

// Update the getAllSubjects function to ensure it returns populated teacher data
export async function getAllSubjects() {
  const { data } = await axios.get(`${API_URL}/subjects`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  })

  // Transform the data to match our frontend structure
  return data.map((subject: any) => ({
    ...subject,
    id: subject._id || subject.id,
    teacherDetails:
      subject.teachers?.map((teacher: any) => ({
        teacherId: teacher.id || teacher._id,
        name: teacher.name,
        username: teacher.username,
      })) || [],
  }))
}

export async function getTeacherSubjects() {
  const { data } = await axios.get(`${API_URL}/subjects/teacher`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  })

  // Transform the data to match our frontend structure
  return data.map((subject: any) => ({
    ...subject,
    id: subject._id || subject.id,
    teachers:
      subject.teachers?.map((teacher: any) => ({
        id: teacher.id || teacher._id,
        name: teacher.name,
        username: teacher.username,
      })) || [],
  }))
}

// Update the createSubject function to handle the correct subject structure
export async function createSubject(subject: Omit<Subject, "id">) {
  const { data } = await axios.post(
    `${API_URL}/subjects`,
    {
      code: subject.code,
      name: subject.name,
      department: subject.department,
      semester: subject.semester,
      isLab: subject.isLab || false,
    },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    },
  )
  return data
}

// Fix the API endpoint for assignTeacher
export async function assignTeacher(
  subjectId: string,
  teacherId: string,
  teacherInfo?: { name: string; username: string },
) {
  const { data } = await axios.post(
    `${API_URL}/subjects/assign-teacher`,
    {
      subjectId,
      teacherId,
      teacherName: teacherInfo?.name,
      teacherUsername: teacherInfo?.username,
    },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    },
  )
  return data
}

export async function removeTeacher(subjectId: string, teacherId: string) {
  const { data } = await axios.post(
    `${API_URL}/subjects/remove-teacher`,
    {
      subjectId,
      teacherId,
    },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    },
  )
  return data
}

