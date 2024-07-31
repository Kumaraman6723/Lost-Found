const express = require("express");
const {
  createReport,
  getReports,
  getReportsByUser,
  editReport,
  deleteReport,
  claimReport,
  markNotificationAsRead,
} = require("../controllers/reportController");
const authenticateUser = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/", authenticateUser, createReport);
router.get("/", getReports);
router.get("/user", authenticateUser, getReportsByUser);
router.put("/:id", authenticateUser, editReport);
router.delete("/:id", authenticateUser, deleteReport);
router.post("/:id/claim", authenticateUser, claimReport);
router.put("/notification/:id/read", authenticateUser, markNotificationAsRead); // Update endpoint

module.exports = router;
