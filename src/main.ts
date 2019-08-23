import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

import 'hammerjs';

// Do all the hacky stuff in this file.
import './monkey-patches';

if (environment.production) {
  enableProdMode();
}

console.log(`Frontend build type: ${environment.buildType}`);

function registerSW() {
  if ('serviceWorker' in navigator && environment.production) {
    navigator.serviceWorker.register('./ngsw-worker.js');
  }
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .then(module => {
    console.log('Module loaded');
    // console.log('ONLINE:', navigator.onLine);
    // if (navigator.onLine) {
    //   navigator.serviceWorker.getRegistrations().then(function(registrations) {
    //     for (const registration of registrations) {
    //       registration.unregister();
    //       console.log('UNREGISTERED');
    //     }
    //     registerSW();
    //   });
    // } else {
    //   registerSW();
    //   console.log('REGISTERED');
    // }

  })
  .catch(err => console.log(err));
