const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const studentSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
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
    class: {
      type: String,
      required: true,
    },
    batch: {
      type: String,
      // Batch is optional as it will be assigned later by the teacher
      required: false,
    },
    hasSetPassword: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

studentSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10)
  }
  next()
})

studentSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

module.exports = mongoose.model("Student", studentSchema)

