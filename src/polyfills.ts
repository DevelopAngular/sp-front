/***************************************************************************************************
 * Zone JS is required by Angular itself.
 */
import 'zone.js/dist/zone'; // Included with Angular CLI.
/**
 * Required to support Web MyRoomAnimations `@angular/platform-browser/animations`.
 * Needed for: All but Chrome, Firefox and Opera. http://caniuse.com/#feat=web-animation
 **/
import 'web-animations-js'; // Run `npm install --save web-animations-js`.
import 'core-js/es6/array';


/***************************************************************************************************
 * APPLICATION IMPORTS
 */
/**
 * Date, currency, decimal and percent pipes.
 * Needed for: All but Chrome, Firefox, Edge, IE11 and Safari 10
 */
// import 'intl';  // Run `npm install --save intl`.
/**
 * Need to import at least one locale-data with intl.
 */
// import 'intl/locale-data/jsonp/en';
(window as any).global = window;
(window as any).appLoaded = function(timeout) {
  const timerId = setInterval(function() {
    if ((window as any).preloader) {
      (window as any).preloader.visibility = false;
      clearInterval(timerId);
    } else {
      clearInterval(timerId);
    }
  }, timeout);
};
