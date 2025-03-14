import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
//to connect Frontend will pass deployed URL in CORS_ORIGIN
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(urlencoded({ extended: true }));
app.use(cookieParser())

//routes
import userRouter from "./router/user.router.js";

app.use("/api/v1/users", userRouter);

export default app;
