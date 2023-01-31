import { Component, ElementRef, Inject, OnInit, Optional } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
	selector: 'app-parent-setting',
	templateUrl: './parent-setting.component.html',
	styleUrls: ['./parent-setting.component.scss'],
})
export class ParentSettingComponent implements OnInit {
	targetElementRef: ElementRef;

	constructor(
		@Optional() @Inject(MAT_DIALOG_DATA) public data: { trigger: ElementRef; isSwitch: boolean },
		@Optional() public dialogRef: MatDialogRef<ParentSettingComponent>
	) {}

	ngOnInit(): void {}
}
