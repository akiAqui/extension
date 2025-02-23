// content.js
console.log('Content script loaded!');

const templates = {
    'a': 'Yes/Noなどの簡素に回答。説明が必要な疑問には、要求以外の説明、私に自明な説明、重複説明、以上すべて禁止。詳細やコードを求められない限り出力しない。提案があるときは「提案あり」と添えること',    
    'b': 'vite/typescript/three.js/lil-gui/vite-plugin-glsl環境で動くコード生成。main.ts, fragment.glsl, vertex.glsl, index.html。生成コードについてはセッションでlimit制限を受けないよう１ファイルずつ。次以降のファイルの生成はOKを待って生成',    
    'c': 'markdownでアーティファクトとして、冗長のない、理系の大学3年生が理解できるような簡素な技術レポートを出力。冒頭に要約を置く。まとめは不要。数式が必要であれば$$と改行でブロックの形で生成、インラインの数式は$で囲う。セクションは細かく区切らないで箇条書きを多用。セクションは##以下で。セクション名に数字を使わない。レポート内で「**」は使わない。文末には、必要な用語説明と、リンクとしてリファレンスを付与',    
    'd': 'ファイルが途中で切れてしまったので、最初から出力を',
    'e': 'ここまでの全ての議論をまとめて、',
    'f': 'trackballControlで制御して、lil-guiで'
};

function insertTemplate(templateKey) {
    const editor = document.querySelector('div.ProseMirror[contenteditable="true"]');
    if (!editor) return;
    
    const text = templates[templateKey];
    if (!text) return;

    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    
    const range = selection.getRangeAt(0);
    if (!editor.contains(range.commonAncestorContainer)) return;

    // カーソル位置のコンテンツを削除し、テンプレートテキストを挿入
    range.deleteContents();
    range.insertNode(document.createTextNode(text));
}

// Alt + number
document.addEventListener('keydown', function(e) {
    if (e.altKey && ['1', '2', '3', '4', '5', '6'].includes(e.key)) {
        e.preventDefault();
        const templateKey = {
            '1': 'a',
            '2': 'b',
            '3': 'c',
            '4': 'd',
            '5': 'e',
            '6': 'f'
        }[e.key];
        
        insertTemplate(templateKey);
        return;
    }

    // Ctrl + Q for focus
    if (e.ctrlKey && e.key === 'q') {
        e.preventDefault();
        const editor = document.querySelector('div.ProseMirror[contenteditable="true"]');
        if (editor) {
            editor.focus();
            console.log('Focus attempted');
        }
    }
});

// Ctrl + ; followed by number
let waitingForSecondKey = false;
let secondKeyTimer = null;

document.addEventListener('keydown', function(e) {
    // First stroke: Ctrl + ;
    if (e.ctrlKey && e.key === ';') {
        e.preventDefault();
        waitingForSecondKey = true;
        
        clearTimeout(secondKeyTimer);
        secondKeyTimer = setTimeout(() => {
            waitingForSecondKey = false;
        }, 2000);
        return;
    }

    // Second stroke: number key
    if (waitingForSecondKey && ['1', '2', '3', '4', '5', '6'].includes(e.key)) {
        e.preventDefault();
        waitingForSecondKey = false;
        clearTimeout(secondKeyTimer);
        
        const templateKey = {
            '1': 'a',
            '2': 'b',
            '3': 'c',
            '4': 'd',
            '5': 'e',
            '6': 'f'
        }[e.key];
        
        insertTemplate(templateKey);
    }
});

// Reset waiting state when focus is lost
document.addEventListener('blur', () => {
    waitingForSecondKey = false;
    clearTimeout(secondKeyTimer);
}, true);
