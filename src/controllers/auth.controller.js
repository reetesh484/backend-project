//signup a new user

import asyncHandler from "../service/asyncHandler";
import CustomError from "../service/customError";
import User from '../models/user.schema'


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