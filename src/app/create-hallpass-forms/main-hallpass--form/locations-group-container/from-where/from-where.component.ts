import {Component, ElementRef, EventEmitter, HostListener, Input, OnInit, OnDestroy, Output, Inject, TemplateRef, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {ToastService} from '../../../../services/toast.service';
import {Navigation} from '../../main-hall-pass-form.component';
import {CreateFormService} from '../../../create-form.service';
import {Subject, BehaviorSubject, fromEvent} from 'rxjs';
import {filter, take, takeUntil} from 'rxjs/operators';
import {ScreenService} from '../../../../services/screen.service';
import {
  ConfirmationDialogComponent,
  ConfirmationTemplates
} from '../../../../shared/shared-components/confirmation-dialog/confirmation-dialog.component';
import {LocationVisibilityService} from '../../location-visibility.service';
import {UserService} from '../../../../services/user.service';
import {User} from '../../../../models/User';

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

  // keep unfiltered students before entering (with posible filtering) to pass card view
  beforeBackStudents: User[] = [];

  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<FromWhereComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private visibilityService: LocationVisibilityService,
    private toastService: ToastService,
    private formService: CreateFormService,
    public screenService: ScreenService,
    private userService: UserService,
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

     this.userService.userData
      .pipe(
        filter(u => !!u),
        take(1),
      )
      .subscribe((u: User) => this.student = u);
  }

  private student: User;

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /*
  private forwardAndEmit() {
    this.formService.setFrameMotionDirection('forward');
    this.formService.compressableBoxController.next(false);

    setTimeout(() => {
      this.formState.previousState = 1;
      this.selectedLocation.emit(location);
    }, 100);
  }
 */

  locationChosen(location) {
    // students go forward
    /*
    if (!this.isStaff) {
      this.forwardAndEmit();
      return;
    }
    */

    /*
    this.visibilityService.howToActOnChooseLocation(
      this.formState,
      location,
      this.confirmDialogVisibility, 
      this.forwardAndEmit.bind(this),
      this.destroy$,
    );
   */

    // advance form to next componet
    // emit chosen location
    const forwardAndEmit = () => {
      this.formService.setFrameMotionDirection('forward');
      this.formService.compressableBoxController.next(false);

      setTimeout(() => {
        this.formState.previousState = 1;
        this.selectedLocation.emit(location);
      }, 100);
    };

    // students go forward
    if (!this.isStaff) {
      forwardAndEmit();
      return;
    }

    // staff only
     const selectedStudents = this.formState.data.selectedStudents;
     const students = selectedStudents.map(s => ''+s.id);
     const ruleStudents = location.visibility_students.map(s => ''+s.id);
     const rule = location.visibility_type;
          
    // skipped are students that do not qualify to go forward     
     let skipped = this.visibilityService.calculateSkipped(students, ruleStudents, rule);

      if (!skipped || skipped.length === 0) {
        forwardAndEmit();
        return; 
      }

      let text =  'This room is only available to certain students';
      let names = selectedStudents.filter(s => skipped.includes(''+s.id)).map(s => s.display_name);
      let title =  'Student does not have permission to come from this room';
      let denyText =  'Cancel';
      if (names.length > 1) {
        text = names?.join(', ') ?? 'This room is only available to certain students'
        title = 'These students do not have permission to come from this room:';
        denyText = 'Skip these students';
      } else {
        title = (names?.join(', ') ?? 'Student') + ' does not have permission to come from this room'; 
        if (selectedStudents.length > 1) denyText = 'Skip this student';
      }

      this.dialog.open(ConfirmationDialogComponent, {
        panelClass: 'overlay-dialog',
        backdropClass: 'custom-backdrop',
        closeOnNavigation: true,
        data: {
          headerText: '',
          body: this.confirmDialogVisibility,
          buttons: {
            confirmText: 'Override',
            denyText,
          },
          templateData: {alerts: [{title, text}]},
          icon: {
            name: 'Eye (Green-White).svg',
            background: '',
          }
        } as ConfirmationTemplates
      }).afterClosed().pipe(
        takeUntil(this.destroy$),
      ).subscribe(override => {
        this.formState.data.roomOverride = !!override; 

        if (override === undefined) {
          return;        
        }
       
        // override case
        if (override) {
          this.formState.data.roomStudents = [...this.formState.data.selectedStudents]; 
          this.formState.data.roomStudentsAfterFromStep = [...this.formState.data.roomStudents]; 
          forwardAndEmit();
          return; 
        }

        // override is false now
        // SKIPPING case
        // only one student means cancel
        if (selectedStudents.length === 1) {
          this.dialogRef.close(); 
          return;
        }

        // filter out the skipped students
        const roomStudents = selectedStudents.filter(s => (!skipped.includes(''+s.id)));
        // avoid no students case
        if (roomStudents.length === 0) {
          this.toastService.openToast({
            title: 'Skiping will left no students to operate on',
            subtitle: 'Last operation did not proceeed',
            type: 'error',
          });
          return;
        }

        this.formState.data.roomStudents = roomStudents; 
        this.formState.data.roomStudentsAfterFromStep = [...roomStudents]; 
        forwardAndEmit();
      }); 
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
