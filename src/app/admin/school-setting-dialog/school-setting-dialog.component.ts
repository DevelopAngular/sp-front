import {Component, OnDestroy, OnInit} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material';
import { AdminService } from '../../services/admin.service';
import { Subject } from 'rxjs';
import { School } from '../../models/School';
import {map, switchMap, takeUntil} from 'rxjs/operators';
import { HttpService } from '../../services/http-service';

@Component({
  selector: 'app-school-setting-dialog',
  templateUrl: './school-setting-dialog.component.html',
  styleUrls: ['./school-setting-dialog.component.scss']
})
export class SchoolSettingDialogComponent implements OnInit, OnDestroy {

  schoolForm: FormGroup;
  currentSchool: School;
  initialState: { display_card_room: boolean, pass_buffer_time: string | number };
  changeForm: boolean;
  showSpinner: boolean;

  changeSettings$ = new Subject();
  destroy$ = new Subject();

  constructor(
      private dialogRef: MatDialogRef<SchoolSettingDialogComponent>,
      private adminService: AdminService,
      private http: HttpService
  ) { }

  ngOnInit() {
    this.http.currentSchool$.pipe(takeUntil(this.destroy$)).subscribe(school => {
      this.currentSchool = school;
      this.buildForm(this.currentSchool);
    });
    this.initialState = this.schoolForm.value;
    this.schoolForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(res => {
      this.changeForm = res.display_card_room !== this.initialState.display_card_room || +res.pass_buffer_time !== +this.initialState.pass_buffer_time;
    });
    this.changeSettings$.pipe(
        takeUntil(this.destroy$),
        switchMap(() => {
          return this.adminService.updateSchoolSettings(this.currentSchool.id, this.schoolForm.value);
        }),
        switchMap(() => {
          return this.adminService.getSchools();
        }),
        map(schools => {
          return schools.find(school => school.id === this.currentSchool.id);
        }))
        .subscribe((res) => {
          this.http.currentSchoolSubject.next(res);
          this.dialogRef.close();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  buildForm(school) {
    this.schoolForm = new FormGroup({
        display_card_room: new FormControl(school.display_card_room),
        pass_buffer_time: new FormControl(school.pass_buffer_time || 0,
            [
                Validators.required,
                Validators.pattern('^[0-9]*?[0-9]+$'),
                Validators.max(60),
                Validators.min(0)])
    });
  }

  save() {
    this.showSpinner = true;
    this.changeSettings$.next(null);
  }

  close() {
    this.dialogRef.close();
  }

}
