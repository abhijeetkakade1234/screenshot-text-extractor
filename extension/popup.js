document.getElementById("extractBtn").addEventListener("click", async () => {
    try {
        chrome.runtime.sendMessage({ action: "startCapture" }, (response) => {
            console.log("Response from background:", response);
        });
    } catch (error) {
        console.error("Popup error:", error);
    }
});

document.getElementById("copyBtn").addEventListener("click", () => {
    const text = document.getElementById("output").value;
    navigator.clipboard.writeText(text).then(() => {
        alert("Copied to clipboard!");
    });
});
