const btn = document.getElementById("toggleBtn");

chrome.storage.sync.get(["tvapp_enabled"], (res) => {
  const enabled = res.tvapp_enabled ?? true;
  updateUI(enabled);
});

btn.addEventListener("click", () => {
  chrome.storage.sync.get(["tvapp_enabled"], (res) => {
    const newState = !(res.tvapp_enabled ?? true);

    chrome.storage.sync.set({ tvapp_enabled: newState });
    updateUI(newState);
  });
}) ;

function updateUI(enabled) {
  if (enabled) {
    btn.textContent = "ON";
    btn.classList.remove("off");
    btn.classList.add("on");
  } else {
    btn.textContent = "OFF";
    btn.classList.remove("on");
    btn.classList.add("off");
  }
}