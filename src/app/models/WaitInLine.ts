import { BaseModel } from './base';
import { Location } from './Location';
import { ColorProfile } from './ColorProfile';
import { User } from './User';
import {
  DEFAULT_VISIBILITY_STUDENTS,
  VisibilityMode,
} from '../admin/overlay-container/visibility-room/visibility-room.type';
import { snakeToTitleCase } from './index';

const WilLocationParser = (JSON: any): Location => {
  if (!JSON) {
    return null
  }

  const id: string = '' + JSON['id'],
    title: string = JSON[snakeToTitleCase('title')],
    campus: string = JSON[snakeToTitleCase('campus')],
    room: string = JSON[snakeToTitleCase('room')],
    category: string = JSON[snakeToTitleCase('category')],
    restricted: boolean = !!JSON[snakeToTitleCase('restricted')],
    request_mode: string = JSON[snakeToTitleCase('request_mode')],
    request_send_destination_teachers: boolean = !!JSON[snakeToTitleCase('request_send_destination_teachers')],
    request_send_origin_teachers: boolean = !!JSON[snakeToTitleCase('request_send_origin_teachers')],
    request_teachers: User[] = [],
    required_attachments: string[] = [],
    travel_types: string[] = [],
    teachers: User[] = [],
    max_allowed_time: number = parseInt(JSON[snakeToTitleCase('max_allowed_time')]),
    starred: boolean = JSON[snakeToTitleCase('starred')],
    scheduling_restricted: boolean = JSON[snakeToTitleCase('scheduling_restricted')],
    scheduling_request_mode: string = JSON[snakeToTitleCase('scheduling_request_mode')],
    scheduling_request_send_destination_teachers: boolean = !!JSON[snakeToTitleCase('scheduling_request_send_destination_teachers')],
    scheduling_request_send_origin_teachers: boolean = !!JSON[snakeToTitleCase('scheduling_request_send_origin_teachers')],
    scheduling_request_teachers: User[] = [],
    max_passes_from: number = JSON[snakeToTitleCase('max_passes_from')],
    max_passes_from_active: boolean = !!JSON[snakeToTitleCase('max_passes_from_active')],
    max_passes_to: number = JSON[snakeToTitleCase('max_passes_to')],
    max_passes_to_active: boolean = !!JSON[snakeToTitleCase('max_passes_to_active')],
    needs_check_in: boolean = !!JSON[snakeToTitleCase('needs_check_in')],
    enable: boolean = !!JSON[snakeToTitleCase('enable')],
    current_active_pass_count_as_destination: number = JSON[snakeToTitleCase('current_active_pass_count_as_destination')],
    current_active_pass_count_as_origin: number = JSON[snakeToTitleCase('current_active_pass_count_as_origin')],
    has_reached_limit_as_destination: boolean = !!JSON[snakeToTitleCase('has_reached_limit_as_destination')],
    has_reached_limit_as_origin: boolean = !!JSON[snakeToTitleCase('has_reached_limit_as_origin')];

  const attachmentsJSON = JSON[snakeToTitleCase('required_attachments')];
  for (let i = 0; i < attachmentsJSON?.length; i++) {
    required_attachments.push(attachmentsJSON[i]);
  }
  const request_teachersJSON = JSON[snakeToTitleCase('request_teachers')];
  if (request_teachersJSON) {
    for (let i = 0; i < request_teachersJSON?.length; i++) {
      request_teachers.push(request_teachersJSON[i]);
    }
  }

  const travelTypesJSON = JSON[snakeToTitleCase('travel_types')];
  for (let i = 0; i < travelTypesJSON?.length; i++) {
    travel_types.push(travelTypesJSON[i]);
  }

  const scheduling_request_teachersJSON = JSON[snakeToTitleCase('scheduling_request_teachers')];
  if (scheduling_request_teachersJSON) {
    for (let i = 0; i < scheduling_request_teachersJSON?.length; i++) {
      scheduling_request_teachers.push(scheduling_request_teachersJSON[i]);
    }
  }

  const teachersJSON = JSON[snakeToTitleCase('teachers')];
  for (let i = 0; i < teachersJSON?.length; i++) {
    teachers.push(teachersJSON[i]);
  }

  const visibility_type: VisibilityMode = JSON[snakeToTitleCase('visibility_type')] ?? DEFAULT_VISIBILITY_STUDENTS.mode;
  const visibility_students: User[] = JSON[snakeToTitleCase('visibility_students')]
    ? JSON[snakeToTitleCase('visibility_students')].map((s) => User.fromJSON(s))
    : DEFAULT_VISIBILITY_STUDENTS.over;
  const visibility_grade: string[] = JSON[snakeToTitleCase('visibility_grade')] ?? null;


  return new Location(id,
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
    has_reached_limit_as_origin)
}

const WilColorParser = (JSON: any): ColorProfile => {
  if (!JSON) {
    return null;
  }

  const id: string = '' + JSON['id'],
    title: string = JSON[snakeToTitleCase('title')],
    gradient_color: string = JSON[snakeToTitleCase('gradient_color')],
    solid_color: string = JSON[snakeToTitleCase('solid_color')],
    overlay_color: string = JSON[snakeToTitleCase('overlay_color')],
    pressed_color: string = JSON[snakeToTitleCase('pressed_color')],
    time_color: string = JSON[snakeToTitleCase('time_color')];

  return new ColorProfile(id, title, gradient_color, solid_color, overlay_color, pressed_color, time_color);
}

export type WaitingInLineUser = Pick<User,
  'id' | 'first_name' | 'last_name' | 'primary_email' | 'badge' | 'profile_picture' |
  'first_login' | 'last_active'> & {
  PrimaryLoginProvider: string;
  Extras?: Record<string, any>;
  username: string;
  is_active: boolean;
  is_deleted: boolean;
  is_staff: boolean
  is_superuser: boolean;
  student_invite_code: string
}

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
    public line_position: number,
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
      origin: Location = WilLocationParser(JSON['origin']),
      destination: Location = WilLocationParser(JSON['destination']),
			student: WaitingInLineUser = JSON['student'],
      color_profile: ColorProfile = WilColorParser(JSON['color_profile']),
      school_id_fk: number = JSON['school_id_fk'],
      line_position: number = JSON['line_position'];


    return new WaitingInLinePass(
			id, created, entry_time, missed_start_attempts, start_attempt_end_time,
      travel_type, duration, issuer_message, icon, issuer, origin, destination,
      student, color_profile, school_id_fk, line_position
		);
	}

  isFrontOfLine(): boolean {
    return this.line_position === 0
  }

  isNextInLine(): boolean {
    return this.line_position === 1
  }
}
