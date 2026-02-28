const express = require("express");
const router = express.Router();
const userController = require("../controllers/admin/user.controller");

router.get("/team", userController.listTeam);
router.get("/roles", userController.listRoles);
router.post("/invite", userController.inviteMember);
router.patch("/role/:id", userController.updateRole);
router.delete("/remove/:id", userController.removeMember);

module.exports = router;
