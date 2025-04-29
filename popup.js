const MAX_SHORTCUTS = 6;

// デフォルトのキーバインド
const defaultKeyBindings = {
    1: { primary: 'Ctrl-;', secondary: '1' },
    2: { primary: 'Ctrl-;', secondary: '2' },
    3: { primary: 'Ctrl-;', secondary: '3' },
    4: { primary: 'Ctrl-;', secondary: '4' },
    5: { primary: 'Ctrl-;', secondary: '5' },
    6: { primary: 'Ctrl-;', secondary: '6' }
};

const altKeyBindings = {
    1: { primary: 'Alt-1' },
    2: { primary: 'Alt-2' },
    3: { primary: 'Alt-3' },
    4: { primary: 'Alt-4' },
    5: { primary: 'Alt-5' },
    6: { primary: 'Alt-6' }
};

let currentKeyCapture = null;
let originalShortcuts = {};
let hasUnsavedChanges = false;

function formatKeyBinding(binding) {
    if (binding.secondary) {
        return `${binding.primary} + ${binding.secondary}`;
    }
    return binding.primary;
}

function updateStatusIndicator(saved = false) {
    const statusIndicator = document.getElementById('status-indicator');
    statusIndicator.className = 'status-indicator ' + (saved ? 'saved' : 'unsaved');
    statusIndicator.textContent = saved ? '変更を保存しました' : '未保存の変更があります';
    
    setTimeout(() => {
        if (saved) {
            statusIndicator.style.display = 'none';
        }
    }, 2000);
}

function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

function createKeyDisplay(number) {
    const container = document.createElement('div');
    container.className = 'shortcut-header';

    // Number display
    const numberLabel = document.createElement('span');
    numberLabel.className = 'shortcut-number';
    numberLabel.textContent = number;

    // Key bindings display
    const keyDisplayCtrl = document.createElement('span');
    keyDisplayCtrl.className = 'key-display';
    keyDisplayCtrl.textContent = formatKeyBinding(defaultKeyBindings[number]);

    const keyDisplayAlt = document.createElement('span');
    keyDisplayAlt.className = 'key-display';
    keyDisplayAlt.textContent = formatKeyBinding(altKeyBindings[number]);

    // Change button
    const changeButton = document.createElement('button');
    changeButton.className = 'key-change-button';
    changeButton.textContent = '変更';
    changeButton.onclick = () => startKeyCapture(number);

    // Key input mode container
    const keyInputMode = document.createElement('div');
    keyInputMode.className = 'key-input-mode';
    keyInputMode.id = `key-input-${number}`;
    
    // Key display area
    const keyDisplayArea = document.createElement('div');
    keyDisplayArea.id = `key-display-area-${number}`;
    keyDisplayArea.textContent = 'キーを入力してください...';
    
    // Button group
    const buttonGroup = document.createElement('div');
    buttonGroup.className = 'button-group';
    
    const okButton = document.createElement('button');
    okButton.textContent = 'OK';
    okButton.onclick = () => confirmKeyCapture(number);
    
    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.onclick = () => cancelKeyCapture(number);
    
    buttonGroup.appendChild(okButton);
    buttonGroup.appendChild(cancelButton);
    
    keyInputMode.appendChild(keyDisplayArea);
    keyInputMode.appendChild(buttonGroup);

    container.appendChild(numberLabel);
    container.appendChild(keyDisplayCtrl);
    container.appendChild(keyDisplayAlt);
    container.appendChild(changeButton);
    container.appendChild(keyInputMode);

    return container;
}

const debouncedTextChange = debounce(() => {
    hasUnsavedChanges = true;
    updateStatusIndicator(false);
}, 300);

function handleTextAreaChange() {
    debouncedTextChange();
}

function startKeyCapture(number) {
    if (currentKeyCapture) {
        cancelKeyCapture(currentKeyCapture.number);
    }

    const keyInputMode = document.getElementById(`key-input-${number}`);
    const keyDisplayArea = document.getElementById(`key-display-area-${number}`);
    keyInputMode.classList.add('active');
    
    const capturedKeys = {
        ctrlKey: false,
        altKey: false,
        shiftKey: false,
        key: null
    };
    
    const keyHandler = (e) => {
        e.preventDefault();
        
        capturedKeys.ctrlKey = e.ctrlKey;
        capturedKeys.altKey = e.altKey;
        capturedKeys.shiftKey = e.shiftKey;
        if (!['Control', 'Alt', 'Shift'].includes(e.key)) {
            capturedKeys.key = e.key;
        }
        
        const keys = [];
        if (capturedKeys.ctrlKey) keys.push('Ctrl');
        if (capturedKeys.altKey) keys.push('Alt');
        if (capturedKeys.shiftKey) keys.push('Shift');
        if (capturedKeys.key) keys.push(capturedKeys.key);
        
        keyDisplayArea.textContent = `現在の入力: ${keys.join('-')}`;
    };

    document.addEventListener('keydown', keyHandler);
    
    currentKeyCapture = {
        number: number,
        handler: keyHandler,
        keys: capturedKeys
    };
}

function confirmKeyCapture(number) {
    if (currentKeyCapture && currentKeyCapture.number === number) {
        document.removeEventListener('keydown', currentKeyCapture.handler);
        const keyInputMode = document.getElementById(`key-input-${number}`);
        keyInputMode.classList.remove('active');
        hasUnsavedChanges = true;
        updateStatusIndicator(false);
        currentKeyCapture = null;
    }
}

function cancelKeyCapture(number) {
    if (currentKeyCapture && currentKeyCapture.number === number) {
        document.removeEventListener('keydown', currentKeyCapture.handler);
        const keyInputMode = document.getElementById(`key-input-${number}`);
        const keyDisplayArea = document.getElementById(`key-display-area-${number}`);
        keyDisplayArea.textContent = 'キーを入力してください...';
        keyInputMode.classList.remove('active');
        currentKeyCapture = null;
    }
}

// ショートカットを表示
function loadShortcuts() {
    chrome.storage.local.get("shortcuts", (data) => {
        originalShortcuts = data.shortcuts || {};

        const container = document.getElementById("shortcut-list");
        container.innerHTML = "";

        for (let i = 1; i <= MAX_SHORTCUTS; i++) {
            const div = document.createElement("div");
            div.className = "shortcut-container";

            const keyDisplay = createKeyDisplay(i);
            div.appendChild(keyDisplay);

            const textarea = document.createElement("textarea");
            textarea.id = `shortcut-${i}`;
            
            textarea.value = originalShortcuts[i] ? originalShortcuts[i].replace(/\\n/g, '\n') : "";
            textarea.addEventListener('input', handleTextAreaChange);
            /*
            textarea.value = originalShortcuts[i] ? originalShortcuts[i].join("\n") : "";
            */


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
        /*
        const value = document.getElementById(`shortcut-${i}`).value; //元の生成コードはこれが付いてた.trim();
        if (value) newShortcuts[i] = value.split("\n"); // 配列に変換して保存
        */
        

    }

    chrome.storage.local.set({ shortcuts: newShortcuts }, () => {
        hasUnsavedChanges = false;
        updateStatusIndicator(true);
        originalShortcuts = {...newShortcuts};
        setTimeout(() => window.close(), 500); // 変更が保存されたことを確認後に閉じる
    });
});

// キャンセル
document.getElementById("cancel").addEventListener("click", () => {
    if (hasUnsavedChanges) {
        if (confirm('未保存の変更があります。破棄してもよろしいですか？')) {
            window.close();
        }
    } else {
        window.close();
    }
});

window.addEventListener('beforeunload', (e) => {
    if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
    }
});

document.addEventListener("DOMContentLoaded", loadShortcuts);
document.querySelectorAll("textarea").forEach(textarea => {
    textarea.addEventListener("input", function () {
        this.style.height = "auto";
        this.style.height = this.scrollHeight + "px";
    });
});
