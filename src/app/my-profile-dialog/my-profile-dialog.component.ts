import {Component, OnInit} from '@angular/core';
import {UserService} from '../services/user.service';
import {HttpService} from '../services/http-service';
import {BehaviorSubject, Observable} from 'rxjs';
import {User} from '../models/User';
import {School} from '../models/School';
import {NextStep} from '../animations';
import {CreateFormService} from '../create-hallpass-forms/create-form.service';
import {MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-my-profile-dialog',
  templateUrl: './my-profile-dialog.component.html',
  styleUrls: ['./my-profile-dialog.component.scss'],
  animations: [NextStep]
})
export class MyProfileDialogComponent implements OnInit {

  public user$: Observable<User>;
  public schools$: Observable<School[]>;
  public page: number = 1;
  public frameMotion$: BehaviorSubject<any>;

  constructor(
    private userService: UserService,
    private http: HttpService,
    private formService: CreateFormService,
    public dialogRef: MatDialogRef<MyProfileDialogComponent>
  ) { }

  ngOnInit() {
    this.frameMotion$ = this.formService.getFrameMotionDirection();
    this.user$ = this.userService.user$;
    this.schools$ = this.http.schoolsCollection$;
  }

  nextStep() {
    this.formService.setFrameMotionDirection();
    setTimeout(() => {
      this.page = 2;
    }, 100);
  }

  back() {
    this.formService.setFrameMotionDirection('back');
    setTimeout(() => {
      this.page = 1;
    }, 100);
  }

}
