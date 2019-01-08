import { ErrorHandler, Injectable } from '@angular/core';
import * as Sentry from '@sentry/browser';
import { environment } from '../environments/environment';


Sentry.init({
  dsn: 'https://2efc0ebe21a14bc0a677b369124c5a03@sentry.io/1364508'
});

@Injectable()
export class SentryErrorHandler implements ErrorHandler {
  constructor() {}
  handleError(error) {
    if (environment.production) {
      Sentry.captureException(error.originalError || error);
    } else {
      return;
    }

    // console.error(error);
  }
}
