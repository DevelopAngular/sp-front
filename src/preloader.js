window.waitForAppLoaded = function() {

  var urlBLackList = [
    'school_signup',
  ];

  var allowPreloader = urlBLackList.every(function(item) {
    return window.location.pathname.search(new RegExp(item, 'i')) === -1;
  })

  if (!allowPreloader) {
    return false;
  }

  if (!window.preloader) {
    Object.defineProperty(window, 'preloader', { value: {
        visibility: true,
        percent: 0,
        n: 200,
        opacity: 1,
        inProgress: true
      },
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else if (window.preloader.inProgress) {
    return;
  } else {
    window.preloader.inProgress = true;
    window.preloader.visibility = true;
  }

  var preloaderRef = document.getElementById('preloaderRef');
  var preloaderSvg = document.getElementById('preloaderSvg');
  var arrowRef = document.querySelector('#arrow');
  var preloaderVisibility = false;
  var percentDisplay = document.querySelector('.percent-display');

  var timerId;

  timerId = setInterval(() => {
    if (preloaderSvg && window.preloader.visibility) {
      window.preloader.opacity = 1;
      preloaderVisibility = true;
      preloaderRef.style.display = 'flex';
      preloaderRef.style.opacity = '1';

      if (window.preloader.n !== 0) {
        if (window.preloader.percent < 99) {
          window.preloader.percent += 1;

        } else {
          window.preloader.percent = 99;
        }
        window.preloader.n -= 2;
        percentDisplay.textContent = `Loading ${window.preloader.percent} %`;
        preloaderSvg.style.strokeDashoffset = window.preloader.n;
      }
    } else {
      window.preloader.n = 0;
      window.preloader.percent = 100;
      preloaderSvg.style.strokeDashoffset = window.preloader.n;
      if (+preloaderSvg.style.strokeDashoffset === 0) {
          percentDisplay.textContent = `Loading ${window.preloader.percent} %`;
          arrowRef.style.fill = '#04CD33';
      }

      clearInterval(timerId);

      setTimeout(() => {
        preloaderRef.style.opacity = '0';
      }, 1000);
      setTimeout(() => {
        window.preloader.n = 200;
        window.preloader.percent = 0;
        window.preloader.opacity = 0;
        window.preloader.inProgress = false;
        arrowRef.style.fill = '#7F879D';
        preloaderRef.style.display = 'none';
      }, 1500);
    }


  }, 25);
}

window.appLoaded = function(timeout = 100) {
  const timerId = setInterval(() => {

    if (window.preloader) {
      window.preloader.visibility = false;
      clearInterval(timerId);
    }
  }, timeout);
};

window.waitForAppLoaded();
