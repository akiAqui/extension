const templates = [
    { id: 'a', label: '1' },
    { id: 'b', label: '2' },
    { id: 'c', label: '3' },
    { id: 'd', label: '4' },
    { id: 'e', label: '5' },
    { id: 'f', label: '6' }
];

// テンプレートを表示
function loadTemplates() {
    chrome.storage.local.get("templates", (data) => {
        const savedTemplates = data.templates || {};
        const container = document.getElementById("template-list");
        container.innerHTML = "";

        templates.forEach(({ id, label }) => {
            const div = document.createElement("div");
            div.className = "template-container";

            const numberLabel = document.createElement("span");
            numberLabel.className = "template-number";
            numberLabel.textContent = label;

            const textarea = document.createElement("textarea");
            textarea.id = `template-${id}`;
            textarea.value = savedTemplates[id] || "";

            div.appendChild(numberLabel);
            div.appendChild(textarea);
            container.appendChild(div);
        });
    });
}

// 保存
document.getElementById("save").addEventListener("click", () => {
    const newTemplates = {};
    templates.forEach(({ id }) => {
        newTemplates[id] = document.getElementById(`template-${id}`).value;
    });

    chrome.storage.local.set({ templates: newTemplates }, () => {
        console.log("Templates saved");
        window.close();
    });
});

// キャンセル
document.getElementById("cancel").addEventListener("click", () => {
    window.close();
});

document.addEventListener("DOMContentLoaded", loadTemplates);

