import { BaseModel, ReadableModel } from './base';
import { ColorProfile } from './ColorProfile';
import { Location } from './Location';
import { User } from './User';

export class Invitation extends BaseModel implements ReadableModel {
  constructor(public id: string,
              public student: User,
              public default_origin: Location,
              public destination: Location,
              public date_choices: Date[],
              public issuer: User,
              public status: string,
              public duration: number,
              public gradient_color: string,
              public icon: string,
              public travel_type: string,
              public color_profile: ColorProfile,
              public cancelled: Date,
              public last_read: Date,
              public last_updated: Date,
              public created: Date) {
    super();
  }

  get isRead() {
    return this.last_read != null && this.last_read >= this.last_updated;
  }

  static fromJSON(JSON: any) {
    if (!JSON) {
      return null;
    }

    const id: string = '' + JSON['id'],
      student: User = User.fromJSON(JSON['student']),
      destination: Location = Location.fromJSON(JSON['destination']),
      date_choices: Date[] = [],
      issuer: User = User.fromJSON(JSON['issuer']),
      status: string = JSON['status'],
      duration: number = JSON['duration'],
      gradient_color: string = JSON['gradient_color'],
      icon: string = JSON['icon'],
      default_origin: Location = (!!JSON['default_origin']) ? Location.fromJSON(JSON['default_orgin']) : null,
      travel_type: string = JSON['travel_type'],
      color_profile: ColorProfile = ColorProfile.fromJSON(JSON['color_profile']),
      cancelled: Date = (!!JSON['cancelled'] ? new Date(JSON['cancelled']) : null),
      last_read: Date = (!!JSON['last_read'] ? new Date(JSON['last_read']) : null),
      last_updated: Date = new Date(JSON['last_updated']),
      created: Date = new Date(JSON['created']);

    let datesJSON = JSON['date_choices'];
    for (let i = 0; i < datesJSON.length; i++) {
      date_choices.push(new Date(datesJSON[i]));
    }



    const invitation =  new Invitation(id, student, default_origin, destination, date_choices, issuer, status, duration, gradient_color, icon, travel_type, color_profile, cancelled, last_read, last_updated, created);

    if (JSON['school_id']) {
      (invitation as any).school_id = JSON['school_id'];
    }

    return invitation;
  }
}
