import { Component, Input, OnInit } from '@angular/core';

@Component({
	selector: 'app-action-item',
	templateUrl: './action-item.component.html',
	styleUrls: ['./action-item.component.scss', '../renewal.component.scss'],
})
export class ActionItemComponent implements OnInit {
	@Input() link: string;
	@Input() desc: string;
	@Input() img: string;
	@Input() title: string;

	constructor() {}

	ngOnInit(): void {}
}
