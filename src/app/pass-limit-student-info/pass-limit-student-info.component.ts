import {ChangeDetectorRef, Component, ElementRef, EventEmitter, Inject, Input, OnInit, Output, TemplateRef, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatDialogState} from '@angular/material/dialog';
import {HallPassLimit, StudentPassLimit} from '../models/HallPassLimits';
import {User} from '../models/User';
import {Router} from '@angular/router';
import {PassLimitService} from '../services/pass-limit.service';
import {BehaviorSubject, Observable} from 'rxjs';
import {FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators} from '@angular/forms';
import {PassLimitInputComponent} from '../pass-limit-input/pass-limit-input.component';
import {concatMap, filter, map, switchMap, tap} from 'rxjs/operators';
import {MatTabGroup} from '@angular/material/tabs';
import {AdminPassLimitDialogComponent} from '../admin-pass-limits-dialog/admin-pass-limits-dialog.component';
import {
  ConfirmationDialogComponent, ConfirmationTemplates,
  RecommendedDialogConfig
} from '../shared/shared-components/confirmation-dialog/confirmation-dialog.component';
import {CreateFormService} from '../create-hallpass-forms/create-form.service';
import {PassLimitFeedbackComponent} from '../pass-limit-feedback/pass-limit-feedback.component';

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
  @Input() set inputData(data: { studentPassLimit: StudentPassLimit, user: User }) {
    if (!data) {
      return;
    }
    this.data = data;
    if (this.data.studentPassLimit.passLimit === -2) {
      this.passLimitForm.patchValue({
        passLimit: 'Unlimited'
      });
    }
    this.setBordersAndButtons();
  }
  // TODO: come up with a better way of sharing this component
  @Input() isDialog = true; // this is not usually a good approach, literally anything is better than this

  isAdmin: boolean;
  individualEditButton: boolean;
  schoolEditButton: boolean;
  individualBorder: boolean;
  schoolLimitBorder: boolean;

  requestLoading = false;
  deleteLoading = false;
  passLimitForm = new FormGroup({
    passLimit: new FormControl(null, [Validators.required, Validators.pattern(/^([1-9]\d*)$|^(0){1}$|^(Unlimited)$/)]),
    description: new FormControl(null)
  }, individualPassLimitRangeValidator());
  passLimitFormLastValue = { passLimit: null, description: '' };
  passLimitFormChanged: Observable<boolean>;
  schoolPassLimit: HallPassLimit;
  frameMotion$: BehaviorSubject<any>;

  @ViewChild('tabGroup') tabGroup: MatTabGroup;
  @ViewChild('passLimitInput') passLimitInput: PassLimitInputComponent;
  @ViewChild('deleteDialogBody') deleteDialogBody: TemplateRef<HTMLElement>;
  @ViewChild(PassLimitFeedbackComponent) set feedbackPosition(comp: PassLimitFeedbackComponent) {
    const dialog = document.querySelector<HTMLElement>('mat-dialog-container');
    const feedback = document.querySelector<HTMLElement>('app-pass-limit-feedback');
    if (dialog && feedback) {
      const coords = dialog.getBoundingClientRect();
      feedback.style.top = `${(this.isDialog ? coords.bottom : coords.height) + 30}px`;
    }
  }

  @Output() backEmit = new EventEmitter();

  constructor(
    private router: Router,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: { studentPassLimit: StudentPassLimit, user: User },
    private dialogRef: MatDialogRef<PassLimitStudentInfoComponent>,
    private passLimitsService: PassLimitService,
    private cdr: ChangeDetectorRef,
    private framerMotion: CreateFormService
  ) { }

  ngOnInit(): void {
    this.frameMotion$ = this.framerMotion.getFrameMotionDirection();
    this.isAdmin = this.data.user.roles.includes('manage_school');
    this.setBordersAndButtons();
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

  private setBordersAndButtons() {
    if (this.data.studentPassLimit) {
      this.schoolEditButton = this.data.studentPassLimit.schoolPassLimitEnabled;
      this.individualEditButton = this.data.studentPassLimit.isIndividual;
      this.schoolLimitBorder = this.data.studentPassLimit.schoolPassLimitEnabled && !this.data.studentPassLimit.isIndividual && !this.data.studentPassLimit.noLimitsSet;
      this.individualBorder = this.data.studentPassLimit.isIndividual && !this.data.studentPassLimit.noLimitsSet;
    }
  }

  navigateToAdminPage() {
    this.dialogRef.close();
    this.dialog.open(AdminPassLimitDialogComponent, {
      hasBackdrop: true,
      panelClass: 'overlay-dialog',
      backdropClass: 'custom-bd',
      width: '425px',
      height: '500px',
    });
  }

  loadForm() {
    if (this.data.studentPassLimit.isIndividual) {
      let passLimit: number | string = this.data?.studentPassLimit?.passLimit || null;
      if (passLimit === -2) {
        passLimit = 'Unlimited';
      }
      const value = {
        passLimit,
        description: this.data?.studentPassLimit?.description || null
      };


      this.passLimitFormLastValue = value;
      this.passLimitForm.patchValue(value);
    }
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
          this.requestLoading = false;
          this.setBordersAndButtons();
          this.cdr.detectChanges();
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

  openDeleteDialog() {
    this.dialog.open<ConfirmationDialogComponent, ConfirmationTemplates, boolean>(ConfirmationDialogComponent, {
      ...RecommendedDialogConfig,
      width: '450px',
      data: {
        headerText: 'Remove the individual limit?',
        body: this.deleteDialogBody,
        buttons: {
          confirmText: 'Remove limit',
          denyText: 'Cancel',
        },
        templateData: {}
      }
    }).afterClosed().pipe(
      filter(Boolean),
      tap(() => this.deleteLoading = true),
      concatMap(() => this.passLimitsService.removeIndividualLimit(this.data.studentPassLimit.student.id)),
      concatMap(() => this.passLimitsService.getStudentPassLimit(this.data.studentPassLimit.student.id)),
    ).subscribe({
      next: (limit) => {
        this.data.studentPassLimit = limit;
        this.setBordersAndButtons();
        this.deleteLoading = false;
        this.cdr.detectChanges();
        this.backToHomePage();
      },
      error: console.error
    });
  }

  close() {
    if (this.isDialog) {
      this.dialogRef.close();
    } else {
      this.backEmit.emit();
    }
  }
}
