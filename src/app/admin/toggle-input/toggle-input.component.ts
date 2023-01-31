import { Component, ElementRef, EventEmitter, Input, NgZone, OnInit, Output, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { fromEvent, Observable } from 'rxjs';
import { filter, tap } from 'rxjs/operators';

export type ToggleInputSize = 'small' | 'regular' | 'large' | 'smallest';

@Component({
	selector: 'app-toggle-input',
	templateUrl: './toggle-input.component.html',
	styleUrls: ['./toggle-input.component.scss'],
})
export class ToggleInputComponent implements OnInit {
	@Input() form: FormGroup;
	@Input() controlName: string;
	@Input() controlLabel: string;
	@Input() controlSize: ToggleInputSize = 'regular';

	private _disabled: boolean = false;
	@Input() set disabled(v: boolean) {
		this._disabled = v;
		if (this._disabled && this.inp) {
			this.inp.nativeElement.checked = false;
			this.pushOut(false);
			this.form.patchValue({ [this.controlName]: false });
		}
	}
	get disabled(): boolean {
		return this._disabled;
	}

	@Input() customClass: boolean = false;
	@Input() delimiter: boolean = true;
	@Input() defaultLayout: boolean = true;
	@Input() mock: boolean = false;
	@Input() color: string = '#00B476';
	@Input() icon: string = './assets/Hand (Jade).svg';
	@Input() hasIcon: boolean = false;
	@Input() padding: string = '8px 0 9px 0';

	@ViewChild('inp') set inputField(inputField: ElementRef) {
		this.inp = inputField;
		if (this.inp) {
			this.e = fromEvent(this.inp.nativeElement, 'change').pipe(
				tap({
					next: (evt: Event) => {
						const $el = evt.target as HTMLInputElement;
						this.checked = $el.checked && !this.disabled;
					},
				}),
				// disabled do not allow event emission
				filter((evt: Event) => evt && !this.disabled)
			);
			this.e.subscribe((e: any) => {
				this.pushOut(e.target.checked);
			});
		}
	}

	@Output() pushOutValue: EventEmitter<boolean> = new EventEmitter<boolean>();
	public inp: ElementRef;
	public e: Observable<Event>;
	sizedLayout: any = {};

	checked: boolean;

	constructor(private _zone: NgZone) {}

	ngOnInit() {
		this._zone.run(() => {
			switch (this.controlSize) {
				case 'small':
					this.sizedLayout['checkbox-container__small'] = true;
					break;
				case 'large':
					this.sizedLayout['checkbox-container__large'] = true;
					break;
				case 'smallest':
					this.sizedLayout['checkbox-container__smallest'] = true;
					break;
				default:
					this.sizedLayout['checkbox-container__regular'] = true;
			}
		});
	}

	pushOut(v: boolean): void {
		this.pushOutValue.emit(v);
	}
}
