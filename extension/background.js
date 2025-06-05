chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "startCapture") {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const tab = tabs[0];

      // 🔒 Skip Chrome system or Web Store pages
      if (!tab || !tab.id || !tab.url || tab.url.startsWith("chrome://") || tab.url.includes("chrome.google.com")) {
        console.warn("Invalid or restricted tab. Skipping...");
        return;
      }

      try {
        const dataUrl = await chrome.tabs.captureVisibleTab(null, { format: "png" });
        const response = await fetch(dataUrl);
        const blob = await response.blob();

        const formData = new FormData();
        formData.append('file', blob, 'screenshot.png');

        const ocrRes = await fetch('http://localhost:8000/ocr', {
          method: 'POST',
          body: formData
        });

        const data = await ocrRes.json();

        // ✅ Try sending message to content script
        try {
          await chrome.tabs.sendMessage(tab.id, {
            action: "showTextRegions",
            regions: data.regions,
            screenshot: dataUrl
          });
        } catch (err) {
          console.warn("SendMessage failed, trying to inject contentScript.js:", err);

          chrome.scripting.executeScript(
            {
              target: { tabId: tab.id },
              files: ["contentScript.js"]
            },
            () => {
              chrome.tabs.sendMessage(tab.id, {
                action: "showTextRegions",
                regions: data.regions,
                screenshot: dataUrl
              });
            }
          );
        }
      } catch (error) {
        console.error("Error processing OCR:", error);
        sendResponse({ error: error.message });
      }
    });

    return true; // Keep message channel open
  }
});

// Optional: Also listen to icon click
chrome.action.onClicked.addListener((tab) => {
  chrome.runtime.sendMessage({ action: "startCapture" });
});
