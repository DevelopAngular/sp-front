/*
 * This file is meant to store all the hackier things done especially
 * those that involve modifying globals, hence "monkey patches".
 */

import { BASE_HREF } from './build-info';

/*
 * Patch register service worker so that firebase messaging gets its service worker registered in the right place.
 * In testing and staging/prod builds, the base-href is /app but this is not respected by the service worker url.
 * Here, we fix this by adding the base-href.
 */

// See: https://github.com/firebase/firebase-js-sdk/blob/master/packages/messaging/src/models/default-sw.ts
const FIREBASE_MESSAGING_DEFAULT_SW_PATH = '/firebase-messaging-sw.js';
const PATCHED_SW_PATH = BASE_HREF + 'firebase-messaging-sw.js';

if (navigator && navigator.serviceWorker) {
  const oldRegister = navigator.serviceWorker.register;
  console.log('Monkey patches registration');
  navigator.serviceWorker.register = function (url: string, options: any = {}) {

    if (url === FIREBASE_MESSAGING_DEFAULT_SW_PATH) {
      url = PATCHED_SW_PATH;
      options.scope = BASE_HREF + 'firebase-cloud-messaging-push-scope';
      console.log(options.scope);
      return oldRegister.call(navigator.serviceWorker, url, options);
    }
    return oldRegister.call(navigator.serviceWorker, url, options);
  };
}


