import {Component, OnDestroy, OnInit} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {MatDialogRef} from '@angular/material';
import {AdminService} from '../../services/admin.service';
import {Observable, Subject} from 'rxjs';
import {School} from '../../models/School';
import {mapTo, switchMap, takeUntil} from 'rxjs/operators';
import {HttpService} from '../../services/http-service';

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
      debugger;
        this.buildForm();
    });
    this.initialState = this.schoolForm.value;
    this.schoolForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(res => {
      this.changeForm = res.display_card_room !== this.initialState.display_card_room || +res.pass_buffer_time !== +this.initialState.pass_buffer_time;
    });
    this.changeSettings$.pipe(
        takeUntil(this.destroy$),
        switchMap(() => {
          return this.adminService.updateSchoolSettings(this.currentSchool.id, this.schoolForm.value);
    })).subscribe(console.log);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  buildForm() {
    this.schoolForm = new FormGroup({
        display_card_room: new FormControl(true),
        pass_buffer_time: new FormControl(20,
            [Validators.pattern('^[0-9]*?[0-9]+$'), Validators.max(59), Validators.min(0)])
    });
  }

  save() {
    this.changeSettings$.next();
  }

  close() {
    this.dialogRef.close();
  }

}
