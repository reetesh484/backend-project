import mongoose from "mongoose";
import OrderStatus from "../utils/orderStatus";

const orderSchema = mongoose.Schema({
    product:{
        type:[
            {
                productId:{
                    type:mongoose.Schema.Types.ObjectId,
                    ref:"Product"
                },
                count:Number,
                price:Number
            }
        ],
        required:[true,"Product is required"]
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    address:{
        type:String,
        required:true
    },
    phoneNumber:{
        type:String,
        required:true
    },
    amount:{
        type:String,
        required:true
    },
    coupon:String,
    transactionId:String,
    status:{
        type:String,
        enum:Object.values(OrderStatus),
        default:OrderStatus.ORDERED
    }
},{timestamps:true})


export default mongoose.model("Order",orderSchema);