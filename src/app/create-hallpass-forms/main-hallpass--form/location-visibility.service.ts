import {Injectable} from '@angular/core';
import {Location} from '../../models/Location';
import {User} from '../../models/User';

@Injectable()
export class LocationVisibilityService {

  constructor() { }

  // mimic server visibility byid  calculation
  calculateSkipped(users: User[], location: Location): string[] {
    const rule = location.visibility_type;
    if (rule === 'visible_all_students'){
      return [];
    }

    const students = users.map(s => ''+s.id);
    const ruleStudents = location.visibility_students.map((s: User) => ''+s.id);
                 
    let byid: string[] = [];
    let delta: string[] = [];

    if (ruleStudents.length > 0) {
      // filter by ids
      if (rule ===  "visible_certain_students") {
       delta = students.filter(s => (!ruleStudents.includes(s)));
      } else if (rule === "hidden_certain_students") {
        delta = students.filter(s => ruleStudents.includes(s));
      }
      byid = delta;
    }

    // some students are already accepted by the more granular rule of filtering by ids
    // not all students has to be checked
    const remainUsers = users.filter(u => !byid.includes(''+u.id));

    // filter by grade
    const ruleGrades = location?.visibility_grade ?? [];
    if (ruleGrades.length === 0) {
      return byid;
    }
    
    const _bygrade: User[] = remainUsers.filter((s: User) => {
      // without grade don't put it in
      if (!s?.grade_level) {
        return false;
      }
      const toSkip = ruleGrades.includes(s.grade_level)
      return rule === 'visible_certain_students' ? !toSkip : toSkip;
    });

    // if grades are not relevant further
    // for union, stop it here
    if (_bygrade.length === 0) {
      return byid;
    }

    // calculate union
    const bygrade: string[] = _bygrade.map((s: User) => ''+s.id);
    // bygrade is from remainUsers that don't contains any of bygrade
    const skipped: string[] = [...byid, ...bygrade]
      // still keep improbable uniques
      .filter((uid: string, i: number, arr: string[]) => arr.indexOf(uid) === i);
    return skipped;
  }

  filterByVisibility(location: Location, students: User[]): boolean {
    let skipped = this.calculateSkipped(students, location);
    return skipped.length === 0;
  }
}
