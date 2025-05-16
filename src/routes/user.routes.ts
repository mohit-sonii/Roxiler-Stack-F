import {Router} from 'express'
import { loginUser, registerUser,searchStore,updatePassword, viewListedStore,updateRating,rateStore ,logout} from '../controllers/user.controller';
import { middleware } from '../middleware/auth.middleware';

const router = Router();

router.route("/register").post(registerUser)
router.route("/login").post(loginUser)
router.route("/reset-pass/:id").get(middleware,updatePassword)

router.route("/stores").get(middleware,viewListedStore)
router.route("/stores/search").post(middleware,searchStore)
router.route("/stores/search/:ratingId").post(middleware,updateRating)
router.route("/store/rate/:storeId").post(middleware,rateStore)
router.route("/logout").get(middleware,logout)


export default router