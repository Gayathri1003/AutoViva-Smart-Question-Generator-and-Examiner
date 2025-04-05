const Exam = require("../models/Exam")
const Question = require("../models/Question")
const Result = require("../models/Result")
const Student = require("../models/Student")

exports.createExam = async (req, res) => {
  try {
    const {
      title,
      description,
      subjectId,
      questions,
      duration,
      startTime,
      endTime,
      batches,
      class: className,
      semester,
      passPercentage = 40,
    } = req.body

    // Validate required fields
    if (
      !title ||
      !subjectId ||
      !questions ||
      !duration ||
      !startTime ||
      !endTime ||
      !batches ||
      !className ||
      !semester
    ) {
      return res.status(400).json({ message: "Missing required fields" })
    }

    // Calculate total marks
    const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0)

    const exam = await Exam.create({
      title,
      description,
      subject: subjectId,
      teacher: req.user._id,
      questions: questions.map((q) => ({
        question: q.id,
        marks: q.marks,
      })),
      totalMarks,
      duration,
      startTime,
      endTime,
      batches,
      class: className,
      semester,
      passPercentage,
      isActive: true,
    })

    res.status(201).json(exam)
  } catch (error) {
    console.error("Create exam error:", error)
    res.status(500).json({ message: "Failed to create exam" })
  }
}

exports.getTeacherExams = async (req, res) => {
  try {
    const exams = await Exam.find({ teacher: req.user._id }).populate("subject", "name code").sort("-createdAt")
    res.json(exams)
  } catch (error) {
    console.error("Get teacher exams error:", error)
    res.status(500).json({ message: "Failed to fetch exams" })
  }
}

exports.getStudentExams = async (req, res) => {
  try {
    // Find student's batch assignments
    const student = await Student.findById(req.user._id)
    if (!student) {
      return res.status(404).json({ message: "Student not found" })
    }

    // Find exams that match student's class, semester, and batch
    const exams = await Exam.find({
      class: student.class,
      semester: Number.parseInt(student.semester),
      isActive: true,
      batches: { $in: [student.batch] },
      endTime: { $gte: new Date() },
    })
      .populate("subject", "name code")
      .sort("startTime")

    res.json(exams)
  } catch (error) {
    console.error("Get student exams error:", error)
    res.status(500).json({ message: "Failed to fetch exams" })
  }
}

exports.getExamById = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id).populate("subject", "name code").populate({
      path: "questions.question",
      select: "text options correctAnswer difficulty marks",
    })

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" })
    }

    res.json(exam)
  } catch (error) {
    console.error("Get exam error:", error)
    res.status(500).json({ message: "Failed to fetch exam" })
  }
}

exports.submitExam = async (req, res) => {
  try {
    const { examId, answers } = req.body

    const exam = await Exam.findById(examId).populate("questions.question")

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" })
    }

    // Check if student has already submitted this exam
    const existingResult = await Result.findOne({
      exam: examId,
      student: req.user._id,
    })

    if (existingResult) {
      return res.status(400).json({ message: "You have already submitted this exam" })
    }

    let marksObtained = 0
    const questionResponses = answers
      .map((answer) => {
        const questionData = exam.questions.find((q) => q.question._id.toString() === answer.questionId)

        if (!questionData) {
          return null // Skip if question not found
        }

        const isCorrect = questionData.question.correctAnswer === answer.selectedOption
        const marks = isCorrect ? questionData.marks : 0
        marksObtained += marks

        return {
          question: answer.questionId,
          selectedOption: answer.selectedOption,
          isCorrect,
          marksObtained: marks,
        }
      })
      .filter(Boolean) // Remove null entries

    const percentage = (marksObtained / exam.totalMarks) * 100
    const status = percentage >= exam.passPercentage ? "pass" : "fail"

    const result = await Result.create({
      exam: examId,
      student: req.user._id,
      answers: questionResponses,
      totalMarks: exam.totalMarks,
      marksObtained,
      percentage,
      status,
    })

    res.json(result)
  } catch (error) {
    console.error("Submit exam error:", error)
    res.status(500).json({ message: "Failed to submit exam" })
  }
}

exports.getExamResults = async (req, res) => {
  try {
    const { examId } = req.params

    // Verify the exam exists and belongs to the teacher
    const exam = await Exam.findById(examId)
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" })
    }

    if (req.user.role === "teacher" && exam.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to view these results" })
    }

    const results = await Result.find({ exam: examId }).populate("student", "name username email").sort("-percentage")

    res.json(results)
  } catch (error) {
    console.error("Get exam results error:", error)
    res.status(500).json({ message: "Failed to fetch results" })
  }
}

exports.getStudentResults = async (req, res) => {
  try {
    const results = await Result.find({ student: req.user._id })
      .populate({
        path: "exam",
        select: "title totalMarks subject",
        populate: {
          path: "subject",
          select: "name code",
        },
      })
      .sort("-createdAt")

    res.json(results)
  } catch (error) {
    console.error("Get student results error:", error)
    res.status(500).json({ message: "Failed to fetch results" })
  }
}

exports.updateExamStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { isActive } = req.body

    const exam = await Exam.findById(id)
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" })
    }

    if (exam.teacher.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to update this exam" })
    }

    exam.isActive = isActive
    await exam.save()

    res.json(exam)
  } catch (error) {
    console.error("Update exam status error:", error)
    res.status(500).json({ message: "Failed to update exam status" })
  }
}

