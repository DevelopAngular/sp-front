import { BaseModel } from './base';

export class User extends BaseModel {
  constructor(public id: string,
              public created: Date,
              public last_updated: Date,
              public first_name: string,
              public last_name: string,
              public display_name: string,
              public primary_email: string,
              public roles: string[],
              public sync_types?: string[]
              ) {
    super();
  }

  static fromJSON(JSON: any): User {
    if (!JSON) {
      return null;
    }

    const
      id: string = '' + JSON['id'],
      created: Date = new Date(JSON['created']),
      last_updated: Date = new Date(JSON['last_updated']),
      first_name: string = JSON['first_name'],
      last_name: string = JSON['last_name'],
      display_name: string = JSON['display_name'],
      primary_email: string = JSON['primary_email'],
      roles: string[] = [],
      sync_types: string[] = [];

    const rolesJSON = JSON['roles'];
    const sync_types_json = JSON['sync_types'];
    for (let i = 0; i < rolesJSON.length; i++) {
      roles.push(rolesJSON[i]);
    }
    for (let i = 0; i < sync_types_json.length; i++) {
      sync_types.push(sync_types_json[i]);
    }

    return new User(id, created, last_updated, first_name, last_name, display_name, primary_email, roles, sync_types);
  }

  isHead() {
    return this.roles.includes('_profile_admin') &&  this.roles.includes('manage_school');
  }
  isAdmin() {
    return this.roles.includes('_profile_admin');
  }

  isStudent() {
    return this.roles.includes('_profile_student');
  }

  isTeacher() {
    return this.roles.includes('_profile_teacher');
  }

  isAssistant() {
    return this.roles.includes('_profile_assistant') && this.roles.includes('represent_users');
  }

  // primaryRole() {
  //   let role;
  //   if (this.isAdmin()) {
  //
  //   }
  // }
  //
  toString() {
    return this.last_name;
  }
}
