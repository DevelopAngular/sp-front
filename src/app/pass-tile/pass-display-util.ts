import { Util } from '../../Util';
import { HallPass } from '../models/HallPass';
import { Invitation } from '../models/Invitation';
import { Request } from '../models/Request';
import { PassLike } from '../models';


export function getFormattedPassDate(pass: PassLike) {
  let date: Date;

  if (pass instanceof Invitation) {
  } else if (pass instanceof Request) {
    date = pass.request_time;
  } else if (pass instanceof HallPass) {
    date = pass.start_time;
  } else {
    throw Error('Unknown PassLike object: ' + pass);
  }

  return date ? Util.formatDateTime(date) : '[null date]';
}

export function getInnerPassContent(pass: PassLike) {
  if (!(pass instanceof HallPass)) {
    if (pass.status === 'denied') {
      return 'Denied';
    }
  }
  return getFormattedPassDate(pass);
}

export function getInnerPassName(pass: PassLike) {
  return pass.student.first_name.substr(0, 1) + '. ' + pass.student.last_name;
}

export function isBadgeVisible(pass: PassLike) {
  return !(pass instanceof HallPass) && !pass.isRead;
}
