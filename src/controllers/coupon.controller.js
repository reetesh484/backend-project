import Coupon from '../models/coupon.schema.js'
import asyncHandler from '../service/asyncHandler.js'
import CustomError from '../service/customError.js'


export const addCoupon = asyncHandler(async(req,res) => {
    const {code,discount} = req.body;

    if(!code || !discount){
        throw new CustomError("Code and discount are required.",400)
    }

    const exists = await Coupon.findOne({code})
    if(exists){
        throw new CustomError("Coupon already exists!",400)
    }

    const newCoupon = await Coupon.create({
        code,discount
    })
    res.status(200).json({
        success:true,
        message:"Coupon Created Successfully"
    })
})

export const getAllCoupons = asyncHandler(async(req,res) => {
    const allCoupons = await Coupon.find({});

    if(!allCoupons){
        throw new CustomError("No Coupons found",400);
    }

    res.status(200).json({
        success:true,
        allCoupons
    })
})

export const deleteCoupon = asyncHandler(async(req,res) => {
    const {id:couponId} = req.params

   const coupon = await Coupon.findByIdAndDelete(couponId)

   if(!coupon){
    throw new CustomError("Coupon not found",404);
   }

   res.status(200).json({
    success:true,
    message:"Coupon updated",
    coupon
   })
})


export const updateCoupon = asyncHandler(async(req,res) => {
    const {id:couponId} = req.params

    const {action} = req.body
    //action is boolean or not

    const coupon  = await Coupon.findByIdAndUpdate(
        couponId,
        {
            active:action
        },
        {
            new:true,
            runValidators:true
        }
    )

    if(!coupon){
        throw new CustomError("Coupon not found",404);
    }

    res.status(200).json({
        success:true,
        message:"Coupon updated",
        coupon
    })
})