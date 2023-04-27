import { Router } from 'express'
import { signUp, login, logout, getProfile,forgotPassword, resetPassword } from '../controllers/auth.controller.js'
import { isLoggedIn, authorize } from "../middleware/auth.middleware.js"
import AuthRoles from '../utils/authRoles.js'
const router = Router()


router.post("/signup", signUp)
router.post("/login", login)
router.get("/logout", logout)

router.post("/password/forgot/", forgotPassword)
router.post("/password/reset/:token",resetPassword)


//if we want only the admin to be able to access the getprofile route
// router.get("/profile", isLoggedIn, authorize(AuthRoles.ADMIN), getProfile)
router.get("/profile", isLoggedIn, getProfile)


export default router;