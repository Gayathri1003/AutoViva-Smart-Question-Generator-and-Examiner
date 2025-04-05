const express = require("express")
const router = express.Router()
const { auth } = require("../middleware/auth")
const studentController = require("../controllers/studentController")

// Admin only routes
router.post("/", auth, studentController.createStudent)
router.get("/", auth, studentController.getStudents)
router.put("/:id", auth, studentController.updateStudent)
router.delete("/:id", auth, studentController.deleteStudent)

module.exports = router

