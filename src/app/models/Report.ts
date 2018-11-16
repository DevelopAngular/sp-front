import { BaseModel } from './base';
import { User } from './User';

export class Report extends BaseModel {
  constructor(public id: string,
              public created: Date,
              public last_updated: Date,
              public issuer: User,
              public student: User,
              public message: string) {
    super();
  }

  static fromJSON(JSON: any): Report {
    if (!JSON) {
      return null;
    }

    const id: string = '' + JSON['id'],
      created: Date = new Date(JSON['created']),
      last_updated: Date = new Date(JSON['last_updated']),
      issuer: User = User.fromJSON(JSON['issuer']),
      student: User = User.fromJSON(JSON['student']),
      message: string = JSON['message'];

    return new Report(id, created, last_updated, issuer, student, message);
  }
}
