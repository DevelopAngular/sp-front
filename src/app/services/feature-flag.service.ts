import { Injectable } from '@angular/core';
import { HttpService } from './http-service';
import { School } from '../models/School';

/**
 * Add any future feature flags to this enum
 */
export enum FLAGS {
	EncounterDetection = 'feature_flag_encounter_detection',
	DigitalId = 'feature_flag_digital_id',
	ParentAccounts = 'feature_flag_parent_accounts',
	WaitInLine = 'feature_flag_wait_in_line',
}

// TODO: Replace individual feature flag functions with this service
@Injectable({
	providedIn: 'root',
})
export class FeatureFlagService {
	private school: School;

	constructor(private http: HttpService) {
		this.http.currentSchool$.subscribe({
			next: (s) => (this.school = s),
		});
	}

	isFeatureEnabled(featureFlag: FLAGS): boolean {
		return !!this.school?.[featureFlag];
	}
}
