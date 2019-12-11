import {Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {fromEvent, of, Subject} from 'rxjs';
import { isNaN } from 'lodash';
import { RequestsService } from '../services/requests.service';
import {catchError, mapTo, switchMap, takeUntil} from 'rxjs/operators';

@Component({
  selector: 'app-teacher-pin-student',
  templateUrl: './teacher-pin-student.component.html',
  styleUrls: ['./teacher-pin-student.component.scss']
})
export class TeacherPinStudentComponent implements OnInit, OnDestroy {

  @Input() requestId: string;

  @Output() pinResult: EventEmitter<any> = new EventEmitter<any>();
  @Output() blurEvent: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild('inp') inp: ElementRef;

  pin: string = '';

  destroy$: Subject<any> = new Subject<any>();

  circles = [
    {id: 1, pressed: false},
    {id: 2, pressed: false},
    {id: 3, pressed: false},
    {id: 4, pressed: false}
  ];

  attempts: number = 5;

  incorrect: boolean;

  constructor(private requestService: RequestsService) { }

  ngOnInit() {
    this.inp.nativeElement.focus();
    fromEvent(this.inp.nativeElement, 'keyup')
      .pipe(
        takeUntil(this.destroy$),
        switchMap((event: KeyboardEvent) => {
          if (!isNaN(parseFloat(event.key)) && (event.target as any).id === this.requestId) {
            this.pin += event.key;
            if (this.pin.length <= 4) {
              const currentElem = this.circles.find(c => c.id === this.pin.length);
              currentElem.pressed = true;
            }
            if (this.pin.length === 4) {
              return this.requestService.acceptRequest(this.requestId, {pin: this.pin})
                .pipe(
                  mapTo(true),
                  catchError(error => {
                    this.incorrect = true;
                    this.attempts -= 1;
                    if (this.attempts > 0) {
                      setTimeout(() => {
                        this.pin = '';
                        this.circles.forEach(circle => {
                          circle.pressed = false;
                        });
                        this.incorrect = false;
                      }, 300);
                    } else {
                      return this.requestService.cancelRequest(this.requestId).pipe(mapTo(true));
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
        if (data) {
          this.pinResult.emit(data);
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
