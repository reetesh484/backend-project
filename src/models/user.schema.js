import mongoose from 'mongoose'
import AuthRoles from '../utils/authRoles'


const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Name is required"],
        maxLength:[50,"Name must be less than 50 characters"]
    },
    email:{
        type:String,
        required:[true,"Email is required"]
    },
    password:{
        type:String,
        required:[true,"Password is required"],
        minLength:[8,"Password must be atleast 8 characters"],
        select:false //dont bring password by default while fetching information of the user
    },
    role:{
        type:String,
        enum:Object.values(AuthRoles),
        default:AuthRoles.USER
    },
    forgotPasswordToken:String,
    forgotPasswordExpiry:Date
},{timestamps:true})


export default mongoose.model("User",userSchema)