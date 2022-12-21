import { BaseModel } from './base'
import { User } from './User'
import { Location } from './Location'
import { ColorProfile } from './ColorProfile'

// Given the position in a line, return the ordinal number
// Position 1: "1st", Position 3: "3rd", etc.
const ordinance = (positionInLine: number): string => {
  const suffixMap = {
    1: 'st',
    2: 'nd',
    3: 'rd'
  };
  const edgeCases = [11, 12, 13];

  const lastTwoDigits = positionInLine % 100;

  if (edgeCases.includes(lastTwoDigits)) {
    return `${positionInLine}th`
  }

  const lastDigit = positionInLine % 10;
  const suffix = suffixMap[lastDigit];

  return !suffix
    ? `${positionInLine}th`
    : `${positionInLine}${suffix}`;
}

export class WaitInLine extends BaseModel {
  constructor (
    public id: string,
    public student: User,
    public issuer: User,
    public created: Date,
    public last_updated: Date,
    public origin: Location,
    public destination: Location,
    public travel_type: string,
    public gradient_color: string,
    public icon: string,
    public color_profile: ColorProfile,
    public cancellable_by_student: boolean = true,
    public position: string,
    public cancelled?: boolean,
    public issuer_message?: string,

  ) {
    super()
  }

  static fromJSON(JSON: Record<string, any>): WaitInLine {
    if (!JSON) {
      return null;
    }

    const id: string = '' + JSON['id'],
      student: User = User.fromJSON(JSON['student']),
      issuer: User = User.fromJSON(JSON['issuer']),
      created: Date = new Date(JSON['created']),
      last_updated: Date = new Date(JSON['last_updated']),
      origin: Location = Location.fromJSON(JSON['origin']),
      destination: Location = Location.fromJSON(JSON['destination']),
      travel_type: string = JSON['travel_type'],
      gradient_color: string = JSON['gradient_color'],
      icon: string = JSON['icon'],
      color_profile: ColorProfile = ColorProfile.fromJSON(JSON['color_profile']),
      cancelled: boolean = JSON['cancelled'],
      cancellable_by_student: boolean = !!JSON['cancellable_by_student'],
      issuer_message: string = JSON['issuer_message'],
      position: string = ordinance(JSON['position'] as number);

    const wil =  new WaitInLine(
      id, student, issuer, created, last_updated,
      origin, destination, travel_type, gradient_color, icon, color_profile,
      cancellable_by_student, position, cancelled, issuer_message);

    if (JSON['school_id']) {
      (wil as any).school_id = JSON['school_id'];
    }

    return wil;
  }
}
