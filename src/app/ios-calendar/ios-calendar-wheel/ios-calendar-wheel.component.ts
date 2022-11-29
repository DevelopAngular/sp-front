import {ChangeDetectionStrategy, Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {BehaviorSubject, interval, Observable, ReplaySubject, Subject} from 'rxjs';
import {map, takeUntil} from 'rxjs/operators';
import { cloneDeep } from 'lodash';
import * as moment from 'moment';
import {Moment} from 'moment';
import {SWIPE_BLOCKER} from '../ios-date.singleton';
import {DeviceDetection} from '../../device-detection.helper';

export interface SwipeEvent {
  start(): void;
  end(): void;
  computeHyperTwist(): number;
}

export class Swipe implements SwipeEvent {
  private startTime: number;
  private endTime: number;
  start() {
    this.startTime = Date.now();
  }
  end() {
    this.endTime = Date.now();
  }
  computeHyperTwist(): number {
    return Math.abs(Math.round(this.endTime - this.startTime) / 1000);
  }
}

@Component({
  selector: 'app-ios-calendar-wheel',
  templateUrl: './ios-calendar-wheel.component.html',
  styleUrls: ['./ios-calendar-wheel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IosCalendarWheelComponent implements OnInit, OnDestroy {
  @Input() align: 'center' | 'flex-start' | 'flex-end' = 'center';
  @Input() leftShift = 0;
  @Input() rightShift = 0;
  @Input() wheelData: 'date' | 'hour' | 'minute' | 'half';
  @Input() current: Moment = moment().add(5, 'minutes');
  @Input() ignoreWeekends = false;

  @Output() selectedUnit: EventEmitter<any> = new EventEmitter();

  daysRotateSubject = new ReplaySubject(1);
  daysRotate$ = this.daysRotateSubject.asObservable();

  positiveData = [];
  negativeData = [];
  entireData = [];

  wheelSectorAmount = 24;
  dataItemHeight = 25;
  dataItemAngle = 360 / this.wheelSectorAmount;
  l = this.dataItemHeight * this.wheelSectorAmount;
  dataRadius = (this.l / Math.PI) / 2;

  focused = false;
  focusPosition: number;
  rotate = {
    rotateAngle: 0,
    maxNegative: null,
    maxPositive: null,
  };

  dir = false;
  scrollFactor = 1;
  scrolling = false;
  counter = 0;
  inPorgress = false;
  endTransition;

  selected;

  dataSetSubject = new BehaviorSubject<any>([]);

  days: Observable<any[]> = this.dataSetSubject.asObservable();

  destroyer$ = new Subject<any>();

  counterX = 0;
  counterXdestroyer: Subject<any>;
  postOutDestroyer: Subject<any>;
  swipeInProgress = false;
  swipeOffset = 0;
  overScroll = false;
  test = 0;

  swipe: SwipeEvent = new Swipe();

  @HostListener('mousewheel', ['$event'])
  mousewheel(event: MouseWheelEvent) { // we're kinda screwed if this event is completely removed
    this.dir = event.deltaY > 0;
    this.onScroll();
  }

  constructor(private sanitizer: DomSanitizer) { }

  ngOnInit() {

    this.buildDates(365, this.wheelData);
    this.dataSetSubject.next(this.connect(0, this.wheelSectorAmount));

      switch (this.wheelData) {
        case 'date':
          this.rotate.rotateAngle = 0;
          break;
        case 'hour':
            this.rotate.rotateAngle = (this.current.hour() - 1) * this.dataItemAngle;
          break;
        case 'minute':
            this.rotate.rotateAngle = this.current.minute() * this.dataItemAngle;
          break;
        case 'half':
            this.rotate.maxPositive = this.dataItemAngle * 0;
            this.rotate.maxNegative = this.dataItemAngle * 1;
            this.rotate.rotateAngle = this.current.hour() >= 12 ? this.dataItemAngle : 0;
      }
      this.runScroll();
    // });

    this.days
      .pipe(
        // debounceTime(250),
        // distinctUntilChanged(),
        takeUntil(this.destroyer$),
      )
      .subscribe((days) => {
        // alert('test')
        if (this.wheelData === 'half') {
          // alert(this.rotate.rotateAngle);
          this.selected = this.rotate.rotateAngle ? days[0] : days[1];
          this.selectedUnit.emit(this.selected);
        } else {
          this.selected = cloneDeep(days[10]);
          this.selectedUnit.emit(days[10]);
        }
        // console.log(this.wheelData, this.selected);
      });

    SWIPE_BLOCKER
      .pipe(
        takeUntil(this.destroyer$),
      )
      .subscribe((v) => {
          if (v) {
            this.test++;
          }
        // alert('bad')
        this.overScroll = v;

        // this.preventOverScroll = v;
        // this.swipeInProgress = v;

        if (v && this.swipeInProgress) {
            this.scrollFactor = 0;
            this.counterXdestroyer.next();
            this.counterXdestroyer.complete();
            this.postOutDestroyer.next();
            this.postOutDestroyer.complete();
            this.swipeInProgress = false;

          this.dataSetSubject.next(this.connect(0, this.wheelSectorAmount));

          switch (this.wheelData) {
            case 'date':
              this.rotate.rotateAngle = 0;
              break;
            case 'hour':
              this.rotate.rotateAngle = (this.current.hour() - 1) * this.dataItemAngle;
              break;
            case 'minute':
              this.rotate.rotateAngle = this.current.minute() * this.dataItemAngle;
              break;
            case 'half':
              // alert(this.rotate.rotateAngle ? 0 : 1);
              this.rotate.rotateAngle = this.current.hour() >= 12 ? this.dataItemAngle : 0;
          }

          this.runScroll();
        }
        if (v && this.wheelData === 'half') {
          // alert('eas')
          this.rotate.rotateAngle = this.current.hour() >= 12 ? this.dataItemAngle : 0;
          this.runScroll();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroyer$.next();
    this.destroyer$.complete();
  }

  buildDates(range: number = 365, dataType: 'date' | 'hour' | 'minute' | 'half' = 'date', offset?) {

    switch (dataType) {
      case 'date':
        let support: Moment;
        if (offset > 0) {
          support = moment().add(`${offset}`, 'days');
        } else if (offset < 0) {
          support = moment().subtract(`${offset}`, 'days');
        } else {
          support = moment();
        }
        this.positiveData.push({
          data:  moment(support),
          value: 'Today',
          rotate: this.sanitizer.bypassSecurityTrustStyle(`rotateY(0deg) rotateX(-${ this.positiveData.length % this.wheelSectorAmount * this.dataItemAngle}deg) translate3d(${0}px, ${0}px, ${this.dataRadius}px)`)
        });

        for (let n = 1; n <= range; n++) {
          const multiplicityOfWheelSize = this.positiveData.length % this.wheelSectorAmount;
          const positiveMomentDate = moment(support).add(`${n}`, 'days');
          const negativeMomentDate = moment(support).subtract(`${n}`, 'days');
          const positiveObject = {
            data:  positiveMomentDate,
            value: positiveMomentDate.format('ddd MMM DD'),
            rotate: this.sanitizer.bypassSecurityTrustStyle(`rotateY(0deg) rotateX(-${ multiplicityOfWheelSize * this.dataItemAngle}deg) translate3d(${0}px, ${0}px, ${this.dataRadius}px)`)
          };
          const negativeObject = {
            data:  negativeMomentDate,
            value: negativeMomentDate.format('ddd MMM DD'),
            rotate: this.sanitizer.bypassSecurityTrustStyle(`rotateY(0deg) rotateX(${ multiplicityOfWheelSize * this.dataItemAngle}deg) translate3d(${0}px, ${0}px, ${this.dataRadius}px)`)
          };

          if (!this.ignoreWeekends) {
            this.positiveData.push(positiveObject);
            this.negativeData.push(negativeObject);
          } else {
            if (positiveMomentDate.weekday() > 0 && positiveMomentDate.weekday() < 6) {
              this.positiveData.push(positiveObject);
              this.negativeData.push(negativeObject);
            }
          }
        }
        this.entireData = this.positiveData.concat(this.negativeData);
        break;
      case 'hour':
        this.positiveData.push({
          data:  1,
          value: '1',
          rotate: this.sanitizer.bypassSecurityTrustStyle(`rotateY(0deg) rotateX(-${ 0 * this.dataItemAngle}deg) translate3d(${0}px, ${0}px, ${this.dataRadius}px)`)
        });
        for (let n = 1; n <= 11; n++) {
          const multiplicityOfWheelSize = n % this.wheelSectorAmount;
          this.positiveData.push({
            data:  (n % 12) + 1,
            value: `${(n % 12) + 1}`,
            rotate: this.sanitizer.bypassSecurityTrustStyle(`rotateY(0deg) rotateX(-${ multiplicityOfWheelSize * this.dataItemAngle}deg) translate3d(${0}px, ${0}px, ${this.dataRadius}px)`)
          });
          this.negativeData.push({
            data:  12 - (n % 12) + 1,
            value: `${(12 - (n % 12) + 1)}` ,
            rotate: this.sanitizer.bypassSecurityTrustStyle(`rotateY(0deg) rotateX(${ multiplicityOfWheelSize * this.dataItemAngle}deg) translate3d(${0}px, ${0}px, ${this.dataRadius}px)`)
          });
        }
        this.negativeData.push({
          data:  12 - (this.negativeData.length % 12) + 1 - 1,
          value: `${12 - (this.negativeData.length % 12) + 1 - 1}`,
          rotate: this.sanitizer.bypassSecurityTrustStyle(`rotateY(0deg) rotateX(${ (this.negativeData.length + 1) % this.wheelSectorAmount * this.dataItemAngle}deg) translate3d(${0}px, ${0}px, ${this.dataRadius}px)`)
        });

        break;
      case 'minute':
        this.positiveData.push({
          data:  0,
          value: '00',
          rotate: this.sanitizer.bypassSecurityTrustStyle(`rotateY(0deg) rotateX(-${ 0 * this.dataItemAngle}deg) translate3d(${0}px, ${0}px, ${this.dataRadius}px)`)
        });
        for (let n = 1; n <= 59; n++) {
          const multiplicityOfWheelSize = n % this.wheelSectorAmount;
          this.positiveData.push({
            data:  n % 60,
            value: `${(n % 60) <= 9 ? '0' : ''}${(n % 60)}`,
            rotate: this.sanitizer.bypassSecurityTrustStyle(`rotateY(0deg) rotateX(-${ multiplicityOfWheelSize * this.dataItemAngle}deg) translate3d(${0}px, ${0}px, ${this.dataRadius}px)`)
          });
          this.negativeData.push({
            data:  60 - n % 60,
            value: `${(60 - n % 60) <= 9 ? '0' : ''}${(60 - n % 60)}`,
            rotate: this.sanitizer.bypassSecurityTrustStyle(`rotateY(0deg) rotateX(${ multiplicityOfWheelSize * this.dataItemAngle}deg) translate3d(${0}px, ${0}px, ${this.dataRadius}px)`)
          });
        }

        this.negativeData.push({
          data:  60 - (this.negativeData.length % 60) - 1,
          value: `${(60 - (this.negativeData.length % 60) - 1) >= 9 ? '0' : ''}${(60 - (this.negativeData.length % 60) - 1)}`,
          rotate: this.sanitizer.bypassSecurityTrustStyle(`rotateY(0deg) rotateX(${ (this.negativeData.length + 1) % this.wheelSectorAmount * this.dataItemAngle}deg) translate3d(${0}px, ${0}px, ${this.dataRadius}px)`)
        });
        break;
      case 'half':
        this.positiveData = [{
          data: 'PM',
          value: 'PM',
          rotate: this.sanitizer.bypassSecurityTrustStyle(`rotateY(0deg) rotateX(-${ 1 * this.dataItemAngle}deg) translate3d(${0}px, ${0}px, ${this.dataRadius}px)`)
        }];
        this.negativeData = [{
          data: 'AM',
          value: 'AM',
          rotate: this.sanitizer.bypassSecurityTrustStyle(`rotateY(0deg) rotateX(${ 0 * this.dataItemAngle}deg) translate3d(${0}px, ${0}px, ${this.dataRadius}px)`)
        }];
    }

    // console.log(this.positiveData, this.negativeData);
  }

  onClick() {
    // this.counterX++;
  }

  onOver(event: MouseEvent) {
    if (!DeviceDetection.isIOSMobile() && !DeviceDetection.isIOSTablet() && !DeviceDetection.isAndroid()) {
      const target = event.target as HTMLElement;
      target.scrollTop = 180;
      this.scrollFactor = 180;
      setTimeout(() => {
        this.scrolling = true;
      }, 50);
    } else {
      return;
    }
  }

  onOut(event?: MouseEvent) {

    if (!DeviceDetection.isIOSMobile() && !DeviceDetection.isIOSTablet() && !DeviceDetection.isAndroid() && event) {
      const target = event.target as HTMLElement;
      target.scrollTop = 0;
      this.scrollFactor = 0;
      this.scrolling = false;
    } else {
      this.counterXdestroyer.next();
      this.counterXdestroyer.complete();
      this.counter = 0;

      this.rotate.rotateAngle += this.scrollFactor / 4;
      this.swipeInProgress = true;

      this.swipe.end();

      if (this.wheelData !== 'half') {

        this.swipeOffset = this.swipe.computeHyperTwist();

        const intervalCounter = Math.floor(this.counterX / this.swipeOffset / 300);
        const restrictor = Math.round(Math.abs(this.counterX) / 3);

        interval(10)
          .pipe(
            map((v) => {
              return v;
            }),
            takeUntil(this.postOutDestroyer)
          )
          .subscribe((v) => {

            const divider = Math.ceil(v  / 10) ? Math.ceil(v  / 10) : 1;
            this.dir ? this.rotate.rotateAngle -= (intervalCounter / divider) : this.rotate.rotateAngle += (intervalCounter / divider);
            const intRotateAngle = this.rotate.rotateAngle / this.dataItemAngle;
            const sliceOffset = this.dir ? Math.floor(intRotateAngle) : Math.ceil(intRotateAngle);

            this.daysRotateSubject.next(this.sanitizer.bypassSecurityTrustStyle(`rotateX(${this.rotate.rotateAngle}deg)`));
            this.dataSetSubject.next(this.connect(sliceOffset, sliceOffset + this.wheelSectorAmount));

            if (v > restrictor || (Math.abs(this.swipeOffset) > .3)) {
              this.runScroll();
              this.postOutDestroyer.next();
              this.postOutDestroyer.complete();
              this.swipeInProgress = false;
              this.focused = false;
              this.focusPosition = null;
              this.scrollFactor = 0;
            }
          });

      } else if (this.wheelData === 'half') {
        if ((typeof this.rotate.maxPositive === 'number') && this.rotate.rotateAngle < this.rotate.maxPositive) {

          interval(1 )
            .pipe(
              takeUntil(this.postOutDestroyer)
            )
            .subscribe((v) => {
              this.rotate.rotateAngle = Math.round(this.rotate.rotateAngle) + 1;
              const intRotateAngle = this.rotate.rotateAngle / this.dataItemAngle;
              const sliceOffset = this.dir ? Math.floor(intRotateAngle) : Math.ceil(intRotateAngle);

              this.daysRotateSubject.next(this.sanitizer.bypassSecurityTrustStyle(`rotateX(${this.rotate.rotateAngle}deg)`));
              this.dataSetSubject.next(this.connect(sliceOffset, sliceOffset + this.wheelSectorAmount));

              if (this.rotate.rotateAngle === this.rotate.maxPositive) {
                this.postOutDestroyer.next();
                this.postOutDestroyer.complete();
                this.swipeInProgress = false;
                this.focused = false;
                this.focusPosition = null;
                this.scrollFactor = 0;
              }
            });

        } else if ((typeof this.rotate.maxNegative === 'number') && this.rotate.rotateAngle > this.rotate.maxNegative) {

          interval(1 )
            .pipe(
              takeUntil(this.postOutDestroyer)
            )
            .subscribe((v) => {
              this.rotate.rotateAngle = Math.round(this.rotate.rotateAngle) - 1;

              const intRotateAngle = this.rotate.rotateAngle / this.dataItemAngle;
              const sliceOffset = this.dir ? Math.floor(intRotateAngle) : Math.ceil(intRotateAngle);

              this.daysRotateSubject.next(this.sanitizer.bypassSecurityTrustStyle(`rotateX(${this.rotate.rotateAngle}deg)`));
              this.dataSetSubject.next(this.connect(sliceOffset, sliceOffset + this.wheelSectorAmount));


              if (this.rotate.rotateAngle === this.rotate.maxNegative) {
                this.postOutDestroyer.next();
                this.postOutDestroyer.complete();
                this.swipeInProgress = false;
                this.focused = false;
                this.focusPosition = null;
                this.scrollFactor = 0;
              }
            });

        } else {

          interval(10)
            .pipe(
              takeUntil(this.postOutDestroyer)
            )
            .subscribe((v) => {
              // this.rotate.rotateAngle = Math.round(this.rotate.rotateAngle) - 1;
              this.dir ? this.rotate.rotateAngle -= 1 : this.rotate.rotateAngle += 1;


              const intRotateAngle = this.rotate.rotateAngle / this.dataItemAngle;
              const sliceOffset = this.dir ? Math.floor(intRotateAngle) : Math.ceil(intRotateAngle);

              this.daysRotateSubject.next(this.sanitizer.bypassSecurityTrustStyle(`rotateX(${this.rotate.rotateAngle}deg)`));
              this.dataSetSubject.next(this.connect(sliceOffset, sliceOffset + this.wheelSectorAmount));


              if (v > 2) {
                this.runScroll();
                this.postOutDestroyer.next();
                this.postOutDestroyer.complete();
                this.swipeInProgress = false;
                this.focused = false;
                this.focusPosition = null;
                this.scrollFactor = 0;
              }
            });

          // this.runScroll();
          // this.postOutDestroyer.next();
          // this.postOutDestroyer.complete();
          // this.swipeInProgress = false;
          // this.focused = false;
          // this.focusPosition = null;
          // this.scrollFactor = 0;
        }

      } else {
        this.runScroll();
        this.swipeInProgress = false;
        this.focused = false;
        this.focusPosition = null;
        this.scrollFactor = 0;
      }
    }
  }

  onDown(event: TouchEvent) {

    // this.http.post('http://localhost:3000', event).subscribe((res) => {
    //   console.log(res);
    // }, (error1) => {
    //   this.counterX = 25;
    // });

    this.endTransition = 'none';

    if (this.swipeInProgress) {
      this.scrollFactor = 0;
      this.counterXdestroyer.next();
      this.counterXdestroyer.complete();
      this.postOutDestroyer.next();
      this.postOutDestroyer.complete();
      this.swipeInProgress = false;
    }

    this.focused = true;
    this.focusPosition = event.touches[0].pageY;
    this.counterXdestroyer = new Subject<any>();
    this.postOutDestroyer = new Subject<any>();

    this.swipe.start();

    // alert(this.counterX);
    interval(150)
      .pipe(
        takeUntil(this.counterXdestroyer)
      )
      .subscribe((v) => {
        // this.counterX += 1;
      });
  }
  onUp(event: Event) {
    this.focused = false;
    this.focusPosition = null;
    this.endTransition = 'transform .2s ease';
    this.rotate.rotateAngle = this.dir ? Math.floor(this.rotate.rotateAngle / this.dataItemAngle) * this.dataItemAngle : Math.ceil(this.rotate.rotateAngle / this.dataItemAngle) * this.dataItemAngle;
    this.daysRotateSubject.next(this.sanitizer.bypassSecurityTrustStyle(`rotateX(${this.rotate.rotateAngle}deg)`));
  }

  onMouseDown(event: MouseEvent) {
    this.endTransition = 'none';

    if (this.swipeInProgress) {
      this.scrollFactor = 0;
      this.counterXdestroyer.next();
      this.counterXdestroyer.complete();
      this.postOutDestroyer.next();
      this.postOutDestroyer.complete();
      this.swipeInProgress = false;
    }

    this.focused = true;
    this.focusPosition = event.pageY
    this.counterXdestroyer = new Subject<any>();
    this.postOutDestroyer = new Subject<any>();

    this.swipe.start();

    // alert(this.counterX);
    interval(150)
      .pipe(
        takeUntil(this.counterXdestroyer)
      )
      .subscribe((v) => {
        // this.counterX += 1;
      });
  }

  onMouseMove(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    if (this.focused) {

      this.counter = 0;
      // this.counterX++;

      this.endTransition = 'none';

      const scrollTop = this.focusPosition - event.pageY;
      // this.http.post('http://192.168.115.84:3000', {'event': event.touches[0].pageY || 'nothing'}).subscribe((res) => {
      //   console.log(res);
      // });

      // return
      this.counterX =  Math.abs(scrollTop);

      if (event.pageY >= this.focusPosition) {
        if (!this.dir) {
          this.swipe.start();
        }
        this.dir = true;
      } else {
        if (this.dir) {
          this.swipe.start();
        }
        this.dir = false;
      }
      this.daysRotateSubject.next(this.sanitizer.bypassSecurityTrustStyle(`rotateX(${this.rotate.rotateAngle + (scrollTop / 4)}deg)`));

      const intRotateAngle = this.rotate.rotateAngle / this.dataItemAngle;
      const sliceOffset = this.dir ? Math.floor(intRotateAngle) : Math.ceil(intRotateAngle);
      this.dataSetSubject.next(this.connect(sliceOffset, sliceOffset + this.wheelSectorAmount));

      this.scrollFactor = scrollTop;
    }
  }

  onMouseLeave(event: MouseEvent) {

  }

  onMove(event: TouchEvent) {

    event.preventDefault();
    event.stopPropagation();

    if (this.focused) {

      this.counter = 0;
      // this.counterX++;

      this.endTransition = 'none';

      const scrollTop = this.focusPosition - event.touches[0].pageY;
      // this.http.post('http://192.168.115.84:3000', {'event': event.touches[0].pageY || 'nothing'}).subscribe((res) => {
      //   console.log(res);
      // });

      // return
      this.counterX =  Math.abs(scrollTop);

      if (event.touches[0].pageY >= this.focusPosition) {
        if (!this.dir) {
          this.swipe.start();
        }
        this.dir = true;
      } else {
        if (this.dir) {
          this.swipe.start();
        }
        this.dir = false;
      }
      this.daysRotateSubject.next(this.sanitizer.bypassSecurityTrustStyle(`rotateX(${this.rotate.rotateAngle + (scrollTop / 4)}deg)`));

      const intRotateAngle = this.rotate.rotateAngle / this.dataItemAngle;
      const sliceOffset = this.dir ? Math.floor(intRotateAngle) : Math.ceil(intRotateAngle);
      this.dataSetSubject.next(this.connect(sliceOffset, sliceOffset + this.wheelSectorAmount));

      this.scrollFactor = scrollTop;
    }
  }

  onScroll() {
    this.counter = 0;
    this.endTransition = 'none';
    this.dir
      ? this.rotate.rotateAngle += this.dataItemAngle
      : this.rotate.rotateAngle -= this.dataItemAngle;

    if ((typeof this.rotate.maxPositive === 'number') && this.rotate.rotateAngle < this.rotate.maxPositive) {
      this.rotate.rotateAngle = this.rotate.maxPositive;
    } else if ((typeof this.rotate.maxNegative === 'number') && this.rotate.rotateAngle > this.rotate.maxNegative) {
      this.rotate.rotateAngle = this.rotate.maxNegative;
    }
    const intRotateAngle = this.rotate.rotateAngle / this.dataItemAngle;
    const sliceOffset = this.dir ? Math.floor(intRotateAngle) : Math.ceil(intRotateAngle);

    this.runScroll();
    this.daysRotateSubject.next(this.sanitizer.bypassSecurityTrustStyle(`rotateX(${this.rotate.rotateAngle}deg)`));
    this.dataSetSubject.next(this.connect(sliceOffset, sliceOffset + this.wheelSectorAmount));
  }

  runScroll() {
    if (this.inPorgress) {
       return;
    }
    this.inPorgress = true;
    this.endTransition = 'transform .3s ease';
    const destroyer$ = new Subject();

    interval(25)
      .pipe(
        takeUntil(destroyer$)
      )
      .subscribe((v) => {
        this.counter++;
        // alert(this.counter);

        if (this.counter >= 2) {

          const intRotateAngle = this.rotate.rotateAngle / this.dataItemAngle;

          const sliceOffset = this.dir ? Math.floor(intRotateAngle) : Math.ceil(intRotateAngle);

          // this.rotate.rotateAngle = this.dir ? Math.floor(intRotateAngle) * this.dataItemAngle : Math.ceil(intRotateAngle) * this.dataItemAngle;
          this.rotate.rotateAngle = Math.round(intRotateAngle) * this.dataItemAngle;

          this.daysRotateSubject.next(this.sanitizer.bypassSecurityTrustStyle(`rotateX(${this.rotate.rotateAngle}deg)`));

          this.dataSetSubject.next(this.connect(sliceOffset, sliceOffset + this.wheelSectorAmount));

          this.inPorgress = false;

          this.counter = 0;
          destroyer$.next();
          destroyer$.complete();
        }
      });
  }
  connect(_from: number = 0, _to: number = this.wheelSectorAmount) {

    const from = _from - 10;
    const to = _to - 10;
    let dataSlice = [];

    if (this.negativeData.length && this.positiveData.length) {
      if (this.wheelData === 'half') {
        // debugger
        dataSlice = this.positiveData.concat(this.negativeData);
      } else {
        if ((this.positiveData.length - to) <= 10) {
          const additional = this.positiveData.map((item, i) => {
            const n = this.positiveData.length + i;
            const copy = {...item};
            copy.rotate = this.sanitizer.bypassSecurityTrustStyle(`rotateY(0deg) rotateX(-${n % this.wheelSectorAmount * this.dataItemAngle}deg) translate3d(${0}px, ${0}px, ${this.dataRadius}px)`)
            return copy;
          });
          this.positiveData = this.positiveData.concat(additional);
          // console.log(this.positiveData, additional);
        }
        if (from < 0) {
          const localTo = Math.abs(from);
          if ((this.negativeData.length - localTo) <= 10)  {
            const additional = this.negativeData.map((item, i) => {
              const n = this.negativeData.length + i + 1;
              const copy = {...item};
              copy.rotate = this.sanitizer.bypassSecurityTrustStyle(`rotateY(0deg) rotateX(${n % this.wheelSectorAmount * this.dataItemAngle}deg) translate3d(${0}px, ${0}px, ${this.dataRadius}px)`)
              return copy;
            });
            this.negativeData = this.negativeData.concat(additional);
            // console.log(this.negativeData, additional);
          }
          if (to < -1) {
            const localFrom = Math.abs(to);
            dataSlice = this.negativeData.slice(localFrom, localTo).reverse();
          } else {
            dataSlice = this.negativeData.slice(0, localTo).reverse().concat(this.positiveData.slice(0, to > 1 ? to : 1));
          }
        }
        if (from >= 0) {
          dataSlice = this.positiveData.slice(Math.abs(from), Math.abs(to));
        }
      }
    }
    // console.log(dataSlice);
    return dataSlice;
  }
}
