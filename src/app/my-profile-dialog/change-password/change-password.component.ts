import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CreateFormService } from '../../create-hallpass-forms/create-form.service';
import { BehaviorSubject } from 'rxjs';
import { User } from '../../models/User';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {Router} from '@angular/router';
import {UserService} from '../../services/user.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {

  @Input() user: User;

  @Output() back: EventEmitter<any> = new EventEmitter<any>();

  frameMotion$: BehaviorSubject<any>;
  form: FormGroup;
  showOldPasswordInput: boolean;

  constructor(
    private formService: CreateFormService,
    private router: Router,
    private userService: UserService
    ) { }

  get isAdmin() {
    return this.user && this.user.roles.includes('_profile_admin');
  }

  get isSaveButton() {
    if (!this.showOldPasswordInput) {
      return this.form.get('newPassword').valid;
    } else {
      return this.form.valid;
    }
  }

  ngOnInit() {
    this.frameMotion$ = this.formService.getFrameMotionDirection();
    this.showOldPasswordInput = !this.router.url.includes('/admin');
    this.form = new FormGroup({
      oldPassword: new FormControl('', [Validators.required]),
      newPassword: new FormControl('', [
        Validators.required,
        Validators.minLength(8)
      ])
    });
  }

  updateUserPassword() {
    this.userService.updateUser(this.user.id, {password: this.form.get('newPassword').value})
      .subscribe(res => {
        console.log('Update Success');
      });
  }

}
