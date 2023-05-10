import { Injectable } from '@angular/core';
import { HttpService } from './http-service';
import { School } from '../models/School';

/**
 * Add any future feature flags to this enum
 */
export enum FLAGS {
	EncounterDetection = 'feature_flag_encounter_detection',
	DigitalId = 'feature_flag_digital_id',
	PhoneAccess = 'feature_flag_phone',
	ParentAccounts = 'feature_flag_parent_accounts',
	WaitInLine = 'feature_flag_wait_in_line',
	ShowWaitInLine = 'feature_flag_show_wait_in_line',
	AbbreviateLastName = 'feature_flag_new_abbreviation',
	ShowStreaks = 'feature_flag_streaks',
	RenewalChecklist = 'feature_flag_renewal_checklist',
	ReferralProgramme = 'feature_flag_referral_program',
	// V2 Feature Flags
	YearInReview = 'year_in_review',
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

	isFeatureEnabledV2(featureFlag: FLAGS): boolean {
		if (!this.school || !this.school.feature_flags_v2) {
			return false;
		}

		return this.school.feature_flags_v2.includes(featureFlag);
	}
}
