import { create } from "zustand"
import * as api from "../lib/api/students"
import type { Student } from "../types"

interface StudentState {
  students: Student[]
  loading: boolean
  error: string | null
  fetchStudents: () => Promise<void>
  addStudent: (student: Omit<Student, "id">) => Promise<void>
  updateStudent: (id: string, student: Partial<Student>) => Promise<void>
  deleteStudent: (id: string) => Promise<void>
  getStudentsByClass: (className: string) => Student[]
  getStudentsBySemester: (semester: string) => Student[]
}

export const useStudentStore = create<StudentState>((set, get) => ({
  students: [],
  loading: false,
  error: null,

  fetchStudents: async () => {
    set({ loading: true, error: null })
    try {
      const students = await api.getAllStudents()
      // Ensure each student has the required properties
      const processedStudents = students.map((student: any) => ({
        id: student._id || student.id,
        name: student.name,
        username: student.username,
        email: student.email || "",
        class: student.class || "",
        semester: student.semester || "",
        department: student.department || "",
        rollNumber: student.rollNumber || "",
      }))
      set({ students: processedStudents, loading: false })
    } catch (error) {
      console.error("Error fetching students:", error)
      set({ error: "Failed to fetch students", loading: false })
    }
  },

  addStudent: async (student) => {
    set({ loading: true, error: null })
    try {
      const newStudent = await api.createStudent(student)
      set((state) => ({
        students: [...state.students, newStudent],
        loading: false,
      }))
    } catch (error) {
      set({ error: "Failed to add student", loading: false })
    }
  },

  updateStudent: async (id, student) => {
    set({ loading: true, error: null })
    try {
      const updatedStudent = await api.updateStudent(id, student)
      set((state) => ({
        students: state.students.map((s) => (s.id === id ? { ...s, ...updatedStudent } : s)),
        loading: false,
      }))
    } catch (error) {
      set({ error: "Failed to update student", loading: false })
    }
  },

  deleteStudent: async (id) => {
    set({ loading: true, error: null })
    try {
      await api.deleteStudent(id)
      set((state) => ({
        students: state.students.filter((s) => s.id !== id),
        loading: false,
      }))
    } catch (error) {
      set({ error: "Failed to delete student", loading: false })
    }
  },

  getStudentsByClass: (className) => {
    return get().students.filter((student) => student.class === className)
  },

  getStudentsBySemester: (semester) => {
    return get().students.filter((student) => student.semester === semester)
  },
}))

