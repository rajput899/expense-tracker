# 💰 Expense Tracker

A full-stack Expense Tracker web application built with **Node.js, Express, MongoDB, HTML, CSS, and JavaScript**. It helps users manage expenses, set monthly budgets, visualize spending through charts, and securely manage their accounts using JWT Authentication and Email OTP verification.

---

## 🚀 Features

### 🔐 Authentication
- User Registration
- Secure Login (JWT)
- Email Verification (OTP)
- Resend OTP
- Forgot Password (OTP)
- Reset Password
- Protected Routes

### 💵 Expense Management
- Add Expense
- Edit Expense
- Delete Expense
- View All Expenses
- Static Categories
- Search Expenses
- Category Filter

### 📊 Budget & Analytics
- Monthly Budget Management
- Remaining Budget Calculation
- Budget Warning (80%)
- Budget Exceeded Alert
- Expense Statistics
- Highest Expense
- Total Transactions
- Total Expense
- Pie Chart
- Bar Chart

### 📤 Export
- CSV Export

### 🎨 UI Features
- Dark / Light Theme
- Responsive UI
- SweetAlert2 Notifications
- Loading Buttons
- Clean Dashboard

---

# 🛠 Tech Stack

### Frontend
- HTML5
- CSS3
- JavaScript (ES6)
- Chart.js
- SweetAlert2

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs
- Axios
- Brevo Email API

---

# 📂 Project Structure

```
expense-tracker/
│
├── models/
│   ├── User.js
│   └── Expense.js
│
├── public/
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── verify.html
│   ├── forgot.html
│   ├── reset.html
│   ├── script.js
│   ├── auth.js
│   ├── style.css
|   ├── profile.html
|   ├── profilr.js
│
├── server.js
├── package.json
├── .env
└── README.md
```

---

# ⚙ Installation

Clone the repository

```bash
git clone https://github.com/rajput899/expense-tracker.git
```

Move into project

```bash
cd expense-tracker
```

Install dependencies

```bash
npm install
```

Create a `.env` file

```env
MONGO_URI=YOUR_MONGODB_URI

JWT_SECRET=YOUR_SECRET

BREVO_API_KEY=YOUR_BREVO_API_KEY

SENDER_EMAIL=YOUR_VERIFIED_EMAIL
```

Start the server

```bash
npm start
```

Visit

```
http://localhost:5000
```

---

# 🔐 Authentication Flow

```
Register
      │
      ▼
Email OTP Verification
      │
      ▼
Login
      │
      ▼
JWT Token
      │
      ▼
Dashboard
```

---

# 📈 Dashboard

The dashboard includes
- Profile
- Total Expense
- Total Transactions
- Highest Expense
- Monthly Budget
- Remaining Budget
- Pie Chart
- Bar Chart
- Search
- Category Filter

---

# 📤 Export

Users can export all expenses into a CSV file or PDF file for record keeping.

---

# 📧 Email Service

OTP emails are delivered using the **Brevo Email API**.

---

# 🛡 Security

- Password Hashing (bcrypt)
- JWT Authentication
- Protected API Routes
- Email Verification
- OTP Expiration
- Secure Password Reset

---

# 📸 Screenshots

Coming soon.....

Example:

- Login Page
- Register Page
- Dashboard
- Budget Section
- Charts
- Expense List

---

# 🤝 Contributing

Contributions are welcome.

1. Fork the repository

2. Create a new branch

```bash
git checkout -b feature-name
```

3. Commit changes

```bash
git commit -m "Added new feature"
```

4. Push

```bash
git push origin feature-name
```

5. Open a Pull Request

---
## 🌐 Live Demo

https://expense-tracker-l3wq.onrender.com

# 📄 License

This project is created for learning and educational purposes.

---

## 👨‍💻 Developer

**Rituraj Singh**

Made with ❤️ using Node.js, Express & MongoDB.
