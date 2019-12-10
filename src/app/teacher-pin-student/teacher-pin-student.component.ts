import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {fromEvent, of} from 'rxjs';
import { isNaN } from 'lodash';
import {RequestsService} from '../services/requests.service';
import {catchError, filter, finalize, map, mapTo, switchMap, tap} from 'rxjs/operators';

@Component({
  selector: 'app-teacher-pin-student',
  templateUrl: './teacher-pin-student.component.html',
  styleUrls: ['./teacher-pin-student.component.scss']
})
export class TeacherPinStudentComponent implements OnInit {

  @Input() requestId: string;

  @Output() pinResult: EventEmitter<any> = new EventEmitter<any>();
  @Output() blurEvent: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild('inp') inp: ElementRef;

  pin: string = '';

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
        switchMap((event: KeyboardEvent) => {
          if (!isNaN(parseFloat(event.key)) && (event.target as any).id === this.requestId) {
            this.pin += event.key;
            if (this.pin.length <= 4) {
              const currentElem = this.circles.find(c => c.id === this.pin.length);
              currentElem.pressed = true;
            }
            if (this.pin.length === 4) {
              // ToDO request to server after that clear pin
              // debugger;
              return this.requestService.acceptRequest(this.requestId, {teacher_pin: this.pin})
                .pipe(
                  mapTo(true),
                  catchError(error => {
                    // debugger;
                    this.incorrect = true;
                    if (this.attempts !== 0) {
                      setTimeout(() => {
                        this.pin = '';
                        this.attempts -= 1;
                        this.circles.forEach(circle => {
                          circle.pressed = false;
                        });
                        this.incorrect = false;
                      }, 1000);
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
        // this.pinResult.emit(data);
      });
  }

  blur() {
    this.inp.nativeElement.focus();
  }

}
