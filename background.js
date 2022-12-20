function reloadPages() {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      const url = new URL(tab.url);
      if (url.hostname.includes("www.google.") && url.pathname === '/') {
        chrome.tabs.reload(tab.id);
      }
    });
  });
}

chrome.management.onEnabled.addListener(reloadPages);
chrome.management.onInstalled.addListener(reloadPages);
chrome.management.onDisabled.addListener(reloadPages);
chrome.management.onUninstalled.addListener(reloadPages);

chrome.runtime.onMessage.addListener((_arg, _sender, sendResponse) => {
  fetch("https://www.artstation.com/random_project.json")
    .then(response => response.json())
    .then(data => sendResponse(data))
    .catch(error => console.error(error));

  return true;
});