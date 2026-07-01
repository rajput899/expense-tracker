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
// Redirect if already logged in
const token = localStorage.getItem("token");

if (token) {
  window.location.href = "/";
}

// OTP Inputs
const otpInputs = document.querySelectorAll(".otp-input");

// Auto Next + Backspace
otpInputs.forEach((input, index) => {
  input.addEventListener("input", () => {
    input.value = input.value.replace(/[^0-9]/g, "");

    if (input.value && index < otpInputs.length - 1) {
      otpInputs[index + 1].focus();
    }
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Backspace" && input.value === "" && index > 0) {
      otpInputs[index - 1].focus();
    }
  });
});

// Paste OTP
otpInputs[0].addEventListener("paste", (e) => {
  e.preventDefault();

  const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);

  paste.split("").forEach((digit, i) => {
    if (otpInputs[i]) {
      otpInputs[i].value = digit;
    }
  });
});

// Autofill Email
const params = new URLSearchParams(window.location.search);

const savedEmail = params.get("email");

if (savedEmail) {
  document.getElementById("email").value = savedEmail;
}

// Verify Form
const verifyForm = document.getElementById("verifyForm");

verifyForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;

  const otp = [...otpInputs].map((input) => input.value).join("");

  if (otp.length !== 6) {
    showToast("warning", "Please enter complete OTP.");
    return;
  }

  const response = await fetch("/verify-otp", {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      email,
      otp,
    }),
  });

  const data = await response.json();

  showToast("error", data.message);

  if (response.ok) {
    localStorage.setItem("token", data.token);

    localStorage.setItem("user", JSON.stringify(data.user));

    window.location.href = "/";
  }
});

// Countdown
const resendBtn = document.getElementById("resendOtp");
const timer = document.getElementById("timer");

let countdown;

function startCountdown() {
  let seconds = 60;

  resendBtn.disabled = true;

  timer.innerText = `Resend available in ${seconds}s`;

  countdown = setInterval(() => {
    seconds--;

    timer.innerText = `Resend available in ${seconds}s`;

    if (seconds <= 0) {
      clearInterval(countdown);

      resendBtn.disabled = false;

      timer.innerText = "";
    }
  }, 1000);
}

startCountdown();

// Resend OTP
resendBtn.addEventListener("click", async () => {
  const email = document.getElementById("email").value;

  if (!email) {
    showToast("warning", "Enter your Email first.");

    return;
  }

  const response = await fetch("/resend-otp", {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      email,
    }),
  });

  const data = await response.json();

  showToast("error", data.message);

  clearInterval(countdown);

  startCountdown();
});
