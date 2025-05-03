console.log("✅ content.js IS RUNNING");

// Detect dark mode
function isDarkMode() {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

// Single message listener
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Received message:", message.type, message.text);
  
  if (message.type === "showCollectionSelector" && message.text) {
    showCollectionSelector(message.text);
    // Keep the message channel open for potential responses
    return true;
  }
  return false;
});

function showCollectionSelector(textToSave) {
  chrome.storage.local.get(["collections"], (res) => {
    const collections = res.collections || ["Default"];
    console.log("Available collections:", collections);
    
    // Remove existing selector if any
    const existing = document.getElementById("kolam-collection-selector");
    if (existing) existing.remove();
    
    // Determine color scheme
    const darkMode = isDarkMode();
    
    // Create container with dark mode support
    const div = document.createElement("div");
    div.id = "kolam-collection-selector";
    Object.assign(div.style, {
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      zIndex: "99999",
      background: darkMode ? "#2d2d2d" : "#ffffff",
      border: darkMode ? "1px solid #444" : "1px solid #e0e0e0",
      padding: "16px",
      boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
      borderRadius: "12px",
      maxWidth: "320px",
      width: "90%",
      maxHeight: "80vh",
      overflowY: "auto",
      fontFamily: "'Segoe UI', Arial, sans-serif",
      color: darkMode ? "#f0f0f0" : "#333"
    });

    // Add close button
    const closeBtn = document.createElement("button");
    closeBtn.innerHTML = "&times;";
    closeBtn.style.position = "absolute";
    closeBtn.style.top = "8px";
    closeBtn.style.right = "8px";
    closeBtn.style.background = "none";
    closeBtn.style.border = "none";
    closeBtn.style.fontSize = "18px";
    closeBtn.style.cursor = "pointer";
    closeBtn.style.color = darkMode ? "#f0f0f0" : "#333";
    closeBtn.onclick = () => {
      div.remove();
      document.getElementById("kolam-collection-overlay")?.remove();
    };
    div.appendChild(closeBtn);

    // Add heading
    const heading = document.createElement("h3");
    heading.textContent = "Save to Collection";
    heading.style.margin = "0 0 16px 0";
    heading.style.fontSize = "18px";
    div.appendChild(heading);

    // Add preview of selected text
    const preview = document.createElement("div");
    preview.textContent = `"${textToSave.trim().length > 30 ? 
      textToSave.trim().substring(0, 30) + "..." : 
      textToSave.trim()}"`;
    Object.assign(preview.style, {
      marginBottom: "16px",
      padding: "8px",
      background: darkMode ? "#3d3d3d" : "#f8f9fa",
      borderRadius: "6px",
      fontSize: "14px",
      color: darkMode ? "#e0e0e0" : "#555",
      wordBreak: "break-word"
    });
    div.appendChild(preview);

    // Create cards for each collection
    if (collections.length === 0) {
      const emptyMsg = document.createElement("div");
      emptyMsg.textContent = "No collections found";
      emptyMsg.style.color = darkMode ? "#aaa" : "#666";
      emptyMsg.style.textAlign = "center";
      emptyMsg.style.padding = "16px";
      div.appendChild(emptyMsg);
    } else {
      collections.forEach((col) => {
        const card = document.createElement("div");
        card.textContent = col;
        Object.assign(card.style, {
          margin: "8px 0",
          padding: "12px 16px",
          background: darkMode ? "#3d3d3d" : "#f5f5f5",
          borderRadius: "8px",
          cursor: "pointer",
          transition: "all 0.2s ease",
          fontSize: "15px",
          fontWeight: "500",
          color: darkMode ? "#f0f0f0" : "#333"
        });

        card.onmouseenter = () => card.style.background = darkMode ? "#4d4d4d" : "#e0e0e0";
        card.onmouseleave = () => card.style.background = darkMode ? "#3d3d3d" : "#f5f5f5";

        card.onclick = async () => {
          console.log("Saving to collection:", col);
          try {
            await chrome.runtime.sendMessage({
              type: "saveToCollection",
              text: textToSave,
              collection: col
            });
            console.log("Saved successfully");
            div.remove();
            document.getElementById("kolam-collection-overlay")?.remove();
            showSuccessNotification(col, darkMode);
          } catch (error) {
            console.error("Error saving:", error);
          }
        };

        div.appendChild(card);
      });
    }

    // Add click-outside-to-close functionality
    const overlay = document.createElement("div");
    overlay.id = "kolam-collection-overlay";
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.right = "0";
    overlay.style.bottom = "0";
    overlay.style.zIndex = "99998";
    overlay.style.background = darkMode ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0.3)";
    overlay.onclick = () => {
      div.remove();
      overlay.remove();
    };
    
    document.body.appendChild(overlay);
    document.body.appendChild(div);
  });
}

function showSuccessNotification(collectionName, darkMode) {
  const notification = document.createElement("div");
  notification.textContent = `✓ Saved to ${collectionName}`;
  Object.assign(notification.style, {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    background: darkMode ? "#388e3c" : "#4CAF50",
    color: "white",
    padding: "12px 24px",
    borderRadius: "4px",
    zIndex: "99999",
    animation: "fadeIn 0.3s, fadeOut 0.3s 2s forwards",
    fontSize: "14px",
    fontWeight: "500"
  });
  
  document.body.appendChild(notification);
  
  // Add animations if not already present
  if (!document.getElementById("kolam-animation-styles")) {
    const style = document.createElement("style");
    style.id = "kolam-animation-styles";
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
  
  setTimeout(() => notification.remove(), 2500);
}