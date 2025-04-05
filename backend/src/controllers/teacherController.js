const Teacher = require("../models/Teacher")

exports.createTeacher = async (req, res) => {
  try {
    const { name, username, email } = req.body

    // Check if username or email already exists
    const existingTeacher = await Teacher.findOne({
      $or: [{ username }, { email }],
    })

    if (existingTeacher) {
      return res.status(400).json({
        message: "Teacher with this username or email already exists",
      })
    }

    // Create a new teacher with a temporary password
    // Department is not required at this stage
    const teacher = new Teacher({
      name,
      username,
      email,
      password: "tempPassword123", // This will be hashed by the pre-save hook
      hasSetPassword: false,
    })

    await teacher.save()

    res.status(201).json({
      id: teacher._id,
      name: teacher.name,
      username: teacher.username,
      email: teacher.email,
    })
  } catch (error) {
    console.error("Create teacher error:", error)
    res.status(500).json({ message: "Failed to create teacher" })
  }
}

exports.getTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find().select("-password")
    res.json(teachers)
  } catch (error) {
    console.error("Get teachers error:", error)
    res.status(500).json({ message: "Failed to fetch teachers" })
  }
}

exports.updateTeacher = async (req, res) => {
  try {
    const { id } = req.params
    const { name, email, department } = req.body

    const updateData = { name, email }
    // Only include department if it's provided
    if (department) {
      updateData.department = department
    }

    const teacher = await Teacher.findByIdAndUpdate(id, updateData, { new: true }).select("-password")

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" })
    }

    res.json(teacher)
  } catch (error) {
    console.error("Update teacher error:", error)
    res.status(500).json({ message: "Failed to update teacher" })
  }
}

exports.deleteTeacher = async (req, res) => {
  try {
    const { id } = req.params

    const teacher = await Teacher.findByIdAndDelete(id)

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" })
    }

    res.json({ message: "Teacher deleted successfully" })
  } catch (error) {
    console.error("Delete teacher error:", error)
    res.status(500).json({ message: "Failed to delete teacher" })
  }
}

