import { User } from './User';

export class Alert {
  constructor(public id: string,
              public created: Date,
              public last_updated: Date,
              public creator: User,
              public start_time: Date,
              public message: string,
              public users: User[],
              public high_priority: boolean,
              public status_sent: boolean) {
  }

  static fromJSON(JSON: any): Alert {
    if (!JSON) {
      return null;
    }

    const id: string = '' + JSON['id'],
      created: Date = new Date(JSON['created']),
      last_created: Date = new Date(JSON['last_updated']),
      creator: User = User.fromJSON(JSON['creator']),
      start_time: Date = new Date(JSON['start']),
      message: string = JSON['message'],
      users: User[] = [],
      high_priority: boolean = JSON['high_priority'],
      status_sent: boolean = JSON['status'];

    let usersJSON = JSON['users'];
    for (let i = 0; i < usersJSON.length; i++) {
      users.push(usersJSON[i]);
    }

    return new Alert(id, created, last_created, creator, start_time, message, users, high_priority, status_sent);
  }
}
