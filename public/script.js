function showToast(icon, title) {
  Swal.fire({
    toast: true,

    position: "top-end",

    icon,

    title,

    showConfirmButton: false,

    timer: 2500,

    timerProgressBar: true,

    background: "#1f2937",

    color: "#fff",
  });
}

let allExpenses = [];
const pdfBtn = document.getElementById("pdfBtn");
let profile = {};
const todayElement = document.getElementById("todayExpense");

const monthElement = document.getElementById("monthExpense");

const averageElement = document.getElementById("averageExpense");

const topCategoryElement = document.getElementById("topCategory");
async function loadProfileData() {
  try {
    const response = await fetch("/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) return;

    profile = await response.json();
  } catch (err) {
    console.error(err);
  }
}

const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "/login.html";
}
const exportBtn = document.getElementById("exportBtn");
const themeBtn = document.getElementById("themeBtn");
if (localStorage.getItem("theme") === "light") {
  document.body.classList.add("light-mode");

  themeBtn.innerText = "🌞 Light Mode";
}

themeBtn.addEventListener("click", () => {
  document.body.classList.toggle("light-mode");

  if (document.body.classList.contains("light-mode")) {
    localStorage.setItem("theme", "light");

    themeBtn.innerText = "🌞 Light Mode";
  } else {
    localStorage.setItem("theme", "dark");

    themeBtn.innerText = "🌙 Dark Mode";
  }
});
const profileBtn = document.getElementById("profileBtn");

if (profileBtn) {
  profileBtn.addEventListener("click", () => {
    window.location.href = "/profile.html";
  });
}
const pieBtn = document.getElementById("pieBtn");
const barBtn = document.getElementById("barBtn");

let chartType = "pie";
const budgetInput = document.getElementById("budgetInput");
const setBudget = document.getElementById("setBudget");
const remainingBudget = document.getElementById("remainingBudget");
const progressBar = document.getElementById("progressBar");

let budget = 0;

budgetInput.value = budget;
const warningElement = document.getElementById("warning");
const filter = document.getElementById("filter");
const chartCanvas = document.getElementById("expenseChart");

let expenseChart;
let editId = null;

const searchInput = document.getElementById("search");
const countElement = document.getElementById("count");
const highestElement = document.getElementById("highest");
const expenseForm = document.getElementById("expenseForm");
const expenseList = document.getElementById("expenseList");
const totalElement = document.getElementById("total");
async function loadBudget() {
  try {
    const response = await fetch("/budget", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Request failed");
    }

    budget = data.budget || 0;

    budgetInput.value = budget;
  } catch (err) {
    showToast("error", err.message);
  }
}

async function loadExpenses() {
  const response = await fetch("/expenses", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  allExpenses = await response.json();

  let expenses = [...allExpenses];
  // Search
  const searchValue = searchInput.value.toLowerCase();

  expenses = expenses.filter((expense) =>
    expense.title.toLowerCase().includes(searchValue),
  );

  // Category Filter
  if (filter && filter.value !== "All") {
    expenses = expenses.filter((expense) => expense.category === filter.value);
  }

  expenseList.innerHTML = "";

  let total = 0;

  let highest = 0;

  let todayTotal = 0;

  let monthTotal = 0;

  const categories = {};

  const today = new Date();

  expenses.forEach((expense) => {
    total += Number(expense.amount);
    const expenseDate = new Date(expense.date);

    if (expenseDate.toDateString() === today.toDateString()) {
      todayTotal += Number(expense.amount);
    }

    if (
      expenseDate.getMonth() === today.getMonth() &&
      expenseDate.getFullYear() === today.getFullYear()
    ) {
      monthTotal += Number(expense.amount);
    }

    if (expense.amount > highest) {
      highest = expense.amount;
    }

    if (categories[expense.category]) {
      categories[expense.category] += Number(expense.amount);
    } else {
      categories[expense.category] = Number(expense.amount);
    }

    expenseList.innerHTML += `
      <div class="expense">

        <h2>${expense.title}</h2>

        <h3>₹${expense.amount}</h3>
        <p class="date">
  📅 ${new Date(expense.date).toLocaleDateString()}
</p>


        <span class="category">
          ${expense.category}
        </span>

        <button onclick="editExpense(
          '${expense._id}',
          '${expense.title}',
          '${expense.amount}',
          '${expense.category}'
        )">
          Edit
        </button>

        <button
          class="delete-btn"
          onclick="deleteExpense('${expense._id}')">
          Delete
        </button>

      </div>
    `;
  });
  console.log("Budget:", budget);
  console.log("Total:", total);
  totalElement.innerText = `₹${total}`;
  const remaining = budget - total;
  document.getElementById("remainingCard").textContent =
    "₹" + remaining;
  const warningKey = `budget-warning-${budget}`;
  if (total >= budget) {
    remainingBudget.innerText = `Over by ₹${Math.abs(remaining)}`;
    remainingBudget.style.color = "#ff4d4d";
  } else {
    remainingBudget.innerText = `₹${remaining}`;
    remainingBudget.style.color = "#43e97b";
  }
  if (
    budget > 0 &&
    total >= budget * 0.8 &&
    total < budget &&
    !localStorage.getItem(warningKey)
  ) {
    Swal.fire({
      icon: "warning",
      title: "Budget Alert",
      text: "You have used 80% of your budget.",
    });

    localStorage.setItem(warningKey, "shown");
  }

  if (
    budget > 0 &&
    total >= budget &&
    !localStorage.getItem(`budget-exceeded-${budget}`)
  ) {
    Swal.fire({
      icon: "error",
      title: "Budget Exceeded",
      text: "You have exceeded your monthly budget.",
    });

    localStorage.setItem(`budget-exceeded-${budget}`, "shown");
  }

  if (budget > 0) {
    let percent = (total / budget) * 100;

    if (percent > 100) percent = 100;

    progressBar.style.width = percent + "%";

    if (percent < 70) {
      progressBar.style.background = "#22c55e";
    } else if (percent < 90) {
      progressBar.style.background = "#eab308";
    } else {
      progressBar.style.background = "#ef4444";
    }
  }

  countElement.innerText = expenses.length;
  todayElement.innerText = `₹${todayTotal}`;

  monthElement.innerText = `₹${monthTotal}`;

  averageElement.innerText = expenses.length
    ? `₹${Math.round(total / expenses.length)}`
    : "₹0";

  let topCategory = "-";

  let max = 0;

  for (const category in categories) {
    if (categories[category] > max) {
      max = categories[category];

      topCategory = category;
    }
  }

  topCategoryElement.innerText = topCategory;
  highestElement.innerText = `₹${highest}`;

  if (expenses.length === 0) {
    expenseList.innerHTML = `
      <div class="empty">
        No Expenses Found
      </div>
    `;
  }

  // Chart
  if (expenseChart) {
    expenseChart.destroy();
  }

  expenseChart = new Chart(chartCanvas, {
    type: chartType,
    data: {
      labels: Object.keys(categories),
      datasets: [
        {
          data: Object.values(categories),
          backgroundColor: [
            "#4facfe",
            "#43e97b",
            "#fa709a",
            "#f6d365",
            "#a18cd1",
          ],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: chartType === "pie",
          labels: {
            color: "white",
            font: {
              size: 14,
            },
          },
        },
      },
    },
  });
}

// Add or Update Expense
expenseForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const submitBtn = expenseForm.querySelector('button[type="submit"]');

  submitBtn.disabled = true;
  const originalText = submitBtn.textContent;
  submitBtn.textContent = editId ? "Updating..." : "Saving...";
  const title = document.getElementById("title").value;
  const amount = document.getElementById("amount").value;
  const category = document.getElementById("category").value;
  const isEditing = !!editId;
  if (isEditing) {
    await fetch(`/expenses/${editId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title,
        amount,
        category,
      }),
    });

    editId = null;
  } else {
    await fetch("/expenses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title,
        amount,
        category,
      }),
    });
  }
  showToast(
    "success",
    isEditing ? "Expense updated successfully" : "Expense added successfully",
  );

  expenseForm.reset();

  loadExpenses();
  submitBtn.disabled = false;
  submitBtn.textContent = originalText;
});

// Delete Expense
async function deleteExpense(id) {
  const result = await Swal.fire({
    title: "Delete Expense?",
    text: "This action cannot be undone.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Delete",
    cancelButtonText: "Cancel",
    confirmButtonColor: "#ef4444",
  });

  if (!result.isConfirmed) return;

  try {
    const response = await fetch(`/expenses/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to delete expense");
    }
    showToast("success", "Expense deleted");

    await loadExpenses();
  } catch (err) {
    showToast("error", err.message);
  }
}

// Edit Expense
function editExpense(id, title, amount, category) {
  editId = id;

  document.getElementById("title").value = title;
  document.getElementById("amount").value = amount;
  document.getElementById("category").value = category;
}

// Search
searchInput.addEventListener("input", () => {
  loadExpenses();
});

// Filter
if (filter) {
  filter.addEventListener("change", () => {
    loadExpenses();
  });
}
setBudget.addEventListener("click", async () => {
  budget = Number(budgetInput.value);

  const response = await fetch("/budget", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      budget,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }
  if (response.ok) {
    Object.keys(localStorage).forEach((key) => {
      if (
        key.startsWith("budget-warning-") ||
        key.startsWith("budget-exceeded-")
      ) {
        localStorage.removeItem(key);
      }
    });

    showToast("success", "Budget saved successfully");

    await loadExpenses();
  } else {
    showToast("error", data.message);
  }
});
pieBtn.addEventListener("click", () => {
  chartType = "pie";

  loadExpenses();
});

barBtn.addEventListener("click", () => {
  chartType = "bar";

  loadExpenses();
});
exportBtn.addEventListener("click", () => {
  if (!allExpenses || allExpenses.length === 0) {
    showToast("warning", "No expenses to export!");
    return;
  }

  let csv = "Title,Amount,Category,Date\n";

  allExpenses.forEach((expense) => {
    csv += `${expense.title},${expense.amount},${expense.category},${new Date(expense.date).toLocaleDateString()}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");

  a.href = url;

  a.download = "expenses.csv";

  a.click();
});

async function init() {
  await loadProfileData();
  await loadBudget();
  await loadExpenses();
}

init();
const logoutBtn = document.getElementById("logoutBtn");

logoutBtn.addEventListener("click", async () => {
  const result = await Swal.fire({
    title: "Logout?",

    text: "Do you really want to logout?",

    icon: "question",

    showCancelButton: true,

    confirmButtonText: "Logout",

    cancelButtonText: "Cancel",
  });

  if (!result.isConfirmed) return;

  localStorage.removeItem("token");
  localStorage.removeItem("user");

  budget = 0;
  editId = null;
  allExpenses = [];

  window.location.href = "/login.html";
});
if (pdfBtn) {
  pdfBtn.addEventListener("click", generatePDF);
}

async function generatePDF() {
  if (!allExpenses.length) {
    return showToast("warning", "No expenses to export");
  }

  const { jsPDF } = window.jspdf;

  const doc = new jsPDF();

  // Header
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, 210, 28, "F");

  doc.setTextColor(255);
  doc.setFontSize(22);
  doc.text("Expense Tracker Report", 14, 18);

  doc.setTextColor(0);

  let y = 40;

  doc.setFontSize(12);

  doc.text(`Name : ${profile.name || "-"}`, 14, y);

  y += 8;

  doc.text(`Email : ${profile.email || "-"}`, 14, y);

  y += 8;

  doc.text(`Generated : ${new Date().toLocaleString()}`, 14, y);

  y += 12;

  doc.setFontSize(14);

  doc.text("Summary", 14, y);

  y += 8;

  doc.setFontSize(11);

  doc.text(
    `Total Expense : ₹${totalElement.innerText.replace("₹", "")}`,
    14,
    y,
  );

  y += 7;

  doc.text(`Transactions : ${countElement.innerText}`, 14, y);

  y += 7;

  doc.text(`Highest Expense : ${highestElement.innerText}`, 14, y);

  y += 7;

  doc.text(`Budget : ₹${budget}`, 14, y);

  y += 7;

  doc.text(`Remaining : ${remainingBudget.innerText}`, 14, y);

  y += 12;

  const rows = [];

  allExpenses.forEach((expense) => {
    rows.push([
      expense.title,

      expense.category,

      `₹${expense.amount}`,

      new Date(expense.date).toLocaleDateString(),
    ]);
  });

  doc.autoTable({
    head: [["Title", "Category", "Amount", "Date"]],

    body: rows,

    startY: y,

    theme: "striped",

    headStyles: {
      fillColor: [37, 99, 235],
    },
  });

  const pageCount = doc.internal.getNumberOfPages();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    doc.setFontSize(10);

    doc.text(
      `Generated by Expense Tracker | Page ${i}/${pageCount}`,

      14,

      290,
    );
  }

  doc.save("Expense_Report.pdf");

  showToast("success", "PDF Downloaded");
}
