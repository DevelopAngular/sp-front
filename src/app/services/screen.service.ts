import {Injectable} from '@angular/core';
import {DeviceDetection} from '../device-detection.helper';
import {BehaviorSubject, Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ScreenService {

  enabledLocationTableDnD: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  customBackdropEvent$: Subject<boolean> = new Subject<boolean>();

  constructor() { }

  private extraSmallDeviceBreakPoint = 320;
  private smallDevicesBreakPoint = 375;
  private midDevicesBreakPoint = 475;
  private largeDevicesBreakPoint = 768;
  private  extraLargeDeviceBreakPoint = 940;

  get smallDeviceExtra() {
    return this.extraSmallDeviceBreakPoint;
  }

  get smallDevice() {
    return this.smallDevicesBreakPoint;
  }

  get midDevice() {
    return this.midDevicesBreakPoint;
  }

  get largeDevice() {
    return this.largeDevicesBreakPoint;
  }

  get isDeviceSmallExtra() {
    return this.windowWidth <= this.smallDeviceExtra;
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
    this.extraLargeDeviceBreakPoint = 940;
    if (this.isIOSTablet) {
      this.extraLargeDeviceBreakPoint = 1024;
    }
    return this.windowWidth <= this.extraLargeDeviceBreakPoint;
  }

  get isIpadWidth() {
    return this.extraLargeDeviceBreakPoint >= this.windowWidth  && this.midDevicesBreakPoint <= this.windowWidth;
  }

  get isDesktopWidth() {
    return this.extraLargeDeviceBreakPoint < this.windowWidth;
  }

  private get windowWidth() {
    return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  }

  private get isIOSTablet() {
    return DeviceDetection.isIOSTablet();
  }

  public createCustomBreakPoint(breakPoint: number) {
    return breakPoint > this.windowWidth || breakPoint >= this.windowWidth ;
  }
}
