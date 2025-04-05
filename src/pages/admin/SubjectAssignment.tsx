"use client"

import { useState, useEffect } from "react"
import { PlusCircle, Pencil, Trash2 } from "lucide-react"
import { useTeacherStore } from "../../store/teacherStore"
import SubjectAssignmentForm from "./components/SubjectAssignmentForm"
import { getAllSubjects } from "../../lib/api/subjects"
import toast from "react-hot-toast"

const SubjectAssignment = () => {
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState<any>(null)
  const { teachers, fetchTeachers, removeSubjectAssignment } = useTeacherStore()
  const [subjects, setSubjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [subjectAssignments, setSubjectAssignments] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        await fetchTeachers()
        const fetchedSubjects = await getAllSubjects()
        setSubjects(fetchedSubjects)
      } catch (error) {
        console.error("Failed to fetch data:", error)
        toast.error("Failed to load subjects and teachers")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [fetchTeachers, showAssignModal, editingAssignment]) // Refresh when modal closes or after editing

  // Update the useEffect that processes subject assignments to properly display teacher information
  useEffect(() => {
    if (!subjects.length || !teachers.length) return

    // Transform subjects with teacher assignments into the format we need
    const assignments = subjects
      .filter((subject) => subject.teachers && subject.teachers.length > 0)
      .flatMap((subject) => {
        return subject.teachers.map((teacher: any) => {
          // Get teacher details from the teacher object directly
          const teacherName = teacher.name || "Unknown Teacher"
          const teacherUsername = teacher.username || ""

          return {
            id: `${subject._id}-${teacher.id || teacher._id}`,
            subjectId: subject._id,
            teacherId: teacher.id || teacher._id,
            subjectName: subject.name,
            subjectCode: subject.code,
            department: subject.department,
            semester: subject.semester,
            class: subject.class || "A", // Default class if not provided
            isLab: subject.isLab || false,
            teacherName: teacherName,
            teacherUsername: teacherUsername,
          }
        })
      })

    setSubjectAssignments(assignments)
  }, [subjects, teachers])

  const handleRemoveAssignment = async (assignmentId: string) => {
    if (window.confirm("Are you sure you want to remove this subject assignment?")) {
      try {
        const assignment = subjectAssignments.find((a) => a.id === assignmentId)
        if (assignment) {
          await removeSubjectAssignment(assignmentId)
          // Update the local state to remove the assignment
          setSubjectAssignments((prev) => prev.filter((a) => a.id !== assignmentId))
          toast.success("Subject assignment removed successfully")
        }
      } catch (error) {
        toast.error("Failed to remove subject assignment")
      }
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading subject assignments...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Subject Assignments</h1>
        <button
          onClick={() => setShowAssignModal(true)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Assign Subject
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {subjectAssignments.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teacher
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Semester
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Class
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {subjectAssignments.map((assignment) => (
                <tr key={assignment.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {assignment.teacherName || "Unknown Teacher"}
                    </div>
                    <div className="text-sm text-gray-500">{assignment.teacherUsername || ""}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{assignment.subjectName}</div>
                    <div className="text-sm text-gray-500">{assignment.subjectCode}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{assignment.department}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{assignment.semester}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{assignment.class}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        assignment.isLab ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {assignment.isLab ? "Lab" : "Theory"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => setEditingAssignment(assignment)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRemoveAssignment(assignment.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No subject assignments found. Assign subjects to teachers using the button above.
          </div>
        )}
      </div>

      {(showAssignModal || editingAssignment) && (
        <SubjectAssignmentForm
          assignment={editingAssignment}
          onClose={() => {
            setShowAssignModal(false)
            setEditingAssignment(null)
          }}
        />
      )}
    </div>
  )
}

export default SubjectAssignment

