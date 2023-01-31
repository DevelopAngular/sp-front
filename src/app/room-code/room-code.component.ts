import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, TemplateRef, ViewChild, ViewChildren } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HallPass } from '../models/HallPass';
import { HallPassesService } from '../services/hall-passes.service';
import { ToastService } from '../services/toast.service';

@Component({
	selector: 'app-room-code',
	templateUrl: './room-code.component.html',
	styleUrls: ['./room-code.component.scss'],
})
export class RoomCodeComponent implements OnInit, OnDestroy {
	@Input() pass: HallPass;
	// @Input() requestId: string;

	@Output() pinResult: EventEmitter<any> = new EventEmitter<any>();
	@Output() roomCodeResult: EventEmitter<any> = new EventEmitter<any>();
	@Output() blurEvent: EventEmitter<any> = new EventEmitter<any>();

	@ViewChild('inp', { static: true }) inp: ElementRef;
	@ViewChild('confirmDialogBody') confirmDialogBody: TemplateRef<HTMLElement>;

	form: FormGroup;
	formInput = ['input1', 'input2', 'input3'];
	@ViewChildren('formRow') rows: any;

	incorrect: boolean;
	passLimit: number;
	pin = '';
	attempts = 5;
	destroy$ = new Subject<any>();
	circles = [
		{ id: 1, pressed: false },
		{ id: 2, pressed: false },
		{ id: 3, pressed: false },
	];
	roomName: string;

	constructor(private toastService: ToastService, private hallPassService: HallPassesService) {}

	ngOnInit(): void {
		this.form = this.toFormGroup(this.formInput);

		if (this.pass.travel_type == 'round_trip') {
			this.roomName = this.pass.origin.title;
		} else {
			this.roomName = '';
		}
		setTimeout(() => {
			this.rows._results[0].nativeElement.focus();
		}, 500);
	}

	toFormGroup(elements) {
		const group: any = {};

		elements.forEach((key) => {
			group[key] = new FormControl('', Validators.required);
		});
		return new FormGroup(group);
	}

	keyUpEvent(event, index) {
		let pos = index;
		if (event.keyCode === 8 && event.which === 8) {
			pos = index - 1;
		} else {
			pos = index + 1;
		}
		if (pos > -1 && pos < this.formInput.length) {
			this.rows._results[pos].nativeElement.focus();
		}

		if (this.form.valid) {
			const ROOM_CODE = this.form.value.input1 + this.form.value.input2 + this.form.value.input3;
			let body = {
				room_code: ROOM_CODE,
				destination_id: this.pass.destination.id,
			};
			this.resetInput();
			this.hallPassService
				.endPassWithCheckIn(this.pass.id, body)
				.pipe(
					catchError((errorResponse: HttpErrorResponse) => {
						//   if (errorResponse.error.detail == "room code is incorrect") {
						//     this.toastService.openToast({
						//     title: 'room code is incorrect',
						//     type: 'error',
						//   });
						// }
						try {
							console.log('errorResponse : ', errorResponse);
							this.incorrect = true;
							this.resetInput();
						} catch {
							return throwError(errorResponse);
						}
					})
				)
				.subscribe(() => {
					// this.hallPassService.endPassRequest(this.pass.id);
				});
		}
	}

	enableTeacherPin() {}

	resetInput() {
		this.form.reset();
		this.rows._results[0].nativeElement.focus();
		setTimeout(() => {
			this.incorrect = false;
		}, 300);
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	blur() {
		this.inp.nativeElement.focus();
	}
}
