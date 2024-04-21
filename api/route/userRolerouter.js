const router = require("express").Router();

const {
  getAllUsersRole,
  createUserRole,
  updateUserRole,
  getUserRoleById,
  deleteUserById,
} = require("../controller/userRoleController");

router.get("/get-all", getAllUsersRole);
router.delete("/:id", deleteUserById);
router.get("/:id", getUserRoleById);
router.put("/update/:id", updateUserRole);
router.post("/create", createUserRole);

module.exports = router;
