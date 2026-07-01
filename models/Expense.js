const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
  title: String,

  amount: Number,

  category: String,

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Expense", expenseSchema);