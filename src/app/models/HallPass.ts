import { BaseModel } from './base';
import { ColorProfile } from './ColorProfile';
import { Location } from './Location';
import { User } from './User';

export class HallPass extends BaseModel {
	constructor(
		public id: number,
		public student: User,
		public issuer: User,
		public reported_pass_id: number | null,
		public created: Date,
		public last_updated: Date,
		public start_time: Date,
		public expiration_time: Date,
		public end_time: Date,
		public origin: Location,
		public destination: Location,
		public travel_type: string,
		public gradient_color: string,
		public icon: string,
		public color_profile: ColorProfile,
		public flow_start: Date,
		public parent_invitation: string,
		public parent_request: string,
		public schedule_config_id?: number,
		public cancelled?: boolean,
		public issuer_message?: string,
		public cancellable_by_student: boolean = true,
		public needs_check_in?: boolean
	) {
		super();
	}

	static fromJSON(JSON: any): HallPass {
		if (!JSON) {
			return null;
		}

		// console.log(JSON);
		const id: number = JSON['id'],
			student: User = User.fromJSON(JSON['student']),
			issuer: User = User.fromJSON(JSON['issuer']),
			reported_pass_id: number | null = JSON['reported_pass_id'] ?? null,
			created: Date = new Date(JSON['created']),
			last_updated: Date = new Date(JSON['last_updated']),
			start_time: Date = new Date(JSON['start_time']),
			expiration_time: Date = new Date(JSON['expiration_time']),
			end_time: Date = new Date(JSON['end_time']),
			origin: Location = Location.fromJSON(JSON['origin']),
			destination: Location = Location.fromJSON(JSON['destination']),
			travel_type: string = JSON['travel_type'],
			gradient_color: string = JSON['gradient_color'],
			icon: string = JSON['icon'],
			color_profile: ColorProfile = ColorProfile.fromJSON(JSON['color_profile']),
			flow_start: Date = new Date(JSON['flow_start']),
			parent_invitation: string = JSON['parent_invitation'],
			parent_request: string = JSON['parent_request'],
			cancelled: boolean = JSON['cancelled'],
			cancellable_by_student = !!JSON['cancellable_by_student'],
			schedule_config_id: number = JSON['schedule_config_id'],
			needs_check_in = !!JSON['needs_check_in'],
			issuer_message: string = JSON['issuer_message'];

		const pass = new HallPass(
			id,
			student,
			issuer,
			reported_pass_id,
			created,
			last_updated,
			start_time,
			expiration_time,
			end_time,
			origin,
			destination,
			travel_type,
			gradient_color,
			icon,
			color_profile,
			flow_start,
			parent_invitation,
			parent_request,
			schedule_config_id,
			cancelled,
			issuer_message,
			cancellable_by_student,
			needs_check_in
		);

		if (JSON['school_id']) {
			(pass as any).school_id = JSON['school_id'];
		}

		return pass;
	}

	calculatePassStatus(): { isActive: boolean; fromPast: boolean; forFuture: boolean } {
		const now = new Date();
		return {
			isActive: now >= this.start_time && now < this.end_time,
			fromPast: now > this.end_time,
			forFuture: now < this.start_time,
		};
	}
}
