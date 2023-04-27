//signup a new user

import asyncHandler from "../service/asyncHandler";
import CustomError from "../service/customError";
import User from '../models/user.schema'
import mailHelper from "../service/mailHelper";
import crypto from 'crypto'


export const cookieOptions = {
    expires: new Date(Date.now + 3 * 24 * 60 * 60 * 1000),
    httpOnly: true
}


export const signUp = asyncHandler(async (req, res) => {
    //get data from user
    const { name, email, password } = req.body

    //validation
    if (!name || !email || !password) {
        throw new CustomError("Please add all the fields", 400)
    }
    //we can add more validations as per our need

    //check if the user already exists
    const existingUser = await User.findOne({ email })

    if (existingUser) {
        throw new CustomError("User already exists", 400);
    }

    //lets add the data to the database
    const user = await User.create({
        name, email, password
    })

    //generate JWT Token
    const token = user.getJWTtoken()

    //safety, because even though password's select property is set to false, it is still returned on the creation of the user
    //so, it returns back the password while creating account but respects select:false when we are using select operations such findbyid, update etc...
    user.password = undefined

    //store this token in user's cookie
    res.cookie("token", token, cookieOptions);

    //send back a response to the user
    res.status(200).json({ success: true, token, user })

})

export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body

    //validation
    if (!email || !password) {
        throw new CustomError("Please fill all details", 400);
    }

    const user = await User.findOne({ email }).select("+password")

    //if user doesn't exists
    if (!user) {
        throw new CustomError("Invalid Credentials", 400);
    }

    const isPasswordMatched = await user.comparePassword(password)

    if (isPasswordMatched) {
        const token = user.getJWTtoken()
        user.password = undefined;
        res.cookie('token', token, cookieOptions);
        return res.status(200).json({
            success: true,
            token,
            user
        })
    }

    //if passwords didn't match
    throw new CustomError("Password is incorrect", 400);
})


export const logout = asyncHandler(async (req, res) => {
    //just remove the cookie by setting it to null and expiring it immediately
    res.cookie("token", null, { expires: new Date(Date.now()), httpOnly: true })

    res.status(200).json({
        success: true,
        message: 'Logged Out'
    })
})


export const getProfile = asyncHandler(async (req, res) => {
    const { user } = req

    if (!user) {
        throw new CustomError("User not found", 401)
    }

    res.status(200).json({
        success: true,
        user
    })
})

export const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body

    const user = await User.findOne({ email })

    if (!user) {
        throw new CustomError("User not found", 404);
    }

    const resetToken = user.generateForgotPasswordToken()

    await user.save({ validateBeforeSave: false })

    const resetUrl = `${req.protocol}://${req.get("host")}/api/v1/auth/password/reset/${resetToken}`

    const message = `Your password reset token is as follows \n\n ${resetUrl} \n\n if this was not requested by you, please ignore`

    try {
        await mailHelper({
            email: user.email,
            subject: "Password reset mail",
            message
        })
    } catch (error) {
        user.forgotPasswordToken = undefined
        user.forgotPasswordExpiry = undefined

        await user.save({ validateBeforeSave: false })

        throw new CustomError(error.message || "Email could not be sent", 500)
    }
})

export const resetPassword = asyncHandler(async(req,res) => {
    const {token:resetToken} = req.params
    const {password,confirmPassword} = req.body

    if(password !== confirmPassword){
        throw new CustomError("Password does not match",400)
    }

    const resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex")

    const user = await User.findOne({
        forgotPasswordToken:resetPasswordToken,
        forgotPasswordExpiry:{$gt : Date.now()}
    })

    if(!user){
        throw new CustomError("Password reset token is invalid or expired",400)
    }

   user.password = password;
   user.forgotPasswordToken = undefined;
   user.forgotPasswordExpiry = undefined;

   await user.save()

   //optional 
   const token = user.getJWTtoken()
   res.cookie("token",token,cookieOptions)

   res.status(200).json({
    success:true,
    user
   })

})