import { Router } from 'express'
import { generateOrder,generateRazorpayOrderId, getAllOrders, getMyOrders, updateOrderStatus } from '../controllers/order.controller.js'
import { isLoggedIn, authorize } from "../middleware/auth.middleware.js"
import AuthRoles from '../utils/authRoles.js'

const router = Router()

//to initiate payment
router.post("/payment",isLoggedIn,generateRazorpayOrderId);

//to generate order
router.post("/",isLoggedIn,generateOrder);

//to get all orders (ADMIN only)
router.get("/",isLoggedIn,authorize(AuthRoles.ADMIN),getAllOrders)

//to get only my orders
router.get("/:id",isLoggedIn,getMyOrders);

//to update order status (ADMIN only)
router.patch("/:id",isLoggedIn,authorize(AuthRoles.ADMIN),updateOrderStatus)

export default router;