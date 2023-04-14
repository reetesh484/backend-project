import mongoose from "mongoose";

const {Schema} = mongoose

const collectionSchema = new Schema({
    name:{
        type:String,
        required:[true,"Please provide a collection name"],
        trim:true,
        maxLength:[
            120,
            "Collection name should not be more than 120 characters"
        ]
    }
},{timestamps:true})


export default mongoose.model("Collection",collectionSchema)

//whatever we name the model, it will always be saved in all lowercase and in plural form...for example my "Collection" will be saved as "collections"