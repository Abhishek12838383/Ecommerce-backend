
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const User = require("./User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());


mongoose.connect("mongodb://127.0.0.1:27017/Login")
.then(() => console.log("DB connected"))


// signup route
app.post("/signup", async (req, res) => {

  // check if user already exists
  try {
     const { name,email, password } = req.body;

     const existingUser = await User.findOne({ email });

      if (existingUser) return res.status(400).json({ message: "User already exists" });

     const hashedPassword = await bcrypt.hash(password, 10);

     const user = await User.create({ name, email, password: hashedPassword });

    res.status(201).json({ message: "User created successfully", user });

  } catch (error) {
    console.log(error);
    
  }
});

  // login

  app.post("/login",async(req,res)=>{
    const {email,password} = req.body;

    try {
      const isuserexist = await User.findOne({email});

      if(!isuserexist){
        return res.status(400).json({message:"User not found"})
      }

      const hashpass = bcrypt.compare(password,isuserexist.password);

      if(!hashpass){
        return res.status(400).json({message:"Invalid credentials"})
      }

  

      const token = jwt.sign({id:isuserexist._id},"JWT_SECRET",{expiresIn:"1h"});
        res.json({ token, user: { id: isuserexist._id, username: isuserexist.username, email: isuserexist.email } });
    } catch (error) {
      
    }
  })



app.listen("5000",()=>{
  console.log("server start")
})