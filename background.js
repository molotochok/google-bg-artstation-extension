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
  const STORAGE_KEY = "gbae_request_data";
  const URL = "https://www.artstation.com/random_project.json";

  chrome.storage.local.get(STORAGE_KEY).then((value) => {
    fetch(URL)
      .then(response => response.json())
      .then(data => chrome.storage.local.set({ [STORAGE_KEY]: data }))
      .catch(error => console.error(error));

    if (!value || !value[STORAGE_KEY]) {
      fetch(URL)
        .then(response => response.json())
        .then(data => sendResponse(data))
        .catch(error => console.error(error));
    } else {
      sendResponse(value[STORAGE_KEY]);
    }
  });

  return true;
});