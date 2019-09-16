import {Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild} from '@angular/core';
import {Navigation} from '../../main-hall-pass-form.component';
import {CreateFormService} from '../../../create-form.service';
import {BehaviorSubject, fromEvent} from 'rxjs';
import {ScreenService} from '../../../../services/screen.service';

@Component({
  selector: 'app-from-where',
  templateUrl: './from-where.component.html',
  styleUrls: ['./from-where.component.scss']
})
export class FromWhereComponent implements OnInit {

  @ViewChild('header') header: ElementRef<HTMLDivElement>;
  @ViewChild('rc') set rc(rc: ElementRef<HTMLDivElement> ) {
    if (rc) {
      fromEvent( rc.nativeElement, 'scroll').subscribe((evt: Event) => {
        let blur: number;

        if ((evt.target as HTMLDivElement).scrollTop < 100) {
          blur = 5;
        } else if ((evt.target as HTMLDivElement).scrollTop > 100 && (evt.target as HTMLDivElement).scrollTop < 400) {
          blur = (evt.target as HTMLDivElement).scrollTop / 20;
        } else {
          blur = 20;
        }

        this.header.nativeElement.style.boxShadow = `0 1px ${blur}px 0px rgba(0,0,0,.2)`;
        console.log(this.header.nativeElement.dataset);
      });
    }
  }

  @Input() date;

  @Input() isStaff: boolean;

  @Input() formState: Navigation;

  @Input() studentText;

  @Output() selectedLocation: EventEmitter<any> = new EventEmitter<any>();
  @Output() backButton: EventEmitter<any> = new EventEmitter<any>();

  shadow: boolean;
  frameMotion$: BehaviorSubject<any>;

  headerTransition = {
    'from-header': true,
    'from-header_animation-back': false
  };



  @HostListener('scroll', ['$event'])
  tableScroll(event) {
    const tracker = event.target;
    const limit = tracker.scrollHeight - tracker.clientHeight;
    if (event.target.scrollTop < limit) {
      this.shadow = true;
    }
    if (event.target.scrollTop === limit) {
      this.shadow = false;
    }
  }


  constructor(
    private formService: CreateFormService,
    public screenService: ScreenService
  ) { }

  ngOnInit() {
    this.frameMotion$ = this.formService.getFrameMotionDirection();

    this.frameMotion$.subscribe((v: any) => {
      switch (v.direction) {
        case 'back':
          this.headerTransition['from-header'] = false;
          this.headerTransition['from-header_animation-back'] = true;
          break;
        case 'forward':
          this.headerTransition['from-header'] = true;
          this.headerTransition['from-header_animation-back'] = false;
          break;
        default:
          this.headerTransition['from-header'] = true;
          this.headerTransition['from-header_animation-back'] = false;
      }
    });
  }

  locationChosen(location) {

    this.formService.setFrameMotionDirection('forward');

    setTimeout(() => {
      this.formState.previousState = 1;
      this.selectedLocation.emit(location);
    }, 100);


  }


  back() {

    this.formService.setFrameMotionDirection('back');


    setTimeout(() => {
      if (this.formState.forLater || this.formState.missedRequest) {
        this.formState.previousState = 1;
        this.formState.previousStep = 3;
        this.formState.step = 1;
        this.formState.state = 1;
        this.formState.previousStep = 3;
      } else if (!!this.studentText && this.formState.state === 1) {
        this.formState.previousState = 1;
        this.formState.step = 2;
        this.formState.state = 1;
        this.formState.previousStep = 3;
      } else {
        this.formState.step = 0;
      }
      this.formState.previousState = 1;


      this.backButton.emit(this.formState);
    }, 100);
  }

  get displayFooters() {
    return this.screenService.isDeviceLargeExtra;
  }
}
