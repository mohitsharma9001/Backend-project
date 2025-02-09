import dotenv from "dotenv";
import { server } from "./app.js";
import connectDB from "./db/index.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
