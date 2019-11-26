import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import {UserService} from '../services/user.service';
import {Observable} from 'rxjs';
import {User} from '../models/User';
import {switchMap} from 'rxjs/operators';

@Component({
  selector: 'app-teacher-pin',
  templateUrl: './teacher-pin.component.html',
  styleUrls: ['./teacher-pin.component.scss']
})
export class TeacherPinComponent implements OnInit {

  form: FormGroup;
  user$: Observable<User>;

  constructor(private userService: UserService) { }

  ngOnInit() {
    this.user$ = this.userService.user$;
    this.form = new FormGroup({
      pin: new FormControl()
    });
    //
    // this.form.valueChanges
    //   .pipe(
    //     switchMap(value => {
    //       debugger;
    //       return this.userService.postUser({secret_pin: +value.pin});
    //     })
    //   ).subscribe(res => {
    //     debugger;
    // });
  }

}
