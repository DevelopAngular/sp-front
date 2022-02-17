import {Component, Inject, OnInit} from '@angular/core';
import {UserService} from '../services/user.service';
import {HttpService} from '../services/http-service';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {User} from '../models/User';
import {School} from '../models/School';
import {NextStep} from '../animations';
import {CreateFormService} from '../create-hallpass-forms/create-form.service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

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
    public dialogRef: MatDialogRef<MyProfileDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any
  ) { }

  ngOnInit() {
    this.frameMotion$ = this.formService.getFrameMotionDirection();
    if (this.data && this.data['target'] && this.data['target'] === 'password') {
      this.user$ = of(this.data['profile']);
      this.page = 2;
    } else {
      this.user$ = this.userService.user$;
      this.schools$ = this.http.schoolsCollection$;
    }
  }

  nextStep() {
    this.formService.setFrameMotionDirection();
    setTimeout(() => {
      this.page = 2;
    }, 100);
  }

  back() {
    if (this.data['target'] && this.data['target'] === 'password') {
      this.dialogRef.close();
    } else {
      this.formService.setFrameMotionDirection('back');
      setTimeout(() => {
        this.page = 1;
      }, 100);
    }
  }

}
