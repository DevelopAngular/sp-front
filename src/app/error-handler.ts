import { ErrorHandler, Injectable, Provider } from '@angular/core';
import * as Sentry from '@sentry/browser';
import { environment } from '../environments/environment';


export function getErrorHandler(): ErrorHandler {
  if (environment.production) {
    return new SentryErrorHandler();
  } else {
    return new ErrorHandler();
  }
}

export function provideErrorHandler(): Provider {
  return {
    provide: ErrorHandler,
    useFactory: getErrorHandler,
    deps: [],
  };
}

@Injectable()
export class SentryErrorHandler implements ErrorHandler {

  constructor() {
    console.log('Error Handler Loaded.');
    Sentry.init({
      dsn: 'https://2efc0ebe21a14bc0a677b369124c5a03@sentry.io/1364508'
    });
  }

  handleError(error) {
    Sentry.captureException(error.originalError || error);
    console.error(error);
  }
}
