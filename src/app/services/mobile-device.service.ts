import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MobileDeviceService {

  constructor() { }

  get IsMobileDevice() {
    return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase());
  }
}
