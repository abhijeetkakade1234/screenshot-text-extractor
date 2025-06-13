// console.log("OCR Content Script loaded");

// if (window.hasOwnProperty('__ocr_script_loaded__')) {
//     console.log('OCR script already loaded, skipping...');
// } else {
//     window.__ocr_script_loaded__ = true;

//     chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//         if (request.action === "showTextRegions") {
//             try {
//                 if (!request.regions || !request.screenshot) {
//                     sendResponse({ error: "Missing regions or screenshot" });
//                     return false;
//                 }

//                 createTextOverlay(request.screenshot, request.regions);
//                 sendResponse({ success: true });
//             } catch (error) {
//                 console.error("Overlay error:", error);
//                 sendResponse({ error: error.message });
//             }
//             return false;
//         }
//     });

//     function createTextOverlay(screenshotDataUrl, regions) {
//         // Remove existing overlay if any
//         const existingOverlay = document.getElementById('ocr-text-overlay');
//         if (existingOverlay) {
//             existingOverlay.remove();
//         }

//         const overlay = document.createElement('div');
//         overlay.id = 'ocr-text-overlay';
//         overlay.style.cssText = `
//             position: fixed;
//             top: 0;
//             left: 0;
//             width: 100%;
//             height: 100%;
//             pointer-events: none;
//             z-index: 2147483646;
//         `;

//         // Background image (screenshot)
//         const img = document.createElement('img');
//         img.src = screenshotDataUrl;
//         img.style.cssText = `
//             width: 100%;
//             height: 100%;
//             object-fit: cover;
//             position: absolute;
//             top: 0;
//             left: 0;
//             z-index: -1;
//         `;
//         overlay.appendChild(img);

//         // Add close button
//         const closeBtn = document.createElement('button');
//         closeBtn.textContent = '❌';
//         closeBtn.style.cssText = `
//             position: fixed;
//             top: 10px;
//             right: 10px;
//             z-index: 2147483648;
//             background: #ff5c5c;
//             color: white;
//             border: none;
//             border-radius: 5px;
//             padding: 6px 10px;
//             font-size: 16px;
//             cursor: pointer;
//         `;
//         closeBtn.addEventListener('click', () => overlay.remove());
//         overlay.appendChild(closeBtn);

//         const scale = 1 / window.devicePixelRatio;

//         regions.forEach(region => {
//             const x = (region.bbox.x1 - window.scrollX) * scale;
//             const y = (region.bbox.y1 - window.scrollY) * scale;
//             const width = (region.bbox.x2 - region.bbox.x1) * scale;
//             const height = (region.bbox.y2 - region.bbox.y1) * scale;

//             const highlight = document.createElement('div');
//             highlight.className = 'ocr-text-region';
//             highlight.style.cssText = `
//                 position: absolute;
//                 left: ${x}px;
//                 top: ${y}px;
//                 width: ${width}px;
//                 height: ${height}px;
//                 background: rgba(255, 255, 0, 0.3);
//                 border: 1px solid rgba(255, 200, 0, 0.7);
//                 cursor: pointer;
//                 pointer-events: auto;
//             `;
//             highlight.setAttribute('data-text', region.text);
//             highlight.addEventListener('click', () => {
//                 navigator.clipboard.writeText(region.text);
//                 showCopiedTooltip(highlight);
//             });
//             overlay.appendChild(highlight);
//         });

//         document.body.appendChild(overlay);
//     }

//     function showCopiedTooltip(element) {
//         const tooltip = document.createElement('div');
//         tooltip.style.cssText = `
//             position: fixed;
//             background: rgba(0, 0, 0, 0.8);
//             color: white;
//             padding: 5px 10px;
//             border-radius: 3px;
//             font-size: 12px;
//             z-index: 2147483647;
//         `;
//         tooltip.textContent = 'Copied!';
//         const rect = element.getBoundingClientRect();
//         tooltip.style.left = `${rect.left}px`;
//         tooltip.style.top = `${rect.bottom + 5}px`;
//         document.body.appendChild(tooltip);
//         setTimeout(() => tooltip.remove(), 1000);
//     }
// }
console.log("OCR Content Script loaded");

if (window.hasOwnProperty("__ocr_script_loaded__")) {
  console.log("OCR script already loaded, skipping...");
} else {
  window.__ocr_script_loaded__ = true;

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "showTextRegions") {
      try {
        if (!request.regions || !request.screenshot) {
          sendResponse({ error: "Missing regions or screenshot" });
          return false;
        }

        createTextOverlay(request.screenshot, request.regions);
        sendResponse({ success: true });
      } catch (error) {
        console.error("Overlay error:", error);
        sendResponse({ error: error.message });
      }
      return false;
    }
  });

  function createTextOverlay(screenshotDataUrl, regions) {
    const existingOverlay = document.getElementById("ocr-text-overlay");
    if (existingOverlay) existingOverlay.remove();

    const overlay = document.createElement("div");
    overlay.id = "ocr-text-overlay";
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 2147483646;
    `;

    document.body.style.overflow = "hidden";

    const img = document.createElement("img");
    img.src = screenshotDataUrl;
    img.style.cssText = `
      width: 100%;
      height: 100%;
      object-fit: cover;
      position: absolute;
      top: 0;
      left: 0;
      z-index: -1;
      pointer-events: none;
    `;
    overlay.appendChild(img);

    const closeBtn = document.createElement("button");
    closeBtn.textContent = "❌";
    closeBtn.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      z-index: 2147483648;
      background: white;
      color: black;
      border: none;
      border-radius: 5px;
      padding: 6px 10px;
      font-size: 16px;
      cursor: pointer;
    `;
    closeBtn.addEventListener("click", () => {
      overlay.remove();
      document.body.style.overflow = "";
    });
    overlay.appendChild(closeBtn);

    const scale = 1 / window.devicePixelRatio;

    regions.forEach(region => {
      const x = region.bbox.x1 * scale;
      const y = region.bbox.y1 * scale;
      const width = (region.bbox.x2 - region.bbox.x1) * scale;
      const height = (region.bbox.y2 - region.bbox.y1) * scale;

      const textSpan = document.createElement("span");
      textSpan.textContent = region.text;
      textSpan.style.cssText = `
        position: absolute;
        left: ${x}px;
        top: ${y}px;
        width: ${width}px;
        height: ${height}px;
        font-size: ${height * 0.8}px;
        color: black;
        background: transparent;
        user-select: text;
        white-space: nowrap;
        pointer-events: auto;
      `;
      overlay.appendChild(textSpan);
    });

    document.body.appendChild(overlay);
  }

  // Optional: Highlight + Tooltip on Manual Selection
  document.addEventListener("mouseup", () => {
    const selectedText = window.getSelection().toString().trim();
    if (selectedText.length > 0) {
      navigator.clipboard.writeText(selectedText);
      const range = window.getSelection().getRangeAt(0);
      const rect = range.getBoundingClientRect();

      // Highlight Effect
      const highlight = document.createElement("div");
      highlight.style.cssText = `
        position: absolute;
        top: ${rect.top + window.scrollY}px;
        left: ${rect.left + window.scrollX}px;
        width: ${rect.width}px;
        height: ${rect.height}px;
        background: rgba(255, 255, 0, 0.4);
        border: 1px solid gold;
        border-radius: 4px;
        z-index: 99998;
        pointer-events: none;
        transition: opacity 0.2s ease;
      `;
      document.body.appendChild(highlight);
      setTimeout(() => highlight.remove(), 2000);

      // Tooltip
      const tooltip = document.createElement("div");
      tooltip.innerHTML = `"${selectedText}" copied ✂️ <span style="margin-left:10px;cursor:pointer;">&times;</span>`;
      tooltip.style.cssText = `
        position: absolute;
        top: ${rect.top + window.scrollY - 40}px;
        left: ${rect.left + window.scrollX}px;
        background: #000;
        color: #fff;
        padding: 8px 12px;
        border-radius: 8px;
        font-size: 14px;
        z-index: 99999;
        opacity: 0;
        transition: opacity 0.3s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      `;

      document.body.appendChild(tooltip);
      requestAnimationFrame(() => (tooltip.style.opacity = 1));

      const closeBtn = tooltip.querySelector("span");
      closeBtn.onclick = () => tooltip.remove();

      setTimeout(() => {
        tooltip.style.opacity = 0;
        setTimeout(() => tooltip.remove(), 500);
      }, 2000);
    }
  });
}
