import {Injectable} from '@angular/core';
import {Location} from '../../models/Location';
import {VisibilityMode} from '../../admin/overlay-container/visibility-room/visibility-room.type';

@Injectable()
export class LocationVisibilityService {

  constructor() { }

  // mimic server visibility skipped  calculation
  calculateSkipped(students: string[], ruleStudents: string[], rule: VisibilityMode): string[] | undefined {
                     
     let skipped: string[] | undefined;

     if (rule ===  "visible_certain_students") {
       if (ruleStudents.length === 0) {                    
         skipped = students;
       } else {
          const delta: string[] = students.filter(s => (!ruleStudents.includes(s)));
         if (delta.length > 0) {
           skipped = delta;
         }                             
       }                                        
     } else if (rule === "hidden_certain_students") {    
      if (ruleStudents.length > 0) {                
        const delta: string[] = students.filter(s => ruleStudents.includes(s));
        if (delta.length > 0) {
          skipped = delta;
        } 
      } 
    } 

    return skipped;
  }

  filterByVisibility(location: Location, students: string[]) {
    const ruleStudents = location.visibility_students.map(s => ''+s.id);
    const rule = location.visibility_type;
    let skipped = this.calculateSkipped(students, ruleStudents, rule);
    return skipped === undefined;
  }

}
