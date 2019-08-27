import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {BehaviorSubject, interval, Observable, ReplaySubject, Subject} from 'rxjs';
import {debounceTime, distinctUntilChanged, takeUntil} from 'rxjs/operators';
import * as moment from 'moment';
import {Moment} from 'moment';

@Component({
  selector: 'app-ios-calendar-wheel',
  templateUrl: './ios-calendar-wheel.component.html',
  styleUrls: ['./ios-calendar-wheel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IosCalendarWheelComponent implements OnInit {

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
  initialOffset = (this.wheelSectorAmount - 11) * this.dataItemHeight;
  offset = 0;
  rotate = {
    rotateAngle: 0,
    maxNegative: null,
    maxPositive: null,
  }
  dir: boolean = true;
  scrollFactor = 1;
  scrolling: boolean = false;
  counter = 0;
  inPorgress: boolean = false;
  endTransition;

  selected;

  dataSetSubject = new BehaviorSubject<any>([]);

  days: Observable<any[]> = this.dataSetSubject.asObservable();

  constructor(
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    console.log(this.current.hour());
    this.buildDates(365, this.wheelData);
    this.dataSetSubject.next(this.connect(0, this.wheelSectorAmount));
    this.offset = this.initialOffset;

    switch (this.wheelData) {
      case 'hour':
        this.rotate.rotateAngle += (this.current.hour() - 1) * this.dataItemAngle;
        break;
      case 'minute':
        this.rotate.rotateAngle += this.current.minute() * this.dataItemAngle;
        break;
      case 'half':
        this.rotate.maxPositive = this.dataItemAngle * -0.0000000000001;
        this.rotate.maxNegative = this.dataItemAngle * 1.0000000000001;
        this.rotate.rotateAngle += this.current.hour() >= 12 ? this.dataItemAngle : 0;

    }

    this.runScroll();

    this.days
      .pipe(
        debounceTime(250),
        distinctUntilChanged()
      )
      .subscribe((days) => {
        if (this.wheelData === 'half') {
          this.selected = this.rotate.rotateAngle ? days[0] : days[1];
          console.log(this.selected);
          this.selectedUnit.emit(this.selected);
        } else {
          this.selected = days[10];
        console.log(days[10]);
          this.selectedUnit.emit(this.selected);
        }
      });
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
          // console.log(multiplicityOfWheelSize, n, this.positiveData.length , this.wheelSectorAmount);
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
          data:  moment(support),
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

  onOver(event: Event) {
    const target = event.target as HTMLElement;
    this.scrolling = false;
    target.scrollTop = 180;
    this.scrollFactor = 180;
  }
  onOut(event: Event) {
    const target = event.target as HTMLElement;
    target.scrollTop = 0;
    this.scrollFactor = 0;
    this.scrolling = false;
  }

  onDown(event: MouseEvent) {
    this.focused = true;
    this.focusPosition = event.pageY;
  }
  onUp(event: Event) {
    this.focused = false;
    this.focusPosition = null;
    this.endTransition = 'transform .2s ease';
    this.offset = this.dir ? Math.floor(this.offset / this.dataItemAngle) * this.dataItemAngle : Math.ceil(this.offset / this.dataItemAngle) * this.dataItemAngle;
    this.rotate.rotateAngle = this.dir ? Math.floor(this.rotate.rotateAngle / this.dataItemAngle) * this.dataItemAngle : Math.ceil(this.rotate.rotateAngle / this.dataItemAngle) * this.dataItemAngle;
    this.daysRotateSubject.next(this.sanitizer.bypassSecurityTrustStyle(`rotateX(${this.rotate.rotateAngle}deg)`));
  }

  onMove(event: MouseEvent) {
    if (this.focused) {

      this.counter = 0;
      this.endTransition = 'none';

      const scrollTop = this.focusPosition + event.pageY;
      console.log(scrollTop);

      if (this.scrollFactor >= scrollTop) {
        this.dir = true;
      } else {
        this.dir = false;
      }

      this.dir ? this.rotate.rotateAngle += 1 : this.rotate.rotateAngle -= 1;
      // console.log(this.dir);
      if (this.scrolling) {
        this.runScroll();
        this.daysRotateSubject.next(this.sanitizer.bypassSecurityTrustStyle(`rotateX(${this.rotate.rotateAngle}deg)`));
      }
      this.scrollFactor = scrollTop;
      this.scrolling = true;
    }
  }

  onScroll(event: Event) {

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
    const intRotateAngle = this.rotate.rotateAngle / this.dataItemAngle;

    const sliceOffset = this.dir ? Math.floor(intRotateAngle) : Math.ceil(intRotateAngle);

    this.dir ? this.offset += this.dataItemHeight / 4 : this.offset -= this.dataItemHeight / 4;
    this.dir ? this.rotate.rotateAngle += this.dataItemAngle / 4 : this.rotate.rotateAngle -= this.dataItemAngle / 4;

    if (this.rotate.maxPositive && this.rotate.rotateAngle < this.rotate.maxPositive) {
        this.rotate.rotateAngle = this.rotate.maxPositive;
    } else if (this.rotate.maxNegative && this.rotate.rotateAngle > this.rotate.maxNegative) {
        this.rotate.rotateAngle = this.rotate.maxNegative;
    }

    if (this.scrolling) {
      this.runScroll();
      this.daysRotateSubject.next(this.sanitizer.bypassSecurityTrustStyle(`rotateX(${this.rotate.rotateAngle}deg)`));
      this.dataSetSubject.next(this.connect(sliceOffset, sliceOffset + this.wheelSectorAmount));
    }
    this.scrollFactor = scrollTop;
    this.scrolling = true;

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
          this.endTransition = 'transform .2s ease';

          const intRotateAngle = this.rotate.rotateAngle / this.dataItemAngle;

          const sliceOffset = this.dir ? Math.floor(intRotateAngle) : Math.ceil(intRotateAngle);

          this.offset = this.dir ? Math.floor(intRotateAngle) * this.dataItemHeight : Math.ceil(intRotateAngle) * this.dataItemHeight;
          this.rotate.rotateAngle = this.dir ? Math.floor(intRotateAngle) * this.dataItemAngle : Math.ceil(intRotateAngle) * this.dataItemAngle;

          this.daysRotateSubject.next(this.sanitizer.bypassSecurityTrustStyle(`rotateX(${this.rotate.rotateAngle}deg)`));

          this.dataSetSubject.next(this.connect(sliceOffset, sliceOffset + this.wheelSectorAmount));

          this.scrolling = false;
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
