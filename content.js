let isEnabled = true;
let hoverTimeout = null;
let lastSymbol = null;

// Load toggle
chrome.storage.sync.get(["tvapp_enabled"], (res) => {
  isEnabled = res.tvapp_enabled ?? true;
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes.tvapp_enabled) {
    isEnabled = changes.tvapp_enabled.newValue;
  }
});

// ❌ Block UI junk (important)
function isBlocked(el) {
  return (
    el.closest("button") ||
    el.closest("[role='button']") ||
    el.closest("svg") ||
    el.closest("canvas") ||
    el.closest("[class*='toolbar']") ||
    el.closest("[class*='button']")
  );
}

// ✅ CORE: Extract exact TradingView symbol
function extractTVSymbol(el) {
  let current = el;

  for (let i = 0; i < 5 && current; i++) {

    // Look for anchor links
    const link = current.querySelector("a[href*='/symbols/']");

    if (link) {
      const href = link.getAttribute("href");

      // Example: /symbols/NSE-QPOWER/
      const match = href.match(/symbols\/([^/]+)\//);

      if (match && match[1]) {
        const raw = match[1]; // NSE-QPOWER

        // Convert to TradingView format
        const symbol = raw.replace("-", ":"); // NSE:QPOWER

        return symbol;
      }
    }

    current = current.parentElement;
  }

  return null;
}

// Open chart
function openChart(symbol) {
  if (!symbol || symbol === lastSymbol) return;

  lastSymbol = symbol;

  const url = `https://www.tradingview.com/chart/?symbol=${symbol}`;

  chrome.runtime.sendMessage({
    type: "OPEN_CHART",
    url: url
  });
}

// Hover
document.addEventListener("mouseover", (e) => {
  if (!isEnabled) return;

  if (isBlocked(e.target)) return;

  clearTimeout(hoverTimeout);

  hoverTimeout = setTimeout(() => {
    const symbol = extractTVSymbol(e.target);

    if (symbol) {
      openChart(symbol);
    }
  }, 200);
});

// Cleanup
document.addEventListener("mouseout", () => {
  clearTimeout(hoverTimeout);
});