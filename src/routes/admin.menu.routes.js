const express = require("express");
const router = express.Router();

const menuController = require("../controllers/admin/menu.controller");

// Categories
router.get("/categories", menuController.getCategories);
router.post("/categories", menuController.createCategory);
router.patch("/categories/:id", menuController.updateCategory);

// Items
router.get("/items", menuController.getItems);
router.post("/items", menuController.createItem);
router.patch("/items/:id", menuController.updateItem);
router.patch("/items/:id/availability", menuController.toggleAvailability);

// Global Actions
router.post("/sync", menuController.syncMenu);

module.exports = router;
