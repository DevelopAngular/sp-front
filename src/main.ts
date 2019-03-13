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

platformBrowserDynamic().bootstrapModule(AppModule)
  .then(module => {
    console.log('Module loaded');
  })
  .catch(err => console.log(err));
