import mongoose from "mongoose";
import { DB_NAME } from "../constent.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGO_URI}/${DB_NAME}`
    );

    console.log(
      `\nMongoDB connected !! DB HOST ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.error("Mongo DB Error :", error);
    process.exit(1);
  }
};


export default connectDB


// import express from "express";
// const app = express()
// (async () => {
//   try {
//     await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
//     app.on("error",(error)=>{
//         console.log("Err",error)
//         throw error
//     })

//     app.listen(process.env.PORT,()=>{
//         console.log(`App is listening on port ${process.env.PORT}`)
//     })
//   } catch (error) {
//     console.error("Error :", error);
//   }
// })();