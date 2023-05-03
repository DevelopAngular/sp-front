import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandler, Injectable, Provider } from '@angular/core';
import * as Sentry from '@sentry/browser';
import { BrowserOptions } from '@sentry/browser';
import { Event, EventHint } from '@sentry/types';
import { FirebaseError } from 'firebase';
import { environment } from '../environments/environment';

const FIREBASE_ERROR_IGNORE_LIST = ['messaging/unsupported-browser'];

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
			dsn: 'https://bd1a607220844e7b84077cf4694b8570@o4505053464494080.ingest.sentry.io/4505053466918912',
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

					if (event.message && event.message.indexOf('Http failure response for') !== -1 && event.message.indexOf(': 0 Unknown Error') !== -1) {
						console.log('error message matches discard rule: ' + event.message);
						return null;
					}
				}

				return event;
			},
		};

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

			if (error.status === 0) {
				return;
			}

			Sentry.captureException({
				status: error.status,
				url: error.url,
				error: error.error || null,
			});

			return;
		}

		if (error.name === 'FirebaseError') {
			const err = error as FirebaseError;
			if (FIREBASE_ERROR_IGNORE_LIST.indexOf(err.code) >= 0) {
				console.log('[error-handler] Ignoring Firebase error: ' + err.code);
				console.log('[error-handler] Error Message: ' + err.message);
				return;
			}
		}

		Sentry.captureException(error.originalError || error);
	}

	handleError(error) {
		SentryErrorHandler.reportError(error);
		console.error(error);
	}

	setUserContext(user: UserContext) {
		Sentry.configureScope((scope) => {
			scope.setUser(user);
		});
	}
}
