import {Component, OnInit, ViewChild, OnDestroy} from '@angular/core';
import {FormArray, FormControl, FormGroup, Validators} from '@angular/forms';

import {MatDialogRef} from '@angular/material/dialog';
import {MatTabGroup} from '@angular/material/tabs';
import {cloneDeep} from 'lodash';
import {Observable, of, Subscription} from 'rxjs';
import {concatMap, delay, map, tap} from 'rxjs/operators';

import {ScreenService} from '../../../services/screen.service';
import {PassLimitService} from '../../../services/pass-limit.service';
import {HallPassLimit, IndividualPassLimit} from '../../../models/HallPassLimits';
import {User} from '../../../models/User';
import {SPSearchComponent} from '../../../sp-search/sp-search.component';
import {UserService} from '../../../services/user.service';
import {IntroData} from '../../../ngrx/intros';


/**
 * TODOS for pass limits v2
 * TODO: Put a Number of limits per day
 * TODO: Create shared component for pass limit drop down
 * TODO: Hook up spinner loading animation to individual form limits
 * TODO: Hook up spinner loading animation to current school-wide limits
 * TODO: Re-fetch the individual limits when coming back to page one (should we re-fetch the school-wide limits too?)
 * TODO: Add fade animation to angular material tabs
 */

@Component({
  selector: 'app-admin-pass-limits-dialog',
  templateUrl: './admin-pass-limits-dialog.component.html',
  styleUrls: ['./admin-pass-limits-dialog.component.scss']
})
export class AdminPassLimitDialogComponent implements OnInit, OnDestroy {
  // TODO: This is for when multiple pass frequencies are implemented

  showInfoMessage = true; // TODO: hide this message based on database value in the future
  passLimitToggleTooltip = `Some help text about pass limits`; // TODO: Get text for this
  individualLimitsTooltip = `These override the school-wide pass limit on a per-student basis`; // TODO: Get text for this
  individualStudentLimits: IndividualPassLimit[];
  hasPassLimit: boolean;
  passLimit: HallPassLimit;
  passLimitForm = new FormGroup({
    limitEnabled: new FormControl(false),
    passLimit: new FormControl(null, Validators.pattern(/^[1-9]\d*$/)),
    frequency: new FormControl(null, Validators.required)
  }); // TODO: disable while fetching the pass limit status
  passLimitFormSubs: Subscription;
  passLimitFormChanged: Observable<boolean> = of(false);
  passLimitFormLastValue: { limitEnabled: boolean, passLimit: string, frequency: string };
  showLimitFormatError = false;
  requestLoading = false;
  contentLoading = true;
  showPassLimitNux: boolean;
  introsData: IntroData;
  introSubs: Subscription;
  individualOverrideForm: FormGroup = new FormGroup({
    students: new FormArray([], Validators.required),
    passLimit: new FormControl(null, Validators.pattern(/^((1 pass)|(((1\d+)|[2-9]\d*) passes))$/)),
    description: new FormControl(null, Validators.required)
  });
  individualFormPreviousValue: { student: string[], passLimit: string, description: string };
  individualFormChanged: Observable<boolean>;

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
    this.passLimitService.getPassLimit().pipe(
      concatMap(pl => {
        this.hasPassLimit = !!pl.pass_limit;
        if (this.hasPassLimit) {
          this.passLimit = pl.pass_limit;
          this.contentLoading = false;
          this.passLimitForm.patchValue({limitEnabled: this.passLimit.limitEnabled});
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
    this.individualFormPreviousValue = this.individualOverrideForm.value;
    this.individualFormChanged = this.individualOverrideForm.valueChanges.pipe(
      map(v => JSON.stringify(v) !== JSON.stringify(this.individualFormPreviousValue))
    );

    this.passLimitService.getIndividualLimits().subscribe(limits => this.individualStudentLimits = limits);
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
    this.dialogPages.selectedIndex = pageNumber - 1;
  }

  goToIndividualLimitPage() {
    this.goToPage(2);
  }

  back() {
    this.goToPage(1);
  }

  resetIndividualForm() {
    this.studentSearcher.reset();
    this.individualOverrideForm.reset(this.individualFormPreviousValue);
  }

  updateStudentList(selectedUsers: User[]) {
    this.individualOverrideForm.removeControl('students');
    const controls = selectedUsers.map(u => new FormControl(u.id));
    this.individualOverrideForm.addControl('students', new FormArray(controls));
  }

  submitIndividualLimits() {
    console.log(this.individualOverrideForm.value);
  }

  ngOnDestroy() {
    if (this.introSubs) {
      this.introSubs.unsubscribe();
    }
  }
}
