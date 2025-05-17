import {Router} from 'express'
import { middleware } from '../middleware/auth.middleware'
import { loginOwner,dashboardMethod } from '../controllers/owner.controller'
import { logout, updatePassword } from '../controllers/user.controller'

const router = Router()

router.route("/login").post(middleware,loginOwner)
router.route("/reset-pass/:id").post(middleware,updatePassword) // this is taken from user as eventullay the owner is in user though and there logic was similar
router.route("/logout").get(middleware,logout) // this as well

// see we have to find the users who rated the owner and inthe next we want to find their average meaning that I have to find the list of users who voted eventually. Hence this can be done in only one method, when this method calls I will return the list of the users and along with that i will return the average and hence it can be taken fro response via frontend.
router.route("/:id/dashboard/ratings/list").get(middleware,dashboardMethod)

export default router