const express = require("express")
const router = express.Router()
const { auth } = require("../middleware/auth")
const teacherController = require("../controllers/teacherController")

// Admin only routes
router.post("/", auth, teacherController.createTeacher)
router.get("/", auth, teacherController.getTeachers)
router.put("/:id", auth, teacherController.updateTeacher)
router.delete("/:id", auth, teacherController.deleteTeacher)

module.exports = router

