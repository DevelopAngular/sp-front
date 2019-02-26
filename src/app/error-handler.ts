import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandler, Injectable, Provider } from '@angular/core';
import * as Sentry from '@sentry/browser';
import { BrowserOptions } from '@sentry/browser';
import { BUILD_INFO_REAL, RELEASE_NAME } from '../build-info';
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

export interface UserContext {
  id: string;
  email: string;
  is_student?: boolean;
  is_teacher?: boolean;
  is_admin?: boolean;
}

@Injectable()
export class SentryErrorHandler implements ErrorHandler {

  constructor() {
    console.log('Error Handler Loading.');

    const sentryConfig: BrowserOptions = {
      dsn: 'https://2efc0ebe21a14bc0a677b369124c5a03@sentry.io/1364508',
      environment: environment.buildType
    };

    if (BUILD_INFO_REAL) {
      sentryConfig.release = RELEASE_NAME;
    } else if (environment.production) {
      console.log('Production build does not have build-info set!');
    }

    Sentry.init(sentryConfig);
  }

  private static reportError(error) {
    if (error instanceof HttpErrorResponse) {
      // the server should never send a 1xx error code
      // 5xx means server error so both should be reported
      // even though the server logs errors internally.
      if (error.status >= 200 && error.status < 500) {
        return;
      }

      Sentry.captureException({
        status: error.status,
        url: error.url,
        error: (error.error || null)
      });

      return;
    }

    Sentry.captureException(error.originalError || error);
  }

  handleError(error) {
    SentryErrorHandler.reportError(error);
    console.error(error);
  }

  setUserContext(user: UserContext) {
    Sentry.configureScope(scope => {
      scope.setUser(user);
    });
  }

}
