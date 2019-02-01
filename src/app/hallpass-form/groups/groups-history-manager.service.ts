import { Injectable } from '@angular/core';
import {User} from '../../models/User';

@Injectable({
  providedIn: 'root'
})
export class GroupsHistoryManagerService {

  private static selectedStudents: User[] = [];

  constructor() { }

  static nextStep(step) {

  }
  static getSelectedStudents() {
    return this.selectedStudents;
  }
  static setSelectedStudents(students: User[]) {
    this.selectedStudents = this.selectedStudents.concat(students);
  }
}
