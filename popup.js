const dropdown = document.getElementById("collections");
const list = document.getElementById("text-list");

// Load collections and their texts
function loadCollections() {
  chrome.storage.local.get(["collections", "selectedCollection", "clipboardByCollection"], (data) => {
    // Initialize collections if empty
    const collections = data.collections || ["Default"];
    const selected = data.selectedCollection || "Default";
    const savedTexts = data.clipboardByCollection || { "Default": [] };

    // Update dropdown
    dropdown.innerHTML = "";
    collections.forEach(name => {
      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      if (name === selected) option.selected = true;
      dropdown.appendChild(option);
    });

    // Load texts for selected collection
    loadTexts(selected, savedTexts[selected] || []);
  });
}

// Load texts for a specific collection
function loadTexts(collectionName, texts) {
  list.innerHTML = "";

  if (!texts || texts.length === 0) {
    const emptyState = document.createElement("div");
    emptyState.className = "empty-state";
    emptyState.innerHTML = `
      <svg viewBox="0 0 24 24">
        <path d="M19,3H14.82C14.4,1.84 13.3,1 12,1C10.7,1 9.6,1.84 9.18,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M12,3A1,1 0 0,1 13,4A1,1 0 0,1 12,5A1,1 0 0,1 11,4A1,1 0 0,1 12,3M7,7H17V5H19V19H5V5H7V7Z" />
      </svg>
      <p>No items in ${collectionName} collection</p>
    `;
    list.appendChild(emptyState);
    return;
  }

  texts.forEach((text, index) => {
    const item = document.createElement("div");
    item.className = "item-card";
    item.innerHTML = `
      <div class="item-content">${text}</div>
      <button class="delete-btn" data-index="${index}">
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
        </svg>
      </button>
    `;
    
    // Copy text on click
    item.addEventListener("click", async (e) => {
      if (!e.target.closest('.delete-btn')) {
        try {
          await navigator.clipboard.writeText(text);
          showSuccessNotification('✓ Copied to clipboard');
        } catch (e) {
            showErrorNotification('Failed to copy');
        }
      }
    });

    // Delete button functionality
    const deleteBtn = item.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteText(collectionName, index);
    });

    list.appendChild(item);
  });
}

// Delete text from collection
function deleteText(collectionName, index) {
  chrome.storage.local.get(["clipboardByCollection"], (data) => {
    const savedTexts = data.clipboardByCollection || {};
    if (savedTexts[collectionName]) {
      savedTexts[collectionName].splice(index, 1);
      chrome.storage.local.set({ clipboardByCollection: savedTexts }, () => {
        loadCollections(); // Refresh the list
        showSuccessNotification('✓ Item deleted');
      });
    }
  });
}

// Collection dropdown change handler
dropdown.addEventListener("change", (e) => {
  const selected = e.target.value;
  chrome.storage.local.set({ selectedCollection: selected }, () => {
    loadCollections();
  });
});

// Create new collection
document.getElementById("create-collection").addEventListener("click", () => {
  const name = prompt("Enter collection name:");
  if (!name) return;

  chrome.storage.local.get(["collections", "clipboardByCollection"], (data) => {
    const collections = data.collections || [];
    const savedTexts = data.clipboardByCollection || {};

    if (!collections.includes(name)) {
      collections.push(name);
      savedTexts[name] = [];
      chrome.storage.local.set({ 
        collections,
        clipboardByCollection: savedTexts,
        selectedCollection: name 
      }, () => {
        loadCollections();
        showSuccessNotification(`Created ${name} collection`);
      });
    } else {
        showErrorNotification('Collection already exists');

    }
  });
});

// Show toast notification
function showToast(message, isError = false) {
  const toast = document.createElement("div");
  toast.className = `toast ${isError ? 'error' : ''}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add("fade-out");
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

function showSuccessNotification(collectionName) {
    const notification = document.createElement("div");
    notification.textContent = `Saved to ${collectionName} ✓`;
    Object.assign(notification.style, {
      position: "fixed",
      bottom: "20px",
      right: "20px",
      background: "#4CAF50",
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
  
  function showErrorNotification(message) {
    const notification = document.createElement("div");
    notification.textContent = message;
    Object.assign(notification.style, {
      position: "fixed",
      bottom: "20px",
      right: "20px",
      background: "#f44336",
      color: "white",
      padding: "12px 24px",
      borderRadius: "4px",
      zIndex: "99999",
      animation: "fadeIn 0.3s, fadeOut 0.3s 2s forwards",
      fontSize: "14px",
      fontWeight: "500"
    });
    
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 2500);
  }

// Initialize when DOM loads
document.addEventListener("DOMContentLoaded", loadCollections);