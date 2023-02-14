import { BaseModel } from './base';
import { Location } from './Location';
import { ColorProfile } from './ColorProfile';
import { User } from './User';

export type WaitingInLineUser = Pick<
	User,
	'id' | 'first_name' | 'last_name' | 'primary_email' | 'badge' | 'profile_picture' | 'first_login' | 'last_active'
> & {
	PrimaryLoginProvider: string;
	Extras?: Record<string, any>;
	username: string;
	is_active: boolean;
	is_deleted: boolean;
	is_staff: boolean;
	is_superuser: boolean;
	student_invite_code: string;
};

export interface WaitingInLinePassResponse {
	id: string;
	created: Date;
	entry_time: Date;
	missed_start_attempts: number;
	start_attempt_end_time: Date | null;
	travel_type: 'round_trip' | 'one_way';
	duration: number;
	issuer_message: string;
	icon: string; // asset URL
	issuer: WaitingInLineUser;
	origin: Record<string, any>;
	destination: Record<string, any>;
	student: WaitingInLineUser;
	color_profile: Record<string, any>;
	school_id_fk: number;
	line_position: number;
}

export class WaitingInLinePass extends BaseModel {
	constructor(
		public id: string,
		public created: Date,
		public entry_time: Date,
		public missed_start_attempts: number,
		public start_attempt_end_time: Date | null,
		public travel_type: string,
		public duration: number,
		public issuer_message: string,
		public icon: string, // asset URL
		public issuer: WaitingInLineUser,
		public origin: Location,
		public destination: Location,
		public student: WaitingInLineUser,
		public color_profile: ColorProfile,
		public school_id_fk: number,
		public line_position: number
	) {
		super();
	}

	static fromJSON(JSON: Record<string, any>): WaitingInLinePass {
		if (!JSON) {
			return null;
		}

		const id: string = '' + JSON['id'],
			created: Date = new Date(JSON['created']),
			entry_time: Date = new Date(JSON['entry_time']),
			missed_start_attempts: number = JSON['missed_start_attempts'],
			start_attempt_end_time: Date = new Date(JSON['start_attempt_end_time']),
			travel_type: string = JSON['travel_type'],
			duration: number = JSON['duration'],
			issuer_message: string = JSON['issuer_message'],
			icon: string = JSON['icon'],
			issuer: WaitingInLineUser = JSON['issuer'],
			origin: Location = Location.fromJSON(JSON['origin']),
			destination: Location = Location.fromJSON(JSON['destination']),
			student: WaitingInLineUser = JSON['student'],
			color_profile: ColorProfile = ColorProfile.fromJSON(JSON['color_profile']),
			school_id_fk: number = JSON['school_id_fk'],
			line_position: number = JSON['line_position'];

		return new WaitingInLinePass(
			id,
			created,
			entry_time,
			missed_start_attempts,
			start_attempt_end_time,
			travel_type,
			duration,
			issuer_message,
			icon,
			issuer,
			origin,
			destination,
			student,
			color_profile,
			school_id_fk,
			line_position
		);
	}

	isReadyToStart(): boolean {
		return this.line_position === 0;
	}

	isFrontOfLine(): boolean {
		return this.line_position === 1;
	}
}
