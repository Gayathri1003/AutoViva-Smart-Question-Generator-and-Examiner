const express = require("express")
const router = express.Router()
const { auth } = require("../middleware/auth")
const subjectController = require("../controllers/subjectController")

// Create a new subject
router.post("/", auth, subjectController.createSubject)

// Get all subjects
router.get("/", auth, subjectController.getAllSubjects)

// Get subjects for the logged-in teacher
router.get("/teacher", auth, subjectController.getTeacherSubjects)

// Assign a teacher to a subject
router.post("/assign-teacher", auth, subjectController.assignTeacher)

// Remove a teacher from a subject
router.post("/remove-teacher", auth, subjectController.removeTeacher)

module.exports = router

