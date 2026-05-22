import { renderBadWordsChart } from "./statistics_chart.js";

const API_BASE_URL = "https://tinyguard-backend.onrender.com";
const user = JSON.parse(localStorage.getItem("tinyguardUser"));

const adminDashboard = document.getElementById("adminDashboard");
const parentDashboard = document.getElementById("parentDashboard");
const userSearchInput = document.getElementById("userSearchInput");
const token = localStorage.getItem("tinyguardToken");
let allUsers = [];


if (user && user.role_id === 1) {
  adminDashboard.classList.remove("hidden");
}

if (user && user.role_id === 2) {
  parentDashboard.classList.remove("hidden");
}

const connectChildBtn = document.getElementById("connectChildBtn");
const childEmailInput = document.getElementById("childEmail");
const connectChildMessage = document.getElementById("connectChildMessage");

if (connectChildBtn) {
  connectChildBtn.addEventListener("click", async () => {
    const childEmail = childEmailInput.value.trim();

    if (!childEmail) {
      connectChildMessage.textContent = "Please enter the child's email.";
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/parent-child/add-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ childEmail })
      });

      const data = await response.json();

      if (!response.ok) {
        connectChildMessage.textContent = data.error || "Could not connect child.";
        return;
      }

      connectChildMessage.textContent = "Child connected successfully!";
      childEmailInput.value = "";
      loadChildren();
    } catch (error) {
      console.error(error);
      connectChildMessage.textContent = "Could not connect to server.";
    }
  });
}

const childrenList = document.getElementById("childrenList");
const childStatistics = document.getElementById("childStatistics");
const filterButtons = document.querySelectorAll("#statisticsFilters button");

let selectedChildId = null;

async function loadChildren() {

  try {
    const response = await fetch(`${API_BASE_URL}/my-children`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      childrenList.textContent = data.error || "Could not load children.";
      return;
    }

    childrenList.innerHTML = "";

    if (data.length === 0) {
      childrenList.textContent = "No connected children.";
      return;
    }

    data.forEach(child => {
      const childElement = document.createElement("div");

      childElement.innerHTML = `
        <p>
          <strong>${child.full_name}</strong><br>
          ${child.email}
        </p>
      `;

      childElement.addEventListener("click", () => {
        selectedChildId = child.id;
        loadChildStatistics(child.id, "week");
      });

      childrenList.appendChild(childElement);
    });

  } catch (error) {
    console.error(error);
  }
}

async function loadChildStatistics(childId, period) {

  try {
    const response = await fetch(
      `${API_BASE_URL}/statistics/child/${childId}?period=${period}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      childStatistics.textContent = data.error || "Could not load statistics.";
      return;
    }

    childStatistics.innerHTML = `
      <div class="stat-card">
        <i class="fa-solid fa-expand"></i>
        <div>
          <p>Total scans</p>
          <strong>${data.total_scans}</strong>
        </div>
      </div>

      <div class="stat-card">
        <i class="fa-solid fa-triangle-exclamation"></i>
        <div>
          <p>Bad words found</p>
          <strong>${data.total_bad_words}</strong>
        </div>
      </div>
    `;
  renderBadWordsChart(data.chart_data, period);
  } catch (error) {
    console.error(error);
    childStatistics.textContent = "Could not connect to server.";
  }
}

filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    if (!selectedChildId) {
      childStatistics.textContent = "Please select a child first.";
      return;
    }

    const period = button.dataset.period;
    loadChildStatistics(selectedChildId, period);
  });
});

loadChildren();

const usersTableBody = document.getElementById("usersTableBody");
const userIdInput = document.getElementById("userId");
const fullNameInput = document.getElementById("fullName");
const adminEmailInput = document.getElementById("adminEmail");
const roleIdInput = document.getElementById("roleId");
const saveUserBtn = document.getElementById("saveUserBtn");
const clearBtn = document.getElementById("clearBtn");

async function loadUsers() {
  if (!usersTableBody) return;

  try {
    const response = await fetch(`${API_BASE_URL}/users`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const users = await response.json();
    allUsers = users;
    renderUsers(allUsers);
    return;

  } catch (error) {
    console.error(error);
  }
}


function renderUsers(users) {
  usersTableBody.innerHTML = "";

  users.forEach(user => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${user.id}</td>
      <td>${user.full_name}</td>
      <td>${user.email}</td>
      <td>${user.role_id}</td>
      <td>
        <button class="editUserBtn">Edit</button>
        <button class="deleteUserBtn">Delete</button>
      </td>
    `;

    row.querySelector(".editUserBtn").addEventListener("click", () => {
      userIdInput.value = user.id;
      fullNameInput.value = user.full_name;
      adminEmailInput.value = user.email;
      roleIdInput.value = user.role_id;
    });

    row.querySelector(".deleteUserBtn").addEventListener("click", async () => {
      const confirmDelete = confirm("Are you sure you want to delete this user?");
      if (!confirmDelete) return;

      const response = await fetch(`${API_BASE_URL}/users/${user.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        alert("Failed to delete user.");
        return;
      }

      loadUsers();
    });

    usersTableBody.appendChild(row);
  });
}

if (saveUserBtn) {
  saveUserBtn.addEventListener("click", async () => {

    const id = userIdInput.value;

    const url = id
      ? `${API_BASE_URL}/users/${id}`
      : `${API_BASE_URL}/users`;

    const method = id ? "PUT" : "POST";

    const userData = {
      full_name: fullNameInput.value,
      email: adminEmailInput.value,
      role_id: Number(roleIdInput.value)
    };


    if (!id) {
      userData.password = document.getElementById("adminPassword").value;
    }

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      alert("Failed to save user.");
      return;
    }

    userIdInput.value = "";
    fullNameInput.value = "";
    adminEmailInput.value = "";
    document.getElementById("adminPassword").value = "";
    roleIdInput.value = "1";

    loadUsers();
  });
}

if (clearBtn) {
  clearBtn.addEventListener("click", () => {
    userIdInput.value = "";
    fullNameInput.value = "";
    adminEmailInput.value = "";
    roleIdInput.value = "1";
  });
}

if (user && user.role_id === 1) {
  loadUsers();
}

if (userSearchInput) {
  userSearchInput.addEventListener("input", () => {
    const searchTerm = userSearchInput.value.toLowerCase();

    const filteredUsers = allUsers.filter(user =>
      user.full_name.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm)
    );

    renderUsers(filteredUsers);
  });
}