const express = require("express")
const router = express.Router()
const { auth } = require("../middleware/auth")
const questionController = require("../controllers/questionController")

router.post("/generate", auth, questionController.generateQuestions)
router.get("/subject/:subjectId", auth, questionController.getQuestionsBySubject)
router.post("/", auth, questionController.createQuestion)
router.put("/:id", auth, questionController.updateQuestion)
router.delete("/:id", auth, questionController.deleteQuestion)

module.exports = router

