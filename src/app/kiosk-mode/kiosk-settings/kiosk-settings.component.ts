import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { DarkThemeSwitch } from '../../dark-theme-switch';
import { FormBuilder, FormGroup } from '@angular/forms';
import { KioskModeService } from '../../services/kiosk-mode.service';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { HttpService } from '../../services/http-service';
import { map } from 'rxjs/operators';
import { StorageService } from '../../services/storage.service';

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
		private router: Router,
		private http: HttpService,
		private storage: StorageService
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
			let kioskRoom = this.kioskModeService.getCurrentRoom().value;
			if (kioskRoom?.id) {
				this.userService
					.saveKioskModeLocation(kioskRoom.id)
					.pipe(
						map((res: any) => {
							this.storage.setItem('kioskToken', res.access_token);
							//this.loginService.updateAuth({username: user.user.primary_email, type: 'demo-login', kioskMode: true});
							this.http.kioskTokenSubject$.next(res);
							this.router.navigate(['main/kioskMode']);
						})
					)
					.subscribe();
			} else {
				this.kioskModeService.enterKioskMode$.next(true);
			}
		}
	}

	control(id: string): FormGroup {
		return this.form.get(id) as FormGroup;
	}
}
