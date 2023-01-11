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
import { fromEvent, of, Subject } from 'rxjs';
import {isNaN} from 'lodash';
import {RequestsService} from '../services/requests.service';
import { catchError, concatMap, mapTo, switchMap, takeUntil } from 'rxjs/operators';
import {StorageService} from '../services/storage.service';
import {Request} from '../models/Request';
import {PassLimitService} from '../services/pass-limit.service';
import {HttpErrorResponse} from '@angular/common/http';
import {MatDialog} from '@angular/material/dialog';
import {ToastService} from '../services/toast.service';
import { EncounterPreventionService } from '../services/encounter-prevention.service'

/*
 * TODO: Restructure component
 *  This component should only tell if the teacher's pin was entered correctly or not
 *  It shouldn't have any request or pass limit logic in here.
 */

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
  @ViewChild('confirmDialogBody') confirmDialogBody: TemplateRef<HTMLElement>;

  incorrect: boolean;
  passLimit: number;
  pin = '';
  attempts = 5;
  destroy$ = new Subject<any>();
  circles = [false, false, false, false];

  constructor(
    private requestService: RequestsService,
    private cdr: ChangeDetectorRef,
    private storage: StorageService,
    private passLimitsService: PassLimitService,
    private dialog: MatDialog,
    private toastService: ToastService,
    private encounterService: EncounterPreventionService
  ) {
  }

  ngOnInit() {
    if (this.storage.getItem('pinAttempts') && JSON.parse(this.storage.getItem('pinAttempts'))[this.requestId]) {
      this.attempts = JSON.parse(this.storage.getItem('pinAttempts'))[this.requestId];
    }
    this.inp.nativeElement.focus();
    fromEvent(this.inp.nativeElement, 'keyup')
      .pipe(
        takeUntil(this.destroy$),
        switchMap((event: KeyboardEvent) => {
          console.log(event.code);
          this.cdr.detectChanges();
          const isNumberKeyPressed = !isNaN(parseFloat(event.key));
          const idMatch = +(event.target as any).id === +this.requestId;

          if (event.code === 'Backspace') {
            this.pin = this.pin.slice(0, this.pin.length - 1);
            this.circles[this.pin.length] = false;
            this.cdr.detectChanges();
            return of(null);
          }

          if (isNumberKeyPressed && idMatch) {
            this.pin += event.key;


            if (this.pin.length <= 4) {
              this.circles[this.pin.length - 1] = true;
              this.cdr.detectChanges();
            }

            if (this.pin.length === 4) {
              return this.requestService.checkLimits({teacher_pin: this.pin}, this.request, this.confirmDialogBody).pipe(
                concatMap((httpBody) => this.requestService.acceptRequest(this.request.id, httpBody)),
                catchError((err: Error) => {
                  if (err instanceof HttpErrorResponse && err?.error?.conflict_student_ids) {
                    this.encounterService.showEncounterPreventionToast({
                      exclusionPass: this.request,
                      isStaff: true
                    })
                    return of('encounter prevention');
                  } else if (err.message === 'override cancelled') {
                    this.clearPin();
                    this.pinResult.emit(false);
                  } else {
                    return this.handleIncorrectPin();
                  }

                  return of(null);
                })
              );
            }
          }

          return of(null);
        }),
      )
      .subscribe((data) => {
        if (!data) {
          this.cdr.detectChanges();
          return;
        }

        if (data === 'encounter prevention') {
          this.pinResult.emit(data);
          return;
        }

        const storageData = JSON.parse(this.storage.getItem('pinAttempts'));
        if (storageData && storageData[this.requestId] === 0) {
          delete storageData[this.requestId];
          this.storage.setItem('pinAttempts', JSON.stringify({...storageData}));
        }
        this.pinResult.emit(data);
      });
  }

  private handleIncorrectPin() {
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
      this.clearPin();
      this.blur();
    } else {
      return this.requestService.cancelRequest(this.requestId).pipe(mapTo(true));
    }
    this.cdr.detectChanges();
    return of(null);
  }

  private clearPin() {
    setTimeout(() => {
      this.pin = '';
      this.circles = [false, false, false, false];
      this.cdr.detectChanges();
      this.incorrect = false;
    }, 300);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  blur() {
    this.inp.nativeElement.focus();
  }

}
