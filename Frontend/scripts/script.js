const Inputfile  = document.getElementById('Inputfile'); 
const uploadBtn  = document.getElementById('uploadBtn');
const fileName = document.getElementById("file-name");
const dropArea = document.getElementById("drop-area")

uploadBtn.addEventListener("click", () => {
    Inputfile.click();
})

Inputfile.addEventListener("change", function () {
    if (Inputfile.files.length > 0){
        fileName.textContent = "Selected file: " + Inputfile.files[0].name;

    }
})


//Drop file

dropArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropArea.style.background = "#ddd";
});

dropArea.addEventListener("dragleave", () => {
    dropArea.style.background = "#f5f5f5";
});

dropArea.addEventListener("drop", (e) => {
    e.preventDefault();

    const file = e.dataTransfer.files[0];
    fileName.textContent = "Selected file: " + file.name;
});


