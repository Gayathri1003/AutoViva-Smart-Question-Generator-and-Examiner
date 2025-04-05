const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const teacherSchema = new mongoose.Schema(
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
      // Department is optional when creating a teacher
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

teacherSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10)
  }
  next()
})

teacherSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

module.exports = mongoose.model("Teacher", teacherSchema)

