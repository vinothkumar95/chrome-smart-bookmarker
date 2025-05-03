// Create context menu on install
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: "saveToClipboardCollection",
      title: "💾 Save to Clipboard Collection",
      contexts: ["selection"]
    });
  
    // Initialize storage with default values
    chrome.storage.local.get(["collections", "collectionsData", "selectedCollection", "clipboardByCollection"], (data) => {
      const defaults = {
        collections: data.collections || ["Default"],
        collectionsData: data.collectionsData || { "Default": [] },
        selectedCollection: data.selectedCollection || "Default",
        clipboardByCollection: data.clipboardByCollection || { "Default": [] }
      };
      chrome.storage.local.set(defaults);
    });
  });
  
  // Context menu click handler
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "saveToClipboardCollection" && info.selectionText) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      }, () => {
        // Handle any injection errors
        if (chrome.runtime.lastError) {
          console.error("Injection failed:", chrome.runtime.lastError);
          return;
        }
        
        // Send message to content script
        chrome.tabs.sendMessage(tab.id, {
          type: "showCollectionSelector",
          text: info.selectionText
        });
      });
    }
  });
  
  // Message listener with proper async response handling
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "saveToCollection") {
      // This is async so we need to return true
      handleSaveToCollection(message, sendResponse);
      return true; // Keep the message channel open
    }
    
    // Add other message types here if needed
    return false; // Close the channel for other messages
  });
  
  // Separate function to handle the save operation
  function handleSaveToCollection(message, sendResponse) {
    chrome.storage.local.get(["clipboardByCollection"], (res) => {
      const store = res.clipboardByCollection || {};
      const collection = message.collection || "Default";
      const list = store[collection] || [];
  
      // Check if text already exists
      if (!list.includes(message.text)) {
        list.unshift(message.text);
        if (list.length > 10) list.pop();
  
        store[collection] = list;
        chrome.storage.local.set({ clipboardByCollection: store }, () => {
          console.log(`✅ Saved "${message.text}" to [${collection}]`);
          sendResponse({ success: true });
        });
      } else {
        sendResponse({ success: false, message: "Text already exists" });
      }
    });
  }
  
  // Handle auto-save on copy (no response needed)
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "copied") {
      chrome.storage.local.get(["selectedCollection", "collectionsData"], (res) => {
        const collection = res.selectedCollection || "Default";
        const data = res.collectionsData || {};
        const history = data[collection] || [];
  
        if (!history.includes(message.text)) {
          history.unshift(message.text);
          if (history.length > 10) history.pop();
          data[collection] = history;
          chrome.storage.local.set({ collectionsData: data });
        }
      });
      return false; // No response needed
    }
    return false;
  });