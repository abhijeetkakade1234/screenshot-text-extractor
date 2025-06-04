document.getElementById("extractBtn").addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "capture" }, (response) => {
        console.log("Response from background:", response);
    });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "showText") {
        const textarea = document.getElementById("output");
        textarea.value = request.text;
        navigator.clipboard.writeText(request.text);
    }
});
