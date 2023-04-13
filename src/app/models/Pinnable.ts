import { BaseModel } from './base';
import { ColorProfile } from './ColorProfile';
import { Location } from './Location';

export class Pinnable extends BaseModel {
	constructor(
		public id: number,
		public title: string,
		public gradient_color: string,
		public icon: string,
		public type: string,
		public location: Location,
		public category: string,
		public color_profile: ColorProfile,
		public ignore_students_pass_limit: boolean,
		public show_as_origin_room: boolean
	) {
		super();
	}

	static fromJSON(JSON: any): Pinnable {
		if (!JSON) {
			return null;
		}

		const id: number = JSON['id'],
			title: string = JSON['title'],
			gradient_color: string = JSON['gradient_color'],
			icon: string = JSON['icon'],
			type: string = JSON['type'],
			location: Location = JSON['location'],
			category: string = JSON['category'],
			color_profile: ColorProfile = ColorProfile.fromJSON(JSON['color_profile']),
			ignore_students_pass_limit: boolean = JSON['ignore_students_pass_limit'],
			show_as_origin_room: boolean = JSON['show_as_origin_room'];

		return new Pinnable(id, title, gradient_color, icon, type, location, category, color_profile, ignore_students_pass_limit, show_as_origin_room);
	}
}
