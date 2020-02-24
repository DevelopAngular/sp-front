window.waitForAppLoaded = function(force = false) {

  var urlBLackList = [
    'school_signup',
  ];

  var allowPreloader = urlBLackList.every(function(item) {
    return window.location.pathname.search(new RegExp(item, 'i')) === -1;
  })

  if (!force && (!allowPreloader || window.location.pathname === '/')) {
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

  const currentTheme = window.localStorage.getItem('appearance') || 'Auto';
  const darkMode = window.matchMedia('(prefers-color-scheme: dark)');

  if (currentTheme === 'Dark' || currentTheme === 'Auto' && darkMode.matches) {
    preloaderRef.classList.add('preloader-container__dark');
  }


  timerId = setInterval(function() {
    if (window.safari) {
      var filterShadowRef = document.getElementById('filterShadowRef');
          filterShadowRef.setAttribute('filter', `url(${window.location.href}#dropshadow)`);
    }
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
      percentDisplay.textContent = `Loading ${window.preloader.percent} %`;
      arrowRef.style.fill = '#04CD33';

      setTimeout(function() {
        preloaderRef.style.opacity = '0';
      }, 500);
      setTimeout(function() {
        window.preloader.n = 200;
        window.preloader.percent = 0;
        window.preloader.opacity = 0;
        window.preloader.inProgress = false;
        arrowRef.style.fill = '#7F879D';
        preloaderRef.style.display = 'none';
      }, 1500);
      setInterval(function () {
        clearInterval(timerId);
      }, 1750);
    }
  }, 25);
}

window.appLoaded = function(timeout = 100) {
  const timerId = setInterval(function() {
    if (window.preloader) {
      window.preloader.visibility = false;
      clearInterval(timerId);
    } else {
      clearInterval(timerId);
    }
  }, timeout);
};

window.waitForAppLoaded();
