"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useTeacherStore } from "../../../store/teacherStore"
import { useAuthStore } from "../../../store/authStore"
import SubjectCard from "./SubjectCard"
import EmptyState from "./EmptyState"
import { BookOpen } from "lucide-react"

const SubjectList: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { getTeacherAssignments, fetchSubjects, fetchTeachers } = useTeacherStore()
  const [loading, setLoading] = useState(true)

  // Ensure subjects and teacher data are loaded
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        await fetchSubjects()
        await fetchTeachers()
      } catch (error) {
        console.error("Failed to load data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [fetchSubjects, fetchTeachers])

  const assignments = user ? getTeacherAssignments(user.id) : []

  if (loading) {
    return <div className="text-center py-8">Loading subjects...</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Subjects</h1>

      {assignments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignments.map((assignment) => (
            <SubjectCard key={assignment.id} assignment={assignment} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<BookOpen className="h-12 w-12 text-gray-400" />}
          title="No subjects assigned yet"
          description="You don't have any subjects assigned to you yet. Please contact the administrator."
        />
      )}
    </div>
  )
}

export default SubjectList

