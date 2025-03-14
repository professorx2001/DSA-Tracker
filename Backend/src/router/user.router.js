import { Router } from "express";
import { registerUser, loginUser, getProfile, refreshDataAndUpdateDB } from "../controllers/user.controller.js";
import verifyJWT from "../middlwares/auth.middleware.js";


const router = Router();

router.route("/register").post(registerUser)
router.route("/login").post(loginUser)

router.route("/getprofile").get(verifyJWT, getProfile)
router.route("/refreshdata").get(verifyJWT, refreshDataAndUpdateDB)

export default router;
