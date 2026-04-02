let chartWindowId = null;

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "OPEN_CHART") {
    const url = msg.url;

    if (chartWindowId !== null) {
      chrome.windows.get(chartWindowId, (win) => {
        if (chrome.runtime.lastError || !win) {
          createWindow(url);
        } else {
          chrome.tabs.query({ windowId: chartWindowId }, (tabs) => {
            if (tabs.length > 0) {
              chrome.tabs.update(tabs[0].id, { url: url });
            }
          });
        }
      });
    } else {
      createWindow(url);
    }
  }
});

function createWindow(url) {
  chrome.windows.create({
    url: url,
    type: "popup",
    width: 1000,
    height: 700
  }, (win) => {
    chartWindowId = win.id;
  });
}

chrome.windows.onRemoved.addListener((id) => {
  if (id === chartWindowId) {
    chartWindowId = null;
  }
});