/*
 * This file is meant to store all the hackier things done especially
 * those that involve modifying globals, hence "monkey patches".
 */

/*
 * Patch register service worker so that firebase messaging gets its service worker registered in the right place.
 * In testing and staging/prod builds, the base-href is /app but this is not respected by the service worker url.
 * Here, we fix this by adding the base-href.
 */

// See: https://github.com/firebase/firebase-js-sdk/blob/master/packages/messaging/src/models/default-sw.ts
const FIREBASE_MESSAGING_DEFAULT_SW_PATH = '/firebase-messaging-sw.js';
const PATCHED_SW_PATH = 'firebase-messaging-sw.js';

if (navigator && navigator.serviceWorker) {
  console.log('Monkey patches registration');
  const oldRegister = navigator.serviceWorker.register;
  navigator.serviceWorker.register = function (url, options = {}) {
    console.log('url' , url );
    console.log('FIREBASE_MESSAGING_DEFAULT_SW_PATH', FIREBASE_MESSAGING_DEFAULT_SW_PATH);
    console.log('url === FIREBASE_MESSAGING_DEFAULT_SW_PATH', url === FIREBASE_MESSAGING_DEFAULT_SW_PATH);

    if (url === FIREBASE_MESSAGING_DEFAULT_SW_PATH) {
      url = PATCHED_SW_PATH;
      options.scope = 'firebase-cloud-messaging-push-scope';
      console.log(options.scope);
      return oldRegister.call(navigator.serviceWorker, url, options);
    }
    return oldRegister.call(navigator.serviceWorker, url, options);
  };
}


