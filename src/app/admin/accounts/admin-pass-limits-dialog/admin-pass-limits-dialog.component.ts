import {Component, OnInit, ViewChild, OnDestroy} from '@angular/core';
import {FormArray, FormControl, FormGroup, Validators} from '@angular/forms';

import {MatDialogRef} from '@angular/material/dialog';
import {MatTabGroup} from '@angular/material/tabs';
import {cloneDeep} from 'lodash';
import {forkJoin, Observable, of, Subscription} from 'rxjs';
import {concatMap, delay, map, tap} from 'rxjs/operators';

import {ScreenService} from '../../../services/screen.service';
import {PassLimitService} from '../../../services/pass-limit.service';
import {HallPassLimit, IndividualPassLimit, IndividualPassLimitCollection} from '../../../models/HallPassLimits';
import {User} from '../../../models/User';
import {SPSearchComponent} from '../../../sp-search/sp-search.component';
import {UserService} from '../../../services/user.service';
import {IntroData} from '../../../ngrx/intros';

/**
 * TODOS for pass limits v2
 * TODO: Add fade animation to angular material tabs
 */

@Component({
  selector: 'app-admin-pass-limits-dialog',
  templateUrl: './admin-pass-limits-dialog.component.html',
  styleUrls: ['./admin-pass-limits-dialog.component.scss']
})
export class AdminPassLimitDialogComponent implements OnInit, OnDestroy {
  hasPassLimit: boolean;
  passLimit: HallPassLimit;
  passLimitForm = new FormGroup({
    limitEnabled: new FormControl(false),
    passLimit: new FormControl(null, Validators.pattern(/^[1-9]\d*$/)),
    frequency: new FormControl(null, Validators.required)
  });
  passLimitFormSubs: Subscription;
  passLimitFormChanged: Observable<boolean> = of(false);
  passLimitFormLastValue: { limitEnabled: boolean, passLimit: string, frequency: string };
  showLimitFormatError = false;
  requestLoading = false;
  contentLoading = true;
  showPassLimitNux: boolean;
  introsData: IntroData;
  introSubs: Subscription;
  individualStudentLimits: IndividualPassLimit[] = [];
  individualOverrideForm: FormGroup;
  individualFormPreviousValue: { student: string[], passLimit: string, description: string };
  individualFormChanged: Observable<boolean>;
  individualLoading: boolean;
  selectedExistingIndividualLimit: IndividualPassLimit;

  @ViewChild('tabGroup') dialogPages: MatTabGroup;
  @ViewChild('studentSearch') studentSearcher: SPSearchComponent;

  constructor(
    public dialogRef: MatDialogRef<AdminPassLimitDialogComponent>,
    public screenService: ScreenService,
    private passLimitService: PassLimitService,
    private userService: UserService
  ) {
  }

  ngOnInit(): void {
    /**
     * Fetch the pass limit and individual limits for the school
     * If fetching the school-wide pass limit returns null (??), then the school has
     * no pass limits.
     * Enabling the pass limit slider creates the pass limit and the user has the option to specify the number
     * of passes per day that is allowed
     * «
     * If the pass limit does not exist, then the slider creates the limit when enabled
     * If a pass limit already exists, then the slider enables/disables the limit
     */

    this.passLimitFormSubs = this.passLimitForm.valueChanges.subscribe((v) => {
      v.enabled
        ? this.passLimitForm.controls['passLimit'].setValidators([Validators.required, Validators.pattern(/^[1-9]\d*$/)])
        : this.passLimitForm.controls['passLimit'].setValidators([Validators.pattern(/^[1-9]\d*$/)]);
    });
    this.passLimitForm.disable();
    forkJoin({
      pl: this.passLimitService.getPassLimit(),
      overrides: this.passLimitService.getIndividualLimits()
    }).pipe(
      concatMap(({ pl, overrides }) => {
        this.hasPassLimit = !!pl.pass_limit;
        if (this.hasPassLimit) {
          this.passLimit = pl.pass_limit;
          this.contentLoading = false;
          this.passLimitForm.patchValue({limitEnabled: this.passLimit.limitEnabled});
          this.individualStudentLimits = overrides;
          return of(true).pipe(delay(100));
        }
        return of(true);
      }),
      tap(() => {
        if (this.hasPassLimit) {
          this.passLimitForm.patchValue(this.passLimit);
        }
        this.passLimitFormLastValue = this.passLimitForm.value;
        this.passLimitFormChanged = this.passLimitForm.valueChanges.pipe(
          map(v => {
            if (v?.passLimit) {
              v.passLimit = parseInt(v.passLimit, 10);
            }
            const {invalid, dirty} = this.passLimitForm.get('passLimit');
            this.showLimitFormatError = invalid && dirty;
            return JSON.stringify(v) !== JSON.stringify(this.passLimitFormLastValue);
          }));
        this.passLimitForm.enable();
        this.contentLoading = false;
      })
    ).subscribe();
    this.introSubs = this.userService.introsData$.subscribe(intros => {
      this.introsData = intros;
      this.showPassLimitNux = !intros?.admin_pass_limit_message?.universal?.seen_version;
    });
  }

  // TODO: This is for when multiple pass frequencies are implemented
  // triggerFrequencyDialog() {
  //   const freqButton = document.querySelector('#passLimitFrequencyButton');
  //   const coords = freqButton.getBoundingClientRect();
  //   this.frequencyDialogRef = this.dialog.open(this.frequencyPopup, {
  //     hasBackdrop: true,
  //     backdropClass: 'cdk-overlay-transparent-backdrop',
  //     closeOnNavigation: true,
  //     restoreFocus: true,
  //     panelClass: 'pass-limits-frequency-dialog',
  //     position: {
  //       top: `${coords.bottom}px`,
  //       left: `${coords.left}px`
  //     }
  //   });
  //   this.frequencyDialogRef.afterClosed().pipe(filter(Boolean)).subscribe(frequency => {
  //     this.passLimitForm.patchValue({frequency});
  //   });
  // }

  // TODO: This is for when multiple pass frequencies are implemented
  // selectFrequency(frequency: string) {
  //   this.frequencyDialogRef.close(frequency);
  // }
  resetPassLimitsForm() {
    this.passLimitForm.patchValue(this.passLimitFormLastValue);
  }

  updatePassLimits() {
    this.requestLoading = true;
    const passLimit = parseInt(this.passLimitForm.value['passLimit'], 10);
    const newValue = {
      ...this.passLimit,
      ...this.passLimitForm.value,
      passLimit
    };

    const request = this.hasPassLimit
      ? this.passLimitService.updatePassLimits(newValue)
      : this.passLimitService.createPassLimit(newValue);

    request.subscribe({
      next: () => {
        this.hasPassLimit = true;
        this.requestLoading = false;
        this.passLimitFormLastValue = cloneDeep(this.passLimitForm.value);
        this.passLimitFormChanged = this.passLimitForm.valueChanges.pipe(
          map(v => {
            const {invalid, dirty} = this.passLimitForm.get('passLimit');
            this.showLimitFormatError = invalid && dirty;
            if (v?.passLimit) {
              v.passLimit = parseInt(v.passLimit, 10);
            }
            return JSON.stringify(v) !== JSON.stringify(this.passLimitFormLastValue);

          }));
      },
      error: () => {
        this.requestLoading = false;
      }
    });
  }

  async onEnabledToggle(change: boolean) {
    await new Promise(resolve => {
      setTimeout(() => {
        resolve();
      }, 50);
    });
    if (change) {
      if (this.hasPassLimit) {
        this.passLimitForm.patchValue({
          passLimit: `${this.passLimit.passLimit}`,
          frequency: this.passLimit.frequency
        });
      } else {
        this.passLimitForm.patchValue({
          passLimit: '5',
          frequency: 'day'
        });
      }
    }
  }

  dismissPassLimitNux() {
    this.userService.updateIntrosAdminPassLimitsMessageRequest(this.introsData, 'universal', '1');
    this.showPassLimitNux = false;
  }

  private goToPage(pageNumber: number) {
    if (pageNumber < 1) {
      throw new Error('Page Numbers cannot be less than 1');
    }
    this.dialogPages.selectedIndex = pageNumber - 1;
  }

  goToIndividualLimitPage(limit?: IndividualPassLimit) {
    this.initIndividualForm(limit);
    this.goToPage(2);
  }

  goToHomePage() {
    this.destroyIndividualForm();
    this.goToPage(1);
  }

  private initIndividualForm(limit?: IndividualPassLimit) {
    this.selectedExistingIndividualLimit = limit;
    const controls: FormControl[] = [];

    if (!!limit) {
      controls.push(new FormControl(limit.student.id));
    }

    this.individualOverrideForm = new FormGroup({
      students: new FormArray(controls, Validators.required),
      passLimit: new FormControl(limit?.passLimit?.toString() || '10', Validators.pattern(/^[1-9]\d*$/)),
      description: new FormControl(limit?.description || '')
    });
    this.individualFormPreviousValue = this.individualOverrideForm.value;
    this.individualFormChanged = this.individualOverrideForm.valueChanges.pipe(map(v => {
      return JSON.stringify(v) !== JSON.stringify(this.individualFormPreviousValue);
    }));
    setTimeout(() => {
      this.individualOverrideForm.patchValue({ passLimit: limit?.passLimit?.toString() || '10' }, { emitEvent: true });
    }, 100);
  }

  private destroyIndividualForm() {
    this.individualFormPreviousValue = undefined;
    this.individualFormChanged = of(false);
    this.individualOverrideForm = null;
    this.selectedExistingIndividualLimit = undefined;
  }

  resetIndividualForm() {
    if (this.studentSearcher) {
      this.studentSearcher.reset();
    }
    this.individualOverrideForm.removeControl('students');
    this.individualOverrideForm.addControl('students', new FormArray([]));
    this.individualOverrideForm.reset(this.individualFormPreviousValue);
  }

  updateStudentList(selectedUsers: User[]) {
    if (selectedUsers === undefined) {
      this.individualOverrideForm.markAsPristine();
      return;
    }
    this.individualOverrideForm.removeControl('students');
    const controls = selectedUsers.map(u => new FormControl(u.id));
    this.individualOverrideForm.addControl('students', new FormArray(controls));
    this.individualOverrideForm.markAsDirty();
  }

  submitIndividualLimits() {
    const parsedForm: IndividualPassLimitCollection = {
      students: this.individualOverrideForm.value.students,
      passLimit: parseInt(this.individualOverrideForm.value.passLimit, 10),
      description: (this.individualOverrideForm?.value?.description || '').trim()
    };

    if (parsedForm.students.length === 0) {
      throw new Error('Invalid form: must have at least one student and a properly formatted pass limit string');
    }

    this.individualLoading = true;
    const request = this.selectedExistingIndividualLimit
      ? this.passLimitService.updateIndividualLimit({
        ...parsedForm,
        description: parsedForm.description || this.selectedExistingIndividualLimit.description
      })
      : this.passLimitService.createIndividualLimits(parsedForm);

    request.pipe(
      concatMap(() => this.passLimitService.getIndividualLimits())
    ).subscribe({
      next: value => {
        this.individualStudentLimits = value;
        this.individualLoading = false;
        this.goToHomePage();
      },
    });
  }

  ngOnDestroy() {
    if (this.introSubs) {
      this.introSubs.unsubscribe();
    }
  }
}
