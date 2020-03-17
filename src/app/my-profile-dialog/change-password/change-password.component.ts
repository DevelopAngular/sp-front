import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CreateFormService } from '../../create-hallpass-forms/create-form.service';
import { BehaviorSubject } from 'rxjs';
import { User } from '../../models/User';
import {FormControl, FormGroup, Validators} from '@angular/forms';

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

  ngOnInit() {
    this.frameMotion$ = this.formService.getFrameMotionDirection();
    this.form = new FormGroup({
      oldPassword: new FormControl(''),
      newPassword: new FormControl('', [
        Validators.required,
        Validators.minLength(8)
      ])
    });
  }

}
