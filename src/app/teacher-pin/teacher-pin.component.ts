import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {UserService} from '../services/user.service';
import {Observable, of} from 'rxjs';
import {User} from '../models/User';
import {MatDialogRef} from '@angular/material/dialog';
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
        if (pin !== this.form.get('pin').value && this.form.get('pin').dirty) {
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
    this.userPin$.subscribe(res => {
      this.form = new FormGroup({
        pin: new FormControl(res, [
          Validators.required,
          Validators.minLength(4),
          Validators.pattern('^[0-9]*?[0-9]+$'),
          (fn) => fn.value.length < 4 ? { minPin: true } : null
        ])
      });
    });
  }

  save() {
    this.user$.pipe(
      take(1),
      switchMap(user => {
        return this.userService.updateUserRequest(user, this.form.value);
      })
    ).subscribe(() => {
      // this.close();
    });
  }

  close() {
    this.dialogRef.close();
  }

}
