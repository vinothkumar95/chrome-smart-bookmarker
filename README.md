# Smart Bookmarker with Collections

**Save and organize important text into collections while browsing the web.**

## Features:
- 📝 **Highlight and Save**: Save important text to a specific collection.
- 🔍 **Search by Collections**: Easily find saved texts by collection or keyword.
- 🗂️ **Organize by Collections**: Group saved entries into collections such as "Books", "Research", or "Quotes."
- 🖋️ **Add Notes**: Add personal notes to any saved text.

## How to Use:
1. **Highlight** text you find interesting.
2. **Right-click** or **long-press** and select **Save to Collection**.
3. **Search** for saved text by collection name or keyword.
4. **Click** on a saved entry to open the original page.

## Technologies Used:
- **JavaScript** for content scripting and interaction
- **Chrome Storage API** for saving collections and highlights
- **CSS Grid** for responsive and modern UI design

## 📦 Installation (Development Mode)

1. Clone or download this repository:

   ```bash
   git clone https://github.com/vinothkumar95/chrome-smart-bookmarker
   ````

2. Open Google Chrome and go to:

    ```bash
    chrome://extensions/
    ```

3. Enable Developer mode (top right)

4. Click "Load unpacked" and select the project folder

5. You're done! ✅ Try copying text on any webpage.

## 📁 Project Structure

        chrome-clipboard/
        │
        ├── manifest.json          # Chrome extension config
        ├── background.js          # Handles saving history
        ├── content.js             # Listens to copy events on websites
        ├── popup.html             # Extension popup UI
        ├── popup.js               # Popup logic (load, click-to-copy)
        ├── icons/                 # Extension icons
        └── README.md              # This file
  


## 🔐 Permissions Used
    storage – To save clipboard history

    clipboardRead, clipboardWrite – To read/write clipboard

    activeTab, scripting – For interactions (future use)

    host_permissions – To run on all pages

    contextMenus – To add menu

    scripting – To inject scripts


##  🚧 Known Limitations
    Some sites like Google Docs or Facebook may block clipboard event detection

    Direct pasting into fields from popup is blocked by browser security, but re-copy works fine

## 📜 License
MIT – Feel free to use, modify, and share!
