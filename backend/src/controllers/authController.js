const Teacher = require("../models/Teacher")
const Student = require("../models/Student")
const jwt = require("jsonwebtoken")

// Admin credentials (hardcoded)
const ADMIN_USERNAME = "admin"
const ADMIN_PASSWORD = "admin123"

exports.login = async (req, res) => {
  try {
    const { username, password, role } = req.body

    // Handle admin login with hardcoded credentials
    if (role === "admin") {
      if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        const token = jwt.sign({ userId: "admin", role: "admin" }, process.env.JWT_SECRET, { expiresIn: "24h" })

        return res.json({
          token,
          user: {
            id: "admin",
            username: "admin",
            name: "Administrator",
            role: "admin",
          },
        })
      } else {
        return res.status(401).json({ message: "Invalid admin credentials" })
      }
    }

    // Handle teacher login
    if (role === "teacher") {
      const teacher = await Teacher.findOne({ username })
      if (!teacher) {
        return res.status(401).json({ message: "Invalid credentials" })
      }

      const isMatch = await teacher.comparePassword(password)
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" })
      }

      const token = jwt.sign({ userId: teacher._id, role: "teacher" }, process.env.JWT_SECRET, { expiresIn: "24h" })

      res.json({
        token,
        user: {
          id: teacher._id,
          username: teacher.username,
          name: teacher.name,
          role: "teacher",
          requiresPasswordSetup: !teacher.hasSetPassword,
        },
      })
    }

    // Handle student login
    if (role === "student") {
      const student = await Student.findOne({ username })
      if (!student) {
        return res.status(401).json({ message: "Invalid credentials" })
      }

      const isMatch = await student.comparePassword(password)
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" })
      }

      const token = jwt.sign({ userId: student._id, role: "student" }, process.env.JWT_SECRET, { expiresIn: "24h" })

      res.json({
        token,
        user: {
          id: student._id,
          username: student.username,
          name: student.name,
          role: "student",
          requiresPasswordSetup: !student.hasSetPassword,
        },
      })
    }
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ message: "Login failed" })
  }
}

exports.verifyUsername = async (req, res) => {
  try {
    const { username, role } = req.body

    // Handle admin verification
    if (role === "admin") {
      if (username === ADMIN_USERNAME) {
        return res.json({
          exists: true,
          requiresPasswordSetup: false,
        })
      } else {
        return res.status(404).json({ message: "Username not found" })
      }
    }

    // Handle teacher verification
    if (role === "teacher") {
      const teacher = await Teacher.findOne({ username })
      if (!teacher) {
        return res.status(404).json({ message: "Username not found" })
      }

      return res.json({
        exists: true,
        requiresPasswordSetup: !teacher.hasSetPassword,
      })
    }

    // Handle student verification
    if (role === "student") {
      const student = await Student.findOne({ username })
      if (!student) {
        return res.status(404).json({ message: "Username not found" })
      }

      return res.json({
        exists: true,
        requiresPasswordSetup: !student.hasSetPassword,
      })
    }
  } catch (error) {
    console.error("Verify username error:", error)
    res.status(500).json({ message: "Verification failed" })
  }
}

exports.setPassword = async (req, res) => {
  try {
    const { username, newPassword, role } = req.body

    let user

    if (role === "teacher") {
      user = await Teacher.findOne({ username })
    } else if (role === "student") {
      user = await Student.findOne({ username })
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    user.password = newPassword
    user.hasSetPassword = true
    await user.save()

    res.json({ message: "Password set successfully" })
  } catch (error) {
    console.error("Set password error:", error)
    res.status(500).json({ message: "Failed to set password" })
  }
}

