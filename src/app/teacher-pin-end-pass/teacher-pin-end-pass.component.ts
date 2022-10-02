import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { fromEvent, of, Subject } from 'rxjs';
import { catchError, concatMap, mapTo, switchMap, takeUntil } from 'rxjs/operators';
import { HallPass } from '../models/HallPass';
import { Request } from '../models/Request';
import { User } from '../models/User';
import { HallPassesService } from '../services/hall-passes.service';
import { PassLimitService } from '../services/pass-limit.service';
import { RequestsService } from '../services/requests.service';
import { StorageService } from '../services/storage.service';
import { ToastService } from '../services/toast.service';
import { ConfirmationDialogComponent, ConfirmationTemplates, RecommendedDialogConfig } from '../shared/shared-components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-teacher-pin-end-pass',
  templateUrl: './teacher-pin-end-pass.component.html',
  styleUrls: ['./teacher-pin-end-pass.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TeacherPinEndPassComponent implements OnInit, OnDestroy {

  @Input() request: Request;
  @Input() pass: HallPass;
  @Input() selectedTeacher: User;
  @Input() requestId: string;

  @Output() pinResult: EventEmitter<any> = new EventEmitter<any>();
  @Output() blurEvent: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild('inp', {static: true}) inp: ElementRef;
  @ViewChild('confirmDialogBody') confirmDialogBody: TemplateRef<HTMLElement>;

  incorrect: boolean;
  passLimit: number;
  pin = '';
  attempts = 5;
  destroy$ = new Subject<any>();
  circles = [
    {id: 1, pressed: false},
    {id: 2, pressed: false},
    {id: 3, pressed: false},
    {id: 4, pressed: false}
  ];

  constructor(
    private requestService: RequestsService,
    private cdr: ChangeDetectorRef,
    private storage: StorageService,
    private passLimitsService: PassLimitService,
    private dialog: MatDialog,
    private toastService: ToastService,
    private hallPassService: HallPassesService,
  ) { }

  ngOnInit(): void {
    console.log("selectedTeacher : ", this.selectedTeacher);
    this.passLimitsService.getPassLimit().subscribe(pl => {
      if (pl.pass_limit !== null) {
        this.passLimit = pl.pass_limit.passLimit;
      }
    });
    this.inp.nativeElement.focus();
    fromEvent(this.inp.nativeElement, 'keyup')
      .pipe(
        takeUntil(this.destroy$),
        switchMap((event: KeyboardEvent) => {
          this.cdr.detectChanges();
          if (!isNaN(parseFloat(event.key)) && +(event.target as any).id === +this.pass.id) {
            this.pin += event.key;
            if (this.pin.length <= 4) {
              const currentElem = this.circles.find(c => c.id === this.pin.length);
              currentElem.pressed = true;
            }
            if (this.pin.length >= 4) {
              this.cdr.detectChanges();
              let body = {
                "teacher_pin": this.pin,
                "teacher_id": this.selectedTeacher.id
              };
              return this.hallPassService.endPassWithCheckIn(this.pass.id, body)
                .pipe(
                  mapTo(true),
                  catchError((error: HttpErrorResponse) => {
                    // if (error.error.detail == "teacher pin is incorrect") {
                    //     this.toastService.openToast({
                    //     title: 'teacher pin is incorrect',
                    //     type: 'error',
                    //   });
                    // }
                    // if ((error.error.detail as string).includes('There are active passes for users in same prevention group')) {
                    //   this.toastService.openToast({
                    //     title: 'Sorry, you can\'t start your pass right now.',
                    //     subtitle: 'Please try again later.',
                    //     type: 'error',
                    //     encounterPrevention: true,
                    //     exclusionPass: this.request
                    //   });
                    //   // the subscription function checks for this first and emits this so RequestCardComponent
                    //   // on Kiosk Mode can hide the teacher pin without closing the dialog
                    //   return of('encounter prevention');
                    // }
                    // if (error.error.detail === 'Override confirmation needed') {
                    //   const overrideDialogRef = this.dialog.open(ConfirmationDialogComponent, { 
                    //     ...RecommendedDialogConfig,
                    //     width: '450px',
                    //     data: {
                    //       headerText: `Student's Pass limit reached: ${this.request.student.display_name} has had ${this.passLimit}/${this.passLimit} passes today`,
                    //       buttons: {
                    //         confirmText: 'Override limit',
                    //         denyText: 'Cancel'
                    //       },
                    //       body: this.confirmDialogBody,
                    //       templateData: {},
                    //       icon: {
                    //         name: 'Pass Limit (White).svg',
                    //         background: '#6651F1'
                    //       }
                    //     } as ConfirmationTemplates
                    //   });
                    //   return overrideDialogRef.afterClosed().pipe(concatMap((override) => {
                    //     console.log(override);
                    //     if (!override) {
                    //       this.pinResult.emit();
                    //       return of(null);
                    //     }

                    //     return this.requestService.acceptRequest(this.requestId, {
                    //       teacher_pin: this.pin,
                    //       override: true
                    //     }).pipe(mapTo(true));
                    //   }));
                    // }
                    this.incorrect = true;
                    // this.attempts -= 1;
                    // if (this.storage.getItem('pinAttempts')) {
                    //   this.storage.setItem('pinAttempts', JSON.stringify({
                    //     ...JSON.parse(this.storage.getItem('pinAttempts')),
                    //     [this.requestId]: this.attempts
                    //   }));
                    // } else {
                    //   this.storage.setItem('pinAttempts', JSON.stringify({[this.requestId]: this.attempts}));
                    // }
                    // if (this.attempts > 0) {
                      setTimeout(() => {
                        this.pin = '';
                        this.circles.forEach(circle => {
                          circle.pressed = false;
                          this.cdr.detectChanges();
                        });
                        this.incorrect = false;
                      }, 300);
                    // } else {
                    //   return this.requestService.cancelRequest(this.requestId).pipe(mapTo(true));
                    // }
                    this.cdr.detectChanges();
                    return of(null);
                  })
                )
            }
          } else if (event.keyCode === 8) {
            this.pin = this.pin.slice(0, this.pin.length - 1);
            this.circles[this.pin.length].pressed = false;
            this.cdr.detectChanges();
            return of(null);
          }
          return of(null);
        }),
      )
      .subscribe((data) => {
        console.log("data : ", data);
        if (data) {
          // this.hallPassService.endPassRequest(this.pass.id);
          // if (data === 'encounter prevention') {
          //   this.pinResult.emit(data);
          //   return;
          // }

          // const storageData = JSON.parse(this.storage.getItem('pinAttempts'));
          // if (storageData && storageData[this.requestId] === 0) {
          //   delete storageData[this.requestId];
          //   this.storage.setItem('pinAttempts', JSON.stringify({...storageData}));
          // }
          // this.pinResult.emit(data);
        } else {
          this.cdr.detectChanges();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  blur() {
    this.inp.nativeElement.focus();
  }

}
