import { BaseModel } from './base';
import { User } from './User';

export class Location extends BaseModel {
  constructor(public id: string,
              public title: string,
              public campus: string,
              public room: string,
              public category: string,
              public restricted: boolean,
              public required_attatchments: string[],
              public travel_types: string[],
              public teachers: User[],
              public max_allowed_time: number,
              public starred: boolean) {
    super();
  }

  static fromJSON(JSON: any): Location {
    if (!JSON) {
      return null;
    }

    const id: string = '' + JSON['id'],
      title: string = JSON['title'],
      campus: string = JSON['campus'],
      room: string = JSON['room'],
      category: string = JSON['category'],
      restricted: boolean = !!JSON['restricted'],
      required_attachments: string[] = [],
      travel_types: string[] = [],
      teachers: User[] = [],
      max_allowed_time: number = parseInt(JSON['max_allowed_time']),
      starred: boolean = JSON['starred'];

    let attachmentsJSON = JSON['required_attachments'];
    for (let i = 0; i < attachmentsJSON.length; i++) {
      required_attachments.push(attachmentsJSON[i]);
    }

    let travelTypesJSON = JSON['travel_types'];
    for (let i = 0; i < travelTypesJSON.length; i++) {
      travel_types.push(travelTypesJSON[i]);
    }

    let teachersJSON = JSON['teachers'];
    for (let i = 0; i < teachersJSON.length; i++) {
      teachers.push(User.fromJSON(teachersJSON[i]));
    }

    return new Location(id, title, campus, room, category, restricted, required_attachments, travel_types, teachers, max_allowed_time, starred);
  }

  get nameRoom(): string {
    return this.title + ' (' + this.room + ')';
  }
}
