//console.log('Content script loaded!');

let waitingForSecondKey = false;
let secondKeyTimer = null;

// Get editor element
function getEditor() {
    return document.querySelector('div.ProseMirror[contenteditable="true"]');
}

function simulateShiftReturn() {
    const event = new KeyboardEvent("keydown", {
        key: "Enter",
        code: "Enter",
        keyCode: 13,
        which: 13,
        shiftKey: true,
        bubbles: true,
        cancelable: true
    });
    document.activeElement.dispatchEvent(event);
}



// Insert shortcut text
async function insertShortcut(shortcutNumber) {
    try {
        const editor = getEditor();
        if (!editor) {
            console.log('Editor not found');
            return;
        }

        const result = await chrome.storage.local.get("shortcuts");
        const shortcuts = result.shortcuts || {};
        const text = shortcuts[shortcutNumber];
        if (!text) {
            console.log('Shortcut not found for number:', shortcutNumber);
            return;
        }
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        
        const range = selection.getRangeAt(0);
        if (!editor.contains(range.commonAncestorContainer)) return;

        range.deleteContents();
        range.insertNode(document.createTextNode(text));
        //range.setStartAfter(textNode);
        //range.setEndAfter(textNode);
/*
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
*/            
        //});
        console.log('Inserted shortcut:', shortcutNumber);
    } catch (error) {
        console.error('Error inserting shortcut:', error);
    }
}

// Use event delegation for dynamic content
window.addEventListener('keydown', function(e) {
    /*
    console.log('Keydown detected:', e.key, {
        ctrlKey: e.ctrlKey,
        altKey: e.altKey
    });
    */
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
            // console.log('Editor focused');
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
            // console.log('Second key timeout');
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
