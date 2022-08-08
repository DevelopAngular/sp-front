import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {BehaviorSubject, Observable, of, Subscription} from 'rxjs';
import {CreateFormService} from '../../../create-hallpass-forms/create-form.service';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {NextStep} from '../../../animations';
import {ScreenService} from '../../../services/screen.service';
import {PassLimitService} from '../../../services/pass-limit.service';
import {concatMap, delay, map, tap} from 'rxjs/operators';
import {HallPassLimit} from '../../../models/HallPassLimits';
import {UserService} from '../../../services/user.service';
import {IntroData} from '../../../ngrx/intros';
import {cloneDeep} from 'lodash';

/**
 * TODOS for individual pass limits
 * TODO: Add student label with Student search
 * TODO: Hook up output of student search component with new individual limit form
 * TODO: Make the number of limits input into it's own component
 * TODO: Put a Number of limits per day
 * TODO: Put the description input
 * TODO: Hook up inputs to forms
 * TODO: Put the save button on the top right of the new individual form header
 * TODO: Create shared component for pass limit drop down
 */

@Component({
  selector: 'app-admin-pass-limits-dialog',
  templateUrl: './admin-pass-limits-dialog.component.html',
  styleUrls: ['./admin-pass-limits-dialog.component.scss'],
  animations: [NextStep]
})
export class AdminPassLimitDialogComponent implements OnInit, OnDestroy {
  // TODO: This is for when multiple pass frequencies are implemented

  pageNumber = 1;
  frameMotion$: BehaviorSubject<any>;
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

  constructor(
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<AdminPassLimitDialogComponent>,
    public screenService: ScreenService,
    private formService: CreateFormService,
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

    this.frameMotion$ = this.formService.getFrameMotionDirection();
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

  ngOnDestroy() {
    if (this.introSubs) {
      this.introSubs.unsubscribe();
    }
  }
}
