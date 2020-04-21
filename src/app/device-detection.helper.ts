import { Injectable } from '@angular/core';
import {SPPlatform} from './next-release/services/next-release.service';

declare const window;

const keys = {37: 1, 38: 1, 39: 1, 40: 1};

function preventDefault(e) {
  e = e || window.event;
  if (e.preventDefault) {
    e.preventDefault();
  }
  e.returnValue = false;
}

function preventDefaultForScrollKeys(e) {
  if (keys[e.keyCode]) {
    preventDefault(e);
    return false;
  }
}

@Injectable({
  providedIn: 'root'
})
export class DeviceDetection {

  // private keys = {37: 1, 38: 1, 39: 1, 40: 1};


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
  static isSafari(): boolean {
    return  /macintosh/i.test(navigator.userAgent)
            &&
            /safari/i.test(navigator.userAgent)
            &&
            !(/chrome/i.test(navigator.userAgent))
            ||
            window.safari
            ;
  }

  static platform(): SPPlatform {
    let platform: SPPlatform;

    if (this.isAndroid()) {
      platform = 'android';
    } else if (this.isIOSMobile() || this.isIOSTablet()) {
      platform = 'ios';
    } else {
      platform = 'web';
    }
    return platform;
  }

  static enableScroll() {
    if (window.removeEventListener)
      window.removeEventListener('scroll', preventDefault, false);
    // window.onmousewheel = document.onmousewheel = null;
    window.onwheel = null;
    window.ontouchmove = null;
    document.onkeydown = null;
  }
  static disableScroll() {
    if (window.addEventListener) // older FF
      window.addEventListener('scroll', preventDefault, false);
    window.onwheel = preventDefault; // modern standard
    // window.onmousewheel = document.onmousewheel = preventDefault; // older browsers, IE
    window.ontouchmove  = preventDefault; // mobile
    document.onkeydown  = preventDefaultForScrollKeys;
  }

}
