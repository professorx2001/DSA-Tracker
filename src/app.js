import express, { urlencoded } from 'express';
import cors from 'cors'


const app = express();
//to connect Frontend will pass deployed URL in CORS_ORIGIN
app.use(cors({origin: process.env.CORS_ORIGIN,credentials: true,}))




export default app;