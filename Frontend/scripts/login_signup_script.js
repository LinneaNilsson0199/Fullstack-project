const API_BASE_URL = "http://localhost:4000";
const user = JSON.parse(localStorage.getItem("tinyguardUser"));
const currentPage = window.location.pathname.split("/").pop();
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");


//PROTECT FILEINPUT PAGE
if (currentPage === "fileinput.html" && !user) {
  alert("You must be logged in to access this page.");
  window.location.href = "login.html";
}

const fileInputLinks = document.querySelectorAll('a[href="fileinput.html"]');
fileInputLinks.forEach((link) => {
  if (!user) {
    link.style.display = "none";
  } else {
    link.style.display = "inline-block";
  }
});

const loginLink = document.querySelector('a[href="login.html"]');
const signupLink = document.querySelector('a[href="signup.html"]');

if (user) {
  if (loginLink) loginLink.style.display = "none";
  if (signupLink) signupLink.style.display = "none";
}
//LOGIN


if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
      alert("Please fill in both email and password.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Login failed");
        return;
      }

      localStorage.setItem("tinyguardUser", JSON.stringify(data.user));
      window.location.href = "fileinput.html";
    } catch (error) {
      console.error("Login request failed:", error);
      alert("Could not connect to server.");
    }
  });
}

//signup

if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const full_name = document.getElementById("name").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value.trim();
    const confirmPassword = document.getElementById("confirmPassword").value.trim();
    const selectedRole = document.querySelector('input[name="role"]:checked');

    if (!full_name || !email || !password || !confirmPassword) {
      alert("Please fill in all fields.");
      return;
    }

    if (!selectedRole) {
      alert("Please select a role.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    let role_id = null;

    if (selectedRole.value === "parent") role_id = 2;
    if (selectedRole.value === "child") role_id = 3;

    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          full_name,
          email,
          password,
          role_id
        })
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Signup failed");
        return;
      }

      localStorage.setItem("tinyguardUser", JSON.stringify(data.user));
      alert("Account created successfully!");
      window.location.href = "fileinput.html";
      //window.location.href = "login.html";
    } catch (error) {
      console.error("Signup request failed:", error);
      alert("Could not connect to server.");
    }
  });
}
