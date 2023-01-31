import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CurrentView } from '../explore.component';

@Component({
	selector: 'app-pages-dialog',
	templateUrl: './pages-dialog.component.html',
	styleUrls: ['./pages-dialog.component.scss'],
})
export class PagesDialogComponent implements OnInit {
	triggerElementRef: HTMLElement;
	pages: CurrentView[];
	selectedPage: CurrentView;

	constructor(@Inject(MAT_DIALOG_DATA) public data: any[], public dialogRef: MatDialogRef<PagesDialogComponent>, private router: Router) {}

	ngOnInit() {
		this.triggerElementRef = this.data['trigger'];
		this.pages = this.data['pages'];
		this.selectedPage = this.data['selectedPage'];
		this.updateDialogPosition();
	}

	get isActive(): boolean {
		return this.router.url.includes('explore');
	}

	updateDialogPosition() {
		const matDialogConfig: MatDialogConfig = new MatDialogConfig();
		const rect = this.triggerElementRef.getBoundingClientRect();
		matDialogConfig.position = { left: `${rect.left}px`, top: `${rect.bottom + 13}px` };
		this.dialogRef.updatePosition(matDialogConfig.position);
	}
}
