const express = require("express");
const router = express.Router();
const issueController = require("../controllers/admin/issue.controller");

router.get("/list", issueController.listIssues);
router.get("/details/:id", issueController.getIssueDetails);
router.get("/live-console", issueController.getLiveConsole);
router.get("/critical", issueController.getCritical);
router.get("/escalations", issueController.getEscalations);
router.patch("/status/:id", issueController.updateStatus);

module.exports = router;
