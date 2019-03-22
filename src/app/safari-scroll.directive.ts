import {Directive, ElementRef, HostListener, Renderer2} from '@angular/core';
import {DeviceDetection} from './device-detection.helper';
import {fromEvent} from 'rxjs';

@Directive({
  selector: '[appSafariScroll]'
})
export class SafariScrollDirective {



  constructor(
    public host: ElementRef,
    private renderer: Renderer2
  ) {

    if (DeviceDetection.isSafari()) {
      fromEvent(window, 'resize').subscribe((event) => {
        console.log(event);
        const _host = this.host.nativeElement as HTMLElement;
        if (_host.scrollLeft + _host.clientWidth >= _host.scrollWidth) {
          _host.scrollLeft = _host.scrollWidth - _host.clientWidth;
        }
      });
    }

  }

  @HostListener('scroll', ['$event'])
  onScroll(event) {
    // console.log('isSafari', DeviceDetection.isSafari());
    if (DeviceDetection.isSafari()) {
      const unregister = this.renderer.listen(event.target, 'scroll', () => {
        // console.log(event.target.scrollLeft, event.target.clientWidth, event.target.scrollWidth, 'works');

        if (event.target.scrollLeft < 0) {
          event.target.scrollLeft = 0;

          DeviceDetection.disableScroll();
          setTimeout(() => {
            DeviceDetection.enableScroll();
          }, 200);
        }
        if (event.target.scrollLeft + event.target.clientWidth > event.target.scrollWidth) {
          event.target.scrollLeft = event.target.scrollLeft + event.target.clientWidth;

          DeviceDetection.disableScroll();
          setTimeout(() => {
            DeviceDetection.enableScroll();
          }, 200);
        }
        unregister();
      });
    }

  }

}