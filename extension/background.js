chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("Message received:", request);
    if (request.action === "capture") {
        chrome.tabs.captureVisibleTab(null, { format: "png" }, (dataUrl) => {
            fetch(dataUrl)
                .then(res => res.blob())
                .then(blob => {
                    const formData = new FormData();
                    formData.append("file", blob, "screenshot.png");
                    return fetch("http://localhost:8000/ocr", {
                        method: "POST",
                        body: formData
                    });
                })
                .then(response => response.json())
                .then(data => {
                    chrome.runtime.sendMessage({ action: "showText", text: data.text });
                })
                .catch(console.error);
        });
        sendResponse({ status: "success" });
    }
});
