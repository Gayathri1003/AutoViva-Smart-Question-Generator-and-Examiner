const Student = require("../models/Student")

exports.createStudent = async (req, res) => {
  try {
    const { name, username, email, department, semester, class: className } = req.body

    // Check if username or email already exists
    const existingStudent = await Student.findOne({
      $or: [{ username }, { email }],
    })

    if (existingStudent) {
      return res.status(400).json({
        message: "Student with this username or email already exists",
      })
    }

    // Create a new student with a temporary password
    // Batch is not required at this stage
    const student = new Student({
      name,
      username,
      email,
      department,
      semester,
      class: className,
      password: "tempPassword123", // This will be hashed by the pre-save hook
      hasSetPassword: false,
    })

    await student.save()

    res.status(201).json({
      id: student._id,
      name: student.name,
      username: student.username,
      email: student.email,
      department: student.department,
      semester: student.semester,
      class: student.class,
    })
  } catch (error) {
    console.error("Create student error:", error)
    res.status(500).json({ message: "Failed to create student" })
  }
}

exports.getStudents = async (req, res) => {
  try {
    const students = await Student.find().select("-password")
    res.json(students)
  } catch (error) {
    console.error("Get students error:", error)
    res.status(500).json({ message: "Failed to fetch students" })
  }
}

exports.updateStudent = async (req, res) => {
  try {
    const { id } = req.params
    const { name, email, department, semester, class: className, batch } = req.body

    const updateData = {
      name,
      email,
      department,
      semester,
      class: className,
    }

    // Only include batch if it's provided
    if (batch) {
      updateData.batch = batch
    }

    const student = await Student.findByIdAndUpdate(id, updateData, { new: true }).select("-password")

    if (!student) {
      return res.status(404).json({ message: "Student not found" })
    }

    res.json(student)
  } catch (error) {
    console.error("Update student error:", error)
    res.status(500).json({ message: "Failed to update student" })
  }
}

exports.deleteStudent = async (req, res) => {
  try {
    const { id } = req.params

    const student = await Student.findByIdAndDelete(id)

    if (!student) {
      return res.status(404).json({ message: "Student not found" })
    }

    res.json({ message: "Student deleted successfully" })
  } catch (error) {
    console.error("Delete student error:", error)
    res.status(500).json({ message: "Failed to delete student" })
  }
}

