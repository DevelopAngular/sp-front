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

    // filter by ids
    if (rule ===  "visible_certain_students") {
     if (ruleStudents.length === 0) {
       byid = students;
     } else {
        const delta: string[] = students.filter(s => (!ruleStudents.includes(s)));
       if (delta.length > 0) {
         byid = delta;
       }
     }
    } else if (rule === "hidden_certain_students") {
      if (ruleStudents.length > 0) {
        const delta: string[] = students.filter(s => ruleStudents.includes(s));
        if (delta.length > 0) {
          byid = delta;
        }
      }
    }

    // filter by grade
    const ruleGrades = location?.visibility_grade ?? [];
    if (ruleGrades.length === 0 || rule == 'visible_all_students') return byid;
    
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
