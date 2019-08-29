import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {BehaviorSubject, interval, Observable, ReplaySubject, Subject, Subscription} from 'rxjs';
import {debounceTime, distinctUntilChanged, filter, take, takeUntil} from 'rxjs/operators';
import * as _ from 'lodash';
import * as moment from 'moment';
import {Moment} from 'moment';
import {IosDateSingleton} from '../ios-date.singleton';
import {DeviceDetection} from '../../device-detection.helper';

@Component({
  selector: 'app-ios-calendar-wheel',
  templateUrl: './ios-calendar-wheel.component.html',
  styleUrls: ['./ios-calendar-wheel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IosCalendarWheelComponent implements OnInit, OnDestroy {
  @Input() leftShift: number = 0;
  @Input() rightShift: number = 0;
  @Input() wheelData: 'date' | 'hour' | 'minute' | 'half';
  @Input() current: Moment = moment();

  @Output() selectedUnit: EventEmitter<any> = new EventEmitter();

  daysRotateSubject = new ReplaySubject(1);
  daysRotate$ = this.daysRotateSubject.asObservable();

  positiveData = [];
  negativeData = [];
  entireData = [];

  wheelSectorAmount = 24;
  dataSize = 365;
  dataItemHeight = 35;
  dataItemAngle = 360 / this.wheelSectorAmount;
  l = this.dataItemHeight * this.wheelSectorAmount;
  dataRadius = (this.l / Math.PI) / 2;

  focused: boolean = false;
  focusPosition: number;
  rotate = {
    rotateAngle: 0,
    maxNegative: null,
    maxPositive: null,
  };

  dir: boolean = true;
  scrollFactor = 1;
  scrolling: boolean = false;
  counter = 0;
  inPorgress: boolean = false;
  endTransition;

  selected;

  dataSetSubject = new BehaviorSubject<any>([]);

  days: Observable<any[]> = this.dataSetSubject.asObservable();

  today: Moment = moment();

  destroyer$ = new Subject<any>();

  counterX = 0;
  counterXdestroyer: Subject<any>;
  postOutDestroyer: Subject<any>;
  swipeInProgress: boolean = false;
  swipeOffset = 0;

  constructor(
    private sanitizer: DomSanitizer,
    private iosDate: IosDateSingleton
  ) { }

  ngOnInit() {

    this.buildDates(365, this.wheelData);
    this.dataSetSubject.next(this.connect(0, this.wheelSectorAmount));

      switch (this.wheelData) {
        case 'date':
          if (this.selected) {
            const diff = this.selected.data.diff(this.current) > 0 ? Math.floor(this.selected.data.diff(this.current) / 86400000) : Math.ceil(this.selected.data.diff(this.current) / 86400000);

            console.log(diff, this.selected, this.selected.data.diff(this.current) / 86400000);
            this.rotate.rotateAngle += -(diff) * this.dataItemAngle;
            this.selected.data = _.cloneDeep(this.current);
            this.daysRotateSubject.next(this.sanitizer.bypassSecurityTrustStyle(`rotateX(${this.rotate.rotateAngle}deg)`));
          }
          break;
        case 'hour':
            this.rotate.rotateAngle += (this.current.hour() - 1) * this.dataItemAngle;
          break;
        case 'minute':
            this.rotate.rotateAngle += this.current.minute() * this.dataItemAngle;
          break;
        case 'half':
            this.rotate.maxPositive = this.dataItemAngle * 0;
            this.rotate.maxNegative = this.dataItemAngle * 1;
            this.rotate.rotateAngle += this.current.hour() >= 12 ? this.dataItemAngle : 0;
      }
      this.runScroll();
    // });

    this.days
      .pipe(
        debounceTime(250),
        distinctUntilChanged(),
        takeUntil(this.destroyer$),
      )
      .subscribe((days) => {
        if (this.wheelData === 'half') {
          this.selected = this.rotate.rotateAngle ? days[0] : days[1];
          this.selectedUnit.emit(this.selected);
        } else {
          this.selected = _.cloneDeep(days[10]);
          this.selectedUnit.emit(days[10]);
        }
        // console.log(this.wheelData, this.selected);
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
          this.positiveData.push({
            data:  moment(support).add(`${n}`, 'days'),
            value: moment(support).add(`${n}`, 'days').format('ddd MMM DD'),
            rotate: this.sanitizer.bypassSecurityTrustStyle(`rotateY(0deg) rotateX(-${ multiplicityOfWheelSize * this.dataItemAngle}deg) translate3d(${0}px, ${0}px, ${this.dataRadius}px)`)
          });
          this.negativeData.push({
            data:  moment(support).subtract(`${n}`, 'days'),
            value: moment(support).subtract(`${n}`, 'days').format('ddd MMM DD'),
            rotate: this.sanitizer.bypassSecurityTrustStyle(`rotateY(0deg) rotateX(${ multiplicityOfWheelSize * this.dataItemAngle}deg) translate3d(${0}px, ${0}px, ${this.dataRadius}px)`)
          });
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
    // if (!DeviceDetection.isIOSMobile() && !DeviceDetection.isIOSTablet() && !DeviceDetection.isAndroid()) {
      const target = event.target as HTMLElement;
      target.scrollTop = 180;
      this.scrollFactor = 180;
      setTimeout(() => {
        this.scrolling = true;
      }, 50);
    // } else {
    //   return;
    // }

  }
  onOut(event: MouseEvent) {
    // this.runScroll();
    // return;
    if (!DeviceDetection.isIOSMobile() && !DeviceDetection.isIOSTablet() && !DeviceDetection.isAndroid()) {
      const target = event.target as HTMLElement;
      target.scrollTop = 0;
      this.scrollFactor = 0;
      this.scrolling = false;
    } else {
      this.counterXdestroyer.next();
      this.counterXdestroyer.complete();

      this.rotate.rotateAngle += this.scrollFactor / 2;


      if (this.wheelData !== 'half' && Math.abs(this.scrollFactor) > 30 && Math.abs(this.counterX) > 0) {
        // alert(this.counterX);
        this.swipeInProgress = true;
        const intervalCounter = Math.floor(this.counterX / 50);

        interval(10 )
          .pipe(
            takeUntil(this.postOutDestroyer)
          )
          .subscribe((v) => {

            this.dir ? this.rotate.rotateAngle -= intervalCounter : this.rotate.rotateAngle += intervalCounter;

            if ((typeof this.rotate.maxPositive === 'number') && this.rotate.rotateAngle < this.rotate.maxPositive) {
              this.rotate.rotateAngle = this.rotate.maxPositive;
            } else if ((typeof this.rotate.maxNegative === 'number') && this.rotate.rotateAngle > this.rotate.maxNegative) {
              this.rotate.rotateAngle = this.rotate.maxNegative;
            }

            const intRotateAngle = this.rotate.rotateAngle / this.dataItemAngle;
            const sliceOffset = this.dir ? Math.floor(intRotateAngle) : Math.ceil(intRotateAngle);

            this.daysRotateSubject.next(this.sanitizer.bypassSecurityTrustStyle(`rotateX(${this.rotate.rotateAngle}deg)`));
            this.dataSetSubject.next(this.connect(sliceOffset, sliceOffset + this.wheelSectorAmount));

            if (v > 50) {
              // alert(v);
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
          this.swipeInProgress = true;

          interval(10 )
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
                // this.runScroll();
                this.postOutDestroyer.next();
                this.postOutDestroyer.complete();
                this.swipeInProgress = false;
                this.focused = false;
                this.focusPosition = null;
              }
            });

              // this.rotate.rotateAngle = this.rotate.maxPositive;
        } else if ((typeof this.rotate.maxNegative === 'number') && this.rotate.rotateAngle > this.rotate.maxNegative) {
          this.swipeInProgress = true;

          interval(10 )
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
                // this.runScroll();
                this.postOutDestroyer.next();
                this.postOutDestroyer.complete();
                this.swipeInProgress = false;
                this.focused = false;
                this.focusPosition = null;
              }
            });
          // this.rotate.rotateAngle = this.rotate.maxNegative;
        } else {
          this.runScroll();
          this.postOutDestroyer.next();
          this.postOutDestroyer.complete();
          this.swipeInProgress = false;
          this.focused = false;
          this.focusPosition = null;
        }
        // this.daysRotateSubject.next(this.sanitizer.bypassSecurityTrustStyle(`rotateX(${this.rotate.rotateAngle}deg)`));

      } else {

        // if (this.wheelData === 'half') {
        //   if ((typeof this.rotate.maxPositive === 'number') && this.rotate.rotateAngle < this.rotate.maxPositive) {
        //     this.rotate.rotateAngle = this.rotate.maxPositive;
        //   } else if ((typeof this.rotate.maxNegative === 'number') && this.rotate.rotateAngle > this.rotate.maxNegative) {
        //     this.rotate.rotateAngle = this.rotate.maxNegative;
        //   }
        // }
        // this.daysRotateSubject.next(this.sanitizer.bypassSecurityTrustStyle(`rotateX(${this.rotate.rotateAngle}deg)`));

        this.runScroll();
        this.swipeInProgress = false;
        this.focused = false;
        this.focusPosition = null;
        this.scrollFactor = 0;

      }

    }
  }

  onDown(event: MouseEvent) {
    // this.onClick(); this.onOver(event);
    // return;
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
    this.focusPosition = event.pageY;
    this.counterXdestroyer = new Subject<any>();
    this.postOutDestroyer = new Subject<any>();

    interval(50)
      .pipe(
        takeUntil(this.counterXdestroyer)
      )
      .subscribe((v) => {
        this.counterX = 0;
      });
  }
  onUp(event: Event) {
    this.focused = false;
    this.focusPosition = null;
    this.endTransition = 'transform .2s ease';
    this.rotate.rotateAngle = this.dir ? Math.floor(this.rotate.rotateAngle / this.dataItemAngle) * this.dataItemAngle : Math.ceil(this.rotate.rotateAngle / this.dataItemAngle) * this.dataItemAngle;
    this.daysRotateSubject.next(this.sanitizer.bypassSecurityTrustStyle(`rotateX(${this.rotate.rotateAngle}deg)`));
  }

  onMove(event: MouseEvent, dir?: boolean) {

    event.preventDefault();
    event.stopPropagation();

    if (this.focused) {

      this.counter = 0;
      // this.counterX = 0;
      this.counterX++;

      this.endTransition = 'none';

      const scrollTop = this.focusPosition - event.pageY;
      this.counterX =  Math.abs(scrollTop);
      if (event.pageY >= this.focusPosition) {
        this.dir = true;
      } else {
        this.dir = false;
      }

      // this.dir ? this.rotate.rotateAngle -= 1 : this.rotate.rotateAngle += 1;

      // if (this.wheelData === 'half') {
      //   if ((typeof this.rotate.maxPositive === 'number') && this.rotate.rotateAngle + (scrollTop / 2) < this.rotate.maxPositive) {
      //     scrollTop = this.rotate.maxPositive * 2;
      //   } else if ((typeof this.rotate.maxNegative === 'number') && this.rotate.rotateAngle + (scrollTop / 2) > this.rotate.maxNegative) {
      //     scrollTop = this.rotate.maxNegative * 2;
      //   }
      // }

      this.daysRotateSubject.next(this.sanitizer.bypassSecurityTrustStyle(`rotateX(${this.rotate.rotateAngle + (scrollTop / 2)}deg)`));

      const intRotateAngle = this.rotate.rotateAngle / this.dataItemAngle;
      const sliceOffset = this.dir ? Math.floor(intRotateAngle) : Math.ceil(intRotateAngle);
      this.dataSetSubject.next(this.connect(sliceOffset, sliceOffset + this.wheelSectorAmount));


      this.scrollFactor = scrollTop;

    }
  }

  onScroll(event: Event) {

    if (this.scrolling) {

      this.counter = 0;
      this.endTransition = 'none';

      const target = event.target as HTMLElement;
      const scrollTop = target.scrollTop;

      if (scrollTop < 1) {
        target.scrollTop = 719;
      } else if (scrollTop > 719) {
        target.scrollTop = 1;
      }
      if (Math.abs( this.scrollFactor - scrollTop) < 50) {
        if (this.scrollFactor <= scrollTop) {
          this.dir = true;
        } else {
          this.dir = false;
        }
      }

      this.dir ? this.rotate.rotateAngle += this.dataItemAngle / 4 : this.rotate.rotateAngle -= this.dataItemAngle / 4;

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

      this.scrollFactor = scrollTop;
    }

  }

  runScroll() {
    if (this.inPorgress) {
      return;
    }
    this.inPorgress = true;
    const destroyer$ = new Subject();
    interval(50)
      .pipe(
        takeUntil(destroyer$)
      )
      .subscribe((v) => {
        this.counter++;
        if (this.counter === 2) {
          this.endTransition = 'transform .5s ease';

          const intRotateAngle = this.rotate.rotateAngle / this.dataItemAngle;

          const sliceOffset = this.dir ? Math.floor(intRotateAngle) : Math.ceil(intRotateAngle);

          this.rotate.rotateAngle = this.dir ? Math.floor(intRotateAngle) * this.dataItemAngle : Math.ceil(intRotateAngle) * this.dataItemAngle;

          this.daysRotateSubject.next(this.sanitizer.bypassSecurityTrustStyle(`rotateX(${this.rotate.rotateAngle}deg)`));

          this.dataSetSubject.next(this.connect(sliceOffset, sliceOffset + this.wheelSectorAmount));

          this.inPorgress = false;

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
