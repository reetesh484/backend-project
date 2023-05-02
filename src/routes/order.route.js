import { Router } from 'express'
import { generateOrder,generateRazorpayOrderId, getAllOrders, getMyOrders, updateOrderStatus } from '../controllers/order.controller.js'
import { isLoggedIn, authorize } from "../middleware/auth.middleware.js"
import AuthRoles from '../utils/authRoles.js'

const router = Router()



export default router;