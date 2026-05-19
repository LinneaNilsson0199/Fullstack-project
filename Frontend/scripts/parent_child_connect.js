const API_BASE_URL = "https://tinyguard-backend.onrender.com";
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

async function loadChildren() {
  const token = localStorage.getItem("tinyguardToken");

  try {
    const response = await fetch(
      `${API_BASE_URL}/my-children`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

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

      childrenList.appendChild(childElement);
    });

  } catch (error) {
    console.error(error);
  }
}

loadChildren();