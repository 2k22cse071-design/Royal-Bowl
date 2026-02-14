const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");

router.get("/weekly-report", reportController.getWeeklyReport);
router.get("/monthly-report", reportController.getMonthlyReport);
router.get("/yearly-report", reportController.getYearlyReport);

module.exports = router;
