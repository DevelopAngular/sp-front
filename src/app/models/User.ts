export class User {
  constructor(public id: string,
              public created: Date,
              public last_updated: Date,
              public first_name: string,
              public last_name: string,
              public display_name: string,
              public primary_email: string,
              public roles: string[]) {
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
      roles: string[] = [];

    let rolesJSON = JSON['roles'];
    for (let i = 0; i < rolesJSON.length; i++) {
      roles.push(rolesJSON[i]);
    }

    return new User(id, created, last_updated, first_name, last_name, display_name, primary_email, roles);
  }

  toString() {
    return this.last_name;
  }
}
