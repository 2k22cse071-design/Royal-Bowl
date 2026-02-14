const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transactionController");

router.post("/add-transaction", transactionController.addTransaction);
router.get("/report", transactionController.getTransactions);

module.exports = router;
