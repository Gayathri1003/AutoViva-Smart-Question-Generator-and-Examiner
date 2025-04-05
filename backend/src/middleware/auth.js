const jwt = require("jsonwebtoken")
const Teacher = require("../models/Teacher")
const Student = require("../models/Student")

exports.auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "")
    if (!token) {
      return res.status(401).json({ message: "Authentication required" })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Handle admin authentication
    if (decoded.role === "admin" && decoded.userId === "admin") {
      req.user = {
        _id: "admin",
        role: "admin",
        name: "Administrator",
      }
      return next()
    }

    // Handle teacher and student authentication
    let user
    if (decoded.role === "teacher") {
      user = await Teacher.findById(decoded.userId)
    } else if (decoded.role === "student") {
      user = await Student.findById(decoded.userId)
    }

    if (!user) {
      return res.status(401).json({ message: "User not found" })
    }

    req.user = user
    next()
  } catch (error) {
    console.error("Auth middleware error:", error)
    res.status(401).json({ message: "Invalid token" })
  }
}

