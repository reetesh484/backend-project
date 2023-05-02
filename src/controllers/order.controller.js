import Product from '../models/product.schema.js'
import Coupon from '../models/coupon.schema.js'
import Order from '../models/order.schema.js'
import asyncHandler from '../service/asyncHandler.js'
import CustomError from '../service/customError.js'
import razorpay from '../config/razorpay.config.js'
import OrderStatus from '../utils/orderStatus.js'


export const generateRazorpayOrderId = asyncHandler(async (req, res) => {
    const { products, couponCode } = req.body

    if (!product || products.length === 0) {
        throw new CustomError("No product found", 400);
    }

    let totalAmount = 0;
    let discountAmount = 0;

    //Do product calculation based on DB calls
    let productPriceCalc = Promise.all(products.map(async (product) => {
        const { productId, count } = product;
        const productFromDB = await Product.findById(productId);
        if (!productFromDB) {
            throw new CustomError("Product not found", 400);
        }
        if (productFromDB.stock < count) {
            return res.status(400).json({
                error: "Out of stock"
            })
        }
        totalAmount += productFromDB.price * count;
    }))


    await productPriceCalc;

    //check for coupon discount, if applicable
    const coupon = await Coupon.find({ code: couponCode })
    if (coupon) {
        discountAmount = coupon.discount;
    }

    const options = {
        amount: Math.round(totalAmount * 100) - discountAmount,
        currency: "INR",
        receipt: `receipt_${new Date().getTime()}`
    }

    const order = await razorpay.orders.create(options)

    if (!order) {
        throw new CustomError("Unable to generate order", 400);
    }

    res.status(200).json({
        success: true,
        message: "razorpay order id generated successfully"
    })
})

//add order in the database and update product stock
export const generateOrder = asyncHandler(async (req, res) => {
    const { transactionId, products, user, address, phoneNumber, amount, coupon } = req.body

    const order = await Order.create({
        transactionId, products, user, address, phoneNumber, amount, coupon
    })

    //update stock of every product present in the products array
    let updateProducts = Promise.all(products.map(async (product) => {
        const { productId, count } = product;
        const productFromDB = await Product.findById(productId)
        if (!productFromDB) {
            throw new CustomError("Product not found", 404);
        }
        if (productFromDB.stock < count) {
            throw new CustomError("Out of stock", 404);
        }
        productFromDB.stock = productFromDB.stock - count;
        productFromDB.sold = productFromDB.sold + 1;
        await productFromDB.save();
    }))

    await updateProducts;

    res.status(200).json({
        success: true,
        message: "Order generated successfully!",
        order
    })

})

///Get only my orders
export const getMyOrders = asyncHandler(async (req, res) => {
    const { id: user } = req.params

    if (!user) {
        throw new CustomError("User Id required");
    }

    const orders = await Order.find({ user });
    if (!orders) {
        throw new CustomError("No orders found!");
    }

    res.status(200).json({
        success: true,
        orders
    })
})

//Get all orders : Admin
export const getAllOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({})

    if (!orders) {
        throw new CustomError("No Orders found!");
    }

    res.status(200).json({
        success: true,
        orders
    })

})

//Update order status: Admin
export const updateOrderStatus = asyncHandler(async (req, res) => {

    const { status } = req.body
    const { id: orderId } = req.params

    if(!status){
        throw new CustomError("Order Status required",400);
    }

    if (!OrderStatus[status]) {
        throw new CustomError("Invalid Status",400);
    }

    const order = await Order.findByIdAndUpdate(orderId, { status },
        {
            new: true,
            runValidators: true
        });

    if (!order) {
        throw new CustomError("Order not found!", 404);
    }

    res.success(200).json({
        success:true,
        message:"Order status updated",
        order
    })
})