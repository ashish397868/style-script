const express = require("express");
const app = express();
require("dotenv").config(); // Load .env variables
const database = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:3000', // your React app URL
  credentials: true
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

database();

app.use("/", userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
