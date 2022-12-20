(function () {
  /**
   * To make created css classes and ids unique
   * Means: GoogleBgArtstationExtension
   */
  const CLASS_PREFIX = 'gbae__';

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
  const setBgColorsForContainers = () => {
    const OPACITY = '0.7';

    const $bottomRow = this.document.getElementsByClassName('c93Gbe')[0];
    const bgColor = getComputedStyle($bottomRow).backgroundColor.slice(0, -1) + `, ${OPACITY})`;
    $bottomRow.style.backgroundColor = bgColor;

    const $languages = this.document.getElementById('SIvCob');
    $languages.style.backgroundColor = bgColor;

    const topRow = this.document.querySelector('.o3j99.n1xJcf.Ne6nSd')
    topRow.style.backgroundColor = bgColor;
  };

  const createBgImage = (data) => {
    const image = new Image();
    image.classList.add(CLASS_PREFIX + 'img');
    image.src = data.assets[0].image_url;
    
    this.document.body.prepend(image);
  };

  const createAuthorInfo = (data) => {
    const CONTAINER_ID = CLASS_PREFIX + 'author-info';

    let $authorInfo = this.document.getElementById(CONTAINER_ID);
    if ($authorInfo) return;

    $authorInfo = document.createElement('div');
    $authorInfo.style.float = 'right';
    $authorInfo.id = CONTAINER_ID;

    const $a = document.createElement('a');
    $a.href = data.permalink;
    $a.append([`"${data.title}"`, 'by', data.user.full_name].join(' '));

    $authorInfo.append($a);

    const $countryContainer = this.document.getElementsByClassName('uU7dJb')[0];
    $countryContainer.append($authorInfo);
  };

  if (window.location.pathname !== '/') return;

  window.addEventListener('load', function () {
    setBgColorsForContainers();

    chrome.runtime.sendMessage({}, (response) => {
      createBgImage(response);
      createAuthorInfo(response);
    });
  });
})();

