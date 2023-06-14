// application start
// environment setup
import dotenv from "dotenv";
dotenv.config();
import express from "express"; //importing express
import cors from "cors";
import connectDB from "./config/connectdb.js"; // database connectivity
import userRoutes from "./routes/userRoutes.js"; //

const app = express();
const port = process.env.PORT;
const DATABASE_URL =
  "mongodb+srv://sp-infinity:sp2092002@cluster0.ji0puvj.mongodb.net/?retryWrites=true&w=majority";
// CORS Policy
app.use(cors());

// Database Connection
connectDB(DATABASE_URL);

// JSON
app.use(express.json());

// Load Routes
app.use("/api/user", userRoutes);

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
