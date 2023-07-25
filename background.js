/**** Reload Pages ****/
const reloadPages = () => {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      const url = new URL(tab.url);
      if (url.hostname.includes("www.google.")) {
        chrome.tabs.reload(tab.id);
      }
    });
  });
}

chrome.management.onEnabled.addListener(reloadPages);
chrome.management.onInstalled.addListener(reloadPages);
chrome.management.onDisabled.addListener(reloadPages);
chrome.management.onUninstalled.addListener(reloadPages);


/**** Message receiver ****/
const handleSetDarkMode = (arg, sendResponse) => {
  fetch(`${arg.origin}/setprefs?sig=${encodeURIComponent(arg.sig)}&cs=2`)
    .then((_) => sendResponse())
    .catch(e => console.error(e));

  return true;
};

const handleGetImageData = (sendResponse) => {
  const STORAGE_KEY = "gbae_request_data";

  const getNewImage = () => fetch("https://www.artstation.com/random_project.json")
    .then(response => response.json())
    .then(json => fetch(json.assets[0].image_url)
      .then(img => img.blob())
      .then(blob => {
        const reader = new FileReader();
                
        reader.onloadend = function() {
          json["base64"] = reader.result;
          json["timeStamp"] = new Date().toJSON();
          chrome.storage.local.set({ [STORAGE_KEY]: json });
          sendResponse(json);
        }

        reader.readAsDataURL(blob);
      })
      .catch(error => console.error(error)))
    .catch(error => console.error(error));

  chrome.storage.local.get(STORAGE_KEY).then(cache => {
    if (cache && cache[STORAGE_KEY]) {
      sendResponse(cache[STORAGE_KEY]);

      if (new Date() - new Date(cache[STORAGE_KEY]["timeStamp"] || null) > 5 * 60 * 1000) {
        getNewImage();
      }
    } else {
      getNewImage();
    }
  });
  
  return true;
};

chrome.runtime.onMessage.addListener((arg, _sender, sendResponse) => {
  switch (arg.type) {
    case "setDarkMode": return handleSetDarkMode(arg, sendResponse);
    default: return handleGetImageData(sendResponse);
  }
});