(function() {
  const versionCheckUrl = 'https://api.github.com/repos/luejerry/html-mangareader/contents/version';
  const widthClamp = {
    none: 'none',
    shrink: 'shrink',
    fit: 'fit',
  };

  const orientation = {
    portrait: 'portrait',
    square: 'square',
    landscape: 'landscape',
  };

  const smartFit = {
    size0: {
      portrait: {
        width: 720,
        height: 1024,
      },
      landscape: {
        height: 800,
      },
    },
    size1: {
      portrait: {
        width: 1080,
        height: 1440,
      },
      landscape: {
        height: 1080,
      },
    },
  };

  const pages = Array.from(document.getElementsByClassName('page'));
  const images = Array.from(document.getElementsByClassName('image'));
  const originalWidthBtn = document.getElementById('btn-original-width');
  const shrinkWidthBtn = document.getElementById('btn-shrink-width');
  const fitWidthBtn = document.getElementById('btn-fit-width');
  const smartFitBtns = Array.from(document.getElementsByClassName('btn-smart-fit'));

  let visiblePage;

  const intersectThreshold = 0.2;
  const intersectObserver = new IntersectionObserver(
    entries => {
      entries
        .filter(entry => entry.intersectionRatio > intersectThreshold)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        .map(entry => entry.target)
        .forEach((target, index) => {
          if (!index) {
            visiblePage = target;
            // Update the URL hash as user scrolls.
            // Since we're using a file:// url, need to strip out the drive letter on Windows
            const path = location.pathname.replace(/\/[A-Za-z]:/, '');
            history.replaceState(null, '', `${path}#${target.id}`);
          }
        });
    },
    { threshold: [intersectThreshold] },
  );

  const imagesMeta = images.map(image => {
    const ratio = image.naturalWidth / image.naturalHeight;
    return {
      image,
      orientation: ratio > 1 ? 'landscape' : 'portrait',
    };
  });

  function asyncTimeout(millis) {
    return new Promise((resolve, reject) => {
      setTimeout(() => resolve(), millis);
    });
  }

  function getWidth() {
    return window.innerWidth - 16;
  }

  function handleOriginalWidth() {
    setImagesWidth(widthClamp.none, getWidth());
  }

  function handleFitWidth() {
    setImagesWidth(widthClamp.fit, getWidth());
  }

  function handleShrinkWidth() {
    setImagesWidth(widthClamp.shrink, getWidth());
  }

  function handleSmartWidth(event) {
    const key = event.target.dataset.fitKey;
    smartFitImages(smartFit[key]);
  }

  function setImagesWidth(fitMode, width) {
    for (const img of images) {
      switch (fitMode) {
        case widthClamp.fit:
          Object.assign(img.style, {
            width: `${width}px`,
            maxWidth: null,
            maxHeight: null,
          });
          break;
        case widthClamp.shrink:
          Object.assign(img.style, {
            width: null,
            maxWidth: `${width}px`,
            maxHeight: null,
          });
          break;
        default:
          Object.assign(img.style, {
            width: null,
            maxWidth: null,
            maxHeight: null,
          });
      }
    }
    visiblePage.scrollIntoView();
  }

  function smartFitImages(fitMode) {
    for (const { image: img, orientation: orient } of imagesMeta) {
      switch (orient) {
        case orientation.portrait:
          Object.assign(img.style, {
            maxHeight: `${fitMode.portrait.height}px`,
          });
          break;
        case orientation.landscape:
          Object.assign(img.style, {
            maxWidth: `${getWidth()}px`,
            maxHeight: `${fitMode.landscape.height}px`,
          });
          break;
      }
    }
    visiblePage.scrollIntoView({ behavior: 'smooth' });
  }

  function setupListeners() {
    originalWidthBtn.addEventListener('click', handleOriginalWidth);
    shrinkWidthBtn.addEventListener('click', handleShrinkWidth);
    fitWidthBtn.addEventListener('click', handleFitWidth);
    for (const button of smartFitBtns) {
      button.addEventListener('click', handleSmartWidth);
    }
  }

  function attachIntersectObservers() {
    for (const page of pages) {
      intersectObserver.observe(page);
    }
  }

  async function checkVersion() {
    const response = await fetch(versionCheckUrl, { method: 'GET', mode: 'cors' }).then(r =>
      r.json(),
    );
    const remoteVersion = atob(response.content);
    const localVersion = document.getElementById('version').innerText;
    const compare = versionComparator(localVersion, remoteVersion);
    if (compare > 0) {
      const nextVersionSpan = document.getElementById('next-version');
      const linkUpdate = document.getElementById('link-update');
      const updateToast = document.getElementById('update-toast');
      nextVersionSpan.innerText = remoteVersion;
      linkUpdate.href = 'https://github.com/luejerry/html-mangareader/releases';
      Object.assign(updateToast.style, { display: 'initial' });
      await asyncTimeout(0);
      updateToast.classList.add('show');
      await asyncTimeout(5000);
      updateToast.classList.remove('show');
    }
  }

  /**
   * Basic semver comparator. Only works with numbers, e.g. 1.2.1. Returns positive if target newer
   * than source, negative if target older than source, or zero if equal.
   * @param {string} source
   * @param {string} target
   */
  function versionComparator(source, target) {
    const sourceParts = source.split('.').map(num => parseInt(num, 10));
    const targetParts = target.split('.').map(num => parseInt(num, 10));

    const recursor = (s, t) => {
      if (!s.length && !t.length) {
        return 0;
      } else if (!s.length) {
        return t[0];
      } else if (!t.length) {
        return -s[0];
      }
      const diff = t[0] - s[0];
      return diff === 0 ? recursor(s.slice(1), t.slice(1)) : diff;
    };

    return recursor(sourceParts, targetParts);
  }

  function main() {
    setupListeners();
    attachIntersectObservers();
    checkVersion();
  }

  main();
})();
