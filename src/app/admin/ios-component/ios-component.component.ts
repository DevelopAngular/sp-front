import { Component, OnInit } from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {BehaviorSubject, interval, of, ReplaySubject, Subject} from 'rxjs';
import {map, takeUntil} from 'rxjs/operators';
import * as moment from 'moment';
import * as _ from 'lodash';
import {Moment} from 'moment';



@Component({
  selector: 'app-ios-component',
  templateUrl: './ios-component.component.html',
  styleUrls: ['./ios-component.component.scss']
})
export class IosComponentComponent implements OnInit {

  daysRotateSubject = new ReplaySubject(1);
  daysRotate$ = this.daysRotateSubject.asObservable();
  daysTranslateSubject = new ReplaySubject(1);
  daysTranslate$ = this.daysTranslateSubject.asObservable();


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
  initialOffset = this.wheelSectorAmount * this.dataItemHeight;
  offset = 0;
  rotateAngle = 0;
  dir: boolean = true;
  scrollFactor = 1;
  scrolling: boolean = false;
  counter = 0;
  inPorgress: boolean = false;
  endTransition;

  // dataSet = _.concat([], ..._.chunk(this.buildDates(365, 0), 21).map((chunk) => {
  //   return chunk.map((item, i, arr) => {
  //     // const itemHeight = 35;
  //     // const itemAngle = 360 / arr.length;
  //     // const l = itemHeight * arr.length;
  //     // const radius = (l / Math.PI) / 2;
  //     const day: any = {};
  //
  //     // this.dataItemAngle = itemAngle;
  //     // this.dataRadius = radius;
  //     // this.dataItemHeight = itemHeight;
  //
  //     day.value = item.format('DD MMM');
  //     // day.position = itemAngle * radius;
  //     day.rotate = this.sanitizer.bypassSecurityTrustStyle(`rotateY(0deg) rotateX(-${ i * this.dataItemAngle}deg) translate3d(${0}px, ${0}px, ${this.dataRadius}px)`);
  //     return day;
  //   });
  // }));

  dataSetSubject = new BehaviorSubject<any>([]);

  days: any = this.dataSetSubject.asObservable();
  // hours = Array.from(new Array(12)).map((item, i, arr) => {
  //   const itemHeight = 40;
  //   const itemAngle = 360 / arr.length;
  //   const l = itemHeight * arr.length;
  //   const radius = (l / Math.PI) / 2;
  //   const hour: any = {};
  //
  //   hour.value = i;
  //   hour.position = itemAngle * radius;
  //   hour.rotate = this.sanitizer.bypassSecurityTrustStyle(`rotateY(0deg) rotateX(-${ i * itemAngle}deg) translate3d(${0}px, ${0}px, ${radius}px)`);
  //
  //   return hour;
  // });
  // minutes = Array.from(new Array(60)).map((item, i, arr) => {
  //   const itemHeight = 40;
  //   const itemAngle = 360 / arr.length;
  //   const l = itemHeight * arr.length;
  //   const radius = (l / Math.PI) / 2;
  //   const minute: any = {};
  //
  //   minute.value = i;
  //   minute.position = itemAngle * radius;
  //   minute.rotate = this.sanitizer.bypassSecurityTrustStyle(`rotateY(0deg) rotateX(-${ i * itemAngle}deg) translate3d(${0}px, ${0}px, ${radius}px)`);
  //
  //   return minute;
  // });
  // halfs = ['AM', 'PM'];



  constructor(
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit() {


    // console.log(this.dataSet);
    this.buildDates();
    this.dataSetSubject.next(this.connect(0, 21));

    this.offset = this.initialOffset;
    this.daysTranslateSubject.next(this.sanitizer.bypassSecurityTrustStyle(`translateY(${-(this.offset)}px) translateZ(110px)`));
  }

  buildDates(range: number = 365, offset?) {


    let support: Moment;
    if (offset > 0) {
      support = moment().add(`${offset}`, 'days');
    } else if (offset < 0) {
      support = moment().subtract(`${offset}`, 'days');
    } else {
      support = moment();
    }
    // const dateSet = [support];
    this.positiveData.push({
      data:  moment(support),
      value: moment(support).format('DD MMM'),
      rotate: this.sanitizer.bypassSecurityTrustStyle(`rotateY(0deg) rotateX(-${ this.positiveData.length % this.wheelSectorAmount * this.dataItemAngle}deg) translate3d(${0}px, ${0}px, ${this.dataRadius}px)`)
    });

    for (let n = 1; n <= range; n++) {
      // day.position = itemAngle * radius;
      const multiplicityOfWheelSize = this.positiveData.length % this.wheelSectorAmount;

      console.log(multiplicityOfWheelSize, n, this.positiveData.length , this.wheelSectorAmount);
      this.positiveData.push({
        data:  moment(support).add(`${n}`, 'days'),
        value: moment(support).add(`${n}`, 'days').format('DD MMM'),
        rotate: this.sanitizer.bypassSecurityTrustStyle(`rotateY(0deg) rotateX(-${ multiplicityOfWheelSize * this.dataItemAngle}deg) translate3d(${0}px, ${0}px, ${this.dataRadius}px)`)
      });

      this.negativeData.push({
        data:  moment(support).subtract(`${n}`, 'days'),
        value: moment(support).subtract(`${n}`, 'days').format('DD MMM'),
        rotate: this.sanitizer.bypassSecurityTrustStyle(`rotateY(0deg) rotateX(${ multiplicityOfWheelSize * this.dataItemAngle}deg) translate3d(${0}px, ${0}px, ${this.dataRadius}px)`)
      });
    }
    this.entireData = this.positiveData.concat(this.negativeData);
    console.log(this.positiveData, this.negativeData);

    // _.concat([], ..._.chunk(this.positiveData, 21).map((chunk) => {
    //   return chunk.map((item, i, arr) => {
    //     const itemHeight = 35;
    //     const itemAngle = 360 / arr.length;
    //     const l = itemHeight * arr.length;
    //     const radius = (l / Math.PI) / 2;
    //     const day: any = {};
    //
    //     this.dataItemAngle = itemAngle;
    //     this.dataRadius = radius;
    //     this.dataItemHeight = itemHeight;
    //
    //     day.value = item.format('DD MMM');
    //     // day.position = itemAngle * radius;
    //     day.rotate = this.sanitizer.bypassSecurityTrustStyle(`rotateY(0deg) rotateX(-${ i * itemAngle}deg) translate3d(${0}px, ${0}px, ${radius}px)`);
    //     return day;
    //   });
    // }))

    // console.log(dateSet);
    // this.dataSet = dateSet;
    // return dateSet;
  }

  get translateMargin() {
    return this.initialOffset * Math.floor(this.rotateAngle / 360) + 'px';
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
    this.daysTranslateSubject.next(this.sanitizer.bypassSecurityTrustStyle(`translateY(${-(this.offset)}px) translateZ(110px)`));
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
        // this.runScroll();
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

    // const rotateAngle = this.dir ? Math.floor(intRotateAngle) * this.dataItemHeight : Math.ceil(intRotateAngle) * this.dataItemHeight;


    const sliceOffset = this.dir ? Math.floor(intRotateAngle) : Math.ceil(intRotateAngle);



    this.dir ? this.offset += this.dataItemHeight / 4 : this.offset -= this.dataItemHeight / 4;
    this.dir ? this.rotateAngle += this.dataItemAngle / 4 : this.rotateAngle -= this.dataItemAngle / 4;

    if (this.scrolling) {
      this.runScroll();
      this.daysTranslateSubject.next(this.sanitizer.bypassSecurityTrustStyle(`translateY(${-(this.offset)}px) translateZ(110px)`));
      this.daysRotateSubject.next(this.sanitizer.bypassSecurityTrustStyle(`rotateX(${this.rotateAngle}deg)`));
      console.log(sliceOffset);
      this.dataSetSubject.next(this.connect(sliceOffset, sliceOffset + 21));
      // console.log(this.dir , this.offset, this.rotateAngle, this.dataSetSubject.value);

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
    interval(100)
      .pipe(
        takeUntil(destroyer$)
      )
      .subscribe((v) => {
        this.counter++;
        if (this.counter === 2) {
          this.endTransition = 'transform .2s ease';
          // console.log(this.dir , this.offset, this.rotateAngle);

          // const normalizeForCeil = !(this.offset / this.dataItemHeight % 1) ? this.offset / this.dataItemHeight + .0000000000000000001 : this.offset / this.dataItemHeight;
          console.log(this.dir, this.offset, this.rotateAngle);

          const intOffset = this.offset / this.dataItemHeight;
          const intRotateAngle = this.rotateAngle / this.dataItemAngle;


          // if (this.dir) {
          //   if (intOffset >= 0) {
          //     this.offset = Math.floor(this.offset / this.dataItemHeight) * this.dataItemHeight;
          //   } else {
          //     this.offset = Math.ceil(this.offset / this.dataItemHeight) * this.dataItemHeight;
          //   }
          //
          //   if (intRotateAngle >= 0) {
          //     this.rotateAngle = Math.floor(this.rotateAngle / this.dataItemAngle) * this.dataItemAngle;
          //   } else {
          //     this.rotateAngle = Math.ceil(this.rotateAngle / this.dataItemAngle) * this.dataItemAngle;
          //   }
          // } else {
          //   if (intOffset >= 0) {
          //     this.offset = Math.ceil(this.offset / this.dataItemHeight) * this.dataItemHeight;
          //   } else {
          //     this.offset = Math.floor(this.offset / this.dataItemHeight) * this.dataItemHeight;
          //   }
          //   if (intRotateAngle >= 0) {
          //     this.rotateAngle = Math.ceil(this.rotateAngle / this.dataItemAngle) * this.dataItemAngle;
          //   } else {
          //     this.rotateAngle = Math.floor(this.rotateAngle / this.dataItemAngle) * this.dataItemAngle;
          //   }
          //
          // }
          this.offset = this.dir ? Math.floor(intRotateAngle) * this.dataItemHeight : Math.ceil(intRotateAngle) * this.dataItemHeight;
          this.rotateAngle = this.dir ? Math.floor(intRotateAngle) * this.dataItemAngle : Math.ceil(intRotateAngle) * this.dataItemAngle;


          this.daysTranslateSubject.next(this.sanitizer.bypassSecurityTrustStyle(`translateY(${-(this.offset)}px) translateZ(110px)`));
          this.daysRotateSubject.next(this.sanitizer.bypassSecurityTrustStyle(`rotateX(${this.rotateAngle}deg)`));

          this.scrolling = false;
          this.inPorgress = false;
          const selected = this.offset / this.initialOffset;

          destroyer$.next();
          destroyer$.complete();
        }
      });
  }
  connect(from: number = 0, to: number = 21) {
    let dataSlice = [];

    const supportIndex = this.dataSize;


    if (from < 0 && to < 0) {
      dataSlice = dataSlice.concat(this.negativeData.slice(Math.abs(to - 1), Math.abs(from - 1)));
    }
    if (from < 0 && to >= 0) {
      dataSlice = dataSlice.concat(this.negativeData.slice(Math.abs(0), Math.abs(from - 1)));
      dataSlice = dataSlice.concat(this.positiveData.slice(Math.abs(0), Math.abs(to)));
    }
    // if (from < 0 && to > 0) {
    //   dataSlice = dataSlice.concat(this.negativeData.slice(Math.abs(0), Math.abs(to)));
    // }
    if (from >= 0 && to >= 0) {
      // debugger
      dataSlice = dataSlice.concat(this.positiveData.slice(Math.abs(from), Math.abs(to)));
    }

    console.log(dataSlice);
    return dataSlice;
  }


}
