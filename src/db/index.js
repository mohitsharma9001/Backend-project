
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
