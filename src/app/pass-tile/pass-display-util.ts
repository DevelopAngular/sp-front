import { Util } from '../../Util';
import { PassLike } from '../models';
import { HallPass } from '../models/HallPass';
import { Invitation } from '../models/Invitation';
import { Request } from '../models/Request';


export function getFormattedPassDate(pass: PassLike) {
  let date: Date;

  if (pass instanceof Invitation) {
    date = pass.date_choices[0];
  } else if (pass instanceof Request) {
    date = pass.request_time;
    if (!date) {
      date = pass.created;
    }

  } else if (pass instanceof HallPass) {
    date = pass.start_time;
  } else {
    throw Error('Unknown PassLike object: ' + pass);
  }

  return date ? Util.formatDateTime(date) : '[null date]';
}

export function getInnerPassContent(pass: PassLike, now?: boolean) {
  if (!(pass instanceof HallPass)) {
    if (pass.status === 'declined') {
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
