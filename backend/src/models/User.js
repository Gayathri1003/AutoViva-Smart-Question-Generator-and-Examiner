const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Base schema for common user fields
const baseUserFields = {
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
  hasSetPassword: {
    type: Boolean,
    default: false,
  },
};

// Teacher Schema
const teacherSchema = new mongoose.Schema(
  {
    ...baseUserFields,
    role: {
      type: String,
      default: "teacher",
    },
    department: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Student Schema
const studentSchema = new mongoose.Schema(
  {
    ...baseUserFields,
    role: {
      type: String,
      default: "student",
    },
    department: String,
    semester: Number,
    class: String,
    batch: String,
  },
  {
    timestamps: true,
  }
);

// Password hashing middleware for all schemas
const hashPassword = async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
};

// Password comparison method for all schemas
const comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Add middleware and methods to schemas
teacherSchema.pre("save", hashPassword);
studentSchema.pre("save", hashPassword);

teacherSchema.methods.comparePassword = comparePassword;
studentSchema.methods.comparePassword = comparePassword;

// Create models
const Teacher = mongoose.model("Teacher", teacherSchema);
const Student = mongoose.model("Student", studentSchema);

module.exports = {
  Teacher,
  Student,
};
