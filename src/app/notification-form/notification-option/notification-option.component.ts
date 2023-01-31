import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
	selector: 'app-notification-option',
	templateUrl: './notification-option.component.html',
	styleUrls: ['./notification-option.component.scss'],
})
export class NotificationOptionComponent implements OnInit {
	@Input() icon: string;
	@Input() text: string;
	@Input() form: FormGroup;
	@Input() control: string;
	@Input() tooltip: string = undefined;
	@Input() position: string | null = null;
	@Input() disabled: boolean;

	constructor() {}

	ngOnInit(): void {}
}
