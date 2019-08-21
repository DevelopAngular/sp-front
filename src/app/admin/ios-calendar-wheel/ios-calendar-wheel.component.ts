import {Component, Input, OnInit} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {BehaviorSubject, interval, Observable, of, ReplaySubject, Subject} from 'rxjs';
import {debounceTime, distinctUntilChanged, map, takeUntil} from 'rxjs/operators';
import * as moment from 'moment';
import {Moment} from 'moment';

@Component({
  selector: 'app-ios-calendar-wheel',
  templateUrl: './ios-calendar-wheel.component.html',
  styleUrls: ['./ios-calendar-wheel.component.scss']
})
export class IosCalendarWheelComponent implements OnInit {

  @Input() wheelData: 'date' | 'hour' | 'minute';


  daysRotateSubject = new ReplaySubject(1);
  daysRotate$ = this.daysRotateSubject.asObservable();


  positiveData = [];
  negativeData = [];
  entireData = []


  wheelSectorAmount = 21;
  dataSize = 365;
  dataItemHeight = 35;
  dataItemAngle = 360 / this.wheelSectorAmount;
  l = this.dataItemHeight * this.wheelSectorAmount;
  dataRadius = (this.l / Math.PI) / 2;


  focused: boolean = false;
  focusPosition: number;
  initialOffset = (this.wheelSectorAmount - 11) * this.dataItemHeight;
  offset = 0;
  rotateAngle = 0;
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

    this.buildDates(365, this.wheelData);
    this.dataSetSubject.next(this.connect(0, 21));

    this.offset = this.initialOffset;

    this.days
      .pipe(
        debounceTime(250),
        distinctUntilChanged()
      )
      .subscribe((days) => {
      this.selected = days[10];
      console.log(days[10]);
    });
  }

  buildDates(range: number = 365, dataType: 'date' | 'hour' | 'minute' = 'date', offset?) {

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
          data:  moment(support),
          value: '01',
          rotate: this.sanitizer.bypassSecurityTrustStyle(`rotateY(0deg) rotateX(-${ this.positiveData.length % this.wheelSectorAmount * this.dataItemAngle}deg) translate3d(${0}px, ${0}px, ${this.dataRadius}px)`)
        });
        for (let i = 2; i <= 24; i++) {
          const n = i % 12;
          const multiplicityOfWheelSize = this.positiveData.length % this.wheelSectorAmount;
          // console.log(multiplicityOfWheelSize, n, this.positiveData.length , this.wheelSectorAmount);
          this.positiveData.push({
            data:  moment(support).add(`${n}`, 'days'),
            value: n <= 9 ? '0' + n : n,
            rotate: this.sanitizer.bypassSecurityTrustStyle(`rotateY(0deg) rotateX(-${ multiplicityOfWheelSize * this.dataItemAngle}deg) translate3d(${0}px, ${0}px, ${this.dataRadius}px)`)
          });

          // this.negativeData.push({
          //   data:  moment(support).subtract(`${n}`, 'days'),
          //   value: (12 - n ) <= 9 ? '0' + (12 - n ) : (12 - n ),
          //   rotate: this.sanitizer.bypassSecurityTrustStyle(`rotateY(0deg) rotateX(${ multiplicityOfWheelSize * this.dataItemAngle}deg) translate3d(${0}px, ${0}px, ${this.dataRadius}px)`)
          // });
        }
        this.entireData = this.positiveData.concat(this.negativeData);
        break;
      case 'minute':
        this.positiveData.push({
          data:  moment(support),
          value: '00',
          rotate: this.sanitizer.bypassSecurityTrustStyle(`rotateY(0deg) rotateX(-${ this.positiveData.length % this.wheelSectorAmount * this.dataItemAngle}deg) translate3d(${0}px, ${0}px, ${this.dataRadius}px)`)
        });
        for (let n = 1; n <= 59; n++) {
          const multiplicityOfWheelSize = this.positiveData.length % this.wheelSectorAmount;
          // console.log(multiplicityOfWheelSize, n, this.positiveData.length , this.wheelSectorAmount);
          this.positiveData.push({
            data:  moment(support).add(`${n}`, 'days'),
            value: n <= 9 ? '0' + n : n,
            rotate: this.sanitizer.bypassSecurityTrustStyle(`rotateY(0deg) rotateX(-${ multiplicityOfWheelSize * this.dataItemAngle}deg) translate3d(${0}px, ${0}px, ${this.dataRadius}px)`)
          });

          // this.negativeData.push({
          //   data:  moment(support).subtract(`${n}`, 'days'),
          //   value: n <= 9 ? '0' + n : n,
          //   rotate: this.sanitizer.bypassSecurityTrustStyle(`rotateY(0deg) rotateX(${ multiplicityOfWheelSize * this.dataItemAngle}deg) translate3d(${0}px, ${0}px, ${this.dataRadius}px)`)
          // });
        }
        this.entireData = this.positiveData.concat(this.negativeData);
        break;

    }





    console.log(this.positiveData, this.negativeData);
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
    this.rotateAngle = this.dir ? Math.floor(this.rotateAngle / this.dataItemAngle) * this.dataItemAngle : Math.ceil(this.rotateAngle / this.dataItemAngle) * this.dataItemAngle;
    this.daysRotateSubject.next(this.sanitizer.bypassSecurityTrustStyle(`rotateX(${this.rotateAngle}deg)`));
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

      this.dir ? this.rotateAngle += 1 : this.rotateAngle -= 1;
      // console.log(this.dir);
      if (this.scrolling) {
        this.runScroll();
        this.daysRotateSubject.next(this.sanitizer.bypassSecurityTrustStyle(`rotateX(${this.rotateAngle}deg)`));
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
    const intRotateAngle = this.rotateAngle / this.dataItemAngle;

    const sliceOffset = this.dir ? Math.floor(intRotateAngle) : Math.ceil(intRotateAngle);

    this.dir ? this.offset += this.dataItemHeight / 4 : this.offset -= this.dataItemHeight / 4;
    this.dir ? this.rotateAngle += this.dataItemAngle / 4 : this.rotateAngle -= this.dataItemAngle / 4;

    if (this.scrolling) {
      this.runScroll();
      this.daysRotateSubject.next(this.sanitizer.bypassSecurityTrustStyle(`rotateX(${this.rotateAngle}deg)`));
      this.dataSetSubject.next(this.connect(sliceOffset, sliceOffset + 21));
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

          const intRotateAngle = this.rotateAngle / this.dataItemAngle;

          const sliceOffset = this.dir ? Math.floor(intRotateAngle) : Math.ceil(intRotateAngle);


          this.offset = this.dir ? Math.floor(intRotateAngle) * this.dataItemHeight : Math.ceil(intRotateAngle) * this.dataItemHeight;
          this.rotateAngle = this.dir ? Math.floor(intRotateAngle) * this.dataItemAngle : Math.ceil(intRotateAngle) * this.dataItemAngle;

          this.daysRotateSubject.next(this.sanitizer.bypassSecurityTrustStyle(`rotateX(${this.rotateAngle}deg)`));

          this.dataSetSubject.next(this.connect(sliceOffset, sliceOffset + 21));


          this.scrolling = false;
          this.inPorgress = false;

          destroyer$.next();
          destroyer$.complete();
        }
      });
  }
  connect(_from: number = 0, _to: number = 21) {
    const from = _from - 10;
    const to = _to - 10;

    let dataSlice = [];

    if (this.negativeData.length && this.positiveData.length) {

      if (from < 0) {
        const localTo = Math.abs(from);
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

    } else if (!this.negativeData.length && this.positiveData.length) {

      if (from >= 0 && to > this.positiveData.length) {
        dataSlice = this.positiveData.splice(from).concat(this.positiveData.slice(0, to - this.positiveData.length));
      }
      //
      if (from >= 0 && to <= this.positiveData.length) {
        // dataSlice = this.positiveData.slice(from, to);
        dataSlice = this.positiveData.slice(from, to);

      }
      //
      if (from < 0 && to <= this.positiveData.length) {
        dataSlice = this.positiveData.slice(from).concat(this.positiveData.slice(0, to));
      }

    }



    console.log(dataSlice);
    return dataSlice;
  }

}
