import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import users from "../models/auth.js";
import Login from "../models/loginInfo.js";
import UAParser from 'ua-parser-js';
import UserAgent from 'express-useragent';
export const signup = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existinguser = await users.findOne({ email });
    if (existinguser) {
      return res.status(404).json({ message: "User already Exist." });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = await users.create({
      name,
      email,
      password: hashedPassword,
    });
    const token = jwt.sign(
      { email: newUser.email, id: newUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.status(200).json({ result: newUser, token });
  } catch (error) {
    res.status(500).json("Something went worng...");
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const existinguser = await users.findOne({ email });
    if (!existinguser) {
      return res.status(404).json({ message: "User don't Exist." });
    }
    const isPasswordCrt = await bcrypt.compare(password, existinguser.password);
    if (!isPasswordCrt) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign(
      { email: existinguser.email, id: existinguser._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    const ipAddress = req.ip;
    if (req.headers['x-forwarded-for']) {
      ipAddress = req.headers['x-forwarded-for'].split(',')[0].trim();
    }
    const userAgent = UserAgent.parse(req.headers['user-agent']);
    const device = /Mobile/i.test(userAgent)? 'Mobile' : 'Desktop';
    const browser = `${userAgent.browser} ${userAgent.version}`;
    const os = userAgent.os;

    
    const loginInfo = new Login({
      userId: existinguser._id,
      timestamp: new Date(),
      browser,
      device,
      os,
      ipAddress,
    });
    

    await loginInfo.save()
  .then((savedEntry) => {
    console.log('Login history saved:', savedEntry);
  })
  .catch((error) => {
    console.error('Error saving login history:', error);
  });

    res.status(200).json({ result: existinguser, token });
  } catch (error) {
    console.error(error);
    res.status(500).json("Something went worng...");
  }
};

export const loginHistory = async(req, res) => {
  const { userId } = req.params;

  try {
    const loginHistory = await Login.find({ userId }).sort({ timestamp: -1 });
    res.json(loginHistory);
  } catch (error) {
    console.error('Error fetching login history:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};