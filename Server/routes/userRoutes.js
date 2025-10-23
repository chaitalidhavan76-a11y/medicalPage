import express from "express";
import {
  deleteUser,
  getUserInfo,
  getUserRecords,
  signIn,
  signUp,
  updateUser,
} from "../controller/usercontroller.js";
import { authenticate, isAdmin } from "../Middleware/auth.js";

const router = express.Router();

router.get("/", authenticate, isAdmin, getUserRecords);

// user
router.get("/info", authenticate, getUserInfo);
router.delete("/:user_id", authenticate, deleteUser);
router.put("/:user_id", authenticate, updateUser);
router.post("/signup", signUp);
router.post("/signin", signIn);

export default router;