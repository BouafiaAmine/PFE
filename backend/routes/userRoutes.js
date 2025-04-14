const express = require("express");
const { adminOnly, protect } = require("../middlewares/authMiddleware");
const { getUserById, getUsers } = require("../controllers/userController");


const router = express.Router();

// User Management Routes

router.get("/", protect, adminOnly, getUsers); //get all users (admin only)
router.get("/:id", protect, getUserById); //get a specific user


module.exports = router;