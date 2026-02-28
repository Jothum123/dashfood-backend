const express = require("express");
const router = express.Router();

const storesController = require("../controllers/admin/stores.controller");

router.get("/list", storesController.getStores);
router.get("/details/:id", storesController.getStoreDetails);
router.get("/hours/:id", storesController.getBusinessHours);
router.patch("/toggle-status/:id", storesController.toggleStatus);
router.patch("/config/:id", storesController.updateConfig);

module.exports = router;
