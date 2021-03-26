import {Injectable} from '@angular/core';
import {AngularFireMessaging} from '@angular/fire/messaging';
import {Notification as Notif} from '../models/Notification';
import {HttpService} from './http-service';

import {switchMap, take} from 'rxjs/operators';
import {DeviceDetection} from '../device-detection.helper';

declare var window: any;

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  listening: boolean = false;
  registration: any = {};

  /**
   * Check whether the browser supports notifications.
   *
   * @return true if the browser supports notifications.
   */
  static get hasSupport() {
    return typeof window !== 'undefined' && 'Notification' in window && !DeviceDetection.isSafari();
  }

  /**
   * Check whether this origin has permission to display notifications.
   *
   * @return true if this origin has permission to show notifications.
   */
  static get hasPermission() {
    return NotificationService.hasSupport && window.Notification.permission === 'granted';
  }

  /**
   * Check whether this origin is allowed to request notification permissions.
   * This function will return false if permission has already been granted or denied.
   *
   * @return true if this origin is allowed to request notification permissions.
   */
  static get canRequestPermission() {
    return NotificationService.hasSupport && window.Notification.permission !== 'denied' && window.Notification.permission !== 'granted';
  }

  constructor(private afm: AngularFireMessaging, private http: HttpService) {
    this.afm.messages.subscribe((message) => {
      const notif: Notif = Notif.fromJSON(message);
      this.displayNotification(notif);
    });
  }

  /**
   * Request notification permissions is possible, and return a promise of true or false depending
   * on whether this origin has permission to show notifications.
   *
   * This method returns immediately if permissions have been granted or denied already. If permissions
   * are default (denied), permission to show notifications will be requested and the returned promise
   * will resolve when the user allows or denies permission.
   *
   * @return true if this origin has permission to show notifications.
   */
  requestNotificationPermission(): Promise<boolean> {
    if (!NotificationService.canRequestPermission) {
      return Promise.resolve(NotificationService.hasPermission);
    }

    // Safari as of 2019-02-12 doesn't support the Promise result for requestPermission()
    // but the callback is deprecated in other browsers.
    const legacyPromise = new Promise((resolve, reject) => {
      const rPromise = window.Notification.requestPermission(perm => resolve(perm));
      if (rPromise !== undefined) {
        rPromise
          .then(resolve)
          .catch(reject);
      }
    });

    return legacyPromise.then(() => {
      console.log('Notification.permission === \'' + window.Notification.permission + '\'');
      return NotificationService.hasPermission;
    });
  }

  registerNotificationAuth() {
    this.getFireToken()
      .pipe(
        take(1),
        switchMap(token => this.registerToken(token))
      )
      .subscribe(registration => {
        this.registration = registration;
        this.listen(true);
      });
  }

  /**
   *
   * @param shouldRequest
   */
  initNotifications(shouldRequest: boolean) {
    if (shouldRequest) {
      return this.requestNotificationPermission().then(hasPerm => {
        if (hasPerm) {
          this.registerNotificationAuth();
        }
        return hasPerm;
      });
    }

    if (NotificationService.hasPermission) {
      this.registerNotificationAuth();
    }

    return Promise.resolve(NotificationService.hasPermission);
  }

  private getFireToken() {
    return this.afm.requestToken;
  }

  private registerToken(token) {
    return this.http.post('auth/device/gcm', {registration_id: token, name: 'web'});
  }

  listen(listening) {
    this.listening = listening;
    console.log((this.listening ? '' : 'Not'), 'Listening');
  }

  private displayNotification(notification: Notif) {
    if (!NotificationService.hasPermission) {
      return;
    }

    const notifOptions = {
      body: notification.notification.body,
      icon: '',
      requireInteraction: true
    };
    const notif = new Notification(notification.notification.title, notifOptions);
    notif.onshow = this.showFunc.bind(this);
    notif.onerror = this.errorFunc.bind(this);
  }

  // noinspection JSMethodCanBeStatic
  private showFunc() {
    console.log('Notif shown');
  }

  // noinspection JSMethodCanBeStatic
  private errorFunc() {
    console.log('Notif errored');
  }
}
