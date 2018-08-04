import { ColorProfile } from './ColorProfile';
import { Location } from './Location';
import { User } from './User';

export class HallPass {
  constructor(public id: string,
              public student: User,
              public issuer: User,
              public created: Date,
              public last_updated: Date,
              public start_time: Date,
              public expiration_time: Date,
              public end_time: Date,
              public origin: Location,
              public destination: Location,
              public travel_type: string,
              public gradient_color: string,
              public icon: string,
              public color_profile: ColorProfile) {
  }

  get isRead() {
    return true;
  }

  static fromJSON(JSON: any): HallPass {
    if (!JSON) {
      return null;
    }

    // console.log(JSON);
    const id: string = '' + JSON['id'],
      student: User = User.fromJSON(JSON['student']),
      issuer: User = User.fromJSON(JSON['issuer']),
      created: Date = new Date(JSON['created']),
      last_updated: Date = new Date(JSON['last_updated']),
      start_time: Date = new Date(JSON['start_time']),
      expiration_time: Date = new Date(JSON['expiration_time']),
      end_time: Date = new Date(JSON['end_date']),
      origin: Location = Location.fromJSON(JSON['origin']),
      destination: Location = Location.fromJSON(JSON['destination']),
      travel_type: string = JSON['travel_type'],
      gradient_color: string = JSON['gradient_color'],
      icon: string = JSON['icon'],
      color_profile: ColorProfile = ColorProfile.fromJSON(JSON['color_profile']);

    return new HallPass(id, student, issuer, created, last_updated, start_time, expiration_time, end_time, origin, destination, travel_type, gradient_color, icon, color_profile);
  }
}
