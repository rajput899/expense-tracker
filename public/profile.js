function showToast(icon, title) {
  Swal.fire({
    toast: true,
    position: "top-end",
    icon,
    title,
    showConfirmButton: false,
    timer: 2500,
  });
}

document.querySelectorAll(".toggle-password").forEach((eyeIcon) => {
  eyeIcon.addEventListener("click", () => {
    const input = document.getElementById(eyeIcon.dataset.target);

    if (input.type === "password") {
      input.type = "text";
      eyeIcon.textContent = "🙈";
    } else {
      input.type = "password";
      eyeIcon.textContent = "👁";
    }
  });
});

const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "/login.html";
}

async function loadProfile() {
  try {
    const response = await fetch("/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("token");
        showToast("error", "Session expired. Please login again.");

        setTimeout(() => {
          window.location.href = "/login.html";
        }, 1200);

        return;
      }

      throw new Error(data.message || "Failed to load profile");
    }

    document.getElementById("name").value = data.name || "";
    document.getElementById("email").value = data.email || "";
  } catch (error) {
    console.error(error);
    showToast("error", error.message);
  }
}

loadProfile();

document.getElementById("saveProfile").addEventListener("click", async () => {
  try {
    const name = document.getElementById("name").value;

    const response = await fetch("/profile", {
      method: "PUT",

      headers: {
        "Content-Type": "application/json",

        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify({
        name,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Profile update failed");
    }

    showToast("success", data.message);
  } catch (error) {
    console.error(error);
    showToast("error", error.message);
  }
});

document
  .getElementById("changePassword")
  .addEventListener("click", async () => {
    try {
      const currentPassword = document.getElementById("currentPassword").value;

      const newPassword = document.getElementById("newPassword").value;

      const response = await fetch("/change-password", {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          currentPassword,

          newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast("success", data.message);

        document.getElementById("currentPassword").value = "";

        document.getElementById("newPassword").value = "";
      } else {
        showToast("error", data.message);
      }
    } catch (error) {
      console.error(error);
      showToast("error", error.message);
    }
  });