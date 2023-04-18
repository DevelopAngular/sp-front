import { BaseModel } from './base';
import { User } from './User';
import { VisibilityMode, DEFAULT_VISIBILITY_STUDENTS } from '../admin/overlay-container/visibility-room/visibility-room.type';
import { PassLimit } from './PassLimit';

export interface Choice extends Location {
	passLimit: PassLimit;
	disabledToolTip: boolean;
	isValidLocation: boolean;
	normalizedLocation: Location;
	roomIsHidden: boolean;
	isSelected: boolean;
}

export class Location extends BaseModel {
	constructor(
		public id: number,
		public title: string,
		public campus: string,
		public room: string,
		public category: string,
		public restricted: boolean,
		public request_mode: string,
		public request_send_destination_teachers: boolean,
		public request_send_origin_teachers: boolean,
		public request_teachers: User[] | number[],
		public scheduling_restricted: boolean,
		public scheduling_request_mode: string,
		public scheduling_request_send_destination_teachers: boolean,
		public scheduling_request_send_origin_teachers: boolean,
		public scheduling_request_teachers: User[] | number[],
		public required_attachments: string[],
		public travel_types: string[],
		public teachers: User[],
		public max_allowed_time: number,
		public starred: boolean,
		public max_passes_from: number,
		public max_passes_from_active: boolean,
		public max_passes_to: number,
		public max_passes_to_active: boolean,
		public needs_check_in: boolean,
		public enable: boolean,
		public visibility_type: VisibilityMode,
		public visibility_students: User[],
		public visibility_grade: string[],
		public current_active_pass_count_as_destination?: number,
		public current_active_pass_count_as_origin?: number,
		public has_reached_limit_as_destination?: boolean,
		public has_reached_limit_as_origin?: boolean,
		public isEdit?: boolean,
		public gradient?: string
	) {
		super();
	}

	static fromJSON(JSON: any): Location {
		if (!JSON) {
			return null;
		}

		const id: number = JSON['id'],
			title: string = JSON['title'],
			campus: string = JSON['campus'],
			room: string = JSON['room'],
			category: string = JSON['category'],
			restricted: boolean = !!JSON['restricted'],
			request_mode: string = JSON['request_mode'],
			request_send_destination_teachers: boolean = !!JSON['request_send_destination_teachers'],
			request_send_origin_teachers: boolean = !!JSON['request_send_origin_teachers'],
			request_teachers: User[] = [],
			required_attachments: string[] = [],
			travel_types: string[] = [],
			teachers: User[] = [],
			max_allowed_time: number = parseInt(JSON['max_allowed_time']),
			starred: boolean = JSON['starred'],
			scheduling_restricted: boolean = JSON['scheduling_restricted'],
			scheduling_request_mode: string = JSON['scheduling_request_mode'],
			scheduling_request_send_destination_teachers: boolean = !!JSON['scheduling_request_send_destination_teachers'],
			scheduling_request_send_origin_teachers: boolean = !!JSON['scheduling_request_send_origin_teachers'],
			scheduling_request_teachers: User[] = [],
			max_passes_from: number = JSON['max_passes_from'],
			max_passes_from_active: boolean = !!JSON['max_passes_from_active'],
			max_passes_to: number = JSON['max_passes_to'],
			max_passes_to_active: boolean = !!JSON['max_passes_to_active'],
			needs_check_in: boolean = !!JSON['needs_check_in'],
			enable: boolean = !!JSON['enable'],
			current_active_pass_count_as_destination: number = JSON['current_active_pass_count_as_destination'],
			current_active_pass_count_as_origin: number = JSON['current_active_pass_count_as_origin'],
			has_reached_limit_as_destination: boolean = !!JSON['has_reached_limit_as_destination'],
			has_reached_limit_as_origin: boolean = !!JSON['has_reached_limit_as_origin'];

		const attachmentsJSON = JSON['required_attachments'];
		for (let i = 0; i < attachmentsJSON.length; i++) {
			required_attachments.push(attachmentsJSON[i]);
		}
		const request_teachersJSON = JSON['request_teachers'];
		if (request_teachersJSON) {
			for (let i = 0; i < request_teachersJSON.length; i++) {
				request_teachers.push(request_teachersJSON[i]);
			}
		}

		const travelTypesJSON = JSON['travel_types'];
		for (let i = 0; i < travelTypesJSON.length; i++) {
			travel_types.push(travelTypesJSON[i]);
		}

		const scheduling_request_teachersJSON = JSON['scheduling_request_teachers'];
		if (scheduling_request_teachersJSON) {
			for (let i = 0; i < scheduling_request_teachersJSON.length; i++) {
				scheduling_request_teachers.push(scheduling_request_teachersJSON[i]);
			}
		}

		const teachersJSON = JSON['teachers'];
		for (let i = 0; i < teachersJSON.length; i++) {
			teachers.push(User.fromJSON(teachersJSON[i]));
		}

		const visibility_type: VisibilityMode = JSON['visibility_type'] ?? DEFAULT_VISIBILITY_STUDENTS.mode;
		const visibility_students: User[] = JSON['visibility_students']
			? JSON['visibility_students'].map((s) => User.fromJSON(s))
			: DEFAULT_VISIBILITY_STUDENTS.over;
		const visibility_grade: string[] = JSON['visibility_grade'] ?? null;

		return new Location(
			id,
			title,
			campus,
			room,
			category,
			restricted,
			request_mode,
			request_send_destination_teachers,
			request_send_origin_teachers,
			request_teachers,
			scheduling_restricted,
			scheduling_request_mode,
			scheduling_request_send_destination_teachers,
			scheduling_request_send_origin_teachers,
			scheduling_request_teachers,
			required_attachments,
			travel_types,
			teachers,
			max_allowed_time,
			starred,
			max_passes_from,
			max_passes_from_active,
			max_passes_to,
			max_passes_to_active,
			needs_check_in,
			enable,
			visibility_type,
			visibility_students,
			visibility_grade,
			current_active_pass_count_as_destination,
			current_active_pass_count_as_origin,
			has_reached_limit_as_destination,
			has_reached_limit_as_origin
		);
	}

	get nameRoom(): string {
		return this.title + ' (' + this.room + ')';
	}

	toString(): string {
		return this.nameRoom;
	}
}
