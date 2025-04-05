const Subject = require("../models/Subject")
const Teacher = require("../models/Teacher")

exports.createSubject = async (req, res) => {
  try {
    // Check if subject with the same code already exists
    const existingSubject = await Subject.findOne({ code: req.body.code })
    if (existingSubject) {
      return res.status(400).json({ message: "Subject with this code already exists" })
    }

    // Create the new subject
    const subject = await Subject.create({
      code: req.body.code,
      name: req.body.name,
      department: req.body.department,
      semester: req.body.semester,
      isLab: req.body.isLab || false,
      teachers: [], // Initialize with empty teachers array
      teacherDetails: [], // Initialize the teacherDetails array
    })

    res.status(201).json(subject)
  } catch (error) {
    console.error("Create subject error:", error)
    res.status(500).json({ message: "Failed to create subject" })
  }
}

exports.getAllSubjects = async (req, res) => {
  try {
    // Use populate to include teacher details (name, username, email)
    const subjects = await Subject.find().populate("teachers", "name username email")
    res.json(subjects)
  } catch (error) {
    console.error("Get subjects error:", error)
    res.status(500).json({ message: "Failed to fetch subjects" })
  }
}

exports.getTeacherSubjects = async (req, res) => {
  try {
    // Find subjects where this teacher is assigned
    const subjects = await Subject.find({
      teachers: req.user._id,
    })

    res.json(subjects)
  } catch (error) {
    console.error("Get teacher subjects error:", error)
    res.status(500).json({ message: "Failed to fetch subjects" })
  }
}

exports.assignTeacher = async (req, res) => {
  try {
    const { subjectId, teacherId, teacherName, teacherUsername } = req.body

    // Validate inputs
    if (!subjectId || !teacherId) {
      return res.status(400).json({ message: "Subject ID and Teacher ID are required" })
    }

    // Find the subject
    const subject = await Subject.findById(subjectId)
    if (!subject) {
      return res.status(404).json({ message: "Subject not found" })
    }

    // Find the teacher
    const teacher = await Teacher.findById(teacherId)
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" })
    }

    // Check if teacher is already assigned to this subject
    const teacherIdStr = teacherId.toString()
    if (subject.teachers.some((id) => id.toString() === teacherIdStr)) {
      return res.status(400).json({ message: "Teacher is already assigned to this subject" })
    }

    // Add teacher to subject
    subject.teachers.push(teacherId)

    // Also add teacher details to the teacherDetails array
    subject.teacherDetails.push({
      teacherId: teacherId,
      name: teacherName || teacher.name,
      username: teacherUsername || teacher.username,
    })

    await subject.save()

    // Return the updated subject with populated teacher information
    const updatedSubject = await Subject.findById(subjectId).populate("teachers", "name username email")

    res.json(updatedSubject)
  } catch (error) {
    console.error("Assign teacher error:", error)
    res.status(500).json({ message: "Failed to assign teacher" })
  }
}

// Update the removeTeacher function to also remove from teacherDetails
exports.removeTeacher = async (req, res) => {
  try {
    const { subjectId, teacherId } = req.body

    // Validate inputs
    if (!subjectId || !teacherId) {
      return res.status(400).json({ message: "Subject ID and Teacher ID are required" })
    }

    // Find the subject
    const subject = await Subject.findById(subjectId)
    if (!subject) {
      return res.status(404).json({ message: "Subject not found" })
    }

    const teacherIdStr = teacherId.toString()

    // Remove teacher from subject's teachers array
    subject.teachers = subject.teachers.filter((id) => id.toString() !== teacherIdStr)

    // Also remove from teacherDetails array
    subject.teacherDetails = subject.teacherDetails.filter((detail) => detail.teacherId.toString() !== teacherIdStr)

    await subject.save()
    res.json(subject)
  } catch (error) {
    console.error("Remove teacher error:", error)
    res.status(500).json({ message: "Failed to remove teacher" })
  }
}

