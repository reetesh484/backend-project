import mongoose from "mongoose";
import app from "./src/app.js";
import config from "./src/config/index.js";

//async iife function
( async() => {
    try {
       await mongoose.connect(config.MONGODB_URL)
       console.log("DB Connected")

       //we need to add this before listen so that our app is production ready
       app.on('error',(err) => {
        console.error("Error:",err);
       })

       const onListening = () => {
        console.log(`Listening on port ${config.PORT}`)
       }

       app.listen(config.PORT,onListening)

    } catch (error) {
        console.error("Error:",err);
        throw err;
    }
})()