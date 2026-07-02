require("dotenv").config();
const axios = require("axios");

const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Expense = require("./models/Expense");
const User = require("./models/User");

const app = express();

app.use(express.json());
app.use(express.static("public"));

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((error) => {
    console.log("Database Error:", error.message);
  });

//Middleware
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

 
if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
}


  const token = authHeader.split(" ")[1];

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);

    req.user = verified;

    next();
  } catch {
    res.status(401).json({
      message: "Invalid Token",
    });
  }
}
// Send OTP Email
async function sendOTP(email, otp) {
  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "Expense Tracker",
          email: process.env.SENDER_EMAIL,
        },
        to: [
          {
            email: email,
          },
        ],
        subject: "Expense Tracker - Email Verification OTP",
        htmlContent: `
          <h2>Email Verification</h2>
          <p>Your OTP is:</p>
          <h1>${otp}</h1>
          <p>This OTP will expire in 10 minutes.</p>
        `,
      },
      {
        headers: {
          accept: "application/json",
          "api-key": process.env.BREVO_API_KEY,
          "content-type": "application/json",
        },
      }
    );

    console.log("Brevo Success:", response.data);
  } catch (error) {
    console.error("Brevo Status:", error.response?.status);
    console.error("Brevo Data:", error.response?.data);
    console.error("Brevo Message:", error.message);

    throw error;
  }
}
// Register User
app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
    return res.status(400).json({
        message: "All fields are required"
    });
}

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      otp,
      otpExpiry: new Date(Date.now() + 10 * 60 * 1000), // 10 min
      isVerified: false,
    });

    await newUser.save();

    await sendOTP(email, otp);
    res.status(201).json({
      message: "OTP sent to your email",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: error.message,
    });
  }
});
// Login User
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid Email or Password",
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid Email or Password",
      });
    }
    if (!user.isVerified) {
      return res.status(403).json({
        message: "Please verify your email first.",
      });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        userId: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    res.json({
      message: "Login Successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});
//Verify Email
app.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.json({
        message: "Email already verified",
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    if (new Date() > user.otpExpiry) {
      return res.status(400).json({
        message: "OTP Expired",
      });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;

    await user.save();

    const token = jwt.sign(
      {
        userId: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    res.json({
      message: "Email Verified Successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});
//Resend OTP
app.post("/resend-otp", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        message: "Email already verified",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await user.save();
    await sendOTP(email, otp);

    res.json({
      message: "New OTP sent successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});
//Forget Password
app.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await user.save();

    await sendOTP(email, otp);

    res.json({
      message: "OTP sent successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});
//Reset Password
app.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    if (new Date() > user.otpExpiry) {
      return res.status(400).json({
        message: "OTP Expired",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;

    user.otp = null;
    user.otpExpiry = null;

    await user.save();

    res.json({
      message: "Password Reset Successful",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});
// Add Expense
app.post("/expenses", verifyToken, async (req, res) => {
  try {
    const newExpense = new Expense({
      title: req.body.title,
      amount: req.body.amount,
      category: req.body.category,
      userId: req.user.userId,
    });

    const savedExpense = await newExpense.save();

    res.status(201).json({
      message: "Expense Added Successfully",
      data: savedExpense,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Get All Expenses
app.get("/expenses", verifyToken, async (req, res) => {
  try {
    const expenses = await Expense.find({
      userId: req.user.userId,
    });

    res.json(expenses);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});
// Update Expense

app.put("/expenses/:id", verifyToken, async (req, res) => {
  try {
    const updatedExpense = await Expense.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user.userId,
      },
      {
        title: req.body.title,
        amount: req.body.amount,
        category: req.body.category,
      },
      { new: true },
    );
    if (!updatedExpense) {
    return res.status(404).json({
        message: "Expense not found"
    });
}


    res.json(updatedExpense);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Delete Expense
app.delete("/expenses/:id", verifyToken, async (req, res) => {
  try {
    const deletedExpense = await Expense.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!deletedExpense) {
      return res.status(404).json({
        message: "Expense not found",
      });
    }

    res.json({
      message: "Expense Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});
//Save Budget
app.put("/budget", verifyToken, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      {
        budget: req.body.budget,
      },
      { new: true },
    );

    res.json({
      budget: user.budget,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});
//Get Budget
app.get("/budget", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    res.json({
      budget: user.budget,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});
// Total Expense
app.get("/expenses/total", verifyToken, async (req, res) => {
  try {
    const expenses = await Expense.find({
      userId: req.user.userId,
    });

    let total = 0;

    expenses.forEach((expense) => {
      total += expense.amount;
    });

    res.json({
      totalExpense: total,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

const PORT = process.env.PORT || 5000;
app.get("/test", (req, res) => {
  res.send("Server Working");
});

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use. Stop the other process or set a different PORT.`);
    process.exit(1);
  }
  console.error(error);
  process.exit(1);
});
