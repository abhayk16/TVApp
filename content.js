let isEnabled = true;
let hoverTimeout = null;
let lastSymbol = null;

// Toggle
chrome.storage.sync.get(["tvapp_enabled"], (res) => {
  isEnabled = res.tvapp_enabled ?? true;
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes.tvapp_enabled) {
    isEnabled = changes.tvapp_enabled.newValue;
  }
});

// Block unwanted UI
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

// TradingView exact symbol
function extractTVSymbol(el) {
  let current = el;

  for (let i = 0; i < 5 && current; i++) {
    const link = current.querySelector("a[href*='/symbols/']");

    if (link) {
      const href = link.getAttribute("href");
      const match = href.match(/symbols\/([^/]+)\//);

      if (match && match[1]) {
        return match[1].replace("-", ":");
      }
    }

    current = current.parentElement;
  }

  return null;
}

// Extract $ / #
function extractTicker(el) {
  let current = el;

  for (let i = 0; i < 5 && current; i++) {
    const text = current.textContent;

    if (text) {
      const match = text.match(/([$#])([A-Za-z]{2,20})\b/);

      if (match) {
        return {
          prefix: match[1],
          symbol: match[2]
        };
      }
    }

    current = current.parentElement;
  }

  return null;
}

// Simple mapping
function mapSymbol(symbol, prefix) {
  if (!symbol) return null;

  const s = symbol.toUpperCase();

  if (prefix === "$") {
    return `NASDAQ:${s}`;
  }

  if (prefix === "#") {
    return `NSE:${s}`;
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

// Hover logic
document.addEventListener("mouseover", (e) => {
  if (!isEnabled) return;
  if (isBlocked(e.target)) return;

  clearTimeout(hoverTimeout);

  hoverTimeout = setTimeout(() => {
    let symbol = extractTVSymbol(e.target);

    if (!symbol) {
      const raw = extractTicker(e.target);
      if (raw) {
        symbol = mapSymbol(raw.symbol, raw.prefix);
      }
    }

    if (symbol) {
      openChart(symbol);
    }
  }, 200);
});

document.addEventListener("mouseout", () => {
  clearTimeout(hoverTimeout);
});