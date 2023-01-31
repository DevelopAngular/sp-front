import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Location } from '../models/Location';
import { StorageService } from './storage.service';
import { LocationsService } from './locations.service';
import { HttpService } from './http-service';

export interface KioskSettings {
	findByName: boolean;
	findById: boolean;
	findByScan: boolean;
}

export interface KioskSettings {
	findByName: boolean;
	findById: boolean;
	findByScan: boolean;
}

@Injectable({
	providedIn: 'root',
})
export class KioskModeService {
	private currentRoom$: BehaviorSubject<Location> = new BehaviorSubject(null);
	private loadingStoredKioskRoom = false;
	private currentKioskSettings$: BehaviorSubject<KioskSettings> = new BehaviorSubject<KioskSettings>(this.getKioskModeSettings());
	public enterKioskMode$: BehaviorSubject<Boolean> = new BehaviorSubject(false);

	constructor(private storageService: StorageService, private locationsService: LocationsService, private http: HttpService) {}

	getCurrentRoom() {
		return this.currentRoom$;
	}

	setCurrentRoom(location: Location) {
		this.currentRoom$.next(location);
	}

	areValidSettings(obj: any): obj is KioskSettings {
		return typeof obj === 'object' && 'findByName' in obj && 'findById' in obj && 'findByScan' in obj;
	}

	getKioskModeSettingsSubject(): Observable<KioskSettings> {
		return this.currentKioskSettings$.asObservable();
	}

	GetKioskModeEnterSubject(): Observable<Boolean> {
		return this.enterKioskMode$.asObservable();
	}

	getKioskModeSettings(): KioskSettings {
		let settings = null;
		try {
			settings = JSON.parse(this.storageService.getItem('kioskSettingsData'));
		} catch (e) {}

		if (settings == null || !this.areValidSettings(settings)) {
			return {
				findByName: true,
				findById: false,
				findByScan: false,
			};
		} else {
			return settings as KioskSettings;
		}
	}

	setKioskModeSettings(settings: KioskSettings) {
		this.storageService.setItem('kioskSettingsData', JSON.stringify(settings));
		this.currentKioskSettings$.next(settings);
	}
	resetPassword(location: Location) {
		return this.http.patch(`v1//kiosk/${location.id}/password`);
	}

	getAllKioskLogin() {
		return this.http.get(`v1//kiosk/all_logins`);
	}

	isKisokMode(): boolean {
		return !!this.storageService.getItem('kioskToken');
	}

	kioskSettingsValidCheck(obj: KioskSettings) {
		let check = false;
		for (const key in obj) {
			if (obj[key] == true) check = true;
		}
		return check;
	}
}
