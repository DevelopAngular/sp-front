import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { KioskModeService } from '../../services/kiosk-mode.service';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';

@Component({
	selector: 'app-kiosk-settings',
	templateUrl: './kiosk-settings.component.html',
	styleUrls: ['./kiosk-settings.component.scss'],
})
export class KioskSettingsComponent implements OnInit {
	form: FormGroup;
	idSetup: Boolean = false;
	validCheck: Boolean = true;

	constructor(
		private kioskModeService: KioskModeService,
		private fb: FormBuilder,
		private userService: UserService,
		private router: Router
	) {}

	ngOnInit(): void {
		this.userService.getStatusOfIDNumber().subscribe({
			next: (result: any) => {
				this.idSetup = result.results?.setup;
			},
		});
		this.form = this.fb.group(this.kioskModeService.getKioskModeSettings());
		this.validCheck = this.kioskModeService.kioskSettingsValidCheck(this.kioskModeService.getKioskModeSettings());
		this.form.valueChanges.subscribe((value) => {
			if (this.idSetup) {
				this.kioskModeService.setKioskModeSettings(this.form.value);
				this.validCheck = this.kioskModeService.kioskSettingsValidCheck(this.kioskModeService.getKioskModeSettings());
			}
		});
	}

	close() {}

	enterKioskMode() {
		if (this.kioskModeService.kioskSettingsValidCheck(this.kioskModeService.getKioskModeSettings())) {
			const kioskRoom = this.kioskModeService.getCurrentRoom().value;
			if (kioskRoom?.id) {
        this.router.navigate(['main/kioskMode']);
			} else {
				this.kioskModeService.enterKioskMode$.next(true);
			}
		}
	}

	control(id: string): FormGroup {
		return this.form.get(id) as FormGroup;
	}
}
