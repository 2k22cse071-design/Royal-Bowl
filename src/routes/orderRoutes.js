const express = require("express");
const controller = require("../controllers/orderController");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", controller.placeOrder);                                                          // Public
router.get("/my", auth.verifyToken, controller.getMyOrders);                                      // Logged-in user
router.get("/", [auth.verifyToken, auth.isAdmin], controller.getAllOrders);                       // Admin
router.get("/:id", [auth.verifyToken, auth.isAdmin], controller.getOrderDetails);                // Admin
router.put("/:id/status", [auth.verifyToken, auth.isAdmin], controller.updateOrderStatus);       // Admin

module.exports = router;
