import { BaseModel } from './base';
import { User } from './User';

export class StudentList extends BaseModel {
	constructor(public id: number, public title: string, public users: User[]) {
		super();
	}

	static fromJSON(JSON: any): StudentList {
		if (!JSON) {
			return null;
		}

		const id: number = JSON['id'],
			title: string = JSON['title'],
			users: User[] = JSON['users'];

		return new StudentList(id, title, users);
	}
}
