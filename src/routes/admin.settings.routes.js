const express = require("express");
const router = express.Router();
const settingsController = require("../controllers/admin/settings.controller");

router.get("/global", settingsController.getSettings);
router.patch("/global", settingsController.updateSettings);
router.get("/white-label", settingsController.getWhiteLabel);
router.post("/announcements", settingsController.postAnnouncement);

module.exports = router;
