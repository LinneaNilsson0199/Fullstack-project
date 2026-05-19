const inputFile = document.getElementById("Inputfile");
const uploadBtn = document.getElementById("uploadBtn");
const fileName = document.getElementById("file-name");
const dropArea = document.getElementById("loggedInUploadBox");
const scanResult = document.getElementById("scan-result");

async function scanFile(file) {
  if (!file) return;

  fileName.textContent = "Selected file: " + file.name;
  scanResult.textContent = "Scanning...";

  const formData = new FormData();
  formData.append("file", file);

  try {
    const token = localStorage.getItem("tinyguardToken");

    const response = await fetch("https://tinyguard-backend.onrender.com/scan", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      scanResult.textContent = data.error || "Scan failed";
      return;
    }

    if (data.found) {
      scanResult.textContent = "Inappropriate words found.";
    } else {
      scanResult.textContent = "No inappropriate words found.";
    }

  } catch (error) {
    console.error(error);
    scanResult.textContent = "Could not connect to backend.";
  }
}

if (inputFile && uploadBtn && fileName && dropArea && scanResult) {
  uploadBtn.addEventListener("click", () => {
    inputFile.click();
  });

  inputFile.addEventListener("change", () => {
    scanFile(inputFile.files[0]);    
});

  dropArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropArea.style.background = "#eef4eb";
  });

  dropArea.addEventListener("dragleave", () => {
    dropArea.style.background = "rgba(255,255,255,0.52)";
  });

  dropArea.addEventListener("drop", (e) => {
    e.preventDefault();
    dropArea.style.background = "rgba(255,255,255,0.52)";

    const file = e.dataTransfer.files[0];
    scanFile(file);
});
}

