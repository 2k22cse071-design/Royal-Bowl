const express = require("express");
const controller = require("../controllers/orderController");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", controller.placeOrder); // Public (anyone can order)
router.get("/", [auth.verifyToken, auth.isAdmin], controller.getAllOrders); // Admin view all
router.get("/:id", [auth.verifyToken, auth.isAdmin], controller.getOrderDetails); // Admin view detail
router.put("/:id/status", [auth.verifyToken, auth.isAdmin], controller.updateOrderStatus); // Admin update status

module.exports = router;
