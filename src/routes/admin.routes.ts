import { Router } from "express";
import { logout, registerUser } from "../controllers/user.controller";
import { middleware } from "../middleware/auth.middleware";
import {addStore, dashboardDisplayCounts, listOfStore, listOfUser} from "../controllers/admin.controller"


const router = Router()

router.route("/logout").get(middleware,logout)
router.route("/register").post(middleware,registerUser)
router.route("/dashboard/counts").get(middleware,dashboardDisplayCounts)
router.route("/addStore").post(middleware,addStore)
router.route("/list/store").get(middleware,listOfStore)
router.route("/list/users").get(middleware,listOfUser)


export default router