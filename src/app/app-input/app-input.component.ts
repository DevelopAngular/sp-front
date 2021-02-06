import {Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {DomSanitizer} from '@angular/platform-browser';
import {merge, of, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';


@Component({
  selector: 'app-input',
  templateUrl: './app-input.component.html',
  styleUrls: ['./app-input.component.scss']
})
export class AppInputComponent implements OnInit, OnChanges, OnDestroy {

  @Input() input_type: string = 'text';
  @Input() input_value: string | number;
  @Input() input_label: string;
  @Input() placeholder: string = '';
  @Input() maxLength: string = '100';
  @Input() width: string = '0px';
  @Input() height: string = '40px';
  @Input() padding: string = '8px';
  @Input() fieldSpace: string = '0px';
  @Input() rightIcon: string;
  @Input() tooltipText: string;
  @Input() textAlign: string;
  @Input() isErrorIcon: boolean = true;
  @Input() isFocus: boolean;
  @Input() forcedFocus: boolean;
  @Input() errorIconTop: number = 8;
  @Input() disabled: boolean = false;
  @Input() isSuccessIcon: boolean;
  @Input() forceFocus$: Subject<boolean> = new Subject<boolean>();
  @Input() autocomplete: string = 'off';
  @Input() showPasswordButton: boolean;
  @Input() timeInput: boolean;
  @Input() pattern: string;
  @Input() tabIndex: number = 1;
  @Input() tabAttentive: boolean = false;

  @Input() formGroup;
  @Input() controlName;

  @Output() onUpdate = new EventEmitter<string | number>();
  @Output() over = new EventEmitter();
  @Output() leave = new EventEmitter();
  @Output() blurEvent = new EventEmitter();
  @Output() focusEvent = new EventEmitter();

  @ViewChild('inp', { static: true }) input;

  private initialValue: string | number;

  public hovered: boolean;
  public pressed: boolean;
  public left;
  private destroy$ = new Subject();


  constructor(
    public dialog: MatDialog,
    private sanitizer: DomSanitizer,
  ) {}

  get containerWidth() {
      return this.width ? parseFloat(this.width) + 16 + 'px' : 0;
  }

  get showMin() {
    return this.timeInput && !this.isFocus &&
      (!!this.formGroup.get('timeLimit') || !!this.formGroup.get('from') || !!this.formGroup.get('to')) &&
      this.controlName.valid;
  }

  get minLeftMargin() {
    const value = this.controlName.value;
    if (value < 10) {
      return 32;
    } else if (value >= 10 && value < 100) {
      return 41;
    } else if (value >= 100 && value < 1000) {
      return 50;
    } else if (value >= 1000) {
      return 59;
    }
  }

  ngOnInit() {
    merge(of(''), this.forceFocus$).pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        setTimeout(() => {
          if (this.isFocus) {
            this.input.nativeElement.focus();
          } else {
            this.input.nativeElement.blur();
          }
        }, 50);
      });

    setTimeout(() => {
      this.controlName.setValue(this.input_value);
    }, 50);

    this.controlName.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(res => {
      this.onUpdate.emit(res);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnChanges(sc: SimpleChanges) {
    // if ('forcedFocus' in sc && !sc.forcedFocus.isFirstChange() && sc.forcedFocus.currentValue) {
    //   this.input.nativeElement.focus();
    // }
  }

  updateFocus(el) {

    if(this.tabAttentive) {
      this.isFocus = true;
    }

    this.initialValue = this.input_value;

    if (this.isFocus) {
      el.focus();
      this.focusEvent.emit();
    } else if (!this.forcedFocus) {
      el.blur();
    }
  }

  onBlur(value) {
    this.hovered = false;
    this.isFocus = false;
    if (!this.initialValue || (value !== this.initialValue)) {
      this.blurEvent.emit(value);
    }
  }

  changeInput() {
    if (this.input_type === 'password') {
      this.input_type = 'text';
    } else {
      this.input_type = 'password';
    }
  }
}
