const express = require("express");
const controller = require("../controllers/menuController");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", controller.getMenu); // Public access
router.post("/", [auth.verifyToken, auth.isAdmin], controller.addMenuItem); // Admin only
router.delete("/:id", [auth.verifyToken, auth.isAdmin], controller.deleteMenuItem); // Admin only

module.exports = router;
