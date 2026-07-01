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
const forgotForm = document.getElementById("forgotForm");
const sendOtpBtn = document.getElementById("sendOtpBtn");

forgotForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;

  sendOtpBtn.disabled = true;
  sendOtpBtn.innerHTML = "Sending...";

  const response = await fetch("/forgot-password", {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      email,
    }),
  });

  const data = await response.json();

  sendOtpBtn.disabled = false;
  sendOtpBtn.innerHTML = "Send OTP";

  showToast("info", data.message);

  if (response.ok) {
    document.getElementById("resetSection").style.display = "block";

    sendOtpBtn.style.display = "none";

    document.getElementById("email").readOnly = true;
  }
});
const resetBtn = document.getElementById("resetBtn");

resetBtn.addEventListener("click", async () => {
  const email = document.getElementById("email").value;

  const otp = document.getElementById("otp").value;

  const newPassword = document.getElementById("newPassword").value;

  const confirmPassword = document.getElementById("confirmPassword").value;

  if (newPassword !== confirmPassword) {
    showToast("warning", "Passwords do not match");

    return;
  }

  const response = await fetch("/reset-password", {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      email,
      otp,
      newPassword,
    }),
  });

  const data = await response.json();

 showToast(response.ok ? "success" : "error", data.message);

  if (response.ok) {
    window.location.href = "login.html";
  }
});
