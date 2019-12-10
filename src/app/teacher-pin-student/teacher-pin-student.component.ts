import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {fromEvent} from 'rxjs';
import * as _ from 'lodash';
import {UserService} from '../services/user.service';
import {take} from 'rxjs/operators';

@Component({
  selector: 'app-teacher-pin-student',
  templateUrl: './teacher-pin-student.component.html',
  styleUrls: ['./teacher-pin-student.component.scss']
})
export class TeacherPinStudentComponent implements OnInit {

  @Input() requestId: string;

  @Output() pinResult: EventEmitter<string> = new EventEmitter<string>();
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

  constructor(private userService: UserService) { }

  ngOnInit() {
    this.inp.nativeElement.focus();
    fromEvent(this.inp.nativeElement, 'keyup')
      .subscribe((event: KeyboardEvent) => {
      if (!_.isNaN(parseFloat(event.key)) && (event.target as any).id === this.requestId) {
        this.pin += event.key;
        if (this.pin.length <= 4) {
          const currentElem = this.circles.find(c => c.id === this.pin.length);
          currentElem.pressed = true;
        }
        if (this.pin.length === 4) {
          // ToDO request to server after that clear pin
          this.incorrect = true;
          setTimeout(() => {
            this.pin = '';
            this.attempts -= 1;
            this.circles.forEach(circle => {
              circle.pressed = false;
            });
            this.incorrect = false;
          }, 1000);
        }
      }
    });
  }

  blur() {
    this.inp.nativeElement.focus();
  }

}
