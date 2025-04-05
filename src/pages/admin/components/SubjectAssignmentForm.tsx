"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useTeacherStore } from "../../../store/teacherStore"
import toast from "react-hot-toast"

interface SubjectAssignmentFormProps {
  assignment?: any
  onClose: () => void
}

const SubjectAssignmentForm: React.FC<SubjectAssignmentFormProps> = ({ assignment, onClose }) => {
  const { teachers, subjects, fetchSubjects, assignSubject, isSubjectAssigned } = useTeacherStore()
  const [formData, setFormData] = useState({
    teacherId: "",
    subjectCode: "",
    subjectName: "",
    department: "",
    semester: "1",
    class: "",
    isLab: false,
  })

  useEffect(() => {
    // Fetch subjects only once when component mounts
    fetchSubjects()
  }, [fetchSubjects])

  // Separate useEffect for assignment changes to avoid dependency loop
  useEffect(() => {
    // If editing an existing assignment, populate the form
    if (assignment) {
      setFormData({
        teacherId: assignment.teacherId,
        subjectCode: assignment.subjectCode,
        subjectName: assignment.subjectName,
        department: assignment.department,
        semester: assignment.semester.toString(),
        class: assignment.class,
        isLab: assignment.isLab,
      })
    }
  }, [assignment])

  const departments = ["Computer Science", "Electronics", "Mechanical", "Civil", "Electrical"]

  // Update the handleSubmit function to include teacher name and username when assigning a subject
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Find the selected teacher to get their information
      const selectedTeacher = teachers.find((t) => t.id === formData.teacherId)
      if (!selectedTeacher) {
        toast.error("Selected teacher not found")
        return
      }

      // Check if a subject with the same code, department, semester, and class already exists
      // const existingSubject = get().subjects.find(
      //   (s) =>
      //     s.code === assignment.subjectCode &&
      //     s.department === assignment.department &&
      //     s.semester === assignment.semester,
      // )

      // let subjectId

      // if (existingSubject) {
      //   // If subject exists, use its ID
      //   subjectId = existingSubject._id

      //   // Check if this subject is already assigned to a teacher for the same class
      //   const isAssignedToClass = get().subjectAssignments.some(
      //     (a) =>
      //       a.subjectCode === assignment.subjectCode &&
      //       a.department === assignment.department &&
      //       a.semester === assignment.semester &&
      //       a.class === assignment.class,
      //   )

      //   if (isAssignedToClass && !assignment) {
      //     toast.error("This subject is already assigned to a teacher for this class")
      //     return
      //   }
      // } else {
      //   // If subject doesn't exist, create a new one
      //   const newSubject = {
      //     code: assignment.subjectCode,
      //     name: assignment.subjectName,
      //     department: assignment.department,
      //     semester: assignment.semester,
      //     isLab: assignment.isLab,
      //   }

      //   // Call API to create the subject
      //   const createdSubject = await createSubject(newSubject)
      //   subjectId = createdSubject._id

      //   // Add the new subject to the local state
      //   set((state) => ({
      //     subjects: [...state.subjects, createdSubject],
      //   }))
      // }

      // Call the backend API to assign the teacher to the subject
      // Include teacher name and username in the assignment
      // await assignTeacher(subjectId, assignment.teacherId, {
      //   name: selectedTeacher.name,
      //   username: selectedTeacher.username
      // })

      // Update local state with teacher information
      // const newAssignment: SubjectAssignment = {
      //   id: Date.now().toString(), // This will be replaced by the actual ID from the backend
      //   ...assignment,
      //   teacherName: selectedTeacher.name,
      //   teacherUsername: selectedTeacher.username,
      // }

      // set((state) => ({
      //   subjectAssignments: [...state.subjectAssignments, newAssignment],
      //   loading: false,
      // }))

      // Check if the subject is already assigned to this teacher
      const isAssignedToTeacher = teachers
        .find((t) => t.id === formData.teacherId)
        ?.subjects.includes(formData.subjectName)

      if (isAssignedToTeacher && !assignment) {
        toast.error("This subject is already assigned to this teacher")
        return
      }

      // Check if the subject is already assigned to another teacher for this class
      // Skip this check if we're editing an existing assignment
      if (!assignment) {
        const isAssignedToClass = isSubjectAssigned(
          formData.subjectCode,
          formData.department,
          Number.parseInt(formData.semester),
          formData.class,
        )

        if (isAssignedToClass) {
          toast.error("This subject is already assigned to another teacher for this class")
          return
        }
      }

      // Assign the subject to the teacher (this will create the subject if it doesn't exist)
      await assignSubject({
        ...formData,
        semester: Number.parseInt(formData.semester),
        teacherName: selectedTeacher.name,
        teacherUsername: selectedTeacher.username,
      })

      toast.success(assignment ? "Subject assignment updated successfully" : "Subject assigned successfully")
      onClose()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to assign subject")
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">
            {assignment ? "Edit Subject Assignment" : "Assign Subject to Teacher"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Teacher</label>
            <select
              required
              value={formData.teacherId}
              onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              disabled={!!assignment} // Disable changing teacher when editing
            >
              <option value="">Select Teacher</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name} ({teacher.username})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Subject Code</label>
            <input
              type="text"
              required
              value={formData.subjectCode}
              onChange={(e) => setFormData({ ...formData, subjectCode: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="e.g., CS201"
              disabled={!!assignment} // Disable changing subject code when editing
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Subject Name</label>
            <input
              type="text"
              required
              value={formData.subjectName}
              onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="e.g., Data Structures"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Department</label>
            <select
              required
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Semester</label>
            <select
              required
              value={formData.semester}
              onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                <option key={sem} value={sem}>
                  Semester {sem}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Class</label>
            <select
              required
              value={formData.class}
              onChange={(e) => setFormData({ ...formData, class: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">Select Class</option>
              {["A", "B", "C", "D"].map((classOption) => (
                <option key={classOption} value={classOption}>
                  Class {classOption}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isLab"
              checked={formData.isLab}
              onChange={(e) => setFormData({ ...formData, isLab: e.target.checked })}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="isLab" className="ml-2 block text-sm text-gray-700">
              This is a lab subject
            </label>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
            >
              {assignment ? "Update Assignment" : "Assign Subject"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SubjectAssignmentForm

