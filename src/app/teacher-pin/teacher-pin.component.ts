import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {UserService} from '../services/user.service';
import {Observable, of} from 'rxjs';
import {User} from '../models/User';
import {MatDialogRef} from '@angular/material';
import {switchMap, take} from 'rxjs/operators';

@Component({
  selector: 'app-teacher-pin',
  templateUrl: './teacher-pin.component.html',
  styleUrls: ['./teacher-pin.component.scss']
})
export class TeacherPinComponent implements OnInit {

  form: FormGroup;
  user$: Observable<User>;
  userPin$: Observable<string | number>;

  constructor(
    private userService: UserService,
    private dialogRef: MatDialogRef<TeacherPinComponent>,
    ) { }

  get pinData$() {
    return this.userPin$.pipe(
      take(1),
      switchMap(pin => {
        if (this.form.valid && pin !== this.form.get('pin').value) {
          return of(this.form.value);
        } else {
          return of(null);
        }
      })
    );
  }

  ngOnInit() {
    this.user$ = this.userService.user$;
    this.userPin$ = this.userService.userPin$;
    this.form = new FormGroup({
      pin: new FormControl('', [
        Validators.required,
        Validators.minLength(4)
      ])
    });

    this.dialogRef.backdropClick().subscribe(res => {
      this.close();
    });
  }

  close() {
    this.dialogRef.close(this.pinData$);
  }

}
