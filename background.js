let tvWindowId = null;
let tvTabId = null;

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "OPEN_CHART") {
    const url = msg.url;

    if (tvWindowId !== null && tvTabId !== null) {
      chrome.tabs.update(tvTabId, { url: url }, () => {
        if (chrome.runtime.lastError) {
          createWindow(url);
        }
      });

      chrome.windows.update(tvWindowId, { focused: true });
    } else {
      createWindow(url);
    }
  }
});

function createWindow(url) {
  chrome.windows.create(
    {
      url: url,
      type: "popup",
      width: 900,
      height: 600,
      left: 200,
      top: 100
    },
    (win) => {
      tvWindowId = win.id;
      tvTabId = win.tabs[0].id;
    }
  );
}