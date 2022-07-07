import {Injectable} from '@angular/core';

import {VisibilityCertainStudents} from '../admin/overlay-container/visibility-room/visibility-room.type';

@Injectable({
  providedIn: 'root'
})
export class LocationVisibilityService {

  constructor() { }

  // mimic server visibility skipped  calculation
  calculateSkipped(students: string[], ruleStudents: string[], rule: VisibilityCertainStudents): string[] | undefined {
                     
     let skipped;

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

}
