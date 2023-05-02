import Product from "../models/product.schema.js"
import formidable from "formidable"
import { s3FileUpload, s3deleteFile } from "../service/imageUpload.js"
import mongoose from "mongoose"
import asyncHandler from "../service/asyncHandler.js"
import config from "../config/s3.config.js"
import CustomError from "../service/customError.js"
import fs from "fs";
import { error } from "console"



export const addProduct = asyncHandler(async (req, res) => {
    const form = formidable({ multiples: true, keepExtensions: true });

    form.parse(req, async function (err, fields, files) {
        if (err) {
            throw new CustomError(err.message || "Something went wrong!", 500);
        }

        let productId = new mongoose.Types.ObjectId().toHexString()

        console.log(fields, files);

        if (
            !fields.name ||
            !fields.price ||
            !fields.description ||
            !fields.collectionId
        ) {
            throw new CustomError("Please fill all the fields", 500);
        }

        let imgArrayResponse = Promise.all(
            Object.keys(files).map(async (file, index) => {
                const element = file[fileKey]
                console.log(element)
                const data = fs.readFileSync(element.filepath)

                const upload = await s3FileUpload({
                    bucketName: config.S3_BUCKET_NAME,
                    key: `products/${productId}/photo_${index + 1}.png`,
                    body: data,
                    contentType: element.mimetype
                })
                console.log(upload);
                return {
                    secure_url: upload.Location
                }
            })
        )

        let imgArray = await imgArrayResponse

        const product = await Product.create({
            _id: productId,
            photos: imgArray,
            ...fields
        })

        if (!product) {
            throw new CustomError("Product failed to be created", 400);
        }
        res.status(200).json({
            success: true,
            product
        })

    })
})


export const getAllProducts = asyncHandler(async (req, res) => {
    const products = await Product.find({})

    if (!products) {
        throw new CustomError("No Products found", 400);
    }

    res.status(200).json({
        success: true,
        products
    })
})

export const getProductById = asyncHandler(async (req, res) => {
    const { id: productId } = req.params

    const product = await Product.findById(productId)

    if (!product) {
        throw new CustomError("No product found", 404);
    }

    res.status(200).json({
        success: true,
        product
    })
})

export const getProductByCollectionId = asyncHandler(async (req, res) => {
    const { id: collectionId } = req.params

    const products = await Product.find({ collectionId })

    if (!products) {
        throw new CustomError("No products found", 404);
    }

    res.status(200).json({
        success: true,
        products
    })
})


export const deleteProduct = asyncHandler(async (req, res) => {
    const { id: productId } = req.params

    const product = await Product.findById(productId)
    if (!product) {
        throw new CustomError("Product doesn't exist", 404);
    }

    //just removing the product will not remove the photos so we need to remove the photos first

    //resolve promise
    //loop through photos array => delete each photo
    //key : product._id

    const deletePhotos = Promise.all(
        product.photos.map(async (element, index) => {
            await s3deleteFile({
                bucketName: config.S3_BUCKET_NAME,
                key: `products/${productId.toString()}/photo_${index + 1}.png`
            })
        })
    )

    await deletePhotos;

    await product.remove()
    res.status(200).json({
        success: true,
        message: "Product has been deleted successfully"
    })
})

export const updateProduct = asyncHandler(async (req, res) => {
    const { id: productId } = req.params
    const { name, price, description, photos, stock } = req.body

    if (!name || !price || !description || !photos || !stock) {
        throw new CustomError("Please enter all the details", 400)
    }

    const product = await Product.findByIdAndUpdate(
        productId,
        { name, price, description, photos, stock },
        {
            new: true,
            runValidators: true
        })

    if (!product) {
        throw new CustomError("Product doesn't exists", 404);
    }

    res.status(200).json({
        success: true,
        message: "Product updated successfully",
        product
    })

})