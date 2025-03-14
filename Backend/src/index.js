import 'dotenv/config';
import app from "./app.js";
import connectDB from "./db/index.js";
import fetchCodeforcesData from './services/codeforces.service.js';

const port = process.env.PORT || 5000;


connectDB()
.then(() => {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
})
.catch((error) => {
  console.log(`MongoDB connection error. ${error.message}`);
});

// fetchCodeforcesData("jiangly")