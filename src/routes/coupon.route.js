import { Router } from 'express'
import { createCoupon,deleteCoupon, getAllCoupons, updateCoupon } from '../controllers/auth.controller.js'
import { isLoggedIn, authorize } from "../middleware/auth.middleware.js"
import AuthRoles from '../utils/authRoles.js'

const router = Router()

//create a coupon
router.post("/",isLoggedIn, authorize(AuthRoles.ADMIN),createCoupon)

//delete a single coupon
router.delete("/:id",isLoggedIn,authorize(AuthRoles.ADMIN),deleteCoupon)

//update a single coupon
router.put("/action/:id", isLoggedIn,authorize(AuthRoles.ADMIN),updateCoupon)

//get all coupons
router.get("/",isLoggedIn, authorize(AuthRoles.ADMIN),getAllCoupons)

export default router;