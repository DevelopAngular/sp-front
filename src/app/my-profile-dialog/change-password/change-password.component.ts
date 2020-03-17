import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CreateFormService } from '../../create-hallpass-forms/create-form.service';
import { BehaviorSubject } from 'rxjs';
import { User } from '../../models/User';
import { FormControl, FormGroup, Validators } from '@angular/forms';

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

  constructor(private formService: CreateFormService) { }

  get isAdmin() {
    return this.user && this.user.roles.includes('_profile_admin');
  }

  get isSaveButton() {
    if (this.isAdmin) {
      return this.form.get('newPassword').valid;
    } else {
      return this.form.valid;
    }
  }

  ngOnInit() {
    console.log(this.user);
    this.frameMotion$ = this.formService.getFrameMotionDirection();
    this.form = new FormGroup({
      oldPassword: new FormControl('', [Validators.required]),
      newPassword: new FormControl('', [
        Validators.required,
        Validators.minLength(8)
      ])
    });
  }

}
