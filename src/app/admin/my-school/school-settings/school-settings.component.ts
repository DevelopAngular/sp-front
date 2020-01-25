import {Component, OnDestroy, OnInit} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { HttpService } from '../../../services/http-service';
import * as moment from 'moment';
import { School } from '../../../models/School';
import {Subject} from 'rxjs';
import {filter, switchMap, takeUntil} from 'rxjs/operators';
import {MatDialogRef} from '@angular/material';
import {AdminService} from '../../../services/admin.service';

@Component({
  selector: 'app-school-settings',
  templateUrl: './school-settings.component.html',
  styleUrls: ['./school-settings.component.scss']
})
export class SchoolSettingsComponent implements OnInit, OnDestroy {

  schoolForm: FormGroup;
  school: any;

  changeForm: boolean;
  showSpinner: boolean;

  changeSettings$: Subject<any> = new Subject<any>();

  destroy$ = new Subject();

  constructor(
    private http: HttpService,
    private dialogRef: MatDialogRef<SchoolSettingsComponent>,
    private adminService: AdminService
  ) { }

  ngOnInit() {
    this.http.currentSchool$
      .pipe(takeUntil(this.destroy$))
      .subscribe((school: any) => {
      this.school = {
        ...school,
        name: school.name,
        launch_date: school.launch_date ? moment(school.launch_date).format('MMMM DD, YYYY') : 'Not launched',
        created: moment(school.created).format('MMMM DD, YYYY')
      };
    });
    this.schoolForm = new FormGroup({
      name: new FormControl()
    });

    this.schoolForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(res => {
      this.changeForm = res.name !== this.school.name;
    });

    this.changeSettings$.pipe(
      takeUntil(this.destroy$),
      switchMap(() => {
        return this.adminService.updateSchoolSettingsRequest(this.school, this.schoolForm.value);
      }),
      filter(res => !!res)
      )
      .subscribe((res) => {
        this.http.currentSchoolSubject.next(res);
        this.dialogRef.close();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  close() {
    this.dialogRef.close();
  }

  save()  {
    this.showSpinner = true;
    this.changeSettings$.next();
  }

}
