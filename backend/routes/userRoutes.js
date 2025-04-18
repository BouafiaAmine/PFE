const express = require("express");
const { adminOnly, protect } = require("../middlewares/authMiddleware");
const { getUserById, getUsers, getUsersController } = require("../controllers/userController");

const router = express.Router();

router.get("/", protect, adminOnly, getUsers);
router.get("/all", protect, async (req, res) => {
  try {
    const users = await require("../models/User").find({
      _id: { $ne: req.user._id } // exclude current user
    }).select("-password"); // exclude password if you store it

    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching users", err });
  }
});
router.get("/:id", protect, getUserById);

module.exports = router;