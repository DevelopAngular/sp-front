import { BaseModel } from './base';

export class ColorProfile extends BaseModel {
  constructor(public id: string,
              public title: string,
              public gradient_color: string,
              public solid_color: string,
              public overlay_color: string,
              public pressed_color: string,
              public time_color: string) {
    super();
  }

  static fromJSON(JSON: any): ColorProfile {
    if (!JSON) {
      return null;
    }

    const id: string = '' + JSON['id'],
      title: string = JSON['title'],
      gradient_color: string = JSON['gradient_color'],
      solid_color: string = JSON['solid_color'],
      overlay_color: string = JSON['overlay_color'],
      pressed_color: string = JSON['pressed_color'],
      time_color: string = JSON['time_color'];

    return new ColorProfile(id, title, gradient_color, solid_color, overlay_color, pressed_color, time_color);
  }
}
