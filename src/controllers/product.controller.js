import Product from "../models/product.schema.js"
import formidable from "formidable"
import {s3FileUpload,s3deleteFile} from "../service/imageUpload.js"
import mongoose from "mongoose"
import asyncHandler from "../service/asyncHandler.js"
import config from "../config/s3.config.js"
import CustomError from "../service/customError.js"




export const addProduct = asyncHandler(async(req,res) => {
    const form = formidable({multiples:true,keepExtensions:true});

    form.parse(req,async function(err,fields,files){
        if(err){
            throw new CustomError(err.message || "Something went wrong!", 500);
        }

        let productId = new mongoose.Types.ObjectId().toHexString()

        console.log(fields,files);
        
        //TODO: we will make this tomorrow
    
    })
})
