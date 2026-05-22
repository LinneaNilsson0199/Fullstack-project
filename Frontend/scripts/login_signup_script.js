const API_BASE_URL = "https://tinyguard-backend.onrender.com";
const user = JSON.parse(localStorage.getItem("tinyguardUser"));
const currentPage = window.location.pathname.split("/").pop();
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const logoutBtn = document.getElementById("logoutBtn");
const profileLink = document.querySelector('a[href="profile.html"]');
const canAccessProfile = user && (user.role_id === 1 || user.role_id === 2);

const authButtons = document.getElementById("authButtons");
const showLoginBtn = document.getElementById("showLoginBtn");
const showSignupBtn = document.getElementById("showSignupBtn");
const switchToSignup = document.getElementById("switchToSignup");
const switchToLogin = document.getElementById("switchToLogin");
const loggedInUploadBox = document.getElementById("loggedInUploadBox");

function showLoginForm() {
  if (!authButtons || !loginForm || !signupForm) return;

  hideElement(authButtons)
  hideElement(signupForm)
  showElement(loginForm)
}

function showSignupForm() {
  if (!authButtons || !loginForm || !signupForm) return;

  hideElement(authButtons)
  hideElement(loginForm)
  showElement(signupForm)
}

if (showLoginBtn) {
  showLoginBtn.addEventListener("click", showLoginForm);
}

if (showSignupBtn) {
  showSignupBtn.addEventListener("click", showSignupForm);
}

if (switchToSignup) {
  switchToSignup.addEventListener("click", showSignupForm);
}

if (switchToLogin) {
  switchToLogin.addEventListener("click", showLoginForm);
}

function showElement(element) {
  if (element) element.classList.remove("hidden");
}

function hideElement(element) {
  if (element) element.classList.add("hidden");
}

// PROTECT FILEINPUT PAGE
function protectPages() {
  if (currentPage === "fileinput.html" && !user) {
    alert("You must be logged in to access this page.");
    window.location.href = "index.html";
  }
  // PROTECT PROFILE PAGE

  if (
    currentPage === "profile.html" &&
    (!user || (user.role_id !== 1 && user.role_id !== 2))
  ) {
    alert("Only admins and parents can access this page.");
    window.location.href = "index.html";
  }
}
protectPages();

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

  if (authButtons) hideElement(authButtons)
  if (loginForm) hideElement(loginForm)
  if (signupForm) hideElement(signupForm)

  if (loggedInUploadBox) {
    showElement(loggedInUploadBox)
  }

} else {

  if (loggedInUploadBox) {
    hideElement(loggedInUploadBox)
  }

}
// LOGIN
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
      localStorage.setItem("tinyguardToken", data.token);
      window.location.href = "index.html";
    } catch (error) {
      alert("Could not connect to server.");
    }
  });
}

// SIGNUP
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
          role: selectedRole.value
        })
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Signup failed");
        return;
      }

      localStorage.setItem("tinyguardUser", JSON.stringify(data.user));
      localStorage.setItem("tinyguardToken", data.token);
      alert("Account created successfully!");
      window.location.href = "index.html";
    } catch (error) {
      alert("Could not connect to server.");
    }
  });
}


//LOGOUT
if (user) {
  if (loginLink) loginLink.style.display = "none";
  if (signupLink) signupLink.style.display = "none";
  if (logoutBtn) logoutBtn.style.display = "inline-block";

  if (profileLink) {
    profileLink.style.display = canAccessProfile ? "inline-block" : "none";
  }

} else {
  if (logoutBtn) logoutBtn.style.display = "none";

  if (profileLink) {
    profileLink.style.display = "none";
  }
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", (e) => {
    e.preventDefault();

    localStorage.removeItem("tinyguardUser");
    localStorage.removeItem("tinyguardToken");
    alert("You have been logged out");
    window.location.href = "index.html"
  })
}

const navLoginBtn = document.getElementById("navLoginBtn");
const navSignupBtn = document.getElementById("navSignupBtn");

if (navLoginBtn) {
  navLoginBtn.addEventListener("click", (e) => {
    e.preventDefault();
    showLoginForm();
  });
}

if (navSignupBtn) {
  navSignupBtn.addEventListener("click", (e) => {
    e.preventDefault();
    showSignupForm();
  });
}