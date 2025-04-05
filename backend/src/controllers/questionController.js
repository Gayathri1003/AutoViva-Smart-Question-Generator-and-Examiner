const Question = require("../models/Question")
const Subject = require("../models/Subject")
const OpenAI = require("openai")

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

exports.generateQuestions = async (req, res) => {
  try {
    const { topic, subjectId, count = 5 } = req.body

    // Verify subject exists
    const subject = await Subject.findById(subjectId)
    if (!subject) {
      return res.status(404).json({ message: "Subject not found" })
    }

    const prompt = `Generate ${count} multiple choice questions about ${topic}. 
    Format each question as a JSON object with:
    - text: question text
    - options: array of 4 possible answers
    - correctAnswer: index of correct answer (0-3)
    - difficulty: "easy", "medium", or "hard"
    - marks: number between 1 and 5`

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    })

    const generatedQuestions = JSON.parse(completion.choices[0].message.content)

    // Save questions to database
    const savedQuestions = await Promise.all(
      generatedQuestions.map((q) =>
        Question.create({
          ...q,
          teacher: req.user._id,
          subject: subjectId,
          topic,
        }),
      ),
    )

    res.json(savedQuestions)
  } catch (error) {
    console.error("Question generation error:", error)
    res.status(500).json({ message: "Failed to generate questions" })
  }
}

exports.getQuestionsBySubject = async (req, res) => {
  try {
    const questions = await Question.find({ subject: req.params.subjectId })
      .populate("teacher", "name")
      .sort("-createdAt")
    res.json(questions)
  } catch (error) {
    console.error("Get questions error:", error)
    res.status(500).json({ message: "Failed to fetch questions" })
  }
}

exports.createQuestion = async (req, res) => {
  try {
    // Validate subject exists
    const subject = await Subject.findById(req.body.subject)
    if (!subject) {
      return res.status(404).json({ message: "Subject not found" })
    }

    const question = await Question.create({
      ...req.body,
      teacher: req.user._id,
    })

    res.status(201).json(question)
  } catch (error) {
    console.error("Create question error:", error)
    res.status(500).json({ message: "Failed to create question" })
  }
}

exports.updateQuestion = async (req, res) => {
  try {
    const { id } = req.params

    const question = await Question.findById(id)
    if (!question) {
      return res.status(404).json({ message: "Question not found" })
    }

    // Only allow the teacher who created the question to update it
    if (question.teacher.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to update this question" })
    }

    const updatedQuestion = await Question.findByIdAndUpdate(id, req.body, { new: true })

    res.json(updatedQuestion)
  } catch (error) {
    console.error("Update question error:", error)
    res.status(500).json({ message: "Failed to update question" })
  }
}

exports.deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params

    const question = await Question.findById(id)
    if (!question) {
      return res.status(404).json({ message: "Question not found" })
    }

    // Only allow the teacher who created the question to delete it
    if (question.teacher.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete this question" })
    }

    await Question.findByIdAndDelete(id)

    res.json({ message: "Question deleted successfully" })
  } catch (error) {
    console.error("Delete question error:", error)
    res.status(500).json({ message: "Failed to delete question" })
  }
}

