import {Component, ElementRef, Input, OnDestroy, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {MatDialog, MatDialogRef, MatDialogState} from '@angular/material/dialog';
import {map, startWith} from 'rxjs/operators';
import {Observable, Subscription} from 'rxjs';

interface PassLimitOption {
  text: string;
  value: number | 'Unlimited';
}

@Component({
  selector: 'app-pass-limit-input',
  templateUrl: './pass-limit-input.component.html',
  styleUrls: ['./pass-limit-input.component.scss']
})
export class PassLimitInputComponent implements OnInit, OnDestroy {
  @Input() formGroup: FormGroup;
  @Input() control: FormControl;
  @Input() isIndividual = false;

  limitArray: PassLimitOption[];
  filteredArray$: Observable<PassLimitOption[]>;
  passLimitDropdownRef: MatDialogRef<any>;
  controlSubs: Subscription;

  @ViewChild('passLimitDropdown') passLimitDropdownTemplate: TemplateRef<HTMLElement>;
  @ViewChild('passLimitInputWrapper') passLimitInputWrapper: ElementRef<HTMLElement>;

  constructor(
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.limitArray = new Array(51).fill(0).map((_, i) => ({
      text: `${i} ${i === 1 ? 'pass' : 'passes'}`,
      value: i
    }));
    if (this.isIndividual) {
      this.limitArray.unshift({ text: 'Unlimited passes', value: 'Unlimited' });
    }

    this.filteredArray$ = this.control.valueChanges.pipe(
      map(v => {
        if (this.control.pristine || v === '') {
          return this.limitArray;
        }
        return this.limitArray.filter(l => l.text.includes(v));
      }),
      startWith(this.limitArray)
    );
  }

  openPassLimitDropdown() {
    if (this.passLimitDropdownRef && this.passLimitDropdownRef.getState() === MatDialogState.OPEN) {
      return;
    }

    const coords = this.passLimitInputWrapper.nativeElement.getBoundingClientRect();

    this.passLimitDropdownRef = this.dialog.open(this.passLimitDropdownTemplate, {
      hasBackdrop: false,
      panelClass: ['overlay-dialog', 'show-overlay'],
      closeOnNavigation: true,
      width: '220px',
      height: '200px',
      position: {
        top: `${coords.bottom + 5}px`,
        left: `${coords.left}px`
      }
    });
  }

  selectValue(value: number | string) {
    this.control.patchValue(value.toString(), { emitEvent: true });
    this.passLimitDropdownRef.close();
  }

  ngOnDestroy() {
    if (this.controlSubs) {
      this.controlSubs.unsubscribe();
    }

    if (this.passLimitDropdownRef) {
      this.passLimitDropdownRef.close();
    }
  }

}
