const mongoose = require("mongoose")

const subjectSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    semester: {
      type: Number,
      required: true,
    },
    isLab: {
      type: Boolean,
      default: false,
    },
    teachers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Teacher",
      },
    ],
    // Add a new field to store teacher details
    teacherDetails: [
      {
        teacherId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Teacher",
        },
        name: String,
        username: String,
      },
    ],
  },
  {
    timestamps: true,
  },
)

module.exports = mongoose.model("Subject", subjectSchema)

