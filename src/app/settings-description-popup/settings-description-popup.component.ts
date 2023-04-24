import { Component, Inject, OnInit, ViewContainerRef, AfterViewInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { User } from '../models/User';
import { StatusPopupComponent } from '../admin/profile-card-dialog/status-popup/status-popup.component';
import { filter } from 'rxjs/operators';
import { ToastService } from '../services/toast.service';
import { UserService } from '../services/user.service';

interface Option {
	label: string;
	icon: string;
	description: string;
	textColor: string;
	backgroundColor: string;
	confirmButton: boolean;
	action: string;
	disableClose?: boolean;
	withoutHoverDescription?: boolean;
	isPro?: boolean;
}

@Component({
	selector: 'app-settings-description-popup',
	templateUrl: './settings-description-popup.component.html',
	styleUrls: ['./settings-description-popup.component.scss'],
})
export class SettingsDescriptionPopupComponent implements OnInit, AfterViewInit {
	triggerElementRef: HTMLElement;
	settings: Option[];
	hoverOption: Option;
	showConfirmButton: boolean;
	disableCloseEvent$: Subject<{ action: string; event: any }> = new Subject<{ action: string; event: any }>();
	profile: User;
	profileStatusActive: string;
	private adjustForScroll: boolean = false;

	constructor(
		public dialogRef: MatDialogRef<SettingsDescriptionPopupComponent>,
		private dialog: MatDialog,
		private toast: ToastService,
		private userService: UserService,
		private viewContainerRef: ViewContainerRef,
		@Inject(MAT_DIALOG_DATA) private data: any
	) {
		this.adjustForScroll = data['adjustForScroll'];
	}

	ngOnInit(): void {
		this.triggerElementRef = this.data['trigger'];
		this.settings = this.data['settings'];
		if (this.data['profile']) {
			this.profile = this.data['profile'];
			this.profileStatusActive = this.profile.status;
		}

		this.disableCloseEvent$.subscribe(({ action, event }) => {
			if (action === 'status') {
				this.openStatusPopup(event);
			}
		});
	}

	ngAfterViewInit() {
		this.updatePosition();
	}

	openStatusPopup(elem) {
		const SPC = this.dialog.open(StatusPopupComponent, {
			panelClass: 'consent-dialog-container',
			backdropClass: 'invis-backdrop',
			data: {
				trigger: elem.currentTarget,
				profile: this.profile,
				profileStatus: this.profileStatusActive,
				withoutDelete: true,
				adjustForScroll: true,
			},
		});

		SPC.afterClosed()
			.pipe(filter((res) => !!res))
			.subscribe((status) => {
				this.userService.updateUserRequest(this.profile, { status });
				this.toast.openToast({ title: 'Account status updated', type: 'success' });
				this.profileStatusActive = status;
			});
	}

	// call it in ngAfterViewInit so all elements are fully rendered and have their geometries stabilised
	updatePosition() {
		const dialogref = this.viewContainerRef.element.nativeElement;
		const dialogbox = dialogref.getBoundingClientRect();
		const matDialogConfig: MatDialogConfig = new MatDialogConfig();
		const rect = this.triggerElementRef.getBoundingClientRect();
		let top = rect.bottom + 15;
		let scrollAdjustment = 0;
		if (this.adjustForScroll) {
			scrollAdjustment = Math.abs(document.scrollingElement.getClientRects()[0].top);
		}
		// calculate dif
		const dy = dialogbox.height + top - (window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight);
		if (dy > 0) top -= dy + 15;
		matDialogConfig.position = {
			left: `${rect.left + rect.width - 230}px`,
			top: `${top + scrollAdjustment}px`,
		};

		this.dialogRef.updatePosition(matDialogConfig.position);
	}

	selectedOption(option: Option, event) {
		if (option.confirmButton) {
			this.showConfirmButton = true;
		} else if (option.disableClose) {
			this.disableCloseEvent$.next({ action: option.action, event });
		} else {
			this.dialogRef.close(option.action);
		}
	}
}
