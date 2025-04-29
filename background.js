chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'getShortcuts') {
    chrome.storage.local.get('shortcuts', (result) => {
      sendResponse(result.shortcuts || {});
    });
    return true; // 非同期応答
  }
});
chrome.action.onClicked.addListener(() => {
  chrome.windows.create({
    url: 'popup.html',
    type: 'popup',
    width: 400,
    height: 1200
  });
});
