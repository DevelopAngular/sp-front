import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {MatDialogRef} from '@angular/material/dialog';
import {AdminService} from '../../services/admin.service';
import {Subject} from 'rxjs';
import {School} from '../../models/School';
import {filter, switchMap, takeUntil, take} from 'rxjs/operators';
import {HttpService} from '../../services/http-service';
import {ToastService} from '../../services/toast.service';

@Component({
  selector: 'app-school-setting-dialog',
  templateUrl: './school-setting-dialog.component.html',
  styleUrls: ['./school-setting-dialog.component.scss']
})
export class SchoolSettingDialogComponent implements OnInit, OnDestroy {

  schoolForm: FormGroup;
  currentSchool: School;
  initialState: {
    display_card_room: boolean,
    pass_buffer_time: string | number,
    show_active_passes_number: boolean,
    student_can_use_mobile: boolean,
  };

  changeForm: boolean;
  showSpinner: boolean;
  hideMin: boolean;

  changeSettings$ = new Subject();
  destroy$ = new Subject();

  constructor(
      private dialogRef: MatDialogRef<SchoolSettingDialogComponent>,
      private adminService: AdminService,
      private http: HttpService,
      private toast: ToastService,
  ) { }

  ngOnInit() {
    this.http.currentSchool$.pipe(filter(res => !!res), takeUntil(this.destroy$)).subscribe(school => {
      this.currentSchool = school;
      this.buildForm(this.currentSchool);
    });
    this.initialState = this.schoolForm.value;
    this.schoolForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(res => {
      this.changeForm = res.display_card_room !== this.initialState.display_card_room ||
        +res.pass_buffer_time !== +this.initialState.pass_buffer_time ||
         res.show_active_passes_number !== this.initialState.show_active_passes_number ||
         res.student_can_use_mobile !== this.initialState.student_can_use_mobile;

    });
    this.changeSettings$.pipe(
        takeUntil(this.destroy$),
        switchMap(() => {
          return this.adminService.updateSchoolSettingsRequest(this.currentSchool, this.schoolForm.value);
        }),
        )
        .subscribe((res) => {
         
          if(res) {
            this.http.currentSchoolSubject.next(res);
            this.dialogRef.close();
          }

      
          // TODO: (BUG) it opens multiple toasts 
          // doublingng the number every time
          /*this.toast.openToast({
            title: 'Success!',
            subtitle: 'Pass Options has successfully changed',
            type: 'success',
          });*/
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  buildForm(school: School) {
    this.schoolForm = new FormGroup({
        display_card_room: new FormControl(school.display_card_room),
        pass_buffer_time: new FormControl(school.pass_buffer_time || 0,
           [Validators.required,
            Validators.pattern('^[0-9]*?[0-9]+$'),
            Validators.max(60),
            Validators.min(0)]),
        show_active_passes_number: new FormControl(school.show_active_passes_number),
        student_can_use_mobile: new FormControl(school.student_can_use_mobile),
    });
  }

  save() {
    this.showSpinner = true;
     this.changeSettings$.next();
  }

  close() {
    this.dialogRef.close();
  }

}
