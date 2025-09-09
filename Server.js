const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const User = require("./User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const mongoURL = process.env.MONGO_URL;
const jwtSecret = process.env.JWT_SECRET;

mongoose.connect(mongoURL)
  .then(() => console.log("DB connected"))
  .catch((err) => console.log("DB connection error:", err));

// Signup route
app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });

    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Login route
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const isUserExist = await User.findOne({ email });
    if (!isUserExist) return res.status(400).json({ message: "User not found" });

    const isPasswordCorrect = await bcrypt.compare(password, isUserExist.password);
    if (!isPasswordCorrect) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: isUserExist._id }, jwtSecret, { expiresIn: "1h" });

    res.json({
      token,
      user: { id: isUserExist._id, name: isUserExist.name, email: isUserExist.email }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
