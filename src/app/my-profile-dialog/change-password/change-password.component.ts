import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {CreateFormService} from '../../create-hallpass-forms/create-form.service';
import {BehaviorSubject, iif, of, Subject} from 'rxjs';
import {User} from '../../models/User';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {UserService} from '../../services/user.service';
import {catchError, map, takeUntil, tap} from 'rxjs/operators';
import {HttpService} from '../../services/http-service';
import {ToastService} from '../../services/toast.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit, OnDestroy {

  @Input() user: User;
  me: User;

  @Output() back: EventEmitter<any> = new EventEmitter<any>();
  @Output() cancel: EventEmitter<any> = new EventEmitter<any>();

  frameMotion$: BehaviorSubject<any>;
  form: FormGroup;
  showOldPasswordInput: boolean;
  errorMessage$: BehaviorSubject<string> = new BehaviorSubject<string>(null);

  destroy$: Subject<any> = new Subject<any>();

  constructor(
    private formService: CreateFormService,
    private router: Router,
    private userService: UserService,
    private http: HttpService,
    private toast: ToastService
    ) { }

  get isSelf() {
    return this.me.id === this.user.id;
  }

  get isSaveButton() {
    if (!this.showOldPasswordInput) {
      return this.form.get('newPassword').valid;
    } else {
      return this.form.valid && this.form.get('newPassword').value !== this.form.get('oldPassword').value;
    }
  }

  ngOnInit() {
    this.userService.user$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.me = user;
    });
    this.frameMotion$ = this.formService.getFrameMotionDirection();
    this.showOldPasswordInput = this.isSelf;
    this.form = new FormGroup({
      oldPassword: new FormControl('', [Validators.required]),
      newPassword: new FormControl('', [
        Validators.required,
        Validators.minLength(8)
      ])
    });
    this.form.valueChanges.subscribe(() => {
      this.errorMessage$.next(null);
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  updateUserPassword() {
    iif(
      () => !this.isSelf,
      this.userService.updateUser(this.user.id, {password: this.form.get('newPassword').value}),
      this.userService.updateUser(this.user.id, {
        password: this.form.get('newPassword').value,
        current_password: this.form.get('oldPassword').value})
    ).pipe(
      tap(() => {
        this.cancel.emit();
      }),
      map(() => {
        this.toast.openToast({
          title: 'Account password changed',
          type: 'success'
        });
      }),
      catchError(error => {
        if (error.error.errors.indexOf('password is incorrect') !== -1 || error.error.errors.indexOf('key `current_password` is required') !== -1) {
          this.errorMessage$.next('Current password is incorrect.');
          // this.http.errorToast$.next(null);
        }
        return of(null);
      })
    ).subscribe();
  }

}
