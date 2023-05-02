import { Router } from 'express'
import authRoutes from './auth.route.js'
import couponRoutes from './coupon.route.js'
import orderRoutes from './order.route.js'
import collectionRoutes from './collection.route.js'

const router = Router();

router.use("/auth", authRoutes);
router.use("/coupon", couponRoutes);
router.use("/collections", collectionRoutes);
router.use("/orders", orderRoutes);

export default router;