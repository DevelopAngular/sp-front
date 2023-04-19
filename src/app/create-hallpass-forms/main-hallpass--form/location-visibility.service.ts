import { Injectable } from '@angular/core';
import { Location } from '../../models/Location';
import { User } from '../../models/User';

@Injectable()
export class LocationVisibilityService {
	constructor() {}

	getIdOrThrow(s: User): string {
		if (s?.id) {
			return '' + s.id;
		}
		throw new Error('no appropriate id');
	}

	// mimic server visibility byid  calculation
	calculateSkipped(users: User[], location: Location): string[] {
		const rule = location.visibility_type;
		if (rule === 'visible_all_students') {
			return [];
		}

		const students = users.map((s: User) => this.getIdOrThrow(s));
		const ruleStudents = (location.visibility_students as User[]).map((s: User) => this.getIdOrThrow(s));

		let byid: string[] = [];

		// when we have just grades this visibility_students is empty
		if (ruleStudents.length > 0) {
			// filter by ids
			byid = students.filter((s) => ruleStudents.includes(s));
		}

		// filter by grade
		const ruleGrades = location?.visibility_grade ?? [];
		const _bygrade: User[] = users.filter((s: User) => {
			// without grade don't put it in
			if (!s?.grade_level) {
				return false;
			}
			return ruleGrades.includes(s.grade_level);
		});
		const bygrade: string[] = _bygrade.map((s: User) => '' + s.id);

		const accepted: string[] = [...byid, ...bygrade]
			// keep only unique values
			.filter((uid: string, i: number, arr: string[]) => arr.indexOf(uid) === i);
		const skipped = users.filter((u: User) => !accepted.includes('' + u.id)).map((u: User) => this.getIdOrThrow(u));

		return rule === 'visible_certain_students' ? skipped : accepted;
	}

	filterByVisibility(location: Location, students: User[]): boolean {
		let skipped = this.calculateSkipped(students, location);
		return skipped.length === 0;
	}
}
