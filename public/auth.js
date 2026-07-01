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
console.log("auth.js loaded");
const registerForm = document.getElementById("registerForm");
const registerBtn = document.getElementById("registerBtn");

if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
  
    console.log("Button clicked");
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

  try {
    registerBtn.disabled = true;
    registerBtn.innerHTML = `Register <span class="spinner"></span>`;

    const response = await fetch("/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      showToast("success", data.message);
      window.location.href = `verify.html?email=${encodeURIComponent(email)}`;
    } else {
      showToast("error", data.message);
    }
  } catch (err) {
    console.error(err);
    showToast("error", "Server connection failed");
  } finally {
    registerBtn.disabled = false;
    registerBtn.innerHTML = "Register";
  }
});
}

const loginForm = document.getElementById("loginForm");
const loginBtn = document.getElementById("loginBtn");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    loginBtn.disabled = true;
    loginBtn.innerHTML = `Login <span class="spinner"></span>`;

    const email = document.getElementById("loginEmail").value;
   const password = document.getElementById("password").value;

    const response = await fetch("/login", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      loginBtn.disabled = false;
      loginBtn.innerHTML = "Login";

      localStorage.setItem("token", data.token);

      localStorage.setItem("user", JSON.stringify(data.user));

      showToast("success", "Login Successful");

      setTimeout(() => {
        window.location.href = "index.html";
      }, 1200);
    } else {
      loginBtn.disabled = false;
      loginBtn.innerHTML = "Login";

      showToast("error", data.message);
    }
  });
}
function setupPasswordToggle(inputId, toggleId) {
  const input = document.getElementById(inputId);
  const toggle = document.getElementById(toggleId);

  if (!input || !toggle) return;

  toggle.addEventListener("click", () => {
    const hidden = input.type === "password";

    input.type = hidden ? "text" : "password";
    toggle.textContent = hidden ? "🙈" : "👁";
  });
}

setupPasswordToggle("password", "togglePassword");
setupPasswordToggle("confirmPassword", "toggleConfirmPassword");
setupPasswordToggle("newPassword", "toggleNewPassword");