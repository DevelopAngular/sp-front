import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef, MatDialogState} from '@angular/material/dialog';
import {HallPassLimit, StudentPassLimit} from '../models/HallPassLimits';
import {User} from '../models/User';
import {Router} from '@angular/router';
import {PassLimitService} from '../services/pass-limit.service';
import {Observable} from 'rxjs';
import {FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators} from '@angular/forms';
import {PassLimitInputComponent} from '../pass-limit-input/pass-limit-input.component';
import {concatMap, map, switchMap} from 'rxjs/operators';
import {MatTabGroup} from '@angular/material/tabs';

const individualPassLimitRangeValidator = (): ValidatorFn => (form: FormGroup): ValidationErrors => {
  if (form.value['passLimit'] === 'Unlimited') {
    return null;
  }
  const num = parseInt(form.value['passLimit'], 10);
  if (num === NaN) {
    return {format: true};
  }
  if (num < -2 || num > 50) {
    return {range: true};
  }
  return null;
};

@Component({
  selector: 'app-pass-limit-student-info',
  templateUrl: './pass-limit-student-info.component.html',
  styleUrls: ['./pass-limit-student-info.component.scss']
})
export class PassLimitStudentInfoComponent implements OnInit {
  isAdmin: boolean;
  individualEditButton: boolean;
  schoolEditButton: boolean;

  requestLoading = false;
  passLimitForm = new FormGroup({
    passLimit: new FormControl(null, [Validators.required, Validators.pattern(/^([1-9]\d*)$|^(0){1}$|^(Unlimited)$/)]),
    description: new FormControl(null)
  }, individualPassLimitRangeValidator());
  passLimitFormLastValue = { passLimit: null, description: '' };
  passLimitFormChanged: Observable<boolean>;
  contentLoading = true;
  schoolPassLimit: HallPassLimit;

  @ViewChild('tabGroup') tabGroup: MatTabGroup;
  @ViewChild('passLimitInput') passLimitInput: PassLimitInputComponent;

  constructor(
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public data: { studentPassLimit: StudentPassLimit, user: User },
    private dialogRef: MatDialogRef<PassLimitStudentInfoComponent>,
    private passLimitsService: PassLimitService
  ) { }

  ngOnInit(): void {
    this.isAdmin = this.data.user.roles.includes('manage_school');
    console.log(this.data.studentPassLimit);
    this.schoolEditButton = this.data.studentPassLimit.schoolPassLimitEnabled;
    this.individualEditButton = this.data.studentPassLimit.isIndividual;
    this.passLimitsService.getPassLimit().subscribe({
      next: pl => {
        this.schoolPassLimit = pl.pass_limit;
      }
    });
    this.passLimitFormChanged = this.passLimitForm.statusChanges.pipe(
      switchMap(() => this.passLimitForm.valueChanges),
      map(v => {
        if (!v.passLimit) {
          v.passLimit = null;
        }
        return JSON.stringify(v) !== JSON.stringify(this.passLimitFormLastValue);
      })
    );
  }

  navigateToAdminPage() {
    this.dialogRef.close();
    const urlTree = this.router.createUrlTree(
      ['app', 'admin', 'accounts', '_profile_student'],
      {queryParams: {'pass-limits': ''}}
    );
    const url = this.router.serializeUrl(urlTree);
    window.open(url, '_blank');
  }

  loadForm() {
    const value = {
      passLimit: this.data?.studentPassLimit?.passLimit || null,
      description: this.data?.studentPassLimit?.description || null
    };
    this.passLimitFormLastValue = value;
    this.passLimitForm.patchValue(value);
    this.tabGroup.selectedIndex = 1;
  }

  backToHomePage() {
    this.passLimitFormLastValue = {
      passLimit: null,
      description: null
    };
    this.passLimitForm.reset();
    this.tabGroup.selectedIndex = 0;
  }

  updatePassLimits() {
    const parsedForm = {
      passLimit: this.passLimitForm.value.passLimit === 'Unlimited'
        ? -2
        : parseInt(this.passLimitForm.value.passLimit, 10),
      description: (this.passLimitForm?.value?.description || '').trim()
    };

    this.requestLoading = true;
    this.passLimitsService
      .updateIndividualLimit({
        ...parsedForm,
        students: [this.data.studentPassLimit.student.id]
      })
      .pipe(concatMap(() => this.passLimitsService.getStudentPassLimit(this.data.studentPassLimit.student.id)))
      .subscribe({
        next: (res) => {
          this.data.studentPassLimit = res;
          this.backToHomePage();
        },
        error: err => {
          this.requestLoading = false;
        }
    });
  }

  resetPassLimitsForm() {
    this.passLimitForm.patchValue(this.passLimitFormLastValue);
    if (this.passLimitInput?.passLimitDropdownRef?.getState() === MatDialogState.OPEN) {
      this.passLimitInput.passLimitDropdownRef.close();
    }
  }

}
