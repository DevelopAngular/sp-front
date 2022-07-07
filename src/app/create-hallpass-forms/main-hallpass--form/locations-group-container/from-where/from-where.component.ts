import {Component, ElementRef, EventEmitter, HostListener, Input, OnInit, OnDestroy, Output, Inject, TemplateRef, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {ToastService} from '../../../../services/toast.service';
import {Navigation} from '../../main-hall-pass-form.component';
import {CreateFormService} from '../../../create-form.service';
import {Subject, BehaviorSubject, fromEvent} from 'rxjs';
import {concatMap, filter, map, pluck, retryWhen, switchMap, take, takeUntil, tap} from 'rxjs/operators';
import {ScreenService} from '../../../../services/screen.service';
import {
  ConfirmationDialogComponent,
  ConfirmationTemplates
} from '../../../../shared/shared-components/confirmation-dialog/confirmation-dialog.component';
import {LocationVisibilityService} from '../../../../services/location-visibility.service';

@Component({
  selector: 'app-from-where',
  templateUrl: './from-where.component.html',
  styleUrls: ['./from-where.component.scss']
})
export class FromWhereComponent implements OnInit, OnDestroy {

  @ViewChild('header', { static: true }) header: ElementRef<HTMLDivElement>;
  @ViewChild('rc', { static: true }) set rc(rc: ElementRef<HTMLDivElement> ) {
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
      });
    }
  }

  @Input() date;

  @Input() isStaff: boolean;

  @Input() formState: Navigation;

  @Input() studentText;

  @Output() selectedLocation: EventEmitter<any> = new EventEmitter<any>();
  @Output() backButton: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild('confirmDialogBodyVisibility') confirmDialogVisibility: TemplateRef<HTMLElement>;

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

  destroy$: Subject<any> = new Subject<any>();

  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<FromWhereComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private visibilityService: LocationVisibilityService,
    private toastService: ToastService,
    private formService: CreateFormService,
    public screenService: ScreenService
  ) {}

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

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  locationChosen(location) {
     const students = this.formState.data.selectedStudents.map(s => s.id);
     const ruleStudents = location.visibility_students.map(s => s.id);
     const rule = location.visibility_type;
                     
     let skipped = this.visibilityService.calculateSkipped(students, ruleStudents, rule);

    if (!!skipped) {
      const studentNames = this.formState.data.selectedStudents.filter(s => skipped.includes(s.id)).map(s => s.display_name);      
      // TODO: dialog.open
       this.dialog.open(ConfirmationDialogComponent, {
            panelClass: 'overlay-dialog',
            backdropClass: 'custom-backdrop',
            closeOnNavigation: true,
            data: {
              body: this.confirmDialogVisibility,
              buttons: {
                confirmText: 'Override',
                denyText: 'Skip these students',
              },
              templateData: {alerts: [{phrase: 'These students do not have permission to come from this room', students: studentNames.join(', ')}]},
              icon: './assets/Eye (Green-White).svg'
            } as ConfirmationTemplates
          }).afterClosed().pipe(
            takeUntil(this.destroy$),
            tap(override => console.log(override))
          ).subscribe(res => {
            console.log(res)
            if (!res) {
              // filter out the skipped students
              const roomStudents = this.formState.data.selectedStudents.filter(s => (!skipped.includes(s.id)));
              if (roomStudents.length === 0) {
                this.toastService.openToast({
                  title: 'Skiping left no students to operate on',
                  subtitle: 'Last operation did not proceeed',
                  type: 'error',
                });
              } else {
                this.formState.data.roomStudents = roomStudents; 
                this.formService.setFrameMotionDirection('forward');
                this.formService.compressableBoxController.next(false);

                setTimeout(() => {
                  this.formState.previousState = 1;
                  this.selectedLocation.emit(location);
                }, 100);
              }
            } else {
                this.formService.setFrameMotionDirection('forward');
                this.formService.compressableBoxController.next(false);

                setTimeout(() => {
                  this.formState.previousState = 1;
                  this.selectedLocation.emit(location);
                }, 100);
            }
          }); 
    } else {
      this.formService.setFrameMotionDirection('forward');
      this.formService.compressableBoxController.next(false);

      setTimeout(() => {
        this.formState.previousState = 1;
        this.selectedLocation.emit(location);
      }, 100);
    }


  }


  back() {

    if (!this.screenService.isDeviceLargeExtra && this.formState.formMode.role === 1 && !this.formState.forLater) {
      this.formService.setFrameMotionDirection('disable');
      this.formService.compressableBoxController.next(true);
    } else {
      this.formService.compressableBoxController.next(false);
      this.formService.setFrameMotionDirection('back');
    }

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

      console.log(this.formState);
      this.backButton.emit(this.formState);
    }, 100);
  }

  get displayFooters() {
    return this.screenService.isDeviceLargeExtra;
  }
}
