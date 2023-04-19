import { BaseModel, ReadableModel } from './base';
import { ColorProfile } from './ColorProfile';
import { HallPass } from './HallPass';
import { Location } from './Location';
import { User } from './User';

export class Request extends BaseModel implements ReadableModel {
	constructor(
		public id: number,
		public student: User,
		public origin: Location,
		public destination: Location,
		public attachment_message: string,
		public travel_type: string,
		public status: string,
		public hallpass: HallPass,
		public gradient_color: string,
		public icon: string,
		public teachers: User[],
		public request_time: Date,
		public declined_message: string,
		public student_has_dismissed: boolean,
		public cancelled: Date,
		public color_profile: ColorProfile,
		public last_read: Date,
		public last_updated: Date,
		public duration: number,
		public created: Date
	) {
		super();
	}

	get isRead() {
		return this.last_read != null && this.last_read >= this.last_updated;
	}

	static fromJSON(JSON: any): Request {
		if (!JSON) {
			return null;
		}

		const id: number = JSON['id'],
			student: User = User.fromJSON(JSON['student']),
			origin: Location = Location.fromJSON(JSON['origin']),
			destination: Location = Location.fromJSON(JSON['destination']),
			attachment_message: string = JSON['attachment_message'],
			travel_type: string = JSON['travel_type'],
			status: string = JSON['status'],
			hallpass: HallPass = !!JSON['hallpass'] ? HallPass.fromJSON(JSON['hallpass']) : null,
			gradient_color: string = JSON['gradient_color'],
			icon: string = JSON['icon'],
			teachers: User[] = (JSON['teachers'] as User[]).map((u) => User.fromJSON(u)),
			request_time: Date = !!JSON['request_time'] ? new Date(JSON['request_time']) : null,
			declined_message: string = JSON['declined_message'],
			student_has_dismissed: boolean = JSON['student_has_dismissed'],
			cancelled: Date = !!JSON['cancelled'] ? new Date(JSON['cancelled']) : null,
			color_profile: ColorProfile = ColorProfile.fromJSON(JSON['color_profile']),
			last_read: Date = !!JSON['last_read'] ? new Date(JSON['last_read']) : null,
			last_updated: Date = new Date(JSON['last_updated']),
			duration: number = JSON['duration'],
			created: Date = new Date(JSON['created']);

		const request = new Request(
			id,
			student,
			origin,
			destination,
			attachment_message,
			travel_type,
			status,
			hallpass,
			gradient_color,
			icon,
			teachers,
			request_time,
			declined_message,
			student_has_dismissed,
			cancelled,
			color_profile,
			last_read,
			last_updated,
			duration,
			created
		);

		if (JSON['school_id']) {
			(request as any).school_id = JSON['school_id'];
		}

		return request;
	}
}
