import { ColorProfile } from './ColorProfile';
import { Location } from './Location';

export class Pinnable {
  constructor(public id: string,
              public title: string,
              public gradient_color: string,
              public icon: string,
              public type: string,
              public location: Location,
              public category: string,
              public color_profile: ColorProfile) {
  }

  static fromJSON(JSON: any): Pinnable {
    if (!JSON) {
      return null;
    }

    const id: string = '' + JSON['id'],
      title: string = JSON['title'],
      gradient_color: string = JSON['gradient_color'],
      icon: string = JSON['icon'],
      type: string = JSON['type'],
      location: Location = JSON['location'],
      category: string = JSON['category'],
      color_profile: ColorProfile = ColorProfile.fromJSON(JSON['color_profile']);

    return new Pinnable(id, title, gradient_color, icon, type, location, category, color_profile);
  }
}
