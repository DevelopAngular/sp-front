import {Injectable} from '@angular/core';
import {union} from 'lodash'
import {Location} from '../../models/Location';
import {User} from '../../models/User';

@Injectable()
export class LocationVisibilityService {

  constructor() { }

  // mimic server visibility byid  calculation
  calculateSkipped(users: User[], location: Location): string[] {
    const students = users.map(s => ''+s.id);
    const ruleStudents = location.visibility_students.map((s: User) => ''+s.id);
    const rule = location.visibility_type;
                 
    let byid: string[] = [];
    let delta: string[] = [];

    if (ruleStudents.length > 0) {
      // filter by ids
      if (rule ===  "visible_certain_students") {
       delta = students.filter(s => (!ruleStudents.includes(s)));
      } else if (rule === "hidden_certain_students") {
        delta = students.filter(s => ruleStudents.includes(s));
      }
      if (delta.length > 0) byid = delta;
      // nothing to be skipped
      if (byid.length === 0) return [];
    }

    // filter by grade
    const ruleGrades = location?.visibility_grade ?? [];
    if (ruleGrades.length === 0) return byid;
    
    const _bygrade: User[] = users.filter((s: User) => {
      // without grade don't put in in skipped
      if (!s?.grade_level) return false;
      const toSkip = ruleGrades.includes(s.grade_level)
      return rule === 'visible_certain_students' ? !toSkip : toSkip;
    });

    if (_bygrade.length === 0) {
      return byid;
    }
    
    const bygrade: string[] = _bygrade.map((s: User) => ''+s.id);
    const skipped: string[] = union(byid, bygrade);

    return skipped;
  }

  filterByVisibility(location: Location, students: User[]): boolean {
    let skipped = this.calculateSkipped(students, location);
    return skipped.length === 0;
  }
}
