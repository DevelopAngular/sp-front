import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output, TemplateRef,
  ViewChild
} from '@angular/core';
import {fromEvent, of, Subject} from 'rxjs';
import {isNaN} from 'lodash';
import {RequestsService} from '../services/requests.service';
import {catchError, concatMap, mapTo, switchMap, takeUntil} from 'rxjs/operators';
import {StorageService} from '../services/storage.service';
import {Request} from '../models/Request';
import {PassLimitService} from '../services/pass-limit.service';
import {HttpErrorResponse} from '@angular/common/http';
import {MatDialog} from '@angular/material/dialog';
import {
  ConfirmationDialogComponent,
  ConfirmationTemplates
} from '../shared/shared-components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-teacher-pin-student',
  templateUrl: './teacher-pin-student.component.html',
  styleUrls: ['./teacher-pin-student.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TeacherPinStudentComponent implements OnInit, OnDestroy {

  @Input() request: Request;
  @Input() requestId: string;

  @Output() pinResult: EventEmitter<any> = new EventEmitter<any>();
  @Output() blurEvent: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild('inp', {static: true}) inp: ElementRef;
  @ViewChild('ConfirmDialogBody') confirmDialogBody: TemplateRef<HTMLElement>;

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
    private dialog: MatDialog
  ) {
  }

  // TODO: Clean up this code
  ngOnInit() {
    this.passLimitsService.getPassLimit().subscribe(pl => {
      this.passLimit = pl.pass_limit.passLimit;
      console.log(this.passLimit);
    });
    if (this.storage.getItem('pinAttempts') && JSON.parse(this.storage.getItem('pinAttempts'))[this.requestId]) {
      this.attempts = JSON.parse(this.storage.getItem('pinAttempts'))[this.requestId];
    }
    this.inp.nativeElement.focus();
    fromEvent(this.inp.nativeElement, 'keyup')
      .pipe(
        takeUntil(this.destroy$),
        switchMap((event: KeyboardEvent) => {
          this.cdr.detectChanges();
          if (!isNaN(parseFloat(event.key)) && (event.target as any).id === this.requestId) {
            this.pin += event.key;
            if (this.pin.length <= 4) {
              const currentElem = this.circles.find(c => c.id === this.pin.length);
              currentElem.pressed = true;
            }
            if (this.pin.length >= 4) {
              this.cdr.detectChanges();
              return this.requestService.acceptRequest(this.requestId, {teacher_pin: this.pin})
                .pipe(
                  mapTo(true),
                  catchError((error: HttpErrorResponse) => {
                    if (error.error.detail === 'Override confirmation needed') {
                      const overrideDialogRef = this.dialog.open<ConfirmationDialogComponent, ConfirmationTemplates, boolean>(ConfirmationDialogComponent, {
                        panelClass: 'overlay-dialog',
                        backdropClass: 'custom-backdrop',
                        closeOnNavigation: true,
                        data: {
                          body: this.confirmDialogBody,
                          buttons: {
                            confirmText: 'Override',
                            denyText: 'Cancel'
                          },
                          templateData: {
                            student: this.request.student,
                            passLimit: this.passLimit
                          }
                        } as ConfirmationTemplates
                      });
                      return overrideDialogRef.afterClosed().pipe(concatMap((override) => {
                        return this.requestService.acceptRequest(this.requestId, {
                          teacher_pin: this.pin,
                          override: true
                        }).pipe(mapTo(override));
                      }));
                    }
                    this.incorrect = true;
                    this.attempts -= 1;
                    if (this.storage.getItem('pinAttempts')) {
                      this.storage.setItem('pinAttempts', JSON.stringify({
                        ...JSON.parse(this.storage.getItem('pinAttempts')),
                        [this.requestId]: this.attempts
                      }));
                    } else {
                      this.storage.setItem('pinAttempts', JSON.stringify({[this.requestId]: this.attempts}));
                    }
                    if (this.attempts > 0) {
                      setTimeout(() => {
                        this.pin = '';
                        this.circles.forEach(circle => {
                          circle.pressed = false;
                          this.cdr.detectChanges();
                        });
                        this.incorrect = false;
                      }, 300);
                    } else {
                      return this.requestService.cancelRequest(this.requestId).pipe(mapTo(true));
                    }
                    this.cdr.detectChanges();
                    return of(null);
                  })
                );
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
        if (data) {
          const storageData = JSON.parse(this.storage.getItem('pinAttempts'));
          if (storageData && storageData[this.requestId] === 0) {
            delete storageData[this.requestId];
            this.storage.setItem('pinAttempts', JSON.stringify({...storageData}));
          }
          this.pinResult.emit(data);
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
