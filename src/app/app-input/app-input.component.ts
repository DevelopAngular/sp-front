﻿import { Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { merge, of, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
	selector: 'app-input',
	templateUrl: './app-input.component.html',
	styleUrls: ['./app-input.component.scss'],
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
	@Input() forceError: boolean = false;
	@Input() showUnits: boolean;
	@Input() units: string;
	@Input() color = 'black';
	@Input() dataCy: string;

	@Input() formGroup: FormGroup;
	@Input() controlName: FormControl;

	@Output() onUpdate = new EventEmitter<string | number>();
	@Output() over = new EventEmitter();
	@Output() leave = new EventEmitter();
	@Output() blurEvent = new EventEmitter();
	@Output() focusEvent = new EventEmitter();

	@ViewChild('inp', { static: true }) input: ElementRef<HTMLInputElement>;

	private initialValue: string | number;

	public hovered: boolean;
	public pressed: boolean;
	public left;
	private destroy$ = new Subject();

	constructor(public dialog: MatDialog) {}

	get containerWidth() {
		return this.width ? parseFloat(this.width) + 16 + 'px' : 0;
	}

	get minLeftMargin() {
		if (this.controlName.value === 'Unlimited') {
			// TODO: Remove in future, since this is specific to pass limits
			return 94;
		}
		const value = parseFloat(this.controlName.value);
		if (Number.isNaN(value)) {
			return 32;
		}
		const absoluteValue = Math.abs(value);
		let margin: number;

		if (absoluteValue < 10) {
			margin = 32;
		} else if (absoluteValue >= 10 && absoluteValue < 100) {
			margin = 41;
		} else if (absoluteValue >= 100 && absoluteValue < 1000) {
			margin = 50;
		} else if (absoluteValue >= 1000) {
			margin = 59;
		}

		if (value < 0) {
			margin += 7;
		}

		return margin;
	}

	ngOnInit() {
		merge(of(''), this.forceFocus$)
			.pipe(takeUntil(this.destroy$))
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
			if (this.controlName.value !== undefined) {
				this.controlName.setValue(this.input_value);
			}
		}, 50);

		this.controlName.valueChanges
			.pipe(
				takeUntil(this.destroy$),
				filter((res) => res !== undefined)
			)
			.subscribe((res) => {
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
		if (this.tabAttentive) {
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

	forceFocus() {
		this.isFocus = true;
		this.input.nativeElement.focus();
		this.focusEvent.emit();
	}

	onBlur(value) {
		this.hovered = false;
		this.isFocus = false;
		if (!this.initialValue || value !== this.initialValue) {
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

	errorTooltipToggleMobile(element) {
		if (window.innerWidth <= 425) {
			element.toggle();
		}
	}
}
