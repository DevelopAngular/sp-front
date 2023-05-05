import { BaseModel } from './base';

export enum ROLES {
	Student = '_profile_student',
	Teacher = '_profile_teacher',
	Admin = '_profile_admin',
	Assistant = '_profile_assistant',
	Parent = '_profile_parent',
}

export type ReferralStatus = 'applied' | 'accepted' | 'not_applied';

export class User extends BaseModel {
	constructor(
		public id: string,
		public active: boolean,
		public created: Date,
		public demo_account: boolean,
		public last_login: Date,
		public last_updated: Date,
		public first_name: string,
		public last_name: string,
		public display_name: string,
		public passes_restricted: boolean,
		public primary_email: string,
		public roles: string[],
		public status: string,
		public referralStatus: ReferralStatus,
		public badge: string,
		public sync_types: string[],
		public show_expired_passes: boolean,
		public show_profile_pictures: 'everywhere' | 'hall_monitor',
		public profile_picture: string,
		public extras: any,
		public first_login: Date,
		public grade_level: string,
		public custom_id: string,
		public last_active: Date,
		public streak_count: number,
		public lost_streak_count: any
	) {
		super();
	}

	static fromJSON(JSON: any): User {
		if (!JSON) {
			return null;
		}

		const id: string = '' + JSON['id'],
			active: boolean = !!JSON['active'],
			created: Date = new Date(JSON['created']),
			demo_account: boolean = !!JSON['demo_account'],
			last_login: Date = new Date(JSON['last_login']),
			last_updated: Date = new Date(JSON['last_updated']),
			first_name: string = JSON['first_name'],
			last_name: string = JSON['last_name'],
			display_name: string = JSON['display_name'],
			passes_restricted: boolean = !!JSON['passes_restricted'],
			primary_email: string = JSON['primary_email'],
			roles: string[] = [],
			status: string = JSON['status'],
			referralStatus = JSON['referral_status'] as ReferralStatus,
			badge: string = JSON['badge'],
			sync_types: string[] = [],
			show_expired_passes: boolean = !!JSON['show_expired_passes'],
			show_profile_pictures: 'everywhere' | 'hall_monitor' = JSON['show_profile_pictures'],
			profile_picture: string = JSON['profile_picture'],
			extras: any = JSON['extras'],
			first_login: Date = new Date(JSON['first_login']),
			grade_level: string = JSON['grade_level'],
			custom_id: string = JSON['custom_id'],
			last_active: Date = new Date(JSON['last_active']),
			streak_count: number = JSON['streak_count'],
			lost_streak_count: number = JSON['lost_streak_count'];

		const rolesJSON: string[] = JSON['roles'];

		const sync_types_json = JSON['sync_types'] || [];
		for (let i = 0; i < rolesJSON.length; i++) {
			roles.push(rolesJSON[i]);
		}
		for (let i = 0; i < sync_types_json.length; i++) {
			sync_types.push(sync_types_json[i]);
		}

		return new User(
			id,
			active,
			created,
			demo_account,
			last_login,
			last_updated,
			first_name,
			last_name,
			display_name,
			passes_restricted,
			primary_email,
			roles,
			status,
			referralStatus,
			badge,
			sync_types,
			show_expired_passes,
			show_profile_pictures,
			profile_picture,
			extras,
			first_login,
			grade_level,
			custom_id,
			last_active,
			streak_count,
			lost_streak_count
		);
	}

	isHead() {
		return this.roles.includes('_profile_admin') && this.roles.includes('manage_school');
	}

	isAdmin() {
		return this.roles.includes('_profile_admin');
	}

	isStudent() {
		return this.roles.includes('_profile_student');
	}

	isParent() {
		return this.roles.includes('_profile_parent');
	}

	isTeacher() {
		return this.roles.includes('_profile_teacher');
	}

	isAssistant() {
		return this.roles.includes('_profile_assistant') && this.roles.includes('represent_users');
	}

	isStaff() {
		return this.isTeacher() || this.isAdmin() || this.isAssistant();
	}

	userRoles() {
		return this.roles.filter(
			(role) =>
				role === '_profile_admin' ||
				role === '_profile_teacher' ||
				role === '_profile_student' ||
				role === '_profile_assistant' ||
				role === '_profile_parent'
		);
	}

	abbreviatedName(initialFirstName = true) {
		if (this.first_name === '' || this.last_name === '') {
			return this.display_name;
		}

		return initialFirstName
			? `${this.first_name[0].toLocaleUpperCase()}. ${this.last_name}`
			: `${this.first_name} ${this.last_name[0].toLocaleUpperCase()}.`;
	}

	toString() {
		return this.last_name;
	}
}
