const API_BASE_URL = "http://127.0.0.1:4000";
const user = JSON.parse(localStorage.getItem("tinyguardUser"));
const currentPage = window.location.pathname.split("/").pop();
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const logoutBtn = document.getElementById("logoutBtn");

console.log("login_signup_script.js loaded");
console.log("loginForm:", loginForm);
console.log("signupForm:", signupForm);

// PROTECT FILEINPUT PAGE
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

// LOGIN
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("Login submit fired");

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
      console.log("Login response:", data);

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

// SIGNUP
if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("Signup submit fired");

    const full_name = document.getElementById("name").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value.trim();
    const confirmPassword = document.getElementById("confirmPassword").value.trim();
    const selectedRole = document.querySelector('input[name="role"]:checked');

    console.log("Selected role:", selectedRole ? selectedRole.value : null);

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

    try {
      console.log("Sending request to:", `${API_BASE_URL}/register`);

      const response = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          full_name,
          email,
          password,
          role: selectedRole.value
        })
      });

      const data = await response.json();
      console.log("Signup response:", data);

      if (!response.ok) {
        alert(data.error || "Signup failed");
        return;
      }

      localStorage.setItem("tinyguardUser", JSON.stringify(data.user));
      alert("Account created successfully!");
      window.location.href = "fileinput.html";
    } catch (error) {
      console.error("Signup request failed:", error);
      alert("Could not connect to server.");
    }
  });
}


//LOGOUT
if (user) {
  if (loginLink) loginLink.style.display = "none";
  if (signupLink) signupLink.style.display = "none";
  if (logoutBtn) logoutBtn.style.display = "inline-block";
} else {
  if (logoutBtn) logoutBtn.style.display = "none";
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", (e) => {
    e.preventDefault();

    localStorage.removeItem("tinyguardUser");
    alert("You have been logged out");
    window.location.href = "login.html"
  })
}