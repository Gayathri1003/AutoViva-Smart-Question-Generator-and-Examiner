import { create } from "zustand"
import type { Teacher, SubjectAssignment } from "../types"
import { getTeachers, addTeacher, updateTeacher, deleteTeacher } from "../lib/api/teachers"
import { assignTeacher, removeTeacher, getAllSubjects, createSubject, getTeacherSubjects } from "../lib/api/subjects"

interface TeacherState {
  teachers: Teacher[]
  subjects: any[] // Store all subjects
  subjectAssignments: SubjectAssignment[]
  loading: boolean
  error: string | null
  fetchTeachers: () => Promise<void>
  fetchSubjects: () => Promise<void>
  getTeacherSubjects: () => Promise<void>
  addTeacher: (
    teacher: Omit<Teacher, "id" | "hasSetPassword" | "subjects" | "password" | "department">,
  ) => Promise<void>
  updateTeacher: (id: string, teacher: Partial<Teacher>) => Promise<void>
  deleteTeacher: (id: string) => Promise<void>
  assignSubject: (assignment: Omit<SubjectAssignment, "id">) => Promise<void>
  removeSubjectAssignment: (assignmentId: string) => Promise<void>
  getTeacherAssignments: (teacherId: string) => SubjectAssignment[]
  isSubjectAssigned: (subjectCode: string, department: string, semester: number, class_: string) => boolean
}

export const useTeacherStore = create<TeacherState>((set, get) => ({
  teachers: [],
  subjects: [],
  subjectAssignments: [],
  loading: false,
  error: null,

  fetchTeachers: async () => {
    set({ loading: true, error: null })
    try {
      const teachers = await getTeachers()
      set({ teachers, loading: false })
    } catch (error) {
      console.error("Fetch teachers error:", error)
      set({ error: "Failed to fetch teachers", loading: false })
    }
  },

  fetchSubjects: async () => {
    set({ loading: true, error: null })
    try {
      const subjects = await getAllSubjects()

      // Create subject assignments from the subjects data
      const assignments: SubjectAssignment[] = []

      subjects.forEach((subject) => {
        if (subject.teachers && subject.teachers.length > 0) {
          subject.teachers.forEach((teacher: any) => {
            assignments.push({
              id: `${subject._id || subject.id}-${teacher._id || teacher.id}`,
              teacherId: teacher._id || teacher.id,
              teacherName: teacher.name,
              teacherUsername: teacher.username,
              subjectCode: subject.code,
              subjectName: subject.name,
              department: subject.department,
              semester: subject.semester,
              class: subject.class || "A", // Default class if not provided
              isLab: subject.isLab || false,
            })
          })
        }
      })

      set({
        subjects,
        subjectAssignments: assignments,
        loading: false,
      })
    } catch (error) {
      console.error("Fetch subjects error:", error)
      set({ error: "Failed to fetch subjects", loading: false })
    }
  },

  getTeacherSubjects: async () => {
    set({ loading: true, error: null })
    try {
      const subjects = await getTeacherSubjects()

      // Create subject assignments from the teacher's subjects
      const assignments: SubjectAssignment[] = subjects.map((subject: any) => ({
        id: subject._id || subject.id,
        teacherId: subject.teacher || "",
        teacherName: "", // Will be filled in getTeacherAssignments
        teacherUsername: "",
        subjectCode: subject.code,
        subjectName: subject.name,
        department: subject.department,
        semester: subject.semester,
        class: subject.class || "A", // Default class if not provided
        isLab: subject.isLab || false,
      }))

      set((state) => ({
        subjects: [
          ...state.subjects,
          ...subjects.filter(
            (s: any) => !state.subjects.some((existing) => existing._id === s._id || existing.id === s.id),
          ),
        ],
        subjectAssignments: [...state.subjectAssignments, ...assignments],
        loading: false,
      }))
    } catch (error) {
      console.error("Get teacher subjects error:", error)
      set({ error: "Failed to fetch teacher subjects", loading: false })
    }
  },

  addTeacher: async (teacherData) => {
    set({ loading: true, error: null })
    try {
      const newTeacher = await addTeacher(teacherData)
      set((state) => ({
        teachers: [
          ...state.teachers,
          {
            ...newTeacher,
            department: "",
            subjects: [],
            hasSetPassword: false,
          },
        ],
        loading: false,
      }))
    } catch (error) {
      console.error("Add teacher error:", error)
      set({ error: "Failed to add teacher", loading: false })
      throw error
    }
  },

  updateTeacher: async (id, teacherData) => {
    set({ loading: true, error: null })
    try {
      const updatedTeacher = await updateTeacher(id, teacherData)
      set((state) => ({
        teachers: state.teachers.map((teacher) => (teacher.id === id ? { ...teacher, ...updatedTeacher } : teacher)),
        loading: false,
      }))
    } catch (error) {
      console.error("Update teacher error:", error)
      set({ error: "Failed to update teacher", loading: false })
      throw error
    }
  },

  deleteTeacher: async (id) => {
    set({ loading: true, error: null })
    try {
      await deleteTeacher(id)
      set((state) => ({
        teachers: state.teachers.filter((teacher) => teacher.id !== id),
        subjectAssignments: state.subjectAssignments.filter((assignment) => assignment.teacherId !== id),
        loading: false,
      }))
    } catch (error) {
      console.error("Delete teacher error:", error)
      set({ error: "Failed to delete teacher", loading: false })
      throw error
    }
  },

  assignSubject: async (assignment) => {
    set({ loading: true, error: null })
    try {
      // Find the selected teacher to get their information
      const selectedTeacher = get().teachers.find((t) => t.id === assignment.teacherId)
      if (!selectedTeacher) {
        throw new Error("Teacher not found")
      }

      // Check if a subject with the same code, department, semester, and class already exists
      const existingSubject = get().subjects.find(
        (s) =>
          s.code === assignment.subjectCode &&
          s.department === assignment.department &&
          s.semester === assignment.semester,
      )

      let subjectId

      if (existingSubject) {
        // If subject exists, use its ID
        subjectId = existingSubject._id || existingSubject.id

        // Check if this subject is already assigned to a teacher for this class
        const isAssignedToClass = get().subjectAssignments.some(
          (a) =>
            a.subjectCode === assignment.subjectCode &&
            a.department === assignment.department &&
            a.semester === assignment.semester &&
            a.class === assignment.class,
        )

        if (isAssignedToClass) {
          throw new Error("This subject is already assigned to another teacher for this class")
        }
      } else {
        // If subject doesn't exist, create a new one
        const newSubject = {
          code: assignment.subjectCode,
          name: assignment.subjectName,
          department: assignment.department,
          semester: assignment.semester,
          isLab: assignment.isLab,
        }

        // Call API to create the subject
        const createdSubject = await createSubject(newSubject)
        subjectId = createdSubject._id || createdSubject.id

        // Add the new subject to the local state
        set((state) => ({
          subjects: [...state.subjects, createdSubject],
        }))
      }

      // Call the backend API to assign the teacher to the subject
      // Include teacher name and username in the assignment
      await assignTeacher(subjectId, assignment.teacherId, {
        name: selectedTeacher.name,
        username: selectedTeacher.username,
      })

      // Update local state with teacher information
      const newAssignment: SubjectAssignment = {
        id: `${subjectId}-${assignment.teacherId}`, // Create a consistent ID format
        ...assignment,
        teacherName: selectedTeacher.name,
        teacherUsername: selectedTeacher.username,
      }

      set((state) => ({
        subjectAssignments: [...state.subjectAssignments, newAssignment],
        loading: false,
      }))
    } catch (error) {
      console.error("Assign subject error:", error)
      set({ error: "Failed to assign subject", loading: false })
      throw error
    }
  },

  removeSubjectAssignment: async (assignmentId) => {
    set({ loading: true, error: null })
    try {
      const assignment = get().subjectAssignments.find((a) => a.id === assignmentId)
      if (!assignment) {
        throw new Error("Assignment not found")
      }

      // Find the subject in our subjects list
      const subject = get().subjects.find(
        (s) =>
          s.code === assignment.subjectCode &&
          s.department === assignment.department &&
          s.semester === assignment.semester,
      )

      if (!subject) {
        throw new Error("Subject not found")
      }

      // Call the backend API to remove the teacher from the subject
      await removeTeacher(subject._id || subject.id, assignment.teacherId)

      // Update local state
      set((state) => ({
        subjectAssignments: state.subjectAssignments.filter((a) => a.id !== assignmentId),
        loading: false,
      }))
    } catch (error) {
      console.error("Remove subject assignment error:", error)
      set({ error: "Failed to remove subject assignment", loading: false })
      throw error
    }
  },

  getTeacherAssignments: (teacherId) => {
    // Get all assignments for this teacher
    const assignments = get().subjectAssignments.filter((assignment) => assignment.teacherId === teacherId)

    // Make sure we have all the necessary information
    return assignments.map((assignment) => {
      const teacher = get().teachers.find((t) => t.id === assignment.teacherId)
      return {
        ...assignment,
        // Ensure teacherName is included
        teacherName: teacher?.name || assignment.teacherName || "Unknown Teacher",
        teacherUsername: teacher?.username || assignment.teacherUsername || "",
      }
    })
  },

  isSubjectAssigned: (subjectCode, department, semester, class_) => {
    return get().subjectAssignments.some(
      (assignment) =>
        assignment.subjectCode.toLowerCase() === subjectCode.toLowerCase() &&
        assignment.department.toLowerCase() === department.toLowerCase() &&
        assignment.semester === semester &&
        assignment.class.toLowerCase() === class_.toLowerCase(),
    )
  },
}))

