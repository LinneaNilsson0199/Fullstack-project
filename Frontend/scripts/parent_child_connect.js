import { renderBadWordsChart } from "./statistics_chart.js";

const API_BASE_URL = "https://tinyguard-backend.onrender.com";
const user = JSON.parse(localStorage.getItem("tinyguardUser"));

const adminDashboard = document.getElementById("adminDashboard");
const parentDashboard = document.getElementById("parentDashboard");


if (user.role_id === 1) {
  adminDashboard.classList.remove("hidden");
}

if (user.role_id === 2) {
  parentDashboard.classList.remove("hidden");
}

const connectChildBtn = document.getElementById("connectChildBtn");
const childEmailInput = document.getElementById("childEmail");
const connectChildMessage = document.getElementById("connectChildMessage");

if (connectChildBtn) {
  connectChildBtn.addEventListener("click", async () => {
    const childEmail = childEmailInput.value.trim();
    const token = localStorage.getItem("tinyguardToken");

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
  const token = localStorage.getItem("tinyguardToken");

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
  const token = localStorage.getItem("tinyguardToken");

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
//temporary data for testing chart
  // let demoChartData = [];

  // if (period === "week") {
  //   demoChartData = [
  //     { date_group: "2026-05-18", bad_words: 8 },
  //     { date_group: "2026-05-19", bad_words: 3 },
  //     { date_group: "2026-05-20", bad_words: 2 },
  //     { date_group: "2026-05-21", bad_words: 5 },
  //     { date_group: "2026-05-22", bad_words: 1 },
  //     { date_group: "2026-05-23", bad_words: 8 },
  //     { date_group: "2026-05-24", bad_words: 5 }
  //   ];
  // } else if (period === "year") {
  //   demoChartData = [
  //     { date_group: "2026-01-05", bad_words: 4 },
  //     { date_group: "2026-02-10", bad_words: 7 },
  //     { date_group: "2026-03-15", bad_words: 3 },
  //     { date_group: "2026-04-20", bad_words: 9 },
  //     { date_group: "2026-05-18", bad_words: 6 }
  //   ];
  // } else if (period === "all") {
  //   demoChartData = [
  //     { date_group: "2025-09-08", bad_words: 5 },
  //     { date_group: "2025-11-18", bad_words: 8 },
  //     { date_group: "2026-01-05", bad_words: 4 },
  //     { date_group: "2026-03-15", bad_words: 3 },
  //     { date_group: "2026-05-18", bad_words: 6 }
  //   ];
  // }

  // renderBadWordsChart(demoChartData, period);

  // Real backend data
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

  const token = localStorage.getItem("tinyguardToken");

  try {
    const response = await fetch(`${API_BASE_URL}/users`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const users = await response.json();

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

        const token = localStorage.getItem("tinyguardToken");

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

  } catch (error) {
    console.error(error);
  }
}

window.editUser = function(id, fullName, email, roleId) {
  userIdInput.value = id;
  fullNameInput.value = fullName;
  adminEmailInput.value = email;
  roleIdInput.value = roleId;
};

window.deleteUser = async function(id) {
  const token = localStorage.getItem("tinyguardToken");

  await fetch(`${API_BASE_URL}/users/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  loadUsers();
};

if (saveUserBtn) {
  saveUserBtn.addEventListener("click", async () => {
    const token = localStorage.getItem("tinyguardToken");

    await fetch(`${API_BASE_URL}/users/${userIdInput.value}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        full_name: fullNameInput.value,
        email: adminEmailInput.value,
        role_id: Number(roleIdInput.value)
      })
    });

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