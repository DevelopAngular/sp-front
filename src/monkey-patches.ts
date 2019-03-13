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
const DEFAULT_SW_PATH = '/firebase-messaging-sw.js';
const DEFAULT_SW_SCOPE = '/firebase-cloud-messaging-push-scope';

const PATCHED_SW_PATH = BASE_HREF + 'firebase-messaging-sw.js';
const PATCHED_SW_SCOPE = BASE_HREF + 'firebase-cloud-messaging-push-scope';

if (navigator && navigator.serviceWorker) {
  const oldRegister = navigator.serviceWorker.register;

  navigator.serviceWorker.register = function (url: string, options?: any) {

    if (url === DEFAULT_SW_PATH) {
      url = PATCHED_SW_PATH;
      if (options) {
        options.scope = PATCHED_SW_SCOPE;
      }
    }

    return oldRegister.bind(navigator.serviceWorker, url, options)();
  };
}


