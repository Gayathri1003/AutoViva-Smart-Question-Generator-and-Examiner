const express = require("express")
const router = express.Router()
const authController = require("../controllers/authController")

router.post("/login", authController.login)
router.post("/set-password", authController.setPassword)
router.post("/verify-username", authController.verifyUsername)

module.exports = router

