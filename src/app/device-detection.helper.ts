import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DeviceDetection {

  constructor() { }
  static isAndroid(): boolean {
    return /android/i.test(navigator.userAgent);
  }
  static isIOSMobile(): boolean {
    return /iPhone/.test(navigator.userAgent);
  }
  static isIOSTablet(): boolean {
    return /iPad/.test(navigator.userAgent);
  }
  static isMacOS(): boolean {
    return /macintosh/i.test(navigator.userAgent);
  }
}
