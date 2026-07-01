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
  } catch(err) {
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
  expenses = expenses.filter(
    (expense) => expense.category === filter.value
  );
}

  expenseList.innerHTML = "";

  let total = 0;
  let highest = 0;

  const categories = {};

  expenses.forEach((expense) => {
    total += Number(expense.amount);

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

  if (allExpenses.length === 0) {
  showToast("info", "No expenses to export");
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
  await loadBudget();
  await loadExpenses();
}

init();
const logoutBtn = document.getElementById("logoutBtn");

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  budget = 0;
  editId = null;
  allExpenses = [];

  window.location.href = "/login.html";
});
