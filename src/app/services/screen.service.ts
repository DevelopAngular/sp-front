import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ScreenService {

  constructor() { }

  private smallDevicesBreakPoint = 375;
  private midDevicesBreakPoint = 475;
  private largeDevicesBreakPoint = 768;
  private  extraLargeDeviceBreakPoint = 1024;

  get smallDevice() {
    return this.smallDevicesBreakPoint;
  }

  get midDevice() {
    return this.midDevicesBreakPoint;
  }

  get largeDevice() {
    return this.largeDevicesBreakPoint;
  }

  get isDeviceSmall() {
    return this.windowWidth <= this.smallDevice;
  }

  get isDeviceMid() {
    return this.windowWidth <= this.midDevice;
  }

  get isDeviceLarge() {
    return this.windowWidth <= this.largeDevicesBreakPoint;
  }

  get isDeviceLargeExtra() {
    return this.windowWidth <= this.extraLargeDeviceBreakPoint;
  }

  get isIpadWidth() {
    return this.extraLargeDeviceBreakPoint >= this.windowWidth  && this.largeDevicesBreakPoint <= this.windowWidth;
  }

  get isDesktopWidth() {
    return this.extraLargeDeviceBreakPoint < this.windowWidth;
  }

  private get windowWidth() {
    return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  }
}
