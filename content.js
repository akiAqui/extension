console.log('Content script loaded!');

let shortcuts = {};
let waitingForSecondKey = false;
let secondKeyTimer = null;

// Load shortcuts from storage
chrome.storage.local.get("shortcuts", (data) => {
    shortcuts = data.shortcuts || {};
    console.log('Loaded shortcuts:', shortcuts);
});

// Get editor element
function getEditor() {
    return document.querySelector('div.ProseMirror[contenteditable="true"]');
}

// Insert shortcut text
function insertShortcut(shortcutNumber) {
    const editor = getEditor();
    const text = shortcuts[shortcutNumber];
    
    if (!editor || !text) {
        console.log('Editor or shortcut not found for number:', shortcutNumber);
        return;
    }

    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    
    const range = selection.getRangeAt(0);
    if (!editor.contains(range.commonAncestorContainer)) return;

    range.deleteContents();
    range.insertNode(document.createTextNode(text));
    console.log('Inserted shortcut:', shortcutNumber);
}

// Use event delegation for dynamic content
document.addEventListener('keydown', function(e) {
    console.log('Keydown detected:', e.key, {
        ctrlKey: e.ctrlKey,
        altKey: e.altKey
    });

    const validNumbers = ['1', '2', '3', '4', '5', '6'];

    // Alt + number
    if (e.altKey && validNumbers.includes(e.key)) {
        e.preventDefault();
        insertShortcut(e.key);
        return;
    }

    // Ctrl + Q for focus
    if (e.ctrlKey && e.key === 'q') {
        e.preventDefault();
        const editor = getEditor();
        if (editor) {
            editor.focus();
            console.log('Editor focused');
        }
        return;
    }

    // Ctrl + ; followed by number
    if (e.ctrlKey && e.key === ';') {
        e.preventDefault();
        waitingForSecondKey = true;
        
        clearTimeout(secondKeyTimer);
        secondKeyTimer = setTimeout(() => {
            waitingForSecondKey = false;
            console.log('Second key timeout');
        }, 2000);
        return;
    }

    if (waitingForSecondKey && validNumbers.includes(e.key)) {
        e.preventDefault();
        waitingForSecondKey = false;
        clearTimeout(secondKeyTimer);
        insertShortcut(e.key);
    }
}, true);

// Storage change listener
chrome.storage.onChanged.addListener((changes) => {
    if (changes.shortcuts) {
        shortcuts = changes.shortcuts.newValue || {};
        console.log('Shortcuts updated:', shortcuts);
    }
});
