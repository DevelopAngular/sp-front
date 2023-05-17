import { BaseModel } from './base';

export class School extends BaseModel {
	constructor(
		public display_card_room: boolean,
		public student_can_use_mobile: boolean,
		public id: number,
		public name: string,
		public my_roles: string[],
		public pass_buffer_time: number,
		public earliest_pass_time: string,
		public gsuite_config: any,
		public gsuite_hosted_domain: string,
		public latest_pass_time: string,
		public address: any,
		public created: string,
		public display_username: boolean,
		public show_active_passes_number: boolean,
		public profile_pictures_completed: boolean,
		public profile_pictures_enabled: boolean,
		public feature_flag_digital_id: boolean,
		public feature_flag_phone: boolean,
		public feature_flag_encounter_detection: boolean,
		public feature_flag_parent_accounts: boolean,
		public feature_flag_wait_in_line: boolean,
		public feature_flag_show_wait_in_line: boolean,
		public feature_flag_new_abbreviation: boolean,
		public feature_flag_referral_program: boolean,
		public feature_flags_v2: [string],
		public trial_quote_link: string,
		public trial_end_date: Date,
		public timezone: string
	) {
		super();
	}

	static fromJSON(JSON: any): School {
		if (!JSON) {
			return null;
		}

		const id: number = JSON['id'],
			display_card_room: boolean = JSON['display_card_room'],
			student_can_use_mobile: boolean = JSON[' student_can_use_mobile'],
			name: string = '' + JSON['name'],
			my_roles: string[] = JSON['my_roles'],
			pass_buffer_time: number = JSON['pass_buffer_time'],
			earliest_pass_time: string = JSON['earliest_pass_time'],
			gsuite_config: any = JSON['gsuite_config'],
			gsuite_hosted_domain: string = JSON['gsuite_hosted_domain'],
			latest_pass_time: string = JSON['latest_pass_time'],
			address: any = JSON['address'],
			created: string = JSON['created'],
			display_username: boolean = JSON['display_username'],
			show_active_passes_number: boolean = JSON['show_active_passes_number'],
			profile_pictures_completed: boolean = !!JSON['profile_pictures_completed'],
			profile_pictures_enabled: boolean = !!JSON['profile_pictures_enabled'],
			feature_flag_digital_id: boolean = !!JSON['feature_flag_digital_id'],
			feature_flag_phone: boolean = !!JSON['feature_flag_phone'],
			feature_flag_encounter_detection: boolean = !!JSON['feature_flag_encounter_detection'],
			feature_flag_parent_accounts: boolean = !!JSON['feature_flag_parent_accounts'],
			feature_flag_wait_in_line: boolean = !!JSON['feature_flag_wait_in_line'],
			feature_flag_show_wait_in_line: boolean = !!JSON['feature_flag_show_wait_in_line'],
			feature_flag_new_abbreviation: boolean = !!JSON['feature_flag_new_abbreviation'],
			feature_flag_referral_program: boolean = !!JSON['feature_flag_referral_program'],
			feature_flags_v2: [string] = JSON['feature_flags_v2'],
			timezone: string = JSON['timezone'],
			trial_quote_link: string = JSON['trial_quote_link'];
		let trial_end_date: Date;
		if (JSON['trial_end_date']) {
			trial_end_date = new Date(JSON['trial_end_date']);
		}

		return new School(
			display_card_room,
			student_can_use_mobile,
			id,
			name,
			my_roles,
			pass_buffer_time,
			earliest_pass_time,
			gsuite_config,
			gsuite_hosted_domain,
			latest_pass_time,
			address,
			created,
			display_username,
			show_active_passes_number,
			profile_pictures_completed,
			profile_pictures_enabled,
			feature_flag_digital_id,
			feature_flag_phone,
			feature_flag_encounter_detection,
			feature_flag_parent_accounts,
			feature_flag_wait_in_line,
			feature_flag_show_wait_in_line,
			feature_flag_new_abbreviation,
			feature_flag_referral_program,
			feature_flags_v2,
			trial_quote_link,
			trial_end_date,
			timezone
		);
	}
}
