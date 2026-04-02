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

// Ignore words
const IGNORE = ["BUY", "SELL", "USD", "INR", "VOL", "CHANGE"];

// ❌ BLOCK THESE AREAS COMPLETELY
function isInsideBlockedArea(el) {
  return (
    el.closest("button") ||                // buttons
    el.closest("[role='button']") ||       // UI buttons
    el.closest("svg") ||                   // icons
    el.closest("canvas") ||                // chart area
    el.closest(".chart-container") ||      // chart
    el.closest(".tv-chart") ||             // tradingview chart
    el.closest(".toolbar") ||              // top toolbar
    el.closest("[class*='button']")        // any button class
  );
}

// Validate symbol
function isValidSymbol(word) {
  return (
    word.length >= 3 &&
    word.length <= 15 &&
    /^[A-Z0-9!]+$/.test(word) &&
    !IGNORE.includes(word)
  );
}

// Extract symbol
function extractSymbol(el) {
  let current = el;

  for (let i = 0; i < 4 && current; i++) {
    const text = current.innerText;

    if (text && text.length < 40) {
      const words = text.split(/\s+/);

      for (let word of words) {
        word = word.replace(/[^A-Z0-9!]/g, "");

        if (isValidSymbol(word)) {
          return word;
        }
      }
    }

    current = current.parentElement;
  }

  return null;
}

// Map symbol
function mapSymbol(symbol) {
  if (!symbol) return null;

  if (symbol.includes(":")) return symbol;

  if (symbol.endsWith("1!")) return `MCX:${symbol}`;
  if (symbol === "NIFTY") return "NSE:NIFTY";
  if (symbol === "BANKNIFTY") return "NSE:BANKNIFTY";

  if (/^[A-Z]{3,15}$/.test(symbol)) {
    return `NSE:${symbol}`;
  }

  return symbol;
}

// Open chart
function openChart(symbol) {
  const mapped = mapSymbol(symbol);

  if (!mapped || mapped === lastSymbol) return;

  lastSymbol = mapped;

  const url = `https://www.tradingview.com/chart/?symbol=${mapped}`;

  chrome.runtime.sendMessage({
    type: "OPEN_CHART",
    url: url
  });
}

// Hover
document.addEventListener("mouseover", (e) => {
  if (!isEnabled) return;

  // ❌ BLOCK UI AREAS
  if (isInsideBlockedArea(e.target)) return;

  clearTimeout(hoverTimeout);

  hoverTimeout = setTimeout(() => {
    const symbol = extractSymbol(e.target);

    if (symbol) {
      openChart(symbol);
    }
  }, 250);
});

// Cleanup
document.addEventListener("mouseout", () => {
  clearTimeout(hoverTimeout);
});