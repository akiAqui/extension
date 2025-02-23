const MAX_SHORTCUTS = 6;

// ショートカットを表示
function loadShortcuts() {
    chrome.storage.local.get("shortcuts", (data) => {
        const savedShortcuts = data.shortcuts || {};
        const container = document.getElementById("shortcut-list");
        container.innerHTML = "";

        for (let i = 1; i <= MAX_SHORTCUTS; i++) {
            const div = document.createElement("div");
            div.className = "shortcut-container";

            const numberLabel = document.createElement("span");
            numberLabel.className = "shortcut-number";
            numberLabel.textContent = i;

            const textarea = document.createElement("textarea");
            textarea.id = `shortcut-${i}`;
            textarea.value = savedShortcuts[i] || "";

            div.appendChild(numberLabel);
            div.appendChild(textarea);
            container.appendChild(div);
        }
    });
}

// 保存
document.getElementById("save").addEventListener("click", () => {
    const newShortcuts = {};
    for (let i = 1; i <= MAX_SHORTCUTS; i++) {
        const value = document.getElementById(`shortcut-${i}`).value;
        if (value) newShortcuts[i] = value;
    }

    chrome.storage.local.set({ shortcuts: newShortcuts }, () => {
        console.log("Shortcuts saved:", newShortcuts);
        window.close();
    });
});

// キャンセル
document.getElementById("cancel").addEventListener("click", () => {
    window.close();
});

document.addEventListener("DOMContentLoaded", loadShortcuts);
