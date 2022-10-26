import {Component, ElementRef, EventEmitter, HostListener, Inject, Input, OnInit, AfterViewInit, Output, ViewChild, TemplateRef} from '@angular/core';

import {Navigation} from '../../main-hall-pass-form.component';
import {Pinnable} from '../../../../models/Pinnable';
import {User} from '../../../../models/User';
import {Location} from '../../../../models/Location';
import {CreateFormService} from '../../../create-form.service';
import {Observable, BehaviorSubject, fromEvent, Subject, of} from 'rxjs';
import {filter, tap, takeUntil, withLatestFrom, map} from 'rxjs/operators';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {DeviceDetection} from '../../../../device-detection.helper';
import {LocationVisibilityService} from '../../location-visibility.service';
import {LocationsService} from '../../../../services/locations.service';
import {
  ConfirmationDialogComponent,
  ConfirmationTemplates
} from '../../../../shared/shared-components/confirmation-dialog/confirmation-dialog.component';
import {LocationTableComponent} from '../../../../location-table/location-table.component';
import {PollingEvent} from '../../../../services/polling-service';

@Component({
  selector: 'app-to-category',
  templateUrl: './to-category.component.html',
  styleUrls: ['./to-category.component.scss'],
})
export class ToCategoryComponent implements OnInit, AfterViewInit {
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
  @ViewChild('locationTable') locTableRef: LocationTableComponent;
  @Input() formState: Navigation;

  @Input() isStaff: boolean;

  @Input() date;

  @Input() studentText;

  @Input() fromLocation;

  @Output() locFromCategory: EventEmitter<any> = new EventEmitter<any>();

  @Output() backButton: EventEmitter<Navigation> = new EventEmitter<Navigation>();

  @ViewChild('confirmDialogBodyVisibility') confirmDialogVisibility: TemplateRef<HTMLElement>;

  pinnable: Pinnable;
  animationDirection: string = 'forward';

  frameMotion$: BehaviorSubject<any>;

  headerTransition = {
    'category-header': true,
    'category-header_animation-back': false
  };

  shadow: boolean = true;

  destroy$: Subject<any> = new Subject<any>();

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
    public dialogRef: MatDialogRef<ToCategoryComponent>,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    private visibilityService: LocationVisibilityService,
    private locationsService: LocationsService,
  ) { }

  get headerGradient() {
     const colors =  this.animationDirection === 'back' ? '#FFFFFF, #FFFFFF' :  this.formState.data.direction.pinnable.color_profile.gradient_color;
     return 'radial-gradient(circle at 98% 97%,' + colors + ')';
  }

  ngOnInit() {
    console.log(this.formState);
    this.frameMotion$ = this.formService.getFrameMotionDirection();
    this.fromLocation = this.formState.data.direction.from;
    this.pinnable = this.formState.data.direction.pinnable;
    this.frameMotion$.subscribe((v: any) => {
      switch (v.direction) {
        case 'back':
          this.headerTransition['category-header'] = false;
          this.headerTransition['category-header_animation-back'] = true;
          break;
        case 'forward':
          this.headerTransition['category-header'] = true;
          this.headerTransition['category-header_animation-back'] = false;
          break;
        default:
          this.headerTransition['category-header'] = true;
          this.headerTransition['category-header_animation-back'] = false;
      }
    });
    
    this.listenLocation$ = this.locationsService.listenLocationSocket().pipe(
      takeUntil(this.destroy$),
      filter((res: any | unknown & {data: any}) => (!!res && !('data' in res))),
      map(({data}) => data),
    );
    this.listenLocation$.subscribe();
  }

  listenLocation$: Observable<PollingEvent>;

  ngAfterViewInit() {
    // initialised here to make sure this.locTableRef is populated
    of(this.locTableRef).pipe(
      filter(Boolean),
      takeUntil(this.destroy$),
      withLatestFrom(this.listenLocation$),
      tap(([_, data]) => {
        try {
          // updated location sent via WS
          const loc: Location = Location.fromJSON(data);

          // check for a proper category pinnable
          const isCategory = (this.pinnable.type === 'category' && this.pinnable.location === null);
          if (!isCategory) {
            return;
          }
          // check for locations of a category pinnable 
          const pinn = <Pinnable | Pinnable & {myLocations: Location[]}>this.pinnable;
          if (!('myLocations' in pinn)) {
            return;
          }

          // is the location loc owned by pinnable?
          const found = pinn.myLocations.some((a: Location) => {
            return +a.id === +loc.id
          });
          // but belongs to category pinnable?
          const belongs = loc.category === pinn.category;
          if (!found && !belongs) {
            return;
          }
          
          // update choices
          let choices = pinn.myLocations;
          const updated = choices.map((x: Location) => {
            if (+x.id === +loc.id) {
              return loc;
            }
            return x;
          });

          // is a freshly added location
          if (!found && belongs) {
            updated.push(loc);
          }

          // update pinn
          pinn.myLocations = updated;
          // trigger RV filtering here
          this.locTableRef.choices = updated;

        } catch (e) {
          console.log(e);
        }
      }),
    ).subscribe();
}

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get selectedStudents(): User[] {
   return this.formState.data.roomStudents ?? this.formState.data.selectedStudents;
  }

  locationChosen(location) {
    const forwardAndEmit = () => {
      if (this.formState.formMode.role === 1) {
        this.formService.setFrameMotionDirection('disable');
      } else {
        this.formService.setFrameMotionDirection('forward');
      }

      setTimeout(() => {
        this.locFromCategory.emit(location);
      }, 100);
    };

    if (!this.isStaff) {
      forwardAndEmit();
      return;
    }

   // staff only
   const students = [...this.selectedStudents];
   // skipped are students that do not qualify to go forward     
   let skipped = this.visibilityService.calculateSkipped(students, location);

    if (skipped.length === 0) {
      forwardAndEmit();
      return;
    }

    let text =  'This room is only available to certain students';
    let names = this.selectedStudents.filter(s => skipped.includes(''+s.id)).map(s => s.display_name);
    let title =  'Student does not have permission to go to this room';
    let denyText =  'Skip';
    if (names.length > 1) {
      text = names?.join(', ') ?? 'This room is only available to certain students'
      title = 'These students do not have permission to go to this room:';
      denyText = 'Skip these students';
    } else {
      title = (names?.join(', ') ?? 'Student') + ' does not have permission to go to this room';
    }

    const roomStudents = this.selectedStudents.filter(s => (!skipped.includes(''+s.id)));
    const noStudentsCase = roomStudents.length === 0;
    
    if (noStudentsCase) denyText = 'Cancel';

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
        forwardAndEmit();
        return;
      }

      // SKIPPING case
      // avoid a certain no students case
      if (this.selectedStudents.length === 1) {
        this.dialogRef.close();
        return;
      }

      // filter out the skipped students
      const roomStudents = this.selectedStudents.filter(s => (!skipped.includes(''+s.id)));
      // avoid no students case
      if (noStudentsCase) {
        return;
      }

      this.formState.data.roomStudents = roomStudents;
      forwardAndEmit();
    });
  }

  back() {

    this.formService.setFrameMotionDirection('back');

    setTimeout(() => {
      this.formState.previousState = this.formState.state;
      this.formState.state -= 1;
      this.backButton.emit(this.formState);
    }, 100);
  }

  get isIOSTablet() {
    return DeviceDetection.isIOSTablet();
  }
}
