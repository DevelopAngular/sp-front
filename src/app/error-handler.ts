import { ErrorHandler, Provider } from '@angular/core';
import * as Sentry from '@sentry/angular';
import { BrowserOptions } from '@sentry/angular';
import { FirebaseError } from 'firebase';
import { BUILD_INFO_REAL, RELEASE_NAME } from '../build-info';
import { environment } from '../environments/environment';
import { EventHint, Event } from '@sentry/types';

export interface UserContext {
  id: string;
  email: string;
  is_student?: boolean;
  is_teacher?: boolean;
  is_admin?: boolean;
}

export function getErrorHandler(): ErrorHandler {
  if (environment.production) {
    return Sentry.createErrorHandler();
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

let isSentryInitialized = false;

export function initializeErrorHandler() {
  console.log('initializeErrorHandler()');

  const sentryConfig: BrowserOptions = {
    dsn: 'https://2efc0ebe21a14bc0a677b369124c5a03@sentry.io/1364508',
    environment: environment.buildType,
    beforeSend(event: Event, hint?: EventHint): Event | Promise<Event | null> | null {
      console.log(event);

      if (event.exception && event.exception.values && event.exception.values.length > 0) {
        const ex = event.exception.values[0];

        // Firebase
        if (ex.type === 'FirebaseError' && ex.value.indexOf('messaging/unsupported-browser') !== -1) {
          console.log('Discarding firebase messaging error');
          return null; // discard
        }

        // Bad HTTP responses
        if (ex.type === 'Error') {
          if (event.extra && event.extra.__serialized__) {
            const ser: any = event.extra.__serialized__;
            if (ser.name === 'HttpErrorResponse' && ser.status !== undefined) {
              if (+ser.status === 0) {
                console.log('CORS error, do not report');
                return null;
              }

              // the server should never send a 1xx error code
              // 5xx means server error so both should be reported
              // even though the server logs errors internally.
              if (+ser.status >= 200 && +ser.status < 500) {
                console.log('request error do not report...');
                return null;
              }
            }
          }
        }

        if (event.message.indexOf('Http failure response for') !== -1 && event.message.indexOf(': 0 Unknown Error') !== -1) {
          console.log('error message matches discard rule: ' + event.message);
          return null;
        }

      }

      return event;
    }
  };

  if (BUILD_INFO_REAL) {
    sentryConfig.release = RELEASE_NAME;
  } else if (environment.production) {
    console.log('Production build does not have build-info set!');
  }

  Sentry.init(sentryConfig);
  isSentryInitialized = true;
}

export function setUserContext(user: UserContext) {
  if (isSentryInitialized) {
    Sentry.configureScope(scope => {
      scope.setUser(user);
    });
  }
}
