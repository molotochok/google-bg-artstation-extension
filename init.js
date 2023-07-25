setTimeout((async function(){
  const isMainPage = [ "/", "/webhp" ].some(p => location.pathname == p);
  const isSearchPage = location.pathname == "/search";
  const isCorrectPage = [isMainPage,isSearchPage].some(b => !!b);

  if (!isCorrectPage) return;

  const waitForElement = async (selector) => {
    const main = new Promise(resolve => {
      const element = document.querySelector(selector);
      if (element) return resolve(element);

      const observer = new MutationObserver(_ => {
        const element = document.querySelector(selector);
        if (element) {
          resolve(element);
          observer.disconnect();
        }
      });

      observer.observe(document.documentElement, {
        childList: true,
        subtree: true
      });
    });
    
    let timer;
    return Promise.race([
      main,
      new Promise((r, _rej) => timer = setTimeout(function() { r(null); }, 350))
    ]).finally(() => clearTimeout(timer));
  }

  const body = await waitForElement("body");
  if (!body) return;

  const isDarkmodeEnabled = !!document.querySelector('meta[content="dark"]') 
      || getComputedStyle(body).getPropertyValue('background-color') != "rgb(255, 255, 255)";

  const createClass = (className) => {
    // Means: GoogleBgArtstationExtension
    return `gbae__${className}`;
  }

  /**
   * After setting the background image the texts may become unreadable.
   * This function sets the background color for the containers that
   * include such texts to make them readable again.
   * 
   * Because the page can have different themes (dark/light) it makes
   * sense to use an already existing color instead of hardcoding a
   * new one. The bottom row container has a background color and it
   * is used as a reference.
   */
  const setBgColorsForContainers = async () => {
    const OPACITY = '0.7';

    const $bottomRow = await waitForElement('.c93Gbe');
    if (!$bottomRow) return;

    const bgColor = getComputedStyle($bottomRow).backgroundColor.slice(0, -1) + `, ${OPACITY})`;
    $bottomRow.style.backgroundColor = bgColor;

    const $languages = await waitForElement('#SIvCob');
    if ($languages) $languages.style.backgroundColor = bgColor;

    const $topRow = await waitForElement('.o3j99.n1xJcf.Ne6nSd')
    if ($topRow) $topRow.style.backgroundColor = bgColor;
  };

  const createBgImage = (data) => {
    const image = new Image();
    image.classList.add(createClass('img'));

    image.classList.add(isMainPage 
        ? createClass("brightness-full")
        : isSearchPage ? createClass("brightness-dark") : ""
    );

    image.src = data.base64;
    
    body.prepend(image);
  };

  const setDarkMode = async () => {
    const sigContainer = await waitForElement("#YUIDDb");

    let urlParams;
    // For All other pages
    if (sigContainer) {
      urlParams = new URLSearchParams(sigContainer.getAttribute("data-spl"));
    } 
    // For Search Image Page
    else {
      const href = (await waitForElement(".EXjONc")).getAttribute("href");
      urlParams = new URLSearchParams(href.substring(href.indexOf("?") + 1));
    }
    
    chrome.runtime.sendMessage({
        type: "setDarkMode", 
        sig: urlParams.get("sig"), 
        origin: location.origin
      }, 
      async (_) => window.location.reload()
    );
  };

  const createAuthorInfo = async (data) => {
    const CONTAINER_ID = createClass('author-info');

    let $authorInfo = document.getElementById(CONTAINER_ID);
    if ($authorInfo) return;

    $authorInfo = document.createElement('div');
    $authorInfo.style.float = 'right';
    $authorInfo.id = CONTAINER_ID;

    const $a = document.createElement('a');
    $a.href = data.permalink;
    $a.append([`"${data.title}"`, 'by', data.user.full_name].join(' '));

    $authorInfo.append($a);

    const $countryContainer = await waitForElement('.uU7dJb');
    $countryContainer && $countryContainer.append($authorInfo);
  };

  if (!isDarkmodeEnabled) {
    await setDarkMode();
  }

  chrome.runtime.sendMessage({}, async (response) => {
    createBgImage(response);
    await createAuthorInfo(response);
  });

  await setBgColorsForContainers();
}), 50);
